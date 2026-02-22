import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";

export default function App() {
  const [page, setPage] = useState("cv"); // "cv" | "builder"

  return page === "builder" ? (
    <ResumeBuilder onNavigate={setPage} />
  ) : (
    <Dashboard onNavigate={setPage} />
  );
}