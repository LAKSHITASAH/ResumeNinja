from __future__ import annotations
from typing import Tuple
import re

def _clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    import fitz  # PyMuPDF
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    parts = []
    for page in doc:
        parts.append(page.get_text("text"))
    return _clean_text("\n".join(parts))

def extract_text_from_docx(file_bytes: bytes) -> str:
    from docx import Document
    import io
    doc = Document(io.BytesIO(file_bytes))
    parts = []
    for p in doc.paragraphs:
        if p.text.strip():
            parts.append(p.text.strip())
    return _clean_text("\n".join(parts))

def extract_resume_text(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    """
    Returns (text, file_type)
    """
    name = (filename or "").lower()

    if name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes), "pdf"
    if name.endswith(".docx"):
        return extract_text_from_docx(file_bytes), "docx"

    # Basic fallback if user uploads without extension
    # Try PDF first, then DOCX
    try:
        return extract_text_from_pdf(file_bytes), "pdf"
    except Exception:
        return extract_text_from_docx(file_bytes), "docx"