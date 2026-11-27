"""
Fabrication Validator — Reviewer-requested addition (Reviewer 1)
================================================================
Checks whether claims in a generated resume bullet can be traced
back to tokens present in the original resume text.

This is a NEW module. It does NOT modify any existing file.
Integration: called optionally from generate_jd_resume_from_files()
after PDF generation, results appended to response metadata.

Validation strategy (two layers):
  1. Token-overlap check  — exact lowercase word match
  2. Semantic check       — Groq LLM asked to verify specific claims
                            (optional, skipped if groq_key is empty)

Returns a structured dict suitable for logging and paper reporting.
"""

import re
import json
import requests

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


# ─── Text normalisation ──────────────────────────────────────────────────────

def _tokenise(text: str) -> set:
    """Lowercase word tokens, strips punctuation."""
    return set(re.findall(r'[a-z0-9]+', text.lower()))


def _extract_noun_phrases(text: str) -> list:
    """
    Heuristic: extract capitalised single words and hyphenated terms
    that look like technology or tool names.
    E.g. "Docker", "CI/CD", "PostgreSQL", "REST", "AWS".
    """
    # Match words starting with uppercase or all-uppercase, length ≥ 2
    candidates = re.findall(
        r'\b(?:[A-Z][a-zA-Z0-9]*(?:[/\-\.][a-zA-Z0-9]+)*|[A-Z]{2,})\b',
        text
    )
    # Filter out common English stop-words capitalised at sentence start
    stopwords = {'The', 'A', 'An', 'This', 'That', 'In', 'On', 'At', 'By',
                 'For', 'To', 'Of', 'And', 'Or', 'Is', 'Was', 'Are', 'Were',
                 'Has', 'Have', 'Had', 'Be', 'Been', 'Being', 'With'}
    return [c for c in candidates if c not in stopwords]


# ─── Layer 1: Token overlap ──────────────────────────────────────────────────

def token_check(original_text: str, generated_bullet: str) -> dict:
    """
    Check whether key terms in generated_bullet exist in original_text.

    Returns:
      supported_terms   : list of terms found in source
      unsupported_terms : list of terms NOT found in source (potential fabrication)
      supported_fraction: float 0.0–1.0
      flag              : bool — True if any unsupported term found
    """
    source_tokens = _tokenise(original_text)
    noun_phrases  = _extract_noun_phrases(generated_bullet)

    supported   = []
    unsupported = []

    for phrase in noun_phrases:
        phrase_tokens = _tokenise(phrase)
        # A phrase is supported if ALL its tokens appear in the source
        if phrase_tokens and phrase_tokens.issubset(source_tokens):
            supported.append(phrase)
        else:
            unsupported.append(phrase)

    total = len(noun_phrases)
    fraction = len(supported) / total if total > 0 else 1.0

    return {
        "supported_terms":    supported,
        "unsupported_terms":  unsupported,
        "supported_fraction": round(fraction, 3),
        "flag":               len(unsupported) > 0,
    }


# ─── Layer 2: LLM semantic check (optional) ─────────────────────────────────

def llm_check(original_text: str, bullet: str, groq_key: str) -> dict:
    """
    Ask the LLM whether the bullet introduces any facts not in the source.
    Returns a structured assessment. Skipped if groq_key is empty.
    """
    if not groq_key:
        return {"llm_checked": False, "reason": "No API key provided"}

    prompt = (
        "You are a factuality auditor for resumes.\n"
        "Given the ORIGINAL resume text and a GENERATED bullet point, "
        "determine whether the bullet introduces any technology name, "
        "tool, metric, company, or responsibility that is NOT present "
        "in the original text.\n\n"
        "Return ONLY raw JSON:\n"
        '{"fabrication_detected": true/false, '
        '"unsupported_claims": ["list of unsupported terms"], '
        '"explanation": "one sentence"}\n\n'
        f"ORIGINAL RESUME TEXT (excerpt):\n{original_text[:1500]}\n\n"
        f"GENERATED BULLET:\n{bullet}"
    )

    headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
    payload = {
        "model":       "openai/gpt-oss-120b",
        "messages":    [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens":  200,
    }

    try:
        resp = requests.post(GROQ_URL, json=payload, headers=headers, timeout=20)
        if resp.status_code != 200:
            return {"llm_checked": False, "reason": f"Groq error {resp.status_code}"}

        raw = resp.json()["choices"][0]["message"]["content"].strip()
        raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw).strip()
        raw = re.sub(r"\s*```$", "", raw).strip()
        s, e = raw.find('{'), raw.rfind('}')
        if s != -1 and e > s:
            raw = raw[s:e+1]
        result = json.loads(raw)
        result["llm_checked"] = True
        return result

    except Exception as ex:
        return {"llm_checked": False, "reason": str(ex)}


# ─── Main validator ──────────────────────────────────────────────────────────

def validate_resume(
    original_text: str,
    generated_data: dict,
    groq_key: str = "",
    use_llm: bool = False
) -> dict:
    """
    Validate all bullet-containing sections of a generated resume
    against the original resume text.

    Args:
        original_text  : raw text extracted from the original resume PDF
        generated_data : structured dict returned by extract_and_tailor()
        groq_key       : Groq API key (optional — enables LLM semantic check)
        use_llm        : if True, run LLM check on each flagged bullet

    Returns:
        {
          "total_bullets"      : int,
          "verified_bullets"   : int,
          "flagged_bullets"    : int,
          "flag_rate"          : float,
          "results"            : [per-bullet result dicts],
          "summary"            : str
        }
    """
    results = []

    def _check_section(section_name: str, bullets: list):
        for bullet in bullets:
            bullet = bullet.strip()
            if not bullet:
                continue
            tok = token_check(original_text, bullet)
            entry = {
                "section":          section_name,
                "bullet":           bullet,
                "flag":             tok["flag"],
                "supported_terms":  tok["supported_terms"],
                "unsupported_terms":tok["unsupported_terms"],
                "supported_fraction": tok["supported_fraction"],
                "llm_result":       None,
            }
            # Optionally run LLM check on flagged bullets only
            if use_llm and tok["flag"] and groq_key:
                entry["llm_result"] = llm_check(original_text, bullet, groq_key)
            results.append(entry)

    # Check experience descriptions
    for exp in generated_data.get("experience", []):
        desc = exp.get("description", "")
        if desc:
            for line in re.split(r'[.\n]', desc):
                line = line.strip().lstrip('•-* ').strip()
                if len(line) > 10:
                    _check_section("experience", [line])

    # Check project descriptions
    for proj in generated_data.get("projects", []):
        desc = proj.get("description", "")
        if desc:
            for line in re.split(r'[.\n]', desc):
                line = line.strip().lstrip('•-* ').strip()
                if len(line) > 10:
                    _check_section("projects", [line])

    # Check achievements
    for ach in generated_data.get("achievements", []):
        if ach and len(ach.strip()) > 10:
            _check_section("achievements", [ach.strip()])

    total   = len(results)
    flagged = sum(1 for r in results if r["flag"])
    verified = total - flagged
    flag_rate = round(flagged / total, 3) if total > 0 else 0.0

    return {
        "total_bullets":   total,
        "verified_bullets":verified,
        "flagged_bullets": flagged,
        "flag_rate":       flag_rate,
        "results":         results,
        "summary": (
            f"{verified}/{total} bullets verified by token overlap. "
            f"{flagged} bullet(s) contain terms not found in the source resume "
            f"(automated flag only — not confirmed fabrication)."
        ),
    }
