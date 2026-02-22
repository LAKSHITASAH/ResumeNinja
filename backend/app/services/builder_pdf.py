from io import BytesIO
from typing import Any, Dict, List

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors


def _safe_list(x):
    return x if isinstance(x, list) else []


def _clean(s):
    return (s or "").strip()


def render_resume_pdf(resume: Dict[str, Any]) -> bytes:
    """
    ATS-safe PDF generator:
    - Single column
    - No icons or complex tables
    - Selectable text
    - Headings + rules like typical ATS templates
    - Name centered (as requested)
    - Adds ACTIVITIES section
    """
    buf = BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title="ATS Resume",
        author=_clean(resume.get("name")) or "Resume",
    )

    styles = getSampleStyleSheet()

    # Fonts (use built-in Helvetica for maximum compatibility)
    base = ParagraphStyle(
        "Base",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=13.5,
        spaceAfter=0,
        textColor=colors.black,
    )

    name_style = ParagraphStyle(
        "Name",
        parent=base,
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=6,
    )

    contact_style = ParagraphStyle(
        "Contact",
        parent=base,
        fontSize=10.2,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.black,
        spaceAfter=10,
    )

    heading_style = ParagraphStyle(
        "Heading",
        parent=base,
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=14,
        alignment=TA_LEFT,
        spaceBefore=8,
        spaceAfter=4,
    )

    small_style = ParagraphStyle(
        "Small",
        parent=base,
        fontSize=10.2,
        leading=13,
    )

    subhead_style = ParagraphStyle(
        "Subhead",
        parent=base,
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13.5,
        spaceAfter=1,
    )

    muted_style = ParagraphStyle(
        "Muted",
        parent=base,
        fontSize=9.8,
        leading=12.5,
        textColor=colors.black,
    )

    # --- Helpers ---
    story: List[Any] = []

    def rule():
        # Thin horizontal line (ATS safe)
        story.append(Paragraph('<font size="1"> </font>', base))
        story.append(Spacer(1, 2))

    def section(title: str):
        story.append(Paragraph(title.upper(), heading_style))
        # underline rule using HR-like paragraph (simple)
        story.append(Paragraph('<font size="1">______________________________________________</font>', muted_style))
        story.append(Spacer(1, 6))

    def bullets(lines: List[str]):
        clean_lines = [_clean(x) for x in lines if _clean(x)]
        if not clean_lines:
            return
        lf = ListFlowable(
            [
                ListItem(Paragraph(l, small_style), leftIndent=12, value="bullet")
                for l in clean_lines
            ],
            bulletType="bullet",
            leftIndent=12,
            bulletFontName="Helvetica",
            bulletFontSize=9,
            bulletOffsetY=2,
        )
        story.append(lf)

    # --- Header ---
    name = _clean(resume.get("name")) or "Your Name"
    story.append(Paragraph(name, name_style))

    location = _clean(resume.get("location"))
    email = _clean(resume.get("email"))
    phone = _clean(resume.get("phone"))
    links = [x for x in _safe_list(resume.get("links")) if _clean(x)]
    contact_parts = [x for x in [location, email, phone] if x] + links
    contact_line = " | ".join(contact_parts) if contact_parts else ""
    if contact_line:
        story.append(Paragraph(contact_line, contact_style))
    else:
        story.append(Spacer(1, 6))

    # --- Summary ---
    summary = _clean(resume.get("summary"))
    if summary:
        section("Summary")
        story.append(Paragraph(summary, small_style))
        story.append(Spacer(1, 6))

    # --- Activities (NEW) ---
    activities = [x for x in _safe_list(resume.get("activities")) if _clean(x)]
    if activities:
        section("Activities / Extracurricular")
        bullets(activities)
        story.append(Spacer(1, 6))

    # --- Education ---
    education = _safe_list(resume.get("education"))
    edu_clean = [
        e for e in education
        if _clean(e.get("school")) or _clean(e.get("degree")) or _clean(e.get("dates")) or _clean(e.get("location"))
    ]
    if edu_clean:
        section("Education")
        for e in edu_clean:
            left = " — ".join([x for x in [_clean(e.get("school")), _clean(e.get("location"))] if x])
            right = _clean(e.get("dates"))
            degree = _clean(e.get("degree"))

            # line: School — Location .... Dates
            line = left
            if right:
                line = f"{line} <font name='Helvetica'> </font> <font name='Helvetica'>{' '}</font>"
                # Don't rely on tables; just append dates on next line to keep ATS safe.
            story.append(Paragraph(left, subhead_style))
            if degree:
                story.append(Paragraph(degree, small_style))
            if right:
                story.append(Paragraph(right, muted_style))
            story.append(Spacer(1, 6))

    # --- Experience ---
    exp = _safe_list(resume.get("experience"))
    exp_clean = [
        ex for ex in exp
        if _clean(ex.get("role")) or _clean(ex.get("company")) or _clean(ex.get("dates")) or _clean(ex.get("location"))
    ]
    if exp_clean:
        section("Experience / Internships")
        for ex in exp_clean:
            header_left = " — ".join([x for x in [_clean(ex.get("role")), _clean(ex.get("company"))] if x]) or "Experience"
            meta = " | ".join([x for x in [_clean(ex.get("location")), _clean(ex.get("dates"))] if x])

            story.append(Paragraph(header_left, subhead_style))
            if meta:
                story.append(Paragraph(meta, muted_style))
            b = _safe_list(ex.get("bullets"))
            bullets(b)
            story.append(Spacer(1, 8))

    # --- Projects ---
    projects = _safe_list(resume.get("projects"))
    proj_clean = [
        p for p in projects
        if _clean(p.get("title")) or _clean(p.get("tech")) or _clean(p.get("dates"))
    ]
    if proj_clean:
        section("Projects")
        for p in proj_clean:
            title = _clean(p.get("title")) or "Project"
            tech = _clean(p.get("tech"))
            dates = _clean(p.get("dates"))

            headline = title
            if tech:
                headline = f"{headline} — {tech}"
            story.append(Paragraph(headline, subhead_style))
            if dates:
                story.append(Paragraph(dates, muted_style))
            bullets(_safe_list(p.get("bullets")))
            story.append(Spacer(1, 8))

    # --- Skills ---
    skills = _safe_list(resume.get("skills_list"))
    if skills:
        section("Technical Skills")
        story.append(Paragraph(", ".join([_clean(s) for s in skills if _clean(s)]), small_style))
        story.append(Spacer(1, 6))

    # --- Certifications ---
    certs = [x for x in _safe_list(resume.get("certifications")) if _clean(x)]
    if certs:
        section("Certifications")
        bullets(certs)
        story.append(Spacer(1, 6))

    doc.build(story)
    return buf.getvalue()