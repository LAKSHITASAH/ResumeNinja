import { useEffect, useMemo, useRef, useState } from "react";

export default function UploadPanel({ onResult, onLoading, onError, onPreviewUrl }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [autoMode, setAutoMode] = useState(true);

  const jdRef = useRef(null);
  const lastSentJdRef = useRef("");
  const inflightRef = useRef(false);

  useEffect(() => {
    function onFill(e) {
      setJd(e.detail || "");
      if (jdRef.current) jdRef.current.focus();
    }
    window.addEventListener("JD_FILL", onFill);
    return () => window.removeEventListener("JD_FILL", onFill);
  }, []);

  const canAuto = useMemo(() => !!file && autoMode, [file, autoMode]);

  async function sendAnalyze({ showLoading = true } = {}) {
    onError("");

    if (!file) {
      onError("Please upload a resume (PDF/DOCX).");
      return;
    }

    // avoid spamming multiple requests at once (important for auto mode)
    if (inflightRef.current) return;
    inflightRef.current = true;

    // preview url (PDF best)
    try {
      const url = URL.createObjectURL(file);
      onPreviewUrl?.(url);
    } catch {
      // ignore
    }

    const form = new FormData();

    // ✅ IMPORTANT: match backend field names to avoid 422
    // backend expects: file + job_desc
    form.append("file", file);
    form.append("job_desc", jd || "");

    if (showLoading) onLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        // show real backend validation error text
        const t = await res.text();
        throw new Error(t || "Request failed");
      }

      const data = await res.json();
      onResult(data);
      lastSentJdRef.current = jd || "";
    } catch (e) {
      onError(e?.message || "Something went wrong.");
    } finally {
      if (showLoading) onLoading(false);
      inflightRef.current = false;
    }
  }

  // ✅ Debounced auto re-analyze when JD changes
  useEffect(() => {
    if (!canAuto) return;

    const jdTrim = (jd || "").trim();
    const prevTrim = (lastSentJdRef.current || "").trim();

    // Avoid sending if unchanged
    if (jdTrim === prevTrim) return;

    const t = setTimeout(() => {
      // Send without full loading skeleton (premium feel)
      sendAnalyze({ showLoading: false });
    }, 900);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jd, canAuto]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Upload resume + Job Description</div>
          <div className="text-xs text-slate-600 mt-1">
            PDF works best for preview. DOCX is supported for analysis.
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={autoMode}
            onChange={(e) => setAutoMode(e.target.checked)}
            className="h-4 w-4"
          />
          Auto update results
        </label>
      </div>

      <div className="p-4 sm:p-5 grid lg:grid-cols-2 gap-4">
        {/* Upload */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="text-xs text-slate-600 mb-2">Resume (PDF/DOCX)</div>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />

          {file && (
            <div className="mt-2 text-xs text-slate-700">
              Selected: <span className="font-medium">{file.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => sendAnalyze({ showLoading: true })}
            className="mt-4 w-full rounded-xl bg-blue-700 text-white py-2.5 text-sm font-semibold hover:bg-blue-800 transition"
          >
            Analyze Resume
          </button>

          <div className="mt-3 text-[11px] text-slate-500">
            Tip: Keep auto-update ON to instantly refresh results when you change JD.
          </div>
        </div>

        {/* JD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-600 mb-2">Job Description (optional)</div>

          <textarea
            ref={jdRef}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Paste the Job Description to get match score, priority skills, best roles, and improvements…"
          />

          <div className="mt-2 text-[11px] text-slate-500">
            Adding JD improves: match score + missing skills + role-fit + priority order.
          </div>
        </div>
      </div>
    </div>
  );
}