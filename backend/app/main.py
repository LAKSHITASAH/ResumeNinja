from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional, Any, Dict
from pydantic import BaseModel
from io import BytesIO

from app.core.config import settings
from app.models.schemas import AnalyzeResponse, MetricScores
from app.services.parser import extract_resume_text
from app.services.scoring import analyze

# ✅ NEW (builder PDF)
from app.services.builder_pdf import render_resume_pdf


app = FastAPI(title=settings.app_name, version=settings.version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Resume Analyzer API running. Visit /docs"}


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name, "version": settings.version}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    # ✅ accept both names (frontend might send either)
    file: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),

    # ✅ accept both names for JD too
    job_desc: str = Form(""),
    job_description: str = Form("")
):
    try:
        uploaded = file or resume
        jd_text = (job_desc or "").strip() or (job_description or "").strip()

        if not uploaded:
            raise HTTPException(status_code=400, detail="Missing resume file. Please upload PDF/DOCX.")

        file_bytes = await uploaded.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        text, _filetype = extract_resume_text(uploaded.filename or "", file_bytes)
        if not text or len(text) < 50:
            raise HTTPException(status_code=400, detail="Could not extract enough text from resume.")

        result = analyze(text, jd_text)

        return AnalyzeResponse(
            overall_score=result.overall_score_10,
            grade_label=result.grade_label,
            match_percent=result.match_percent,

            strengths=result.strengths,
            improvements=result.improvements,

            matched_keywords=result.matched_keywords,
            missing_keywords=result.missing_keywords,
            suggested_keywords=result.suggested_keywords,

            metrics=MetricScores(
                formatting=result.formatting,
                content_quality=result.content_quality,
                ats_compatibility=result.ats,
                keyword_usage=result.keyword_usage
            ),

            executive_summary=result.executive_summary,
            ats_checklist=result.ats_checklist,
            skill_gap=getattr(result, "skill_gap", []),

            learning_plan=result.learning_plan,
            project_ideas=result.project_ideas,

            recommended_roles=result.recommended_roles,
            role_reason=result.role_reason,

            top_skills_to_add=result.top_skills_to_add,
            skill_priority=result.skill_priority,

            line_analysis=getattr(result, "line_analysis", []),
            bullet_rewrites=result.bullet_rewrites,

            resume_preview=text[:1200],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")


# =========================
# ✅ NEW: Resume Builder API
# =========================
class ResumeBuilderPayload(BaseModel):
    resume: Dict[str, Any]


@app.post("/builder/render/pdf")
async def builder_render_pdf(payload: ResumeBuilderPayload):
    """
    Generate an ATS-safe PDF (single-column, selectable text) from resume JSON.
    """
    try:
        pdf_bytes = render_resume_pdf(payload.resume)
        filename = (payload.resume.get("name") or "resume").replace(" ", "_") + "_ATS.pdf"

        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF render error: {e}")