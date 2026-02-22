export const API_BASE = "http://127.0.0.1:8000";

export async function analyzeResume({ file, jobDescription }) {
  const form = new FormData();
  form.append("resume", file);
  form.append("job_description", jobDescription || "");

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.detail || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}