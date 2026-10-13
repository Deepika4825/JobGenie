"""
JD-Based Resume Generator — Backend Module

Flow:
  1. Receive: resume PDF bytes + job description text
  2. Extract text from resume PDF using PyPDF2
  3. Send both to Groq LLM → returns structured resume data tailored to the JD
  4. Build PDF using the Harshibar-style ReportLab template
  5. Return PDF bytes

Public entry point:
  generate_jd_resume_from_files(resume_file, jd_text, groq_key) -> bytes
"""

import io
import re
import json
import requests
import PyPDF2

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# ── Colour palette (ATS-safe black/charcoal) ─────────────────────────────────
_BLACK = colors.HexColor('#000000')
_DARK  = colors.HexColor('#1a1a1a')
_GRAY  = colors.HexColor('#444444')
_RULE  = colors.HexColor('#cccccc')

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Extract text from uploaded PDF
# ─────────────────────────────────────────────────────────────────────────────

def extract_text_from_pdf(file) -> str:
    """Extract and normalise text from a PDF file object."""
    try:
        reader = PyPDF2.PdfReader(file)
        pages  = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                pages.append(t)
        raw = "\n".join(pages)
        return re.sub(r"\s+", " ", raw).strip()
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Groq LLM: extract + tailor resume content
# ─────────────────────────────────────────────────────────────────────────────

def extract_and_tailor(resume_text: str, jd_text: str, groq_key: str) -> dict:
    """
    Send the candidate's raw resume text and the job description to Groq.
    Returns a fully structured resume dict ready for PDF building.
    Falls back to a minimal dict on failure.
    """
    prompt = (
        "You are a professional resume writer and ATS optimisation expert.\n"
        "You are given:\n"
        "  1. A candidate's existing resume (raw extracted text)\n"
        "  2. A job description they want to apply for\n\n"
        "Your task:\n"
        "  - Extract ALL factual information from the resume (name, contact, education, "
        "    skills, projects, experience, certifications, achievements)\n"
        "  - Rewrite the professional summary to match the job description\n"
        "  - Reorder and highlight skills that appear in the job description\n"
        "  - Keep all factual content accurate — do NOT invent new facts\n"
        "  - Return ONLY raw JSON in this exact structure (no markdown, no explanation):\n\n"
        "{\n"
        '  "personal": {\n'
        '    "fullName": "",\n'
        '    "phone": "",\n'
        '    "email": "",\n'
        '    "location": "",\n'
        '    "linkedin": "",\n'
        '    "github": "",\n'
        '    "leetcode": "",\n'
        '    "codechef": "",\n'
        '    "medium": ""\n'
        "  },\n"
        '  "summary": "2-3 sentence professional summary tailored to the JD",\n'
        '  "education": [\n'
        '    {"degree": "", "college": "", "location": "", "startYear": "", "endYear": "", "cgpa": ""}\n'
        "  ],\n"
        '  "skills": {\n'
        '    "programmingLanguages": "comma-separated",\n'
        '    "technicalSkills": "comma-separated",\n'
        '    "tools": "comma-separated"\n'
        "  },\n"
        '  "projects": [\n'
        '    {"name": "", "technologies": "", "description": "", "link": ""}\n'
        "  ],\n"
        '  "experience": [\n'
        '    {"company": "", "role": "", "duration": "", "description": ""}\n'
        "  ],\n"
        '  "certifications": [\n'
        '    {"name": "", "organization": "", "year": ""}\n'
        "  ],\n"
        '  "achievements": [""],\n'
        '  "coursework": ""\n'
        "}\n\n"
        "Rules:\n"
        "  - Extract every field you can find from the resume text\n"
        "  - Leave a field empty string if not found — never fabricate data\n"
        "  - summary must be tailored to the job description\n"
        "  - skills must be reordered to prioritise JD keywords first\n"
        "  - ONLY return the JSON object\n\n"
        f"RESUME TEXT:\n{resume_text[:4000]}\n\n"
        f"JOB DESCRIPTION:\n{jd_text[:2000]}"
    )

    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type":  "application/json",
    }
    payload = {
        "model":       "openai/gpt-oss-120b",
        "messages":    [{"role": "user", "content": prompt}],
        "temperature": 0.15,
        "max_tokens":  1500,
    }

    try:
        resp = requests.post(GROQ_URL, json=payload, headers=headers, timeout=45)
        if resp.status_code != 200:
            print(f"Groq error {resp.status_code}: {resp.text[:200]}")
            return _empty_data()

        raw = resp.json()["choices"][0]["message"]["content"].strip()
        # Strip markdown fences and thinking blocks
        raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw).strip()
        raw = re.sub(r"\s*```$", "", raw).strip()

        # Extract JSON object robustly
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            raw = match.group(0)

        data = json.loads(raw)
        return data

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e} — raw[:300]: {raw[:300]}")
        return _empty_data()
    except Exception as e:
        print(f"Groq exception: {e}")
        return _empty_data()


def _empty_data() -> dict:
    return {
        "personal":       {},
        "summary":        "",
        "education":      [],
        "skills":         {"programmingLanguages": "", "technicalSkills": "", "tools": ""},
        "projects":       [],
        "experience":     [],
        "certifications": [],
        "achievements":   [],
        "coursework":     "",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — PDF builder: Harshibar-style ReportLab template
# ─────────────────────────────────────────────────────────────────────────────

def _san(text) -> str:
    if not text:
        return ""
    return str(text).strip()


def _build_styles() -> dict:
    return {
        'name': ParagraphStyle('Name', fontName='Helvetica-Bold', fontSize=20,
                               textColor=_BLACK, alignment=TA_CENTER, spaceAfter=4, leading=24),
        'contact': ParagraphStyle('Contact', fontName='Helvetica', fontSize=9,
                                  textColor=_GRAY, alignment=TA_CENTER, spaceAfter=2, leading=13),
        'section': ParagraphStyle('Section', fontName='Helvetica-Bold', fontSize=10.5,
                                  textColor=_BLACK, spaceBefore=8, spaceAfter=3, leading=14),
        'entry_title': ParagraphStyle('EntryTitle', fontName='Helvetica-Bold', fontSize=10,
                                      textColor=_BLACK, spaceAfter=1, leading=14),
        'entry_sub': ParagraphStyle('EntrySub', fontName='Helvetica-Oblique', fontSize=9,
                                    textColor=_GRAY, spaceAfter=2, leading=13),
        'body': ParagraphStyle('Body', fontName='Helvetica', fontSize=9.5,
                               textColor=_DARK, leading=14, spaceAfter=2),
        'bullet': ParagraphStyle('Bullet', fontName='Helvetica', fontSize=9.5,
                                 textColor=_DARK, leading=13, leftIndent=14, spaceAfter=1),
    }


def _divider():
    return HRFlowable(width='100%', thickness=0.5, color=_RULE, spaceBefore=2, spaceAfter=4)


def _sec(title, styles):
    return [Paragraph(title.upper(), styles['section']), _divider()]


def _bullet(text, styles):
    t = _san(text).lstrip('•- ').strip()
    if not t:
        return None
    return Paragraph(f"\u2022  {t}", styles['bullet'])


def build_pdf(data: dict) -> bytes:
    """Build the Harshibar-style PDF from structured resume data."""
    buf    = io.BytesIO()
    styles = _build_styles()

    doc = SimpleDocTemplate(
        buf, pagesize=letter,
        leftMargin=0.65*inch, rightMargin=0.65*inch,
        topMargin=0.55*inch,  bottomMargin=0.55*inch,
    )
    story = []

    # ── Header ───────────────────────────────────────────────────────────────
    p = data.get('personal', {})
    name = _san(p.get('fullName', ''))
    if name:
        story.append(Paragraph(name, styles['name']))

    contacts = [_san(p.get(k, '')) for k in ['phone', 'email', 'location'] if p.get(k)]
    if contacts:
        story.append(Paragraph('  |  '.join(contacts), styles['contact']))

    links = [_san(p.get(k, '')) for k in ['linkedin', 'github', 'leetcode', 'codechef', 'medium'] if p.get(k)]
    if links:
        story.append(Paragraph('  |  '.join(links), styles['contact']))

    story.append(Spacer(1, 8))

    # ── Summary ──────────────────────────────────────────────────────────────
    summary = _san(data.get('summary', ''))
    if summary:
        story += _sec('Professional Summary', styles)
        story.append(Paragraph(summary, styles['body']))
        story.append(Spacer(1, 4))

    # ── Education ─────────────────────────────────────────────────────────────
    edus = [e for e in data.get('education', []) if e.get('degree') or e.get('college')]
    if edus:
        story += _sec('Education', styles)
        for edu in edus:
            degree = _san(edu.get('degree', ''))
            col    = _san(edu.get('college', ''))
            loc    = _san(edu.get('location', ''))
            start  = _san(edu.get('startYear', ''))
            end    = _san(edu.get('endYear', ''))
            cgpa   = _san(edu.get('cgpa', ''))
            dur    = f"{start} \u2013 {end}" if start or end else ''
            sub    = ' | '.join([x for x in [col, loc] if x])
            if dur:
                sub += f" ({dur})" if sub else dur
            if degree:
                story.append(Paragraph(degree, styles['entry_title']))
            if sub:
                story.append(Paragraph(sub, styles['entry_sub']))
            if cgpa:
                story.append(Paragraph(f"CGPA / Percentage: {cgpa}", styles['body']))
            story.append(Spacer(1, 3))

    # ── Skills ────────────────────────────────────────────────────────────────
    sk = data.get('skills', {})
    pl = _san(sk.get('programmingLanguages', ''))
    ts = _san(sk.get('technicalSkills', ''))
    to = _san(sk.get('tools', ''))
    if pl or ts or to:
        story += _sec('Skills', styles)
        if pl: story.append(Paragraph(f"<b>Programming Languages:</b>  {pl}", styles['body']))
        if ts: story.append(Paragraph(f"<b>Technical Skills:</b>  {ts}", styles['body']))
        if to: story.append(Paragraph(f"<b>Tools &amp; Technologies:</b>  {to}", styles['body']))
        story.append(Spacer(1, 3))

    # ── Experience ────────────────────────────────────────────────────────────
    exps = [e for e in data.get('experience', []) if e.get('company') or e.get('role')]
    if exps:
        story += _sec('Experience', styles)
        for exp in exps:
            role = _san(exp.get('role', ''))
            comp = _san(exp.get('company', ''))
            dur  = _san(exp.get('duration', ''))
            desc = _san(exp.get('description', ''))
            if role:
                story.append(Paragraph(role, styles['entry_title']))
            sub = comp
            if dur:
                sub += f" | {dur}" if sub else dur
            if sub:
                story.append(Paragraph(sub, styles['entry_sub']))
            if desc:
                for line in desc.split('\n'):
                    b = _bullet(line, styles)
                    if b:
                        story.append(b)
            story.append(Spacer(1, 3))

    # ── Projects ──────────────────────────────────────────────────────────────
    projs = [p for p in data.get('projects', []) if p.get('name')]
    if projs:
        story += _sec('Projects', styles)
        for proj in projs:
            pn   = _san(proj.get('name', ''))
            pt   = _san(proj.get('technologies', ''))
            pd   = _san(proj.get('description', ''))
            pl2  = _san(proj.get('link', ''))
            title_txt = pn + (f" | <i>{pt}</i>" if pt else "")
            story.append(Paragraph(title_txt, styles['entry_title']))
            if pd:
                for line in pd.split('\n'):
                    b = _bullet(line, styles)
                    if b:
                        story.append(b)
            if pl2:
                story.append(Paragraph(f"Link: {pl2}", styles['body']))
            story.append(Spacer(1, 3))

    # ── Certifications ────────────────────────────────────────────────────────
    certs = [c for c in data.get('certifications', []) if c.get('name')]
    if certs:
        story += _sec('Certifications', styles)
        for cert in certs:
            cn = _san(cert.get('name', ''))
            co = _san(cert.get('organization', ''))
            cy = _san(cert.get('year', ''))
            line = cn
            if co: line += f" \u2014 {co}"
            if cy: line += f" ({cy})"
            b = _bullet(line, styles)
            if b:
                story.append(b)
        story.append(Spacer(1, 3))

    # ── Achievements ──────────────────────────────────────────────────────────
    achs = [_san(a) for a in data.get('achievements', []) if _san(a)]
    if achs:
        story += _sec('Achievements', styles)
        for ach in achs:
            b = _bullet(ach, styles)
            if b:
                story.append(b)
        story.append(Spacer(1, 3))

    # ── Coursework ────────────────────────────────────────────────────────────
    cw = _san(data.get('coursework', ''))
    if cw:
        story += _sec('Relevant Coursework', styles)
        story.append(Paragraph(cw, styles['body']))

    doc.build(story)
    return buf.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────────────────────

def generate_jd_resume_from_files(resume_file, jd_text: str, groq_key: str) -> bytes:
    """
    Main entry point called by the Flask route.

    Args:
        resume_file : file-like object of the uploaded resume PDF
        jd_text     : job description text (extracted from PDF or pasted)
        groq_key    : Groq API key

    Returns:
        PDF bytes of the JD-tailored resume
    """
    # 1. Extract resume text
    resume_text = extract_text_from_pdf(resume_file)
    if len(resume_text) < 50:
        raise ValueError("Could not extract enough text from the resume PDF. "
                         "Please ensure it is a text-based PDF, not a scanned image.")

    # 2. AI extraction + tailoring
    structured = extract_and_tailor(resume_text, jd_text, groq_key)

    # 3. Build and return PDF
    return build_pdf(structured)


# Keep old entry point working (used by existing /generate-resume-jd route)
def generate_jd_resume(data: dict, groq_key: str) -> bytes:
    """
    Legacy entry point — accepts pre-structured form data with jd_text field.
    Still used by the form-based /generate-resume-jd route.
    """
    jd_text     = data.get('jd_text', '')
    profile_for_llm = {
        "name":     data.get('personal', {}).get('fullName', ''),
        "summary":  data.get('summary', ''),
        "skills":   data.get('skills', {}),
        "projects": [
            {"name": p.get('name', ''), "tech": p.get('technologies', '')}
            for p in data.get('projects', [])[:4]
        ],
    }
    from jd_resume_generator import extract_and_tailor as _et, build_pdf as _bp

    tailored = _et(
        json.dumps(profile_for_llm),
        jd_text,
        groq_key
    )
    merged = dict(data)
    if tailored.get('summary'):
        merged['summary'] = tailored['summary']
    if tailored.get('skills'):
        merged_skills = dict(data.get('skills', {}))
        ts = tailored['skills']
        if ts.get('programmingLanguages'):
            merged_skills['programmingLanguages'] = ts['programmingLanguages']
        if ts.get('technicalSkills'):
            merged_skills['technicalSkills'] = ts['technicalSkills']
        if ts.get('tools'):
            merged_skills['tools'] = ts['tools']
        merged['skills'] = merged_skills
    return _bp(merged)
