export const API_BASE = import.meta.env.VITE_API_BASE || "https://resumeninja-backend2311.onrender.com";

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