const items = [
  { title: "CV Scoring (ATS)", desc: "Analyze your resume with insights", icon: "📊" },
  { title: "AI Resume Builder", desc: "Create a professional resume", icon: "🤖" },
  { title: "Job Matching Score", desc: "Find better role match", icon: "🎯" },
  { title: "Cover Letter Generator", desc: "Generate cover letters instantly", icon: "✍️" },
  { title: "Salary Estimator", desc: "Estimate salary for your role", icon: "💲" },
];

export default function Stepper() {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-center">
        <div className="h-px w-full max-w-4xl bg-white/10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((it, idx) => (
          <div key={idx} className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-lg">{it.icon}</span>
            </div>
            <div className="mt-3 text-sm font-semibold">{it.title}</div>
            <div className="mt-1 text-xs text-white/60">{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}