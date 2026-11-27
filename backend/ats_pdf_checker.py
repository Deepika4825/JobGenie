"""
ATS PDF Checker — Reviewer-requested ATS compatibility test
============================================================
Tests whether generated PDF resumes are machine-readable
(a necessary condition for ATS compatibility) using PyPDF2.

This is NOT a full ATS simulation. It tests structural compatibility:
  - Text is extractable (not image-based)
  - Required fields are present (name, email, skills, experience/projects)
  - No encoding issues that would cause garbled text in parsers
  - Single-page constraint

The paper should state: "ATS compatibility was tested for
machine-readability and required-field presence using PyPDF2.
Full ATS simulation against commercial parsers was not performed
and is identified as future work."

Usage:
    python ats_pdf_checker.py path/to/resume.pdf
    python ats_pdf_checker.py  (checks all PDFs in eval_results/pdfs/)
"""

import os
import sys
import re
import json
import glob
from datetime import datetime

try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not installed. Run: pip install PyPDF2")
    sys.exit(1)


# ─── Checks ──────────────────────────────────────────────────────────────────

def check_pdf(pdf_path: str) -> dict:
    result = {
        "file":              os.path.basename(pdf_path),
        "page_count":        None,
        "single_page":       None,
        "text_extractable":  None,
        "char_count":        None,
        "has_name":          None,
        "has_email":         None,
        "has_phone":         None,
        "has_skills":        None,
        "has_experience_or_projects": None,
        "encoding_ok":       None,
        "overall_pass":      None,
        "issues":            [],
    }

    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            result["page_count"] = len(reader.pages)
            result["single_page"] = len(reader.pages) == 1

            # Extract all text
            text = ""
            for page in reader.pages:
                t = page.extract_text() or ""
                text += t

            result["text_extractable"] = len(text.strip()) > 50
            result["char_count"]       = len(text)

            # Check for encoding issues (replacement chars)
            replacement_count = text.count('\ufffd') + text.count('\u25a0') + text.count('\u25cf')
            result["encoding_ok"] = replacement_count == 0
            if replacement_count > 0:
                result["issues"].append(f"{replacement_count} encoding replacement chars found")

            text_lower = text.lower()

            # Has name: at least one capitalised word pair in first 200 chars
            first_200 = text[:200]
            result["has_name"] = bool(re.search(r'[A-Z][a-z]+ [A-Z][a-z]+', first_200))

            # Has email
            result["has_email"] = bool(re.search(
                r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', text
            ))

            # Has phone
            result["has_phone"] = bool(re.search(
                r'[\+\(]?[0-9][\s\-\.]?[\(]?[0-9]{2,4}[\)\s\-\.]?[0-9]{2,4}[\s\-\.]?[0-9]{2,9}',
                text
            ))

            # Has skills section
            result["has_skills"] = any(kw in text_lower for kw in [
                'skills', 'programming', 'technologies', 'tools', 'languages'
            ])

            # Has experience or projects
            result["has_experience_or_projects"] = any(kw in text_lower for kw in [
                'experience', 'internship', 'project', 'work history', 'employment'
            ])

            # Collect issues
            if not result["single_page"]:
                result["issues"].append(f"Multiple pages ({result['page_count']})")
            if not result["text_extractable"]:
                result["issues"].append("Text not extractable — may be image-based")
            if not result["has_email"]:
                result["issues"].append("Email address not detected")
            if not result["has_skills"]:
                result["issues"].append("Skills section not detected")
            if not result["has_experience_or_projects"]:
                result["issues"].append("Experience/Projects section not detected")

            result["overall_pass"] = (
                result["text_extractable"] and
                result["encoding_ok"] and
                result["has_email"] and
                result["has_skills"] and
                result["has_experience_or_projects"]
            )

    except Exception as e:
        result["issues"].append(f"Error reading PDF: {e}")
        result["overall_pass"] = False

    return result


def print_result(r: dict):
    status = "PASS" if r["overall_pass"] else "FAIL"
    print(f"\n  {'─'*50}")
    print(f"  File   : {r['file']}")
    print(f"  Status : {status}")
    print(f"  Pages  : {r['page_count']} ({'✓' if r['single_page'] else '✗ multi-page'})")
    print(f"  Chars  : {r['char_count']}")
    print(f"  Checks : "
          f"name={'✓' if r['has_name'] else '✗'}  "
          f"email={'✓' if r['has_email'] else '✗'}  "
          f"phone={'✓' if r['has_phone'] else '✗'}  "
          f"skills={'✓' if r['has_skills'] else '✗'}  "
          f"exp/proj={'✓' if r['has_experience_or_projects'] else '✗'}  "
          f"encoding={'✓' if r['encoding_ok'] else '✗'}")
    if r["issues"]:
        for issue in r["issues"]:
            print(f"  ⚠  {issue}")


# ─── Main ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))

    if len(sys.argv) > 1:
        pdf_files = sys.argv[1:]
    else:
        pdf_dir   = os.path.join(base_dir, "eval_results", "pdfs")
        os.makedirs(pdf_dir, exist_ok=True)
        pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))

    if not pdf_files:
        print("\nUsage: python ats_pdf_checker.py resume.pdf [resume2.pdf ...]")
        print("Or place PDFs in eval_results/pdfs/ and run without arguments.")
        sys.exit(0)

    print(f"\nATS PDF Compatibility Checker")
    print(f"Testing {len(pdf_files)} file(s)...\n")
    print("NOTE: Tests machine-readability and required-field presence only.")
    print("      Full commercial ATS simulation was not performed.\n")

    results  = [check_pdf(p) for p in pdf_files]
    passed   = sum(1 for r in results if r["overall_pass"])

    for r in results:
        print_result(r)

    print(f"\n{'─'*52}")
    print(f"  Result: {passed}/{len(results)} PDFs passed all checks")
    print(f"{'─'*52}\n")

    # Save JSON
    ts       = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir  = os.path.join(base_dir, "eval_results")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"ats_check_{ts}.json")
    with open(out_path, 'w') as f:
        json.dump({"timestamp": ts, "files_checked": len(results),
                   "passed": passed, "results": results}, f, indent=2)
    print(f"Results saved to: {out_path}\n")
