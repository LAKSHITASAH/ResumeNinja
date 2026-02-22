export default function ScoreRing({ value = 82, label = "Match Score", subtitle = "Good Match" }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <defs>
            <linearGradient id="ring" x1="0" x2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          <circle
            cx="75"
            cy="75"
            r={r}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="12"
            fill="none"
          />

          <circle
            cx="75"
            cy="75"
            r={r}
            stroke="url(#ring)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 75 75)"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold">{pct}%</div>
          <div className="text-xs text-white/70">{label}</div>
          <div className="text-xs mt-1 text-emerald-300">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}