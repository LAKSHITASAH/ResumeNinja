from typing import List, Dict, Optional, Any
from pydantic import BaseModel


class MetricScores(BaseModel):
    formatting: float = 0.0
    content_quality: float = 0.0
    ats_compatibility: float = 0.0
    keyword_usage: float = 0.0


class AnalyzeResponse(BaseModel):
    # base
    overall_score: float
    grade_label: str
    match_percent: int

    strengths: List[str] = []
    improvements: List[str] = []

    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    suggested_keywords: List[str] = []

    metrics: MetricScores

    # detailed
    executive_summary: str = ""
    ats_checklist: List[Dict[str, Any]] = []

    # (kept for backward compatibility — your new scoring.py might not return skill_gap)
    skill_gap: List[Dict[str, Any]] = []

    learning_plan: List[str] = []
    project_ideas: List[str] = []

    # role + skills
    recommended_roles: List[str] = []
    role_reason: str = ""
    top_skills_to_add: List[str] = []
    skill_priority: Dict[str, List[str]] = {
        "add_first": [],
        "add_next": [],
        "add_later": []
    }

    # resume-worded style
    line_analysis: List[Dict[str, str]] = []     # {line, issue, severity}
    bullet_rewrites: List[Dict[str, str]] = []   # {original, suggestion}

    # optional
    resume_preview: Optional[str] = ""