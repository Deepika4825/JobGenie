"""
Resume Generator Module - Backend Only
Generates professional ATS-friendly PDF resumes using ReportLab.
"""

import io
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER

BLACK   = colors.HexColor('#000000')
DARK    = colors.HexColor('#1a1a1a')
GRAY    = colors.HexColor('#444444')
DIVIDER = colors.HexColor('#cccccc')


def _s(text) -> str:
    """Convert any text to a safe ASCII string for ReportLab."""
    if not text:
        return ""
    t = str(text).strip()
    t = t.encode('ascii', errors='ignore').decode('ascii')
    t = t.replace('#', '').replace('&', ' and ').replace('<', '(').replace('>', ')')
    return t.strip()


def _p(text, style):
    """Safe Paragraph — applies _s() then creates Paragraph, with fallback."""
    safe = _s(text)
    if not safe:
        return None
    try:
        return Paragraph(safe, style)
    except Exception as e:
        print(f"[RG] Paragraph failed: {e} text={repr(safe)[:60]}")
        fallback = ''.join(c if c.isalnum() or c in ' .,;:()-|/' else ' ' for c in safe)
        try:
            return Paragraph(fallback.strip(), style)
        except Exception:
            return None


def _bul(text, style):
    safe = _s(text).lstrip('*+-. ').strip()
    if not safe:
        return None
    try:
        return Paragraph('- ' + safe, style)
    except Exception:
        return None


def _build_styles():
    return {
        'name': ParagraphStyle('RN', fontName='Helvetica-Bold', fontSize=20,
                               textColor=BLACK, alignment=TA_CENTER, spaceAfter=6, leading=24),
        'contact': ParagraphStyle('RC', fontName='Helvetica', fontSize=9,
                                  textColor=GRAY, alignment=TA_CENTER, spaceAfter=3, leading=13),
        'section': ParagraphStyle('RS', fontName='Helvetica-Bold', fontSize=10.5,
                                  textColor=BLACK, spaceBefore=8, spaceAfter=3, leading=14),
        'etitle': ParagraphStyle('RET', fontName='Helvetica-Bold', fontSize=10,
                                 textColor=BLACK, spaceAfter=1, leading=14),
        'esub': ParagraphStyle('RES', fontName='Helvetica-Oblique', fontSize=9,
                               textColor=GRAY, spaceAfter=2, leading=13),
        'body': ParagraphStyle('RB', fontName='Helvetica', fontSize=9.5,
                               textColor=DARK, leading=14, spaceAfter=2),
        'bullet': ParagraphStyle('RBL', fontName='Helvetica', fontSize=9.5,
                                 textColor=DARK, leading=13, leftIndent=14, spaceAfter=1),
    }


def _divider():
    return HRFlowable(width='100%', thickness=0.5, color=DIVIDER, spaceBefore=2, spaceAfter=4)


def _sec(title, st):
    p = _p(title.upper(), st['section'])
    return [p, _divider()] if p else [_divider()]


def _build_story(data, st):
    story = []
    p = data.get('personal', {})

    name = _s(p.get('fullName', ''))
    if name:
        rp = _p(name, st['name'])
        if rp: story.append(rp)

    contacts = [_s(p.get(k,'')) for k in ['phone','email','location'] if _s(p.get(k,''))]
    if contacts:
        rp = _p('  |  '.join(contacts), st['contact'])
        if rp: story.append(rp)

    links = [_s(p.get(k,'')) for k in ['linkedin','github','leetcode','codechef','medium'] if _s(p.get(k,''))]
    if links:
        rp = _p('  |  '.join(links), st['contact'])
        if rp: story.append(rp)

    story.append(Spacer(1, 8))

    summary = _s(data.get('summary', ''))
    if summary:
        story += _sec('Professional Summary', st)
        rp = _p(summary, st['body'])
        if rp: story.append(rp)
        story.append(Spacer(1, 4))

    edus = [e for e in data.get('education', []) if e.get('degree') or e.get('college')]
    if edus:
        story += _sec('Education', st)
        for edu in edus:
            deg  = _s(edu.get('degree', ''))
            col  = _s(edu.get('college', ''))
            loc  = _s(edu.get('location', ''))
            s0   = _s(edu.get('startYear', ''))
            e0   = _s(edu.get('endYear', ''))
            cgpa = _s(edu.get('cgpa', ''))
            dur  = f"{s0} - {e0}" if s0 or e0 else ''
            sub  = ' | '.join(x for x in [col, loc] if x)
            if dur: sub += f" ({dur})" if sub else dur
            if deg:
                rp = _p(deg, st['etitle']); (story.append(rp) if rp else None)
            if sub:
                rp = _p(sub, st['esub']); (story.append(rp) if rp else None)
            if cgpa:
                rp = _p('CGPA: ' + cgpa, st['body']); (story.append(rp) if rp else None)
            story.append(Spacer(1, 3))

    sk = data.get('skills', {})
    pl = _s(sk.get('programmingLanguages', ''))
    ts = _s(sk.get('technicalSkills', ''))
    to = _s(sk.get('tools', ''))
    if pl or ts or to:
        story += _sec('Skills', st)
        for label, val in [('Programming Languages', pl), ('Technical Skills', ts), ('Tools and Technologies', to)]:
            if val:
                rp = _p(f"{label}: {val}", st['body']); (story.append(rp) if rp else None)
        story.append(Spacer(1, 3))

    projs = [p for p in data.get('projects', []) if p.get('name')]
    if projs:
        story += _sec('Projects', st)
        for proj in projs:
            pn = _s(proj.get('name', ''))
            pt = _s(proj.get('technologies', ''))
            pd = _s(proj.get('description', ''))
            pl2 = _s(proj.get('link', ''))
            ttxt = pn + (' | ' + pt if pt else '')
            rp = _p(ttxt, st['etitle']); (story.append(rp) if rp else None)
            if pd:
                for line in pd.split('\n'):
                    b = _bul(line, st['bullet'])
                    if b: story.append(b)
            if pl2:
                rp = _p('Link: ' + pl2, st['body']); (story.append(rp) if rp else None)
            story.append(Spacer(1, 3))

    exps = [e for e in data.get('experience', []) if e.get('company') or e.get('role')]
    if exps:
        story += _sec('Internship / Experience', st)
        for exp in exps:
            role = _s(exp.get('role', ''))
            comp = _s(exp.get('company', ''))
            dur  = _s(exp.get('duration', ''))
            desc = _s(exp.get('description', ''))
            if role:
                rp = _p(role, st['etitle']); (story.append(rp) if rp else None)
            sub = comp + (' | ' + dur if dur else '')
            if sub:
                rp = _p(sub, st['esub']); (story.append(rp) if rp else None)
            if desc:
                for line in desc.split('\n'):
                    b = _bul(line, st['bullet'])
                    if b: story.append(b)
            story.append(Spacer(1, 3))

    certs = [c for c in data.get('certifications', []) if c.get('name')]
    if certs:
        story += _sec('Certifications', st)
        for cert in certs:
            cn = _s(cert.get('name', ''))
            co = _s(cert.get('organization', ''))
            cy = _s(cert.get('year', ''))
            line = cn + (f" - {co}" if co else '') + (f" ({cy})" if cy else '')
            b = _bul(line, st['bullet'])
            if b: story.append(b)
        story.append(Spacer(1, 3))

    achs = [_s(a) for a in data.get('achievements', []) if _s(a)]
    if achs:
        story += _sec('Achievements', st)
        for ach in achs:
            b = _bul(ach, st['bullet'])
            if b: story.append(b)
        story.append(Spacer(1, 3))

    cw = _s(data.get('coursework', ''))
    if cw:
        story += _sec('Relevant Coursework', st)
        rp = _p(cw, st['body']); (story.append(rp) if rp else None)

    return story


def build_resume(data: dict) -> bytes:
    buf = io.BytesIO()
    st  = _build_styles()
    doc = SimpleDocTemplate(buf, pagesize=letter,
                            leftMargin=0.65*inch, rightMargin=0.65*inch,
                            topMargin=0.55*inch,  bottomMargin=0.55*inch)
    try:
        story = _build_story(data, st)
        doc.build(story)
    except Exception as e:
        print(f"[RG] build_resume failed: {e}. Retrying with deep sanitize.")
        import copy
        def ds(obj):
            if isinstance(obj, dict):  return {k: ds(v) for k, v in obj.items()}
            if isinstance(obj, list):  return [ds(i) for i in obj]
            if isinstance(obj, str):
                t = obj.encode('ascii', errors='ignore').decode('ascii')
                return ''.join(c if c.isalnum() or c in ' .,;:()-|/@+' else ' ' for c in t).strip()
            return obj
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter,
                                leftMargin=0.65*inch, rightMargin=0.65*inch,
                                topMargin=0.55*inch,  bottomMargin=0.55*inch)
        story = _build_story(ds(copy.deepcopy(data)), st)
        doc.build(story)
    return buf.getvalue()


def generate_resume(data: dict) -> bytes:
    return build_resume(data)
