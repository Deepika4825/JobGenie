"""
Evaluation Runner — Reviewer-requested research evaluation utility
==================================================================
Standalone script for evaluating resume tailoring across multiple
resume–JD pairs. Does NOT modify any existing application code.

Usage:
    python evaluation_runner.py

Requires:
    - GROQ_API_KEY in environment or .env file
    - Test resume PDFs placed in backend/eval_data/resumes/
    - Test JD text files placed in backend/eval_data/jds/

Output:
    - Console summary table
    - backend/eval_results/evaluation_<timestamp>.json

Metrics computed:
    - keyword_match_before   : fraction of JD keywords in original resume
    - keyword_match_after    : fraction of JD keywords in generated resume
    - keyword_match_gain     : after - before
    - total_bullets          : bullets in generated resume
    - verified_bullets       : bullets with all terms traceable to source
    - flagged_bullets        : bullets with unsupported terms (automated flag)
    - flag_rate              : flagged / total
    - processing_time_s      : wall-clock seconds for the full pipeline

NOTE: "flagged" = automated token-overlap flag only.
      Confirmed fabrication requires human annotation.
      This script clearly separates automated flags from confirmed fabrications.
"""

import os
import sys
import json
import time
import re
import glob
from datetime import datetime
from pathlib import Path

# Add backend dir to path so imports work when run directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

from jd_resume_generator import (
    extract_text_from_pdf,
    extract_and_tailor,
)
from fabrication_validator import validate_resume


# ─── Keyword matching ────────────────────────────────────────────────────────

def extract_jd_keywords(jd_text: str) -> list:
    """
    Extract meaningful keyword candidates from JD text.
    Returns lowercase tokens longer than 3 chars, deduplicated.
    Excludes common English stop-words.
    """
    stop = {
        'that', 'with', 'this', 'will', 'have', 'from', 'they', 'been',
        'their', 'more', 'also', 'your', 'work', 'team', 'role', 'must',
        'able', 'good', 'strong', 'using', 'based', 'such', 'each', 'both',
        'into', 'over', 'some', 'than', 'then', 'when', 'what', 'which',
    }
    tokens = re.findall(r'[a-z][a-z0-9\+\#\.]{2,}', jd_text.lower())
    seen, result = set(), []
    for t in tokens:
        if t not in stop and t not in seen:
            seen.add(t)
            result.append(t)
    return result[:60]  # cap at 60 keywords


def keyword_match_score(resume_text: str, keywords: list) -> float:
    """
    Fraction of JD keywords present in resume text (lowercase).
    """
    if not keywords:
        return 0.0
    text_lower = resume_text.lower()
    matched = sum(1 for kw in keywords if kw in text_lower)
    return round(matched / len(keywords), 3)


def structured_to_text(data: dict) -> str:
    """Convert structured resume dict back to flat text for keyword matching."""
    parts = []
    p = data.get('personal', {})
    for k in ['fullName', 'phone', 'email', 'location']:
        if p.get(k): parts.append(p[k])

    sk = data.get('skills', {})
    for k in ['programmingLanguages', 'technicalSkills', 'tools']:
        if sk.get(k): parts.append(sk[k])

    for edu in data.get('education', []):
        for k in ['degree', 'college']:
            if edu.get(k): parts.append(edu[k])

    for exp in data.get('experience', []):
        for k in ['role', 'company', 'description']:
            if exp.get(k): parts.append(exp[k])

    for proj in data.get('projects', []):
        for k in ['name', 'technologies', 'description']:
            if proj.get(k): parts.append(proj[k])

    for cert in data.get('certifications', []):
        if cert.get('name'): parts.append(cert['name'])

    parts += [a for a in data.get('achievements', []) if a]
    if data.get('coursework'): parts.append(data['coursework'])

    return ' '.join(parts)


# ─── Single pair evaluation ──────────────────────────────────────────────────

def evaluate_pair(test_id: str, resume_path: str, jd_text: str) -> dict:
    """
    Run the full pipeline for one resume–JD pair and return metrics.
    """
    result = {
        "test_id":              test_id,
        "resume_file":          os.path.basename(resume_path),
        "jd_length_chars":      len(jd_text),
        "keyword_match_before": None,
        "keyword_match_after":  None,
        "keyword_match_gain":   None,
        "total_bullets":        0,
        "verified_bullets":     0,
        "flagged_bullets":      0,
        "flag_rate":            None,
        "processing_time_s":    None,
        "error":                None,
        "validation_summary":   None,
        "note": "flagged = automated token-overlap flag only, NOT confirmed fabrication",
    }

    if not GROQ_API_KEY:
        result["error"] = "GROQ_API_KEY not set"
        return result

    try:
        t0 = time.time()

        # 1. Extract original resume text
        with open(resume_path, 'rb') as f:
            original_text = extract_text_from_pdf(f)

        # 2. Extract JD keywords
        jd_keywords = extract_jd_keywords(jd_text)
        result["jd_keyword_count"] = len(jd_keywords)

        # 3. Keyword match BEFORE tailoring
        result["keyword_match_before"] = keyword_match_score(original_text, jd_keywords)

        # 4. Run AI tailoring
        with open(resume_path, 'rb') as f:
            generated_data = extract_and_tailor(original_text, jd_text, GROQ_API_KEY)

        # 5. Keyword match AFTER tailoring
        generated_text = structured_to_text(generated_data)
        result["keyword_match_after"] = keyword_match_score(generated_text, jd_keywords)
        result["keyword_match_gain"]  = round(
            result["keyword_match_after"] - result["keyword_match_before"], 3
        )

        # 6. Fabrication validation
        val = validate_resume(original_text, generated_data, groq_key="", use_llm=False)
        result["total_bullets"]    = val["total_bullets"]
        result["verified_bullets"] = val["verified_bullets"]
        result["flagged_bullets"]  = val["flagged_bullets"]
        result["flag_rate"]        = val["flag_rate"]
        result["validation_summary"] = val["summary"]

        result["processing_time_s"] = round(time.time() - t0, 2)

    except Exception as e:
        result["error"] = str(e)

    return result


# ─── Main ────────────────────────────────────────────────────────────────────

def run_evaluation():
    base_dir    = os.path.dirname(os.path.abspath(__file__))
    resume_dir  = os.path.join(base_dir, "eval_data", "resumes")
    jd_dir      = os.path.join(base_dir, "eval_data", "jds")
    results_dir = os.path.join(base_dir, "eval_results")

    os.makedirs(resume_dir,  exist_ok=True)
    os.makedirs(jd_dir,      exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)

    resume_files = sorted(glob.glob(os.path.join(resume_dir, "*.pdf")))
    jd_files     = sorted(glob.glob(os.path.join(jd_dir,     "*.txt")))

    if not resume_files:
        print(f"\nNo resume PDFs found in: {resume_dir}")
        print("Add resume PDFs to eval_data/resumes/ to run evaluation.")
        return

    if not jd_files:
        print(f"\nNo JD text files found in: {jd_dir}")
        print("Add .txt job description files to eval_data/jds/ to run evaluation.")
        return

    print(f"\nFound {len(resume_files)} resume(s) and {len(jd_files)} JD(s)")
    print(f"Running {len(resume_files) * len(jd_files)} pair(s)...\n")

    all_results = []
    test_id = 1

    for r_path in resume_files:
        for j_path in jd_files:
            with open(j_path, 'r', encoding='utf-8', errors='ignore') as f:
                jd_text = f.read().strip()

            tid = f"T{test_id:03d}"
            print(f"  [{tid}] {os.path.basename(r_path)} × {os.path.basename(j_path)} ...", end=" ", flush=True)

            pair_result = evaluate_pair(tid, r_path, jd_text)
            all_results.append(pair_result)

            if pair_result["error"]:
                print(f"ERROR: {pair_result['error']}")
            else:
                print(
                    f"before={pair_result['keyword_match_before']:.2f}  "
                    f"after={pair_result['keyword_match_after']:.2f}  "
                    f"gain={pair_result['keyword_match_gain']:+.2f}  "
                    f"flags={pair_result['flagged_bullets']}/{pair_result['total_bullets']}  "
                    f"({pair_result['processing_time_s']}s)"
                )
            test_id += 1

    # Aggregate metrics
    valid = [r for r in all_results if not r.get("error")]
    if valid:
        avg_gain      = sum(r["keyword_match_gain"] for r in valid) / len(valid)
        avg_flag_rate = sum(r["flag_rate"] for r in valid) / len(valid)
        avg_time      = sum(r["processing_time_s"] for r in valid) / len(valid)
        total_bullets = sum(r["total_bullets"] for r in valid)
        total_flagged = sum(r["flagged_bullets"] for r in valid)

        print(f"\n{'─'*60}")
        print(f"  Pairs evaluated        : {len(valid)}")
        print(f"  Avg keyword gain       : {avg_gain:+.3f}")
        print(f"  Avg flag rate          : {avg_flag_rate:.3f}  ({total_flagged}/{total_bullets} bullets flagged)")
        print(f"  Avg processing time    : {avg_time:.1f}s")
        print(f"  NOTE: flag rate = automated token-overlap flags only.")
        print(f"        Confirmed fabrication rate requires human annotation.")
        print(f"{'─'*60}\n")

    # Save JSON
    ts       = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = os.path.join(results_dir, f"evaluation_{ts}.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": ts,
            "pairs_evaluated": len(valid),
            "pairs_errored": len(all_results) - len(valid),
            "aggregate": {
                "avg_keyword_match_gain": round(avg_gain, 4) if valid else None,
                "avg_flag_rate":          round(avg_flag_rate, 4) if valid else None,
                "avg_processing_time_s":  round(avg_time, 2) if valid else None,
                "total_bullets":          total_bullets if valid else 0,
                "total_flagged_bullets":  total_flagged if valid else 0,
            },
            "results": all_results,
        }, f, indent=2, ensure_ascii=False)

    print(f"Results saved to: {out_path}\n")


if __name__ == "__main__":
    run_evaluation()
