from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple, Dict, Any
import re
from collections import Counter

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ----------------------------
# Config / keyword utilities
# ----------------------------

STOPWORDS_EXTRA = {
    "resume", "cv", "responsible", "responsibilities", "work", "worked",
    "using", "use", "ability", "skills", "experience", "project", "projects",
    "role", "team", "teams", "company", "companies"
}

ACTION_VERBS = [
    "built", "led", "designed", "improved", "optimized",
    "reduced", "increased", "delivered", "implemented",
    "developed", "created", "automated", "deployed", "tested",
    "analyzed", "integrated", "maintained", "supported"
]

# ----------------------------
# Skill buckets (for gaps / plans)
# ----------------------------

SKILL_BUCKETS: Dict[str, List[str]] = {
    # Software
    "Frontend": ["react", "javascript", "typescript", "nextjs", "next.js", "redux", "tailwind", "css", "html", "ui", "frontend", "vite"],
    "Backend": ["node", "nodejs", "express", "fastapi", "django", "flask", "rest", "api", "backend", "auth", "jwt"],
    "Databases": ["sql", "mysql", "postgres", "postgresql", "mongodb", "database", "redis"],
    "Cloud/DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "ci", "cd", "cicd", "devops", "linux"],
    "Testing": ["testing", "jest", "cypress", "selenium", "unit", "integration", "pytest", "qa"],
    "Data": ["pandas", "numpy", "python", "excel", "powerbi", "tableau", "statistics", "dashboard", "etl"],

    # Hardware / Embedded / Networks
    "Embedded": ["embedded", "firmware", "microcontroller", "mcu", "rtos", "arm", "stm32", "esp32", "uart", "spi", "i2c", "jtag", "bare-metal"],
    "IoT": ["iot", "mqtt", "sensors", "edge", "aws iot", "azure iot"],
    "VLSI/RTL": ["vlsi", "rtl", "verilog", "systemverilog", "fpga", "timing", "synthesis", "simulation", "tcl"],
    "Networking": ["tcp", "ip", "tcp/ip", "routing", "switching", "dns", "dhcp", "firewall", "wireshark", "osi"],
}

# ----------------------------
# Role profiles (to recommend best role)
# ----------------------------

ROLE_PROFILES: Dict[str, Dict[str, Any]] = {
    "Frontend Developer (React)": {
        "must": ["react", "javascript", "css", "html"],
        "nice": ["typescript", "tailwind", "redux", "testing", "jest", "cypress", "accessibility"],
        "category_bias": ["Frontend", "Testing"],
    },
    "Backend Developer (API)": {
        "must": ["api", "rest"],
        "nice": ["fastapi", "node", "express", "jwt", "sql", "postgresql", "redis", "testing"],
        "category_bias": ["Backend", "Databases", "Testing"],
    },
    "Full Stack Developer": {
        "must": ["react", "api"],
        "nice": ["node", "fastapi", "sql", "postgresql", "docker", "aws", "typescript"],
        "category_bias": ["Frontend", "Backend", "Databases", "Cloud/DevOps"],
    },
    "Data Analyst": {
        "must": ["sql", "excel"],
        "nice": ["python", "pandas", "powerbi", "tableau", "dashboard", "statistics"],
        "category_bias": ["Data", "Databases"],
    },
    "QA / Test Engineer": {
        "must": ["testing"],
        "nice": ["cypress", "selenium", "jest", "api", "postman", "ci", "automation"],
        "category_bias": ["Testing", "Backend"],
    },
    "DevOps / Cloud Intern": {
        "must": ["docker", "linux"],
        "nice": ["aws", "ci", "cd", "kubernetes", "monitoring", "devops"],
        "category_bias": ["Cloud/DevOps"],
    },
    "Embedded Systems Engineer": {
        "must": ["c", "embedded"],
        "nice": ["rtos", "arm", "uart", "spi", "i2c", "jtag", "firmware"],
        "category_bias": ["Embedded"],
    },
    "IoT Engineer": {
        "must": ["iot"],
        "nice": ["mqtt", "embedded", "sensors", "esp32", "aws iot", "python"],
        "category_bias": ["IoT", "Embedded", "Cloud/DevOps"],
    },
    "VLSI / RTL Engineer (Entry)": {
        "must": ["verilog"],
        "nice": ["systemverilog", "rtl", "fpga", "timing", "simulation", "tcl", "synthesis"],
        "category_bias": ["VLSI/RTL"],
    },
    "Network Engineer (Entry)": {
        "must": ["tcp", "ip"],
        "nice": ["routing", "switching", "dns", "dhcp", "wireshark", "linux"],
        "category_bias": ["Networking", "Cloud/DevOps"],
    },
}

# ----------------------------
# Dataclass returned by analyze()
# ----------------------------

@dataclass
class Analysis:
    match_percent: int
    overall_score_10: float
    grade_label: str
    strengths: List[str]
    improvements: List[str]
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggested_keywords: List[str]
    formatting: float
    content_quality: float
    ats: float
    keyword_usage: float

    # Enhanced outputs
    executive_summary: str
    ats_checklist: List[Dict[str, Any]]
    recommended_roles: List[str]
    role_reason: str
    role_fit_breakdown: Dict[str, Any]

    top_skills_to_add: List[str]
    skill_priority: Dict[str, List[str]]

    learning_plan: List[str]
    project_ideas: List[str]
    bullet_rewrites: List[Dict[str, str]]


# ----------------------------
# Helpers
# ----------------------------

def _tokenize_keywords(text: str) -> List[str]:
    text = (text or "").lower()
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9\+\#\.\-\/]{1,}", text)
    cleaned: List[str] = []
    for t in tokens:
        t = t.strip().lower()
        if len(t) < 3:
            continue
        if t in STOPWORDS_EXTRA:
            continue
        cleaned.append(t)
    return cleaned


def extract_top_keywords(text: str, top_n: int = 30) -> List[str]:
    tokens = _tokenize_keywords(text)
    if not tokens:
        return []
    freq = Counter(tokens)
    ranked = [k for k, _ in freq.most_common(top_n)]
    return ranked


def similarity_score(resume_text: str, jd_text: str) -> float:
    docs = [resume_text or "", jd_text or ""]
    vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1)
    X = vec.fit_transform(docs)
    sim = cosine_similarity(X[0:1], X[1:2])[0][0]
    return float(sim)


def keyword_overlap(resume_text: str, jd_text: str, top_n: int = 40) -> Tuple[List[str], List[str]]:
    jd_keys = extract_top_keywords(jd_text, top_n=top_n)
    resume_low = (resume_text or "").lower()

    matched: List[str] = []
    missing: List[str] = []
    for k in jd_keys:
        if k in resume_low:
            matched.append(k)
        else:
            missing.append(k)

    return matched[:25], missing[:25]


def metric_formatting(resume_text: str) -> float:
    lines = [l.strip() for l in (resume_text or "").splitlines() if l.strip()]
    if not lines:
        return 3.0

    has_headings = any(
        re.match(r"^(experience|education|skills|projects|summary)\b", l.lower())
        for l in lines
    )
    bullets = sum(1 for l in lines if l.startswith(("-", "•", "*")))

    score = 6.5
    if has_headings:
        score += 1.0
    if bullets >= 5:
        score += 1.0
    if bullets >= 12:
        score += 0.5
    return min(10.0, score)


def metric_content_quality(resume_text: str) -> float:
    low = (resume_text or "").lower()
    verbs = sum(1 for v in ACTION_VERBS if v in low)
    numbers = len(re.findall(r"\b\d+(\.\d+)?%?\b", resume_text or ""))

    score = 6.0
    if verbs >= 3:
        score += 1.2
    if verbs >= 6:
        score += 0.8
    if numbers >= 3:
        score += 1.0
    if numbers >= 8:
        score += 0.6
    return min(10.0, score)


def metric_ats(resume_text: str) -> float:
    text = resume_text or ""
    length = len(text)
    weird = len(re.findall(r"[^\x09\x0A\x0D\x20-\x7E]", text))

    score = 7.0
    if length > 1200:
        score += 1.0
    if length > 2500:
        score += 0.5
    if weird > 30:
        score -= 1.0
    if "\n" not in text:
        score -= 1.0

    return max(2.0, min(10.0, score))


def metric_keyword_usage(match_percent: int) -> float:
    return max(2.0, min(10.0, 2.0 + (match_percent / 100) * 8.0))


def grade_from_score(score_10: float) -> str:
    if score_10 >= 8.8:
        return "Excellent"
    if score_10 >= 7.2:
        return "Good"
    if score_10 >= 5.8:
        return "Average"
    return "Needs Work"


def build_ats_checklist(resume_text: str) -> List[Dict[str, Any]]:
    text = (resume_text or "").strip()
    low = text.lower()
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    has_email = bool(re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text))
    has_phone = bool(re.search(r"\+?\d[\d\-\s()]{8,}\d", text))
    has_linkedin = "linkedin.com" in low
    has_headings = any(re.match(r"^(experience|education|skills|projects|summary)\b", l.lower()) for l in lines)
    bullet_count = sum(1 for l in lines if l.startswith(("-", "•", "*")))
    good_length = len(text) >= 900

    return [
        {"label": "Email present", "ok": has_email, "tip": "Add an email in the header."},
        {"label": "Phone number present", "ok": has_phone, "tip": "Add a reachable phone number."},
        {"label": "LinkedIn link present", "ok": has_linkedin, "tip": "Add LinkedIn URL (custom if possible)."},
        {"label": "Clear section headings", "ok": has_headings, "tip": "Use headings: Summary, Skills, Experience, Education."},
        {"label": "Bullet points used", "ok": bullet_count >= 6, "tip": "Use bullets for achievements (6+ recommended)."},
        {"label": "Good length", "ok": good_length, "tip": "Aim for 1 page (students) or 1–2 pages (experienced)."},
    ]


def _bucket_hits(text: str) -> Dict[str, int]:
    low = (text or "").lower()
    hits: Dict[str, int] = {}
    for cat, words in SKILL_BUCKETS.items():
        c = 0
        for w in words:
            if w in low:
                c += 1
        if c:
            hits[cat] = c
    return hits


def score_role_fit(resume_text: str, jd_text: str | None = None) -> Tuple[List[str], Dict[str, Any]]:
    """
    Returns (recommended_roles_sorted, breakdown)
    breakdown includes scores and category matches.
    """
    resume_low = (resume_text or "").lower()
    jd_low = (jd_text or "").lower() if jd_text else ""

    bucket = _bucket_hits(resume_text)
    role_scores = []

    for role, prof in ROLE_PROFILES.items():
        must = prof.get("must", [])
        nice = prof.get("nice", [])
        bias = prof.get("category_bias", [])

        must_hits = sum(1 for m in must if m in resume_low)
        nice_hits = sum(1 for n in nice if n in resume_low)

        # Bias score from bucket
        bias_score = sum(bucket.get(cat, 0) for cat in bias)

        # If JD exists, give extra score if role terms appear in JD
        jd_bonus = 0
        if jd_low:
            jd_bonus += sum(1 for m in must if m in jd_low) * 2
            jd_bonus += sum(1 for n in nice if n in jd_low)

        score = must_hits * 6 + nice_hits * 2 + bias_score * 1 + jd_bonus * 1
        role_scores.append((role, score, must_hits, nice_hits, bias_score, jd_bonus))

    role_scores.sort(key=lambda x: x[1], reverse=True)
    sorted_roles = [r for r, *_ in role_scores if _[0] is not None]

    breakdown = {
        "bucket_hits": bucket,
        "role_scores": [
            {
                "role": r,
                "score": sc,
                "must_hits": mh,
                "nice_hits": nh,
                "bucket_score": bs,
                "jd_bonus": jb,
            }
            for (r, sc, mh, nh, bs, jb) in role_scores[:8]
        ],
    }
    return [r for (r, *_rest) in role_scores[:10]], breakdown


def build_skill_priority(missing: List[str], jd_text: str) -> Dict[str, List[str]]:
    """
    Use TF-IDF on JD to prioritize missing terms:
    - add_first: most important missing terms
    - add_next: medium
    - add_later: remaining (or advanced bucket-related)
    """
    missing = [m for m in (missing or []) if m]
    jd = jd_text or ""

    if not missing or not jd.strip():
        return {"add_first": missing[:6], "add_next": missing[6:12], "add_later": missing[12:20]}

    # TF-IDF weighting for single document: approximate importance by frequency + position
    jd_low = jd.lower()
    freq = Counter(_tokenize_keywords(jd_low))
    ranked = sorted(missing, key=lambda k: freq.get(k.lower(), 0), reverse=True)

    add_first = ranked[:6]
    add_next = ranked[6:12]
    add_later = ranked[12:20]
    return {"add_first": add_first, "add_next": add_next, "add_later": add_later}


def build_learning_plan(best_role: str, skill_priority: Dict[str, List[str]], improvements: List[str]) -> List[str]:
    first = (skill_priority.get("add_first") or [])[:4]
    nxt = (skill_priority.get("add_next") or [])[:4]
    later = (skill_priority.get("add_later") or [])[:4]

    plan: List[str] = []
    plan.append(f"Target Role: {best_role} — align your Skills + Projects with this role.")
    if first:
        plan.append(f"Week 1–2: Learn {', '.join(first)} and add 1 project + 2 bullets proving it.")
    if nxt:
        plan.append(f"Week 3–4: Add {', '.join(nxt)} and improve ATS keywords across Experience.")
    if later:
        plan.append(f"Later: Explore {', '.join(later)} (optional/advanced).")

    for imp in (improvements or [])[:2]:
        plan.append(f"Resume Upgrade: {imp}")

    plan.append("Always: add measurable impact in bullets (%, time saved, users, accuracy, cost).")
    return plan[:8]


def build_project_ideas(best_role: str, skill_priority: Dict[str, List[str]]) -> List[str]:
    first = (skill_priority.get("add_first") or [])[:4]
    low_role = (best_role or "").lower()
    ideas: List[str] = []

    if "frontend" in low_role or "react" in low_role:
        ideas.append("Build a React dashboard (routing + charts + filters) and deploy it.")
        ideas.append("Create a component library (buttons/forms/modals) with accessibility.")
    elif "backend" in low_role or "api" in low_role:
        ideas.append("Build a REST API with JWT auth + CRUD + validation + documentation.")
        ideas.append("Add Redis caching + rate limiting and show performance improvements.")
    elif "full stack" in low_role:
        ideas.append("Build a full-stack job tracker: React + API + Postgres + auth.")
        ideas.append("Deploy with Docker + CI/CD (GitHub Actions).")
    elif "data analyst" in low_role:
        ideas.append("Build a Power BI/Tableau dashboard with SQL queries + KPI metrics.")
        ideas.append("Automate a report pipeline using Python + pandas + scheduling.")
    elif "qa" in low_role or "test" in low_role:
        ideas.append("Add Cypress/Selenium automation suite for a sample web app.")
        ideas.append("Write API test collection + integrate into CI pipeline.")
    elif "devops" in low_role or "cloud" in low_role:
        ideas.append("Dockerize an app + deploy to cloud with CI/CD pipeline.")
        ideas.append("Set up monitoring + alerts (basic logs + uptime).")
    elif "embedded" in low_role:
        ideas.append("Write firmware for sensor reading + UART/I2C communication with logs.")
        ideas.append("Implement RTOS task scheduling demo and measure latency.")
    elif "iot" in low_role:
        ideas.append("Build IoT sensor project sending data via MQTT to a dashboard.")
        ideas.append("Use ESP32 + cloud IoT + alerts for threshold events.")
    elif "rtl" in low_role or "vlsi" in low_role:
        ideas.append("Design and simulate an RTL block (FIFO/ALU) in Verilog and verify with testbench.")
        ideas.append("Run FPGA demo (simple pipeline) and document timing results.")
    elif "network" in low_role:
        ideas.append("Create a small home-lab network setup doc: VLANs + routing + firewall rules.")
        ideas.append("Wireshark capture analysis report (TCP handshake, retransmits, DNS).")
    else:
        ideas.append("Build a project that proves your top missing skills and add measurable results.")

    if first:
        ideas.append(f"Add these skills into projects: {', '.join(first)}.")
    return ideas[:7]


def build_bullet_rewrites(resume_text: str) -> List[Dict[str, str]]:
    """
    Find bullet lines and generate stronger rewrite suggestions.
    """
    lines = [l.strip() for l in (resume_text or "").splitlines() if l.strip()]
    bullets = [l for l in lines if l.startswith(("-", "•", "*"))]
    out: List[Dict[str, str]] = []

    def has_number(s: str) -> bool:
        return bool(re.search(r"\b\d+(\.\d+)?%?\b", s))

    for b in bullets[:10]:
        original = b.lstrip("-•* ").strip()
        suggestion = ""
        if has_number(original):
            suggestion = f"Improve: {original} (add more context: tools used + why it mattered + measurable outcome)."
        else:
            suggestion = (
                "Example rewrite: Built/Implemented <feature> using <tech> to achieve <result with number> "
                "(e.g., reduced load time by 35%, improved accuracy to 92%, served 5k users)."
            )
        out.append({"original": original, "suggestion": suggestion})

    return out


def build_executive_summary(match_percent: int, grade: str, strengths: List[str], improvements: List[str], missing: List[str]) -> str:
    s1 = strengths[0] if strengths else "You have a solid foundation."
    i1 = improvements[0] if improvements else "Add more role-specific keywords and measurable achievements."
    top_missing = ", ".join(missing[:7]) if missing else "role-specific keywords"

    return (
        f"Score: **{match_percent}% match** • Grade: **{grade}**. "
        f"Strength: {s1} "
        f"Next fix: {i1} "
        f"Add these skills/keywords naturally: {top_missing}."
    )


def _strengths_from_metrics(fmt: float, cq: float, kw: float) -> List[str]:
    strengths: List[str] = []
    if fmt >= 8:
        strengths.append("ATS-friendly structure with clear headings and spacing.")
    if cq >= 8:
        strengths.append("Good use of action verbs and measurable outcomes.")
    if kw >= 8:
        strengths.append("Strong keyword alignment with the job description.")
    if not strengths:
        strengths = ["Your resume is a solid base — with small tweaks it can rank much higher."]
    return strengths[:4]


def _improvements_from_metrics(fmt: float, cq: float, kw: float, missing: List[str]) -> List[str]:
    improvements: List[str] = []
    if kw < 8 and missing:
        improvements.append("Add missing keywords naturally into Skills + Experience bullets.")
    if cq < 8:
        improvements.append("Use more action verbs + numbers (impact, %, time saved, accuracy, users).")
    if fmt < 8:
        improvements.append("Use consistent bullet points and section headings (Experience, Skills, Education).")
    improvements.append("Tailor the top summary to match the role in 2–3 lines.")
    return improvements[:5]


# ----------------------------
# MAIN: analyze()
# ----------------------------

def analyze(resume_text: str, job_desc: str) -> Analysis:
    resume_text = resume_text or ""
    job_desc = (job_desc or "").strip()

    # Recommend roles always (even without JD)
    recommended_roles, role_fit_breakdown = score_role_fit(resume_text, job_desc if job_desc else None)
    best_role = recommended_roles[0] if recommended_roles else "—"

    # Resume-only scoring when JD missing
    if not job_desc:
        fmt = metric_formatting(resume_text)
        cq = metric_content_quality(resume_text)
        ats = metric_ats(resume_text)

        # keyword usage baseline (no JD)
        kw = 6.5
        overall = (fmt + cq + ats + kw) / 4.0
        overall = max(0.0, min(10.0, overall))
        grade = grade_from_score(overall)

        ats_checklist = build_ats_checklist(resume_text)

        # "missing" skills: for resume-only, suggest from role profile (best role)
        prof = ROLE_PROFILES.get(best_role, {})
        resume_low = resume_text.lower()
        role_missing = [k for k in (prof.get("nice", []) + prof.get("must", [])) if k not in resume_low]
        role_missing = list(dict.fromkeys(role_missing))  # unique preserve order

        skill_priority = {"add_first": role_missing[:6], "add_next": role_missing[6:12], "add_later": role_missing[12:20]}
        top_skills_to_add = (skill_priority["add_first"] + skill_priority["add_next"])[:12]

        strengths = [
            "Your resume has a clean structure and readable formatting.",
            "You can increase impact by adding measurable results in bullets.",
        ]
        improvements = [
            "Paste a job description to get keyword matching + missing terms + skill priority.",
            "Add a 2–3 line summary tailored to your target role.",
            "Add 2–3 quantified achievements (%, time saved, users, accuracy, revenue).",
        ]

        executive_summary = (
            f"Resume-only analysis complete. Your grade is **{grade}**. "
            f"Best-fit role: **{best_role}**. "
            f"To improve: add measurable impact + include role keywords in Skills/Experience."
        )

        role_reason = "Based on the strongest skill signals found in your resume (buckets + role profile matches)."

        learning_plan = build_learning_plan(best_role, skill_priority, improvements)
        project_ideas = build_project_ideas(best_role, skill_priority)
        bullet_rewrites = build_bullet_rewrites(resume_text)

        return Analysis(
            match_percent=0,
            overall_score_10=round(overall, 1),
            grade_label=grade,
            strengths=strengths[:4],
            improvements=improvements[:5],
            matched_keywords=[],
            missing_keywords=[],
            suggested_keywords=top_skills_to_add[:8],
            formatting=round(fmt, 1),
            content_quality=round(cq, 1),
            ats=round(ats, 1),
            keyword_usage=round(kw, 1),
            executive_summary=executive_summary,
            ats_checklist=ats_checklist,
            recommended_roles=recommended_roles,
            role_reason=role_reason,
            role_fit_breakdown=role_fit_breakdown,
            top_skills_to_add=top_skills_to_add,
            skill_priority=skill_priority,
            learning_plan=learning_plan,
            project_ideas=project_ideas,
            bullet_rewrites=bullet_rewrites,
        )

    # ----------------------------
    # Full scoring with JD
    # ----------------------------
    sim = similarity_score(resume_text, job_desc)
    matched, missing = keyword_overlap(resume_text, job_desc, top_n=45)

    denom = max(1, (len(matched) + len(missing)))
    overlap = len(matched) / denom

    match_percent = int(round((0.55 * sim + 0.45 * overlap) * 100))
    match_percent = max(0, min(100, match_percent))

    fmt = metric_formatting(resume_text)
    cq = metric_content_quality(resume_text)
    ats = metric_ats(resume_text)
    kw = metric_keyword_usage(match_percent)

    overall = (0.25 * fmt + 0.25 * cq + 0.25 * ats + 0.25 * kw)
    overall = max(0.0, min(10.0, overall))
    grade = grade_from_score(overall)

    strengths = _strengths_from_metrics(fmt, cq, kw)
    improvements = _improvements_from_metrics(fmt, cq, kw, missing)

    ats_checklist = build_ats_checklist(resume_text)

    # skill priority based on JD importance
    skill_priority = build_skill_priority(missing, job_desc)
    top_skills_to_add = (skill_priority["add_first"] + skill_priority["add_next"])[:12]

    # better role reason when JD exists
    role_reason = (
        f"Recommended **{best_role}** because your resume matches key skill buckets "
        f"and aligns best with the JD keywords (match={match_percent}%). "
        f"Improve fastest by adding: {', '.join(skill_priority['add_first'][:5])}."
    )

    executive_summary = build_executive_summary(match_percent, grade, strengths, improvements, missing)

    learning_plan = build_learning_plan(best_role, skill_priority, improvements)
    project_ideas = build_project_ideas(best_role, skill_priority)
    bullet_rewrites = build_bullet_rewrites(resume_text)

    suggested_keywords = missing[:10]

    return Analysis(
        match_percent=match_percent,
        overall_score_10=round(overall, 1),
        grade_label=grade,
        strengths=strengths[:4],
        improvements=improvements[:5],
        matched_keywords=matched[:25],
        missing_keywords=missing[:25],
        suggested_keywords=suggested_keywords,
        formatting=round(fmt, 1),
        content_quality=round(cq, 1),
        ats=round(ats, 1),
        keyword_usage=round(kw, 1),
        executive_summary=executive_summary,
        ats_checklist=ats_checklist,
        recommended_roles=recommended_roles,
        role_reason=role_reason,
        role_fit_breakdown=role_fit_breakdown,
        top_skills_to_add=top_skills_to_add,
        skill_priority=skill_priority,
        learning_plan=learning_plan,
        project_ideas=project_ideas,
        bullet_rewrites=bullet_rewrites,
    )