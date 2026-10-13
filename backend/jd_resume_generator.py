"""
JD-Based Resume Generator — Backend Module

Fixes applied:
  1. clean_text() strips all non-latin1 chars that cause black squares in PDF
  2. Summary section REMOVED from PDF output
  3. Links (linkedin, github, etc.) always shown in header contact line
  4. Manual link overrides merged from frontend form fields
  5. One-page enforcement via font size reduction + section trimming
  6. Robust JSON parsing with per-field regex fallback
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
from reportlab.pdfbase import pdfmetrics

_BLACK = colors.HexColor('#000000')
_DARK  = colors.HexColor('#1a1a1a')
_GRAY  = colors.HexColor('#444444')
_RULE  = colors.HexColor('#bbbbbb')

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


# ─────────────────────────────────────────────────────────────────────────────
# Text sanitiser — kills every character that causes ■ black squares
# ─────────────────────────────────────────────────────────────────────────────

# Characters to replace with safe ASCII equivalents
_CHAR_MAP = {
    '\u2013': '-',   # en dash
    '\u2014': '-',   # em dash
    '\u2018': "'",   # left single quote
    '\u2019': "'",   # right single quote
    '\u201c': '"',   # left double quote
    '\u201d': '"',   # right double quote
    '\u2022': '',    # bullet (we add our own)
    '\u2026': '...',  # ellipsis
    '\u00a0': ' ',   # non-breaking space
    '\u200b': '',    # zero-width space
    '\ufb01': 'fi',  # fi ligature
    '\ufb02': 'fl',  # fl ligature
    '\u25cf': '',    # filled circle bullet
    '\u25aa': '',    # small black square
    '\u25a0': '',    # black square
    '\u2212': '-',   # minus sign
    '\u00b7': ' ',   # middle dot
}

def clean_text(text: str) -> str:
    """Replace known problem characters and drop anything outside latin-1."""
    if not text:
        return ""
    text = str(text).strip()
    for bad, good in _CHAR_MAP.items():
        text = text.replace(bad, good)
    # Drop any remaining non-latin1 chars
    text = text.encode('latin-1', errors='ignore').decode('latin-1')
    # Collapse multiple spaces
    text = re.sub(r'  +', ' ', text).strip()
    return text


def _san(text) -> str:
    return clean_text(text) if text else ""


# ─────────────────────────────────────────────────────────────────────────────
# PDF text extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_text_from_pdf(file) -> str:
    try:
        reader = PyPDF2.PdfReader(file)
        pages  = [page.extract_text() or '' for page in reader.pages]
        raw    = "\n".join(pages)
        return re.sub(r"\s+", " ", raw).strip()
    except Exception as e:
        raise ValueError(f"Could not read PDF: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Groq LLM — extract resume data + tailor to JD
# ─────────────────────────────────────────────────────────────────────────────

def extract_and_tailor(resume_text: str, jd_text: str, groq_key: str) -> dict:
    prompt = (
        "You are a professional resume writer and ATS expert.\n"
        "Extract ALL information from the candidate's resume and return it as structured JSON.\n"
        "Also tailor skills order to prioritise keywords from the job description.\n\n"
        "Return ONLY raw JSON — no markdown, no explanation, no extra text.\n"
        "Use this exact structure:\n"
        "{\n"
        '  "personal": {"fullName":"","phone":"","email":"","location":"","linkedin":"","github":"","leetcode":"","codechef":"","medium":""},\n'
        '  "education": [{"degree":"","college":"","location":"","startYear":"","endYear":"","cgpa":""}],\n'
        '  "skills": {"programmingLanguages":"","technicalSkills":"","tools":""},\n'
        '  "experience": [{"company":"","role":"","duration":"","description":""}],\n'
        '  "projects": [{"name":"","technologies":"","description":"","link":""}],\n'
        '  "certifications": [{"name":"","organization":"","year":""}],\n'
        '  "achievements": [""],\n'
        '  "coursework": ""\n'
        "}\n\n"
        "IMPORTANT RULES:\n"
        "- Extract the candidate's name, phone, email, location from the resume header\n"
        "- Extract LinkedIn, GitHub, LeetCode, CodeChef, Medium URLs if present in the resume\n"
        "- Extract ALL projects with their names, technologies, and description bullet points\n"
        "- Extract ALL experience entries\n"
        "- Extract ALL certifications\n"
        "- Keep description strings as plain text, no markdown symbols\n"
        "- Skills: put JD-matching skills FIRST in each comma-separated list\n"
        "- Do NOT include a summary field\n"
        "- ONLY return the JSON object, nothing else\n\n"
        f"RESUME:\n{resume_text[:4500]}\n\n"
        f"JOB DESCRIPTION:\n{jd_text[:1500]}"
    )

    headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
    payload = {
        "model":       "openai/gpt-oss-120b",
        "messages":    [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens":  2800,
    }

    raw = ""
    try:
        resp = requests.post(GROQ_URL, json=payload, headers=headers, timeout=50)
        if resp.status_code != 200:
            print(f"[JD] Groq error {resp.status_code}: {resp.text[:200]}")
            return _empty_data()

        raw = resp.json()["choices"][0]["message"]["content"].strip()
        print(f"[JD] raw[:500]: {raw[:500]}")

        # Strip thinking blocks and markdown fences
        raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw).strip()
        raw = re.sub(r"\s*```$", "", raw).strip()

        # Extract outermost { }
        s = raw.find('{')
        e = raw.rfind('}')
        if s != -1 and e > s:
            raw = raw[s:e+1]

        data = json.loads(raw)
        print(f"[JD] keys: {list(data.keys())}")
        return data

    except json.JSONDecodeError as ex:
        print(f"[JD] JSON error: {ex} — raw: {raw[:300]}")
        # Try per-field regex extraction as fallback
        return _regex_extract(raw)
    except Exception as ex:
        print(f"[JD] exception: {ex}")
        return _empty_data()


def _regex_extract(raw: str) -> dict:
    """Last-resort extraction when JSON is malformed/truncated."""
    def _arr(key):
        m = re.search(rf'"{key}"\s*:\s*\[(.*?)(?:\]|$)', raw, re.DOTALL)
        if m:
            return re.findall(r'"([^"]{2,})"', m.group(1))
        return []

    def _str(key):
        m = re.search(rf'"{key}"\s*:\s*"([^"]*)"', raw)
        return m.group(1) if m else ""

    personal = {
        "fullName": _str("fullName"), "phone": _str("phone"),
        "email":    _str("email"),    "location": _str("location"),
        "linkedin": _str("linkedin"), "github":   _str("github"),
        "leetcode": _str("leetcode"), "codechef": _str("codechef"),
        "medium":   _str("medium"),
    }
    skills = {
        "programmingLanguages": _str("programmingLanguages"),
        "technicalSkills":      _str("technicalSkills"),
        "tools":                _str("tools"),
    }
    return {
        "personal":       personal,
        "education":      [],
        "skills":         skills,
        "experience":     [],
        "projects":       [],
        "certifications": [],
        "achievements":   _arr("achievements"),
        "coursework":     _str("coursework"),
    }


def _empty_data() -> dict:
    return {
        "personal":       {},
        "education":      [],
        "skills":         {"programmingLanguages": "", "technicalSkills": "", "tools": ""},
        "experience":     [],
        "projects":       [],
        "certifications": [],
        "achievements":   [],
        "coursework":     "",
    }


# ─────────────────────────────────────────────────────────────────────────────
# PDF builder — Harshibar-style, one page, no summary, clean text
# ─────────────────────────────────────────────────────────────────────────────

def _styles(fs=9.5) -> dict:
    """Build styles. fs = base font size for body/bullets (reduce for one-page)."""
    sm = max(fs - 1, 8)
    return {
        'name':    ParagraphStyle('N',  fontName='Helvetica-Bold',    fontSize=18,  textColor=_BLACK, alignment=TA_CENTER, spaceAfter=3, leading=22),
        'contact': ParagraphStyle('C',  fontName='Helvetica',         fontSize=8.5, textColor=_GRAY,  alignment=TA_CENTER, spaceAfter=2, leading=12),
        'section': ParagraphStyle('S',  fontName='Helvetica-Bold',    fontSize=10,  textColor=_BLACK, spaceBefore=6, spaceAfter=2, leading=13),
        'etitle':  ParagraphStyle('ET', fontName='Helvetica-Bold',    fontSize=fs,  textColor=_BLACK, spaceAfter=1, leading=fs+3),
        'esub':    ParagraphStyle('ES', fontName='Helvetica-Oblique', fontSize=sm,  textColor=_GRAY,  spaceAfter=1, leading=sm+3),
        'body':    ParagraphStyle('B',  fontName='Helvetica',         fontSize=fs,  textColor=_DARK,  leading=fs+4, spaceAfter=1),
        'bullet':  ParagraphStyle('BL', fontName='Helvetica',         fontSize=sm,  textColor=_DARK,  leading=sm+3, leftIndent=12, spaceAfter=0),
    }


def _divider():
    return HRFlowable(width='100%', thickness=0.4, color=_RULE, spaceBefore=1, spaceAfter=3)


def _sec(title, st):
    return [Paragraph(title.upper(), st['section']), _divider()]


def _bul(text, st):
    t = _san(text).lstrip('*+-. ').strip()
    return Paragraph(f"- {t}", st['bullet']) if t else None


def _build_story(data: dict, st: dict) -> list:
    story = []
    p = data.get('personal', {})

    # ── Header: name + contacts + links ──────────────────────────────────────
    name = _san(p.get('fullName', ''))
    if name:
        story.append(Paragraph(name, st['name']))

    contacts = [_san(p.get(k,'')) for k in ['phone','email','location'] if p.get(k,'').strip()]
    if contacts:
        story.append(Paragraph('  |  '.join(contacts), st['contact']))

    # Links — always show if present (from AI extraction OR manual override)
    links = [_san(p.get(k,'')) for k in ['linkedin','github','leetcode','codechef','medium'] if p.get(k,'').strip()]
    if links:
        # Render each link as a clickable hyperlink
        link_parts = []
        for url in links:
            if url:
                # Ensure URL has protocol
                href = url if url.startswith('http') else f'https://{url}'
                link_parts.append(f'<a href="{href}" color="#0000EE"><u>{url}</u></a>')
        if link_parts:
            story.append(Paragraph('  |  '.join(link_parts), st['contact']))

    story.append(Spacer(1, 6))

    # ── Education ─────────────────────────────────────────────────────────────
    edus = [e for e in data.get('education',[]) if e.get('degree') or e.get('college')]
    if edus:
        story += _sec('Education', st)
        for edu in edus:
            deg  = _san(edu.get('degree',''))
            col  = _san(edu.get('college',''))
            loc  = _san(edu.get('location',''))
            s    = _san(edu.get('startYear',''))
            e    = _san(edu.get('endYear',''))
            cgpa = _san(edu.get('cgpa',''))
            dur  = f"{s} - {e}" if s or e else ''
            sub  = ' | '.join(x for x in [col, loc] if x)
            if dur: sub += f" ({dur})" if sub else dur
            if deg: story.append(Paragraph(deg, st['etitle']))
            if sub: story.append(Paragraph(sub, st['esub']))
            if cgpa: story.append(Paragraph(f"CGPA: {cgpa}", st['body']))
            story.append(Spacer(1, 2))

    # ── Skills ────────────────────────────────────────────────────────────────
    sk = data.get('skills', {})
    pl = _san(sk.get('programmingLanguages',''))
    ts = _san(sk.get('technicalSkills',''))
    to = _san(sk.get('tools',''))
    if pl or ts or to:
        story += _sec('Skills', st)
        if pl: story.append(Paragraph(f"<b>Languages:</b> {pl}", st['body']))
        if ts: story.append(Paragraph(f"<b>Technical:</b> {ts}", st['body']))
        if to: story.append(Paragraph(f"<b>Tools:</b> {to}", st['body']))
        story.append(Spacer(1, 2))

    # ── Experience ────────────────────────────────────────────────────────────
    exps = [e for e in data.get('experience',[]) if e.get('company') or e.get('role')]
    if exps:
        story += _sec('Experience', st)
        for exp in exps:
            role = _san(exp.get('role',''))
            comp = _san(exp.get('company',''))
            dur  = _san(exp.get('duration',''))
            desc = _san(exp.get('description',''))
            if role: story.append(Paragraph(role, st['etitle']))
            sub = comp + (f" | {dur}" if dur else '')
            if sub: story.append(Paragraph(sub, st['esub']))
            if desc:
                for line in re.split(r'[.\n]', desc):
                    b = _bul(line, st)
                    if b: story.append(b)
            story.append(Spacer(1, 2))

    # ── Projects ──────────────────────────────────────────────────────────────
    projs = [p for p in data.get('projects',[]) if p.get('name')]
    if projs:
        story += _sec('Projects', st)
        for proj in projs:
            pn = _san(proj.get('name',''))
            pt = _san(proj.get('technologies',''))
            pd = _san(proj.get('description',''))
            pl2 = _san(proj.get('link',''))
            ttxt = pn + (f" | <i>{pt}</i>" if pt else '')
            story.append(Paragraph(ttxt, st['etitle']))
            if pd:
                for line in re.split(r'[.\n]', pd):
                    b = _bul(line, st)
                    if b: story.append(b)
            if pl2:
                story.append(Paragraph(f"Link: {pl2}", st['body']))
            story.append(Spacer(1, 2))

    # ── Certifications ────────────────────────────────────────────────────────
    certs = [c for c in data.get('certifications',[]) if c.get('name')]
    if certs:
        story += _sec('Certifications', st)
        for cert in certs:
            cn = _san(cert.get('name',''))
            co = _san(cert.get('organization',''))
            cy = _san(cert.get('year',''))
            line = cn + (f" - {co}" if co else '') + (f" ({cy})" if cy else '')
            b = _bul(line, st)
            if b: story.append(b)
        story.append(Spacer(1, 2))

    # ── Achievements ──────────────────────────────────────────────────────────
    achs = [_san(a) for a in data.get('achievements',[]) if _san(a)]
    if achs:
        story += _sec('Achievements', st)
        for ach in achs:
            b = _bul(ach, st)
            if b: story.append(b)
        story.append(Spacer(1, 2))

    # ── Coursework ────────────────────────────────────────────────────────────
    cw = _san(data.get('coursework',''))
    if cw:
        story += _sec('Relevant Coursework', st)
        story.append(Paragraph(cw, st['body']))

    return story


def build_pdf(data: dict) -> bytes:
    """
    Build one-page PDF.
    First try at font size 9.5. If content overflows one page,
    rebuild with progressively smaller fonts until it fits.
    """
    lm = rm = 0.6 * inch
    tm = bm = 0.5 * inch
    page_h = letter[1] - tm - bm

    for fs in [9.5, 9.0, 8.5, 8.0]:
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter,
                                leftMargin=lm, rightMargin=rm,
                                topMargin=tm,  bottomMargin=bm)
        st    = _styles(fs)
        story = _build_story(data, st)
        doc.build(story)
        # Check page count
        buf.seek(0)
        reader = PyPDF2.PdfReader(buf)
        if len(reader.pages) <= 1:
            buf.seek(0)
            return buf.read()

    # Final fallback — just return whatever was built last
    buf.seek(0)
    return buf.read()


# ─────────────────────────────────────────────────────────────────────────────
# Public entry points
# ─────────────────────────────────────────────────────────────────────────────

def generate_jd_resume_from_files(resume_file, jd_text: str, groq_key: str,
                                   manual_links: dict = None):
    """
    Upload-based entry point.
    Returns (pdf_bytes, candidate_name_slug)
    manual_links: dict of {linkedin, github, leetcode, codechef, medium}
                  entered by user in the frontend form (overrides AI extraction).
    """
    resume_text = extract_text_from_pdf(resume_file)
    if len(resume_text) < 50:
        raise ValueError("Could not extract enough text from the resume PDF. "
                         "Please ensure it is a text-based PDF, not a scanned image.")

    structured = extract_and_tailor(resume_text, jd_text, groq_key)

    # Merge manual link overrides — user-entered links take priority
    if manual_links:
        p = structured.setdefault('personal', {})
        for key in ['linkedin', 'github', 'leetcode', 'codechef', 'medium']:
            val = (manual_links.get(key) or '').strip()
            if val:
                p[key] = val

    # Extract candidate name for the filename
    full_name = _san(structured.get('personal', {}).get('fullName', ''))
    if not full_name:
        # Fallback: first non-blank short line from resume text
        for line in resume_text.split('\n'):
            line = line.strip()
            if 3 < len(line) < 60 and not any(c.isdigit() for c in line[:4]):
                full_name = line
                break
    name_slug = re.sub(r'\W+', '_', full_name.strip().lower())[:40] or 'resume'

    return build_pdf(structured), name_slug


def generate_jd_resume(data: dict, groq_key: str) -> bytes:
    """Legacy form-based entry point (unchanged, still used by /generate-resume-jd)."""
    jd_text = data.get('jd_text', '')
    profile_summary = json.dumps({
        "name":    data.get('personal', {}).get('fullName', ''),
        "skills":  data.get('skills', {}),
        "projects":[{"name": p.get('name',''), "tech": p.get('technologies','')}
                    for p in data.get('projects', [])[:4]],
    })
    tailored = extract_and_tailor(profile_summary, jd_text, groq_key)
    merged   = dict(data)
    if tailored.get('skills'):
        ts = tailored['skills']
        ms = dict(data.get('skills', {}))
        for k in ['programmingLanguages', 'technicalSkills', 'tools']:
            if ts.get(k): ms[k] = ts[k]
        merged['skills'] = ms
    # Remove summary — not needed
    merged.pop('summary', None)
    return build_pdf(merged)
