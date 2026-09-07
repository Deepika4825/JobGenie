"""
Resume Generator Module - Backend Only
Generates professional ATS-friendly PDF resumes using ReportLab.
The template logic is completely hidden from the frontend.
"""

import io
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT


# ─── LaTeX-style escape (kept for forward compatibility) ────────────────────
_LATEX_SPECIAL = re.compile(r'([%&$#_{}~^\\])')

def escape_latex(text: str) -> str:
    """Escape special LaTeX characters (for future LaTeX backend)."""
    if not text:
        return ""
    replacements = {
        '\\': r'\textbackslash{}',
        '&':  r'\&',
        '%':  r'\%',
        '$':  r'\$',
        '#':  r'\#',
        '_':  r'\_',
        '{':  r'\{',
        '}':  r'\}',
        '~':  r'\textasciitilde{}',
        '^':  r'\textasciicircum{}',
    }
    result = []
    for ch in text:
        result.append(replacements.get(ch, ch))
    return ''.join(result)


def sanitize(text: str) -> str:
    """Sanitize text for PDF output — strip leading/trailing whitespace."""
    if not text:
        return ""
    return str(text).strip()


# ─── Color palette ──────────────────────────────────────────────────────────
PRIMARY   = colors.HexColor('#1a1a2e')   # deep navy
ACCENT    = colors.HexColor('#2563eb')   # blue
LIGHT     = colors.HexColor('#64748b')   # slate
DIVIDER   = colors.HexColor('#e2e8f0')   # light gray
WHITE     = colors.white


# ─── Style factory ──────────────────────────────────────────────────────────
def _build_styles():
    base = getSampleStyleSheet()

    name_style = ParagraphStyle(
        'NameStyle',
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=PRIMARY,
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    contact_style = ParagraphStyle(
        'ContactStyle',
        fontName='Helvetica',
        fontSize=9,
        textColor=LIGHT,
        alignment=TA_CENTER,
        spaceAfter=2,
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=ACCENT,
        spaceBefore=10,
        spaceAfter=3,
    )
    entry_title = ParagraphStyle(
        'EntryTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=PRIMARY,
        spaceAfter=1,
    )
    entry_subtitle = ParagraphStyle(
        'EntrySubtitle',
        fontName='Helvetica-Oblique',
        fontSize=9,
        textColor=LIGHT,
        spaceAfter=2,
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        fontName='Helvetica',
        fontSize=9.5,
        textColor=PRIMARY,
        leading=14,
        spaceAfter=2,
    )
    bullet_style = ParagraphStyle(
        'BulletStyle',
        fontName='Helvetica',
        fontSize=9.5,
        textColor=PRIMARY,
        leading=13,
        leftIndent=12,
        bulletIndent=0,
        spaceAfter=1,
    )
    skills_label = ParagraphStyle(
        'SkillsLabel',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        textColor=PRIMARY,
        spaceAfter=2,
    )
    return {
        'name': name_style,
        'contact': contact_style,
        'section': section_heading,
        'entry_title': entry_title,
        'entry_subtitle': entry_subtitle,
        'body': body_style,
        'bullet': bullet_style,
        'skills_label': skills_label,
    }


# ─── Section helpers ────────────────────────────────────────────────────────
def _divider():
    return HRFlowable(width='100%', thickness=0.5, color=DIVIDER, spaceAfter=4)


def _section_header(title: str, styles: dict):
    return [
        Paragraph(title.upper(), styles['section']),
        _divider(),
    ]


def _bullet_points(items: list, styles: dict):
    """Convert a list of strings to bullet paragraphs."""
    result = []
    for item in items:
        item = sanitize(item)
        if item:
            result.append(Paragraph(f"• {item}", styles['bullet']))
    return result


# ─── Main builder functions ──────────────────────────────────────────────────

def build_resume(data: dict) -> bytes:
    """
    Build a PDF resume from structured data.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    styles = _build_styles()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
    )

    story = []

    # ── Personal Info ────────────────────────────────────────────────────────
    personal = data.get('personal', {})
    name = sanitize(personal.get('fullName', ''))
    if name:
        story.append(Paragraph(name, styles['name']))

    # Contact line
    contact_parts = []
    if personal.get('phone'):
        contact_parts.append(sanitize(personal['phone']))
    if personal.get('email'):
        contact_parts.append(sanitize(personal['email']))
    if personal.get('location'):
        contact_parts.append(sanitize(personal['location']))
    if contact_parts:
        story.append(Paragraph(' | '.join(contact_parts), styles['contact']))

    # Links line
    link_parts = []
    if personal.get('linkedin'):
        link_parts.append(sanitize(personal['linkedin']))
    if personal.get('github'):
        link_parts.append(sanitize(personal['github']))
    if link_parts:
        story.append(Paragraph(' | '.join(link_parts), styles['contact']))

    story.append(Spacer(1, 6))

    # ── Professional Summary ─────────────────────────────────────────────────
    summary = sanitize(data.get('summary', ''))
    if summary:
        story += _section_header('Professional Summary', styles)
        story.append(Paragraph(summary, styles['body']))
        story.append(Spacer(1, 4))

    # ── Education ────────────────────────────────────────────────────────────
    education = [e for e in data.get('education', []) if e.get('degree') or e.get('college')]
    if education:
        story += _section_header('Education', styles)
        for edu in education:
            degree   = sanitize(edu.get('degree', ''))
            college  = sanitize(edu.get('college', ''))
            location = sanitize(edu.get('location', ''))
            start    = sanitize(edu.get('startYear', ''))
            end      = sanitize(edu.get('endYear', ''))
            cgpa     = sanitize(edu.get('cgpa', ''))

            duration = f"{start} – {end}" if start or end else ''
            subtitle_parts = [p for p in [college, location] if p]
            subtitle = ' | '.join(subtitle_parts)
            if duration:
                subtitle += f"  ({duration})" if subtitle else duration

            if degree:
                story.append(Paragraph(degree, styles['entry_title']))
            if subtitle:
                story.append(Paragraph(subtitle, styles['entry_subtitle']))
            if cgpa:
                story.append(Paragraph(f"CGPA / Percentage: {cgpa}", styles['body']))
            story.append(Spacer(1, 3))

    # ── Skills ───────────────────────────────────────────────────────────────
    skills = data.get('skills', {})
    prog_langs = sanitize(skills.get('programmingLanguages', ''))
    tech_skills = sanitize(skills.get('technicalSkills', ''))
    tools = sanitize(skills.get('tools', ''))

    if prog_langs or tech_skills or tools:
        story += _section_header('Skills', styles)
        if prog_langs:
            story.append(Paragraph(
                f"<b>Programming Languages:</b> {prog_langs}", styles['body']))
        if tech_skills:
            story.append(Paragraph(
                f"<b>Technical Skills:</b> {tech_skills}", styles['body']))
        if tools:
            story.append(Paragraph(
                f"<b>Tools & Technologies:</b> {tools}", styles['body']))
        story.append(Spacer(1, 3))

    # ── Projects ─────────────────────────────────────────────────────────────
    projects = [p for p in data.get('projects', []) if p.get('name')]
    if projects:
        story += _section_header('Projects', styles)
        for proj in projects:
            p_name  = sanitize(proj.get('name', ''))
            p_tech  = sanitize(proj.get('technologies', ''))
            p_desc  = sanitize(proj.get('description', ''))
            p_link  = sanitize(proj.get('link', ''))

            title_text = p_name
            if p_tech:
                title_text += f" | <font color='#64748b'><i>{p_tech}</i></font>"
            story.append(Paragraph(title_text, styles['entry_title']))

            if p_desc:
                for line in p_desc.split('\n'):
                    line = line.strip()
                    if line:
                        story.append(Paragraph(f"• {line}", styles['bullet']))
            if p_link:
                story.append(Paragraph(
                    f"<font color='#2563eb'>Link: {p_link}</font>", styles['body']))
            story.append(Spacer(1, 3))

    # ── Internship / Experience ──────────────────────────────────────────────
    experiences = [e for e in data.get('experience', []) if e.get('company') or e.get('role')]
    if experiences:
        story += _section_header('Internship / Experience', styles)
        for exp in experiences:
            company  = sanitize(exp.get('company', ''))
            role     = sanitize(exp.get('role', ''))
            duration = sanitize(exp.get('duration', ''))
            desc     = sanitize(exp.get('description', ''))

            if role:
                story.append(Paragraph(role, styles['entry_title']))
            sub = company
            if duration:
                sub += f" | {duration}" if sub else duration
            if sub:
                story.append(Paragraph(sub, styles['entry_subtitle']))
            if desc:
                for line in desc.split('\n'):
                    line = line.strip()
                    if line:
                        story.append(Paragraph(f"• {line}", styles['bullet']))
            story.append(Spacer(1, 3))

    # ── Certifications ───────────────────────────────────────────────────────
    certs = [c for c in data.get('certifications', []) if c.get('name')]
    if certs:
        story += _section_header('Certifications', styles)
        for cert in certs:
            c_name = sanitize(cert.get('name', ''))
            c_org  = sanitize(cert.get('organization', ''))
            c_year = sanitize(cert.get('year', ''))
            line = c_name
            if c_org:
                line += f" — {c_org}"
            if c_year:
                line += f" ({c_year})"
            story.append(Paragraph(f"• {line}", styles['bullet']))
        story.append(Spacer(1, 3))

    # ── Achievements ─────────────────────────────────────────────────────────
    achievements = [a for a in data.get('achievements', []) if sanitize(a)]
    if achievements:
        story += _section_header('Achievements', styles)
        story += _bullet_points(achievements, styles)
        story.append(Spacer(1, 3))

    # ── Coursework ───────────────────────────────────────────────────────────
    coursework = sanitize(data.get('coursework', ''))
    if coursework:
        story += _section_header('Relevant Coursework', styles)
        story.append(Paragraph(coursework, styles['body']))
        story.append(Spacer(1, 3))

    doc.build(story)
    return buffer.getvalue()


def generate_resume(data: dict) -> bytes:
    """
    Public entry point.
    Validates, sanitizes, and generates a PDF resume.
    Returns raw PDF bytes.
    """
    return build_resume(data)
