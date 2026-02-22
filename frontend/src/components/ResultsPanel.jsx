import { useMemo, useRef, useState } from "react";

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Badge({ tone = "gray", children }) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "red"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={clsx("px-2 py-1 rounded-full text-[11px] border", cls)}>
      {children}
    </span>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "px-3 py-2 rounded-xl text-xs border transition",
        active
          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle ? (
            <div className="text-xs text-slate-600 mt-1">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Chip({ tone = "gray", children }) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : tone === "bad"
      ? "bg-rose-50 border-rose-200 text-rose-700"
      : tone === "blue"
      ? "bg-blue-50 border-blue-200 text-blue-700"
      : tone === "amber"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <span className={clsx("px-2 py-1 rounded-full text-xs border", cls)}>
      {children}
    </span>
  );
}

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span>0</span>
        <span>100</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
        <div className="h-full bg-blue-600" style={{ width: `${v}%` }} />
      </div>
      <div className="mt-2 text-sm">
        Match Score: <span className="font-semibold">{v}%</span>
      </div>
    </div>
  );
}

function ScorePill({ matchPercent, grade }) {
  const tone =
    matchPercent >= 75 ? "green" : matchPercent >= 55 ? "amber" : "red";
  const label =
    matchPercent >= 75 ? "Strong" : matchPercent >= 55 ? "Okay" : "Needs work";
  return (
    <div className="flex items-center gap-2">
      <Badge tone={tone}>{label}</Badge>
      <Badge tone="blue">{grade}</Badge>
    </div>
  );
}

/** ✅ Donut chart: pure SVG (no libs) */
function Donut({ value = 0, label = "Score", sublabel = "", size = 92 }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 w-full min-w-0">
      <div className="flex items-center gap-3">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(226 232 240)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(37 99 235)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            style={{ fontSize: 16, fontWeight: 700, fill: "rgb(15 23 42)" }}
          >
            {v}%
          </text>
          <text
            x="50%"
            y="64%"
            dominantBaseline="middle"
            textAnchor="middle"
            style={{ fontSize: 10, fill: "rgb(100 116 139)" }}
          >
            {label}
          </text>
        </svg>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <div className="text-xs text-slate-600 mt-1">{sublabel}</div>
          <div className="mt-2 text-xs text-slate-500">
            Tip: Increase by adding relevant keywords + measurable results.
          </div>
        </div>
      </div>
    </div>
  );
}

function buildReportText(s) {
  return `Resume Analyzer Report

Overall Score: ${s.overall_score_10}/10
Grade: ${s.grade_label}
Match: ${s.match_percent}%

Best Role: ${s.best_role || "—"}
Why: ${s.role_reason || "—"}

Executive Summary:
${s.executive_summary || "—"}

Recommended Roles:
${(s.recommended_roles || []).map((r) => `- ${r}`).join("\n")}

Top Strengths:
${(s.strengths || []).map((x) => `- ${x}`).join("\n")}

Top Fixes:
${(s.improvements || []).map((x) => `- ${x}`).join("\n")}

Skills to Add (Priority):
Add first: ${(s.skill_priority?.add_first || []).join(", ")}
Add next: ${(s.skill_priority?.add_next || []).join(", ")}
Add later: ${(s.skill_priority?.add_later || []).join(", ")}

Matched Keywords:
${(s.matched_keywords || []).join(", ")}

Missing Keywords:
${(s.missing_keywords || []).join(", ")}

Learning Plan:
${(s.learning_plan || []).map((x) => `- ${x}`).join("\n")}

Project Ideas:
${(s.project_ideas || []).map((x) => `- ${x}`).join("\n")}

Bullet Rewrite Suggestions:
${(s.bullet_rewrites || [])
    .map((b) => `- Original: ${b.original}\n  Suggestion: ${b.suggestion}`)
    .join("\n\n")}
`;
}

function InfoCard({ title, right, children, className = "" }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white p-4 min-w-0",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function ResultsPanel({ result, loading, resumePreviewUrl }) {
  const [tab, setTab] = useState("recommendations");
  const [previewHeight, setPreviewHeight] = useState(70); // vh

  // ✅ ONLY ADDITION: anchor ref for smooth scroll to tab content
  const tabContentRef = useRef(null);

  // ✅ ONLY ADDITION: smooth scroll helper
  const scrollToTabContent = () => {
    const el = tabContentRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88; // adjust if header height differs
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const safe = useMemo(() => {
    if (!result) return null;

    const recommended_roles = result.recommended_roles ?? [];
    const best_role = recommended_roles?.[0] || "—";

    return {
      match_percent: result.match_percent ?? 0,
      overall_score_10: result.overall_score ?? result.overall_score_10 ?? 0,
      grade_label: result.grade_label ?? "—",

      executive_summary: result.executive_summary ?? "",
      strengths: result.strengths ?? [],
      improvements: result.improvements ?? [],
      ats_checklist: result.ats_checklist ?? [],

      recommended_roles,
      best_role,
      role_reason: result.role_reason ?? "",

      skill_priority: result.skill_priority ?? { add_first: [], add_next: [], add_later: [] },
      top_skills_to_add: result.top_skills_to_add ?? [],

      matched_keywords: result.matched_keywords ?? [],
      missing_keywords: result.missing_keywords ?? [],
      suggested_keywords: result.suggested_keywords ?? [],

      learning_plan: result.learning_plan ?? [],
      project_ideas: result.project_ideas ?? [],
      bullet_rewrites: result.bullet_rewrites ?? [],

      metrics: result.metrics ?? {
        formatting: result.formatting ?? 0,
        content_quality: result.content_quality ?? 0,
        ats_compatibility: result.ats ?? 0,
        keyword_usage: result.keyword_usage ?? 0,
      },
    };
  }, [result]);

  function copyReport() {
    if (!safe) return;
    const txt = buildReportText(safe);
    navigator.clipboard.writeText(txt);
    alert("Copied full report ✅");
  }

  function downloadReport() {
    if (!safe) return;
    const txt = buildReportText(safe);
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-analyzer-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const atsOkCount = safe?.ats_checklist?.filter((x) => x.ok).length || 0;
  const atsTotal = safe?.ats_checklist?.length || 0;
  const atsPercent = atsTotal ? Math.round((atsOkCount / atsTotal) * 100) : 0;

  const topMissing = (safe?.missing_keywords || []).slice(0, 10);
  const topSuggested = (safe?.suggested_keywords || []).slice(0, 10);
  const topPriorityFirst = (safe?.skill_priority?.add_first || []).slice(0, 10);

  const atsTips = [
    "Use simple section headers: Experience, Projects, Skills, Education.",
    "Move important keywords into Skills + relevant project bullets (naturally).",
    "Add 2–4 measurable outcomes (%, time saved, users, accuracy).",
    "Ensure job titles + dates are consistent and easy to parse.",
    "Avoid icons/tables for key text; keep it ATS-readable.",
  ];

  // ✅ NEW: extra insights (no backend change, just derived from existing data)
  const matchedCount = safe?.matched_keywords?.length || 0;
  const missingCount = safe?.missing_keywords?.length || 0;
  const keywordCoverage = matchedCount + missingCount ? Math.round((matchedCount / (matchedCount + missingCount)) * 100) : 0;

  const bulletCount = safe?.bullet_rewrites?.length || 0;
  const quickWins = (safe?.improvements || []).slice(0, 3);
  const signatureStrengths = (safe?.strengths || []).slice(0, 3);
  const topMatched = (safe?.matched_keywords || []).slice(0, 10);

  const quantIdeas = [
    "Add 1–2 numbers to each key project (time saved, accuracy, % improvement, users).",
    "Prefer strong verbs (Built, Automated, Designed, Improved, Reduced).",
    "Mention tools in the same bullet: <Tech> + <Outcome>.",
    "If no metrics available, estimate with ranges (e.g., 10–20%) and be consistent.",
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-56 bg-slate-100 rounded" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!safe) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="text-sm text-slate-700">
          Upload a resume to see your analysis here (and your resume preview on the right for PDF).
        </div>
      </div>
    );
  }

  const s = safe;

  return (
    <div className="w-full min-w-0">
      <div className="grid 2xl:grid-cols-[520px,1fr] gap-6 items-start w-full min-w-0">
        {/* LEFT: Score + Nav + NEW INSIGHTS (fills blank area nicely) */}
        <div className="space-y-6 min-w-0">
          <SectionCard
            title="Resume Review"
            subtitle={
              <span>
                Overall: <b>{s.overall_score_10}/10</b> • Match: <b>{s.match_percent}%</b>
              </span>
            }
            right={<ScorePill matchPercent={s.match_percent} grade={s.grade_label} />}
          >
            <ProgressBar value={s.match_percent} />

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <Donut value={s.match_percent} label="Match" sublabel="JD alignment" />
              <Donut value={atsPercent} label="ATS" sublabel="Parsing checks" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyReport}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Copy Full Report
              </button>
              <button
                type="button"
                onClick={downloadReport}
                className="px-3 py-2 rounded-xl bg-white text-slate-800 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
              >
                Download TXT
              </button>
              <div className="ml-auto flex items-center gap-2">
                <Badge tone="blue">ATS: {atsPercent}%</Badge>
                <Badge tone={s.match_percent >= 55 ? "green" : "amber"}>
                  Skills to add: {(s.top_skills_to_add || []).length}
                </Badge>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Navigation" subtitle="Switch between key outputs (these update based on the JD you paste).">
            <div className="flex flex-wrap gap-2">
              <Tab
                active={tab === "recommendations"}
                onClick={() => {
                  setTab("recommendations");
                  scrollToTabContent(); // ✅ ADDED
                }}
              >
                Recommendations
              </Tab>
              <Tab
                active={tab === "skills"}
                onClick={() => {
                  setTab("skills");
                  scrollToTabContent(); // ✅ ADDED
                }}
              >
                Skills & Keywords
              </Tab>
              <Tab
                active={tab === "ats"}
                onClick={() => {
                  setTab("ats");
                  scrollToTabContent(); // ✅ ADDED
                }}
              >
                ATS Checks
              </Tab>
              <Tab
                active={tab === "projects"}
                onClick={() => {
                  setTab("projects");
                  scrollToTabContent(); // ✅ ADDED
                }}
              >
                Learning & Projects
              </Tab>
            </div>
          </SectionCard>

          {/* ✅ NEW: Resume Insights (no backend change, just derived from existing data) */}
          <SectionCard
            title="Resume Insights"
            subtitle="Extra analysis & practical advice based on your current resume + JD match."
            right={<Badge tone="blue">Auto</Badge>}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Keyword coverage</div>
                  <Badge tone={keywordCoverage >= 65 ? "green" : keywordCoverage >= 45 ? "amber" : "red"}>
                    {keywordCoverage}%
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Matched: <b>{matchedCount}</b> • Missing: <b>{missingCount}</b>
                </div>
                <div className="mt-3 text-xs text-slate-600">
                  Aim for <b>65%+</b> coverage by adding missing terms naturally in <b>Skills</b> + <b>Projects</b>.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Impact readiness</div>
                  <Badge tone={bulletCount >= 3 ? "green" : bulletCount >= 1 ? "amber" : "red"}>
                    Bullets: {bulletCount}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  {bulletCount
                    ? "You have rewrite candidates—convert them into quantified outcomes."
                    : "No rewrite candidates detected—still add more measurable outcomes to stand out."}
                </div>
                <div className="mt-3 text-xs text-slate-600">
                  Target: <b>2–4</b> quantified results across your strongest projects.
                </div>
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold">Your strongest signals</div>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {(signatureStrengths.length ? signatureStrengths : ["—"]).map((x, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-600">●</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold">Fastest improvements</div>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {(quickWins.length ? quickWins : ["—"]).map((x, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-rose-600">●</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Add numbers like a pro</div>
                <Badge tone="amber">Template</Badge>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Quick ways to quantify even if you don’t have tracking dashboards yet.
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {quantIdeas.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-600">●</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Top matched keywords</div>
                <Badge tone="blue">{topMatched.length}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {topMatched.length ? (
                  topMatched.map((k) => (
                    <Chip key={k} tone="good">
                      {k}
                    </Chip>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No matched keywords available.</span>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: Preview + premium blocks */}
        <div className="space-y-6 min-w-0">
          <SectionCard
            title="Your Resume"
            subtitle="PDF preview shows here. For DOCX, preview may not render."
            right={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600">Height</span>
                <input
                  type="range"
                  min={55}
                  max={85}
                  value={previewHeight}
                  onChange={(e) => setPreviewHeight(Number(e.target.value))}
                  className="w-28"
                />
                <Badge tone="blue">{previewHeight}vh</Badge>
              </div>
            }
          >
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden"
              style={{ height: `${previewHeight}vh` }}
            >
              {resumePreviewUrl ? (
                <iframe title="Resume Preview" src={resumePreviewUrl} className="w-full h-full" />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-600 p-6 text-center">
                  Upload a PDF resume to preview it here.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Quick actions to improve your resume today"
            subtitle="These are the fastest changes recruiters notice."
            right={<Badge tone="amber">High impact</Badge>}
          >
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Add measurable impact</div>
                <div className="mt-2 text-xs text-slate-600">
                  Convert bullets into results: time saved, accuracy, revenue, users, % improvement.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip tone="amber">% improved</Chip>
                  <Chip tone="amber">time saved</Chip>
                  <Chip tone="amber">users served</Chip>
                  <Chip tone="amber">cost reduced</Chip>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Tune for ATS</div>
                <div className="mt-2 text-xs text-slate-600">
                  Keep simple headings and add missing keywords naturally in Skills + Projects.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip tone="blue">Skills section</Chip>
                  <Chip tone="blue">Tools</Chip>
                  <Chip tone="blue">Tech keywords</Chip>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Skill roadmap for your target role" subtitle="Learn in the correct order (first → next → later).">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-sm font-semibold text-rose-900">Add first</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(s.skill_priority?.add_first || []).slice(0, 10).map((k) => (
                    <Chip key={k} tone="bad">
                      {k}
                    </Chip>
                  ))}
                  {!(s.skill_priority?.add_first || []).length && (
                    <span className="text-xs text-rose-700">Paste a JD to generate this.</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold text-amber-900">Add next</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(s.skill_priority?.add_next || []).slice(0, 10).map((k) => (
                    <Chip key={k} tone="amber">
                      {k}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Add later</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(s.skill_priority?.add_later || []).slice(0, 10).map((k) => (
                    <Chip key={k}>{k}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ✅ SCROLL TARGET ANCHOR (added only for scroll) */}
        <div ref={tabContentRef} />

        {/* Recommendations tab (FULL - as you gave) */}
        {tab === "recommendations" && (
          <div className="2xl:col-span-2 min-w-0">
            <SectionCard
              title="Recommendations"
              subtitle="Role fit + resume improvements (auto-updates with your JD)."
              right={<Badge tone="blue">Top roles: {s.recommended_roles?.length || 0}</Badge>}
            >
              <div className="grid xl:grid-cols-3 gap-4 items-start min-w-0">
                <div className="xl:col-span-2 space-y-4 min-w-0">
                  <InfoCard
                    title="Best role for you"
                    right={<Badge tone="blue">Best fit</Badge>}
                    className="bg-gradient-to-br from-blue-50 to-white"
                  >
                    <div className="text-base font-bold text-slate-900">{s.best_role}</div>
                    <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {s.role_reason || "Add a Job Description for a more targeted role recommendation."}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(s.recommended_roles || []).slice(0, 10).map((r) => (
                        <Chip key={r} tone={r === s.best_role ? "blue" : "gray"}>
                          {r}
                        </Chip>
                      ))}
                    </div>
                  </InfoCard>

                  <div className="grid md:grid-cols-2 gap-4 min-w-0">
                    <InfoCard title="Executive Summary">
                      <div className="text-sm text-slate-700 leading-relaxed">
                        {s.executive_summary || "Paste a Job Description to generate a stronger summary."}
                      </div>
                    </InfoCard>

                    <InfoCard title="ATS score boosters" right={<Badge tone="blue">Fast wins</Badge>}>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {atsTips.map((t, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-600">●</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </InfoCard>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 min-w-0">
                    <InfoCard title="Top strengths" right={<Badge tone="green">Keep</Badge>}>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {(s.strengths?.length ? s.strengths : ["—"]).slice(0, 6).map((x, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-600">●</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </InfoCard>

                    <InfoCard title="Top fixes" right={<Badge tone="amber">Improve</Badge>}>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {(s.improvements?.length ? s.improvements : ["—"]).slice(0, 6).map((x, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-rose-600">●</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </InfoCard>
                  </div>

                  <InfoCard title="What to add next (highest impact)" className="bg-gradient-to-br from-slate-50 to-white">
                    <div className="text-xs text-slate-600">
                      These are the most important missing skills/keywords for the JD.
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <Badge tone="red">Priority</Badge>
                        <span className="text-xs text-slate-600">Add to Skills + 1 project bullet</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {topPriorityFirst.length ? (
                          topPriorityFirst.map((k) => (
                            <Chip key={k} tone="bad">
                              {k}
                            </Chip>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">Paste a JD to generate priority skills.</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone="amber">Missing</Badge>
                          <span className="text-xs text-slate-600">Try adding 5–8 naturally</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {topMissing.length ? (
                            topMissing.map((k) => (
                              <Chip key={k} tone="bad">
                                {k}
                              </Chip>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">No missing keywords found.</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone="blue">Suggested</Badge>
                          <span className="text-xs text-slate-600">Extra keywords that help ATS</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {topSuggested.length ? (
                            topSuggested.map((k) => (
                              <Chip key={k} tone="blue">
                                {k}
                              </Chip>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">No suggestions available.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </InfoCard>
                </div>

                <div className="space-y-4 min-w-0">
                  <InfoCard title="Impact bullet formula">
                    <div className="text-xs text-slate-600">
                      Use this template to make your bullets “recruiter-ready”.
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-semibold text-slate-900">
                        Action Verb + What you built + Tools + Result (numbers)
                      </div>
                      <div className="mt-2 text-xs text-slate-600">
                        Example: “Built an IoT sensor dashboard using React + MQTT, reducing downtime by 18%.”
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip tone="amber">% improvement</Chip>
                      <Chip tone="amber">time saved</Chip>
                      <Chip tone="amber">latency reduced</Chip>
                      <Chip tone="amber">accuracy</Chip>
                      <Chip tone="amber">users</Chip>
                      <Chip tone="amber">cost reduced</Chip>
                    </div>
                  </InfoCard>

                  <InfoCard
                    title="Bullet rewrite suggestions"
                    right={
                      <Badge tone={(s.bullet_rewrites || []).length ? "blue" : "gray"}>
                        {(s.bullet_rewrites || []).length || 0}
                      </Badge>
                    }
                  >
                    <div className="text-xs text-slate-600">
                      Use <b>Action Verb + Tech + Result (numbers)</b>.
                    </div>

                    <div className="mt-3 space-y-3">
                      {(s.bullet_rewrites || []).length ? (
                        (s.bullet_rewrites || []).slice(0, 6).map((b, i) => (
                          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="text-xs text-slate-800">
                              <span className="font-semibold">Original:</span> {b.original}
                            </div>
                            <div className="mt-2 text-xs text-slate-800">
                              <span className="font-semibold">Suggestion:</span> {b.suggestion}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-600">
                          No bullets detected or your bullets already look strong.
                        </div>
                      )}
                    </div>
                  </InfoCard>

                  <InfoCard title="Mini checklist (ATS-safe)">
                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {[
                        "One-column layout",
                        "No tables for key text",
                        "Dates aligned (MMM YYYY)",
                        "Skills section present",
                        "Projects include tech stack",
                        "PDF text selectable",
                      ].map((x) => (
                        <div key={x} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                          ✅ {x}
                        </div>
                      ))}
                    </div>
                  </InfoCard>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Other tabs (same logic as your version) */}
        {tab === "skills" && (
          <div className="2xl:col-span-2 min-w-0">
            <div className="grid 2xl:grid-cols-2 gap-6 min-w-0">
              <SectionCard title="Skills to add (priority)" subtitle="This updates based on the JD you paste.">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="red">Add first</Badge>
                      <span className="text-xs text-slate-600">Highest impact for this job</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(s.skill_priority?.add_first || []).length ? (
                        s.skill_priority.add_first.map((k) => (
                          <Chip key={k} tone="bad">
                            {k}
                          </Chip>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Paste a JD to generate priority skills.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="amber">Add next</Badge>
                      <span className="text-xs text-slate-600">Good tools to strengthen profile</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(s.skill_priority?.add_next || []).map((k) => (
                        <Chip key={k} tone="amber">
                          {k}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="gray">Add later</Badge>
                      <span className="text-xs text-slate-600">Advanced / optional</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(s.skill_priority?.add_later || []).map((k) => (
                        <Chip key={k}>{k}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Keywords match" subtitle="Matched vs missing keywords against the Job Description.">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold">Matched</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(s.matched_keywords || []).slice(0, 25).map((k) => (
                        <Chip key={k} tone="good">
                          {k}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold">Missing</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(s.missing_keywords || []).slice(0, 25).map((k) => (
                        <Chip key={k} tone="bad">
                          {k}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold">Top skills to add</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(s.top_skills_to_add || []).length ? (
                      (s.top_skills_to_add || []).slice(0, 16).map((k) => (
                        <Chip key={k} tone="blue">
                          {k}
                        </Chip>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Paste a JD to get skills to add.</span>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {tab === "ats" && (
          <div className="2xl:col-span-2 min-w-0">
            <SectionCard title="ATS checks" subtitle="Fix these to improve parsing + recruiter search visibility.">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(s.ats_checklist || []).map((c, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-slate-800">{c.label}</div>
                      <Badge tone={c.ok ? "green" : "amber"}>{c.ok ? "OK" : "Fix"}</Badge>
                    </div>
                    {!c.ok && <div className="mt-2 text-xs text-slate-600">{c.tip}</div>}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">ATS completion</div>
                  <Badge tone="blue">
                    {atsOkCount}/{atsTotal}
                  </Badge>
                </div>
                <div className="mt-3 h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${atsPercent}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Try to get this above <b>85%</b>.
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {tab === "projects" && (
          <div className="2xl:col-span-2 min-w-0">
            <div className="grid 2xl:grid-cols-2 gap-6 min-w-0">
              <SectionCard title="Learning plan" subtitle="Step-by-step plan based on your role + missing skills.">
                <ol className="space-y-2 text-sm text-slate-800 list-decimal list-inside">
                  {(s.learning_plan?.length ? s.learning_plan : ["Paste a JD to generate a learning plan."]).map((x, i) => (
                    <li key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      {x}
                    </li>
                  ))}
                </ol>
              </SectionCard>

              <SectionCard title="Project ideas" subtitle="Build these to strengthen your resume quickly.">
                <ul className="space-y-2 text-sm text-slate-800">
                  {(s.project_ideas || []).length ? (
                    (s.project_ideas || []).map((p, i) => (
                      <li key={i} className="rounded-xl bg-white border border-slate-200 p-3">
                        • {p}
                      </li>
                    ))
                  ) : (
                    <div className="text-sm text-slate-600">Add a JD for better project recommendations.</div>
                  )}
                </ul>
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}