import { useMemo, useState } from "react";
import NavBar from "../components/NavBar";

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="text-xs text-slate-600 mt-1">{subtitle}</div> : null}
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

  return <span className={clsx("px-2 py-1 rounded-full text-xs border", cls)}>{children}</span>;
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-700">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}

function SmallBtn({ children, onClick, tone = "dark" }) {
  const cls =
    tone === "dark"
      ? "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900"
      : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50";
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("px-3 py-2 rounded-xl text-xs font-semibold transition", cls)}
    >
      {children}
    </button>
  );
}

function BuilderATSChecklist({ resume }) {
  const checks = useMemo(() => {
    const hasName = !!(resume.name || "").trim();
    const hasSkills = (resume.skills_list || []).length > 0;
    const hasEdu = (resume.education || []).some((e) => (e.school || "").trim() || (e.degree || "").trim());
    const hasExp = (resume.experience || []).some((e) => (e.role || "").trim() || (e.company || "").trim());
    const hasProj = (resume.projects || []).some((p) => (p.title || "").trim());

    const guarantees = [
      { ok: true, label: "One-column layout (PDF template)" },
      { ok: true, label: "No tables/icons for key text (PDF template)" },
      { ok: true, label: "Simple headings (SUMMARY, EXPERIENCE, PROJECTS...)" },
      { ok: true, label: "PDF text selectable (ReportLab)" },
    ];

    const contentChecks = [
      { ok: hasName, label: "Name present" },
      { ok: hasSkills, label: "Skills present" },
      { ok: hasEdu, label: "Education present" },
      { ok: hasExp || hasProj, label: "Experience or Projects present" },
      { ok: hasProj, label: "Projects present" },
    ];

    return [...contentChecks, ...guarantees];
  }, [resume]);

  const okCount = checks.filter((c) => c.ok).length;
  const pct = Math.round((okCount / checks.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">ATS Checklist</div>
        <Chip tone={pct >= 85 ? "good" : pct >= 65 ? "amber" : "bad"}>{pct}%</Chip>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
        {checks.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            {c.ok ? "✅" : "⚠️"} {c.label}
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-600">
        Tip: Add measurable impact in bullets (%, time saved, users, accuracy).
      </div>
    </div>
  );
}

function PreviewSection({ title, children }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-bold tracking-wide">{title}</div>
      <div className="mt-1 border-b border-slate-800/60" />
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Preview({ resume }) {
  const edu = resume.education || [];
  const exp = resume.experience || [];
  const proj = resume.projects || [];
  const activities = (resume.activities || []).filter(Boolean);
  const certs = (resume.certifications || []).filter(Boolean);

  const headerLine = [
    resume.location,
    resume.email,
    resume.phone,
    ...(resume.links || []).filter(Boolean),
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Live ATS Preview</div>
          <div className="text-xs text-slate-600 mt-1">
            This matches the PDF formatting (centered name + clean sections).
          </div>
        </div>
        <Chip tone="good">ATS-safe</Chip>
      </div>

      <div className="p-6 text-sm text-slate-900">
        {/* Centered header (requested) */}
        <div className="text-center">
          <div className="text-2xl font-extrabold">{resume.name || "Your Name"}</div>
          <div className="text-xs text-slate-800 mt-1">{headerLine || "Location | Email | Phone | Links"}</div>
        </div>

        {/* Summary */}
        {resume.summary ? (
          <PreviewSection title="SUMMARY">
            <div className="text-sm text-slate-800 whitespace-pre-wrap">{resume.summary}</div>
          </PreviewSection>
        ) : null}

        {/* Activities (NEW) */}
        {activities.length ? (
          <PreviewSection title="ACTIVITIES / EXTRACURRICULAR">
            <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
              {activities.slice(0, 10).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}

        {/* Education */}
        {edu.some((e) => (e.school || "").trim() || (e.degree || "").trim()) ? (
          <PreviewSection title="EDUCATION">
            <div className="space-y-3">
              {edu.map((e, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="font-semibold">
                      {[e.school, e.location].filter(Boolean).join(" — ") || "Education"}
                    </div>
                    <div className="text-xs text-slate-800">{e.dates || ""}</div>
                  </div>
                  {e.degree ? <div className="text-sm text-slate-800">{e.degree}</div> : null}
                </div>
              ))}
            </div>
          </PreviewSection>
        ) : null}

        {/* Experience */}
        {exp.length ? (
          <PreviewSection title="EXPERIENCE / INTERNSHIPS">
            <div className="space-y-4">
              {exp.map((e, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="font-semibold">
                      {[e.role, e.company].filter(Boolean).join(" — ") || "Experience"}
                    </div>
                    <div className="text-xs text-slate-800">
                      {[e.location, e.dates].filter(Boolean).join(" | ")}
                    </div>
                  </div>
                  {e.bullets?.filter(Boolean).length ? (
                    <ul className="mt-1 list-disc pl-5 text-sm text-slate-800 space-y-1">
                      {e.bullets.filter(Boolean).slice(0, 8).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </PreviewSection>
        ) : null}

        {/* Projects */}
        {proj.length ? (
          <PreviewSection title="PROJECTS">
            <div className="space-y-4">
              {proj.map((p, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="font-semibold">
                      {p.title || "Project"}{p.tech ? ` — ${p.tech}` : ""}
                    </div>
                    <div className="text-xs text-slate-800">{p.dates || ""}</div>
                  </div>
                  {p.bullets?.filter(Boolean).length ? (
                    <ul className="mt-1 list-disc pl-5 text-sm text-slate-800 space-y-1">
                      {p.bullets.filter(Boolean).slice(0, 8).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </PreviewSection>
        ) : null}

        {/* Skills */}
        <PreviewSection title="TECHNICAL SKILLS">
          <div className="text-sm text-slate-800">
            {(resume.skills_list || []).length ? resume.skills_list.join(", ") : "Add skills to improve ATS keyword matching."}
          </div>
        </PreviewSection>

        {/* Certifications */}
        {certs.length ? (
          <PreviewSection title="CERTIFICATIONS">
            <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
              {certs.slice(0, 12).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}
      </div>
    </div>
  );
}

export default function ResumeBuilder({ onNavigate }) {
  const [resume, setResume] = useState({
    name: "",
    location: "",
    email: "",
    phone: "",
    links: [],
    summary: "",

    // NEW
    activities: [""],

    education: [{ school: "", degree: "", location: "", dates: "" }],
    experience: [{ role: "", company: "", location: "", dates: "", bullets: [""] }],
    projects: [{ title: "", tech: "", dates: "", bullets: [""] }],
    skills_list: [],
    certifications: [],
  });

  const [busy, setBusy] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  const setField = (k, v) => setResume((r) => ({ ...r, [k]: v }));

  const updateArrayItem = (key, idx, patch) => {
    setResume((r) => {
      const arr = [...(r[key] || [])];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...r, [key]: arr };
    });
  };

  const addArrayItem = (key, item) => setResume((r) => ({ ...r, [key]: [...(r[key] || []), item] }));

  const removeArrayItem = (key, idx) => {
    setResume((r) => {
      const arr = [...(r[key] || [])];
      arr.splice(idx, 1);
      return { ...r, [key]: arr.length ? arr : r[key] };
    });
  };

  const setBullets = (sectionKey, idx, bullets) => {
    setResume((r) => {
      const arr = [...(r[sectionKey] || [])];
      arr[idx] = { ...arr[idx], bullets };
      return { ...r, [sectionKey]: arr };
    });
  };

  const skillsText = (resume.skills_list || []).join(", ");
  const setSkillsText = (txt) => {
    const list = txt
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setField("skills_list", list);
  };

  const addLink = () => setField("links", [...(resume.links || []), ""]);
  const updateLink = (i, v) =>
    setField(
      "links",
      (resume.links || []).map((x, idx) => (idx === i ? v : x))
    );
  const removeLink = (i) =>
    setField(
      "links",
      (resume.links || []).filter((_, idx) => idx !== i)
    );

  async function downloadPDF() {
    try {
      setBusy(true);
      const res = await fetch(`${apiBase}/builder/render/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      if (!res.ok) {
        const txt = await res.text();
        alert("Failed to generate PDF: " + txt);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(resume.name || "resume").replaceAll(" ", "_")}_ATS.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error: " + e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <NavBar active="builder" onNavigate={onNavigate} />

      <main className="w-full px-4 sm:px-8 lg:px-10 py-8">
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Resume Builder <span className="text-slate-400">(ATS)</span>
          </h1>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Build an ATS-safe resume and download as PDF. The right panel shows a live preview while you edit.
          </p>
        </div>

        <div className="mt-6 grid xl:grid-cols-[520px,1fr] gap-6 items-start w-full">
          {/* LEFT */}
          <div className="space-y-6">
            <SectionCard
              title="Profile"
              subtitle="This becomes the resume header."
              right={
                <SmallBtn onClick={downloadPDF}>
                  {busy ? "Generating..." : "Download PDF"}
                </SmallBtn>
              }
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Full Name" value={resume.name} onChange={(v) => setField("name", v)} placeholder="Your Name" />
                <Input label="Location" value={resume.location} onChange={(v) => setField("location", v)} placeholder="City, Country" />
                <Input label="Email" value={resume.email} onChange={(v) => setField("email", v)} placeholder="name@email.com" />
                <Input label="Phone" value={resume.phone} onChange={(v) => setField("phone", v)} placeholder="+91 ..." />
              </div>

              <div className="mt-3">
                <TextArea
                  label="Summary (optional)"
                  value={resume.summary}
                  onChange={(v) => setField("summary", v)}
                  placeholder="1–2 lines: role + strengths + measurable impact."
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-700">Links</div>
                  <SmallBtn tone="light" onClick={addLink}>+ Add Link</SmallBtn>
                </div>

                <div className="mt-2 space-y-2">
                  {(resume.links || []).map((l, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={l}
                        onChange={(e) => updateLink(i, e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <SmallBtn tone="light" onClick={() => removeLink(i)}>Remove</SmallBtn>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* NEW: Activities */}
            <SectionCard
              title="Activities / Extracurricular"
              subtitle="NCC, CR, volunteering, sports, clubs, etc."
              right={<SmallBtn tone="light" onClick={() => setField("activities", [...(resume.activities || []), ""])}>+ Add</SmallBtn>}
            >
              <div className="space-y-2">
                {(resume.activities || []).map((a, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={a}
                      onChange={(e) => {
                        const arr = [...(resume.activities || [])];
                        arr[idx] = e.target.value;
                        setField("activities", arr);
                      }}
                      placeholder="e.g., NCC Cadet — built leadership + teamwork"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    />
                    <SmallBtn
                      tone="light"
                      onClick={() => setField("activities", (resume.activities || []).filter((_, i) => i !== idx))}
                    >
                      Remove
                    </SmallBtn>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Education"
              subtitle="Add your degree(s)."
              right={<SmallBtn tone="light" onClick={() => addArrayItem("education", { school: "", degree: "", location: "", dates: "" })}>+ Add</SmallBtn>}
            >
              <div className="space-y-4">
                {(resume.education || []).map((e, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex justify-between gap-2">
                      <div className="text-sm font-semibold">Education #{idx + 1}</div>
                      <SmallBtn tone="light" onClick={() => removeArrayItem("education", idx)}>Remove</SmallBtn>
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 gap-3">
                      <Input label="School" value={e.school} onChange={(v) => updateArrayItem("education", idx, { school: v })} />
                      <Input label="Location" value={e.location} onChange={(v) => updateArrayItem("education", idx, { location: v })} />
                      <Input label="Degree" value={e.degree} onChange={(v) => updateArrayItem("education", idx, { degree: v })} placeholder="B.Tech, ECE" />
                      <Input label="Dates" value={e.dates} onChange={(v) => updateArrayItem("education", idx, { dates: v })} placeholder="Oct 2022 – Aug 2026" />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Experience / Internships"
              subtitle="Use strong bullets with measurable results."
              right={<SmallBtn tone="light" onClick={() => addArrayItem("experience", { role: "", company: "", location: "", dates: "", bullets: [""] })}>+ Add</SmallBtn>}
            >
              <div className="space-y-4">
                {(resume.experience || []).map((ex, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex justify-between gap-2">
                      <div className="text-sm font-semibold">Experience #{idx + 1}</div>
                      <SmallBtn tone="light" onClick={() => removeArrayItem("experience", idx)}>Remove</SmallBtn>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-2 gap-3">
                      <Input label="Role" value={ex.role} onChange={(v) => updateArrayItem("experience", idx, { role: v })} />
                      <Input label="Company" value={ex.company} onChange={(v) => updateArrayItem("experience", idx, { company: v })} />
                      <Input label="Location" value={ex.location} onChange={(v) => updateArrayItem("experience", idx, { location: v })} />
                      <Input label="Dates" value={ex.dates} onChange={(v) => updateArrayItem("experience", idx, { dates: v })} placeholder="Jul 2025 – Aug 2025" />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-700">Bullets</div>
                        <SmallBtn tone="light" onClick={() => setBullets("experience", idx, [...(ex.bullets || []), ""])}>+ Bullet</SmallBtn>
                      </div>

                      <div className="mt-2 space-y-2">
                        {(ex.bullets || []).map((b, bi) => (
                          <div key={bi} className="flex gap-2">
                            <input
                              value={b}
                              onChange={(e) => {
                                const bullets = [...(ex.bullets || [])];
                                bullets[bi] = e.target.value;
                                setBullets("experience", idx, bullets);
                              }}
                              placeholder="Action verb + tech + result (numbers)"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                            />
                            <SmallBtn
                              tone="light"
                              onClick={() => {
                                const bullets = [...(ex.bullets || [])];
                                bullets.splice(bi, 1);
                                setBullets("experience", idx, bullets.length ? bullets : [""]);
                              }}
                            >
                              Remove
                            </SmallBtn>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 text-xs text-slate-600">
                        Formula: <b>Action Verb + Tech + Result (numbers)</b> — e.g. “Reduced boot time by 22% using C/RTOS optimizations.”
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Projects"
              subtitle="Projects are extremely important for ATS search."
              right={<SmallBtn tone="light" onClick={() => addArrayItem("projects", { title: "", tech: "", dates: "", bullets: [""] })}>+ Add</SmallBtn>}
            >
              <div className="space-y-4">
                {(resume.projects || []).map((p, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex justify-between gap-2">
                      <div className="text-sm font-semibold">Project #{idx + 1}</div>
                      <SmallBtn tone="light" onClick={() => removeArrayItem("projects", idx)}>Remove</SmallBtn>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-2 gap-3">
                      <Input label="Title" value={p.title} onChange={(v) => updateArrayItem("projects", idx, { title: v })} placeholder="Web Quiz Application" />
                      <Input label="Dates" value={p.dates} onChange={(v) => updateArrayItem("projects", idx, { dates: v })} placeholder="Oct 2025" />
                    </div>

                    <div className="mt-3">
                      <Input label="Tech stack (optional)" value={p.tech} onChange={(v) => updateArrayItem("projects", idx, { tech: v })} placeholder="HTML, CSS, JavaScript" />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-700">Bullets</div>
                        <SmallBtn tone="light" onClick={() => setBullets("projects", idx, [...(p.bullets || []), ""])}>+ Bullet</SmallBtn>
                      </div>

                      <div className="mt-2 space-y-2">
                        {(p.bullets || []).map((b, bi) => (
                          <div key={bi} className="flex gap-2">
                            <input
                              value={b}
                              onChange={(e) => {
                                const bullets = [...(p.bullets || [])];
                                bullets[bi] = e.target.value;
                                setBullets("projects", idx, bullets);
                              }}
                              placeholder="Built/Improved ... using ... resulting in ..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                            />
                            <SmallBtn
                              tone="light"
                              onClick={() => {
                                const bullets = [...(p.bullets || [])];
                                bullets.splice(bi, 1);
                                setBullets("projects", idx, bullets.length ? bullets : [""]);
                              }}
                            >
                              Remove
                            </SmallBtn>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Skills" subtitle="Comma-separated skills improve ATS keyword search.">
              <TextArea
                label="Skills"
                value={(resume.skills_list || []).join(", ")}
                onChange={(txt) => {
                  const list = txt
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setField("skills_list", list);
                }}
                placeholder="HTML, CSS, JavaScript, SQL, C++, Python, Git..."
                rows={3}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {(resume.skills_list || []).slice(0, 18).map((s) => (
                  <Chip key={s} tone="blue">{s}</Chip>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Certifications"
              subtitle="Optional, but helps for ATS and recruiter trust."
              right={<SmallBtn tone="light" onClick={() => setField("certifications", [...(resume.certifications || []), ""])}>+ Add</SmallBtn>}
            >
              <div className="space-y-2">
                {(resume.certifications || []).map((c, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={c}
                      onChange={(e) => {
                        const arr = [...(resume.certifications || [])];
                        arr[idx] = e.target.value;
                        setField("certifications", arr);
                      }}
                      placeholder="Course / Certificate name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    />
                    <SmallBtn
                      tone="light"
                      onClick={() => setField("certifications", (resume.certifications || []).filter((_, i) => i !== idx))}
                    >
                      Remove
                    </SmallBtn>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT (Sticky preview) */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-6">
              <BuilderATSChecklist resume={resume} />
              <Preview resume={resume} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}