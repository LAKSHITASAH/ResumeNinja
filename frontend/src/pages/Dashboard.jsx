import { useMemo, useState } from "react";
import NavBar from "../components/NavBar";
import UploadPanel from "../components/UploadPanel";
import ResultsPanel from "../components/ResultsPanel";

const JD_SUGGESTIONS = [
  // --- SOFTWARE ---
  {
    title: "Frontend Developer (React)",
    text:
      "Frontend Developer needed to build responsive web apps. Skills: React, JavaScript/TypeScript, HTML/CSS, Tailwind, accessibility, API integration, state management (Redux/Zustand), testing (Jest/Cypress). Responsibilities: build UI components, optimize performance, collaborate with backend/design."
  },
  {
    title: "Backend Developer (Node/FastAPI)",
    text:
      "Backend Developer to build secure APIs and services. Skills: Node.js/Express or Python/FastAPI, REST, JWT auth, SQL/PostgreSQL, caching (Redis), testing, API documentation, system design basics. Responsibilities: design APIs, integrate DB, improve reliability."
  },
  {
    title: "Full Stack Developer",
    text:
      "Full Stack Developer with React + Node/FastAPI. Skills: React, JavaScript/TypeScript, REST APIs, PostgreSQL/MySQL, Git, Docker. Nice: AWS, CI/CD, testing. Responsibilities: build scalable apps end-to-end, integrate APIs, deploy and monitor."
  },
  {
    title: "Data Analyst",
    text:
      "Data Analyst to clean data, write SQL queries, and create dashboards. Skills: SQL, Excel, Python, statistics, Tableau/Power BI, reporting, stakeholder communication. Responsibilities: build dashboards, automate reports, interpret insights."
  },
  {
    title: "QA / Test Engineer",
    text:
      "QA Engineer focused on manual + automation testing. Skills: test plans, test cases, automation (Cypress/Selenium), API testing (Postman), bug tracking (Jira), CI basics. Responsibilities: ensure product quality, regression testing, automation."
  },
  {
    title: "DevOps / Cloud Intern",
    text:
      "DevOps/Cloud Intern to help with deployments and automation. Skills: Linux basics, Docker, CI/CD (GitHub Actions), AWS basics, monitoring, networking fundamentals. Responsibilities: automate deployment pipelines and improve reliability."
  },

  // --- HARDWARE / EMBEDDED / NETWORKING ---
  {
    title: "Embedded Systems Engineer",
    text:
      "Embedded Engineer to develop firmware for microcontrollers. Skills: C/C++, Embedded C, RTOS, ARM microcontrollers, UART/I2C/SPI, debugging (JTAG), memory optimization, hardware-software integration. Responsibilities: write firmware, test on boards, debug peripherals."
  },
  {
    title: "IoT Engineer",
    text:
      "IoT Engineer to build connected device solutions. Skills: Embedded C, MQTT, sensors, ESP32/Arduino, cloud IoT (AWS IoT/Azure IoT), networking basics, Python. Responsibilities: device firmware + cloud connectivity + dashboards."
  },
  {
    title: "VLSI / RTL Engineer (Entry)",
    text:
      "RTL Engineer entry role. Skills: Verilog/SystemVerilog, digital design basics, timing, simulation, FPGA basics, scripting (Python/TCL). Responsibilities: implement RTL blocks, run simulations, verify results."
  },
  {
    title: "Network Engineer (Entry)",
    text:
      "Network Engineer entry role. Skills: networking fundamentals (TCP/IP), routing/switching basics, Linux, troubleshooting, monitoring tools. Responsibilities: configure networks, resolve issues, document changes."
  },
];

export default function Dashboard({ onNavigate }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumePreviewUrl, setResumePreviewUrl] = useState("");

  const gradeTag = useMemo(() => {
    const p = result?.match_percent ?? 0;
    if (p >= 75) return "Strong";
    if (p >= 55) return "Good";
    return "Needs improvement";
  }, [result]);

  return (
    <div className="min-h-screen w-full text-slate-900 app-shell">
      <NavBar active="cv" onNavigate={onNavigate} />

      <main className="w-full px-4 sm:px-8 lg:px-10 py-8">
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Resume Analyzer <span className="text-slate-400">(ATS)</span>
          </h1>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Upload your resume + optionally paste a Job Description. Get match score, best role suggestions,
            priority skills to add, ATS checks, and bullet improvements — in a real-world format.
          </p>

          {result && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              <span className="font-semibold">Status:</span>
              <span>{gradeTag}</span>
              <span className="text-slate-400">•</span>
              <span className="font-semibold">Match:</span>
              <span>{result.match_percent ?? 0}%</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <div className="text-sm font-semibold">Job Description templates</div>
            <div className="text-xs text-slate-600 mt-1">
              Click a template to auto-fill the JD box (software + hardware roles included).
            </div>
          </div>

          <div className="p-4 sm:p-5 flex flex-wrap gap-2">
            {JD_SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => window.dispatchEvent(new CustomEvent("JD_FILL", { detail: s.text }))}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 transition"
                type="button"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <UploadPanel
            onResult={setResult}
            onLoading={setLoading}
            onError={setError}
            onPreviewUrl={setResumePreviewUrl}
          />
        </div>

        <div className="mt-6">
          <ResultsPanel result={result} loading={loading} resumePreviewUrl={resumePreviewUrl} />
        </div>
      </main>
    </div>
  );
}