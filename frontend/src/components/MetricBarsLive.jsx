function Bar({ name, value10 }) {
  const pct = Math.max(0, Math.min(100, (value10 / 10) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/75">{name}</span>
        <span className="text-white/60">{value10.toFixed(1)}/10</span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-cyan-400/80 to-blue-500/80"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function MetricBarsLive({ metrics }) {
  const m = metrics || {
    formatting: 0,
    content_quality: 0,
    ats_compatibility: 0,
    keyword_usage: 0,
  };

  return (
    <div className="space-y-4">
      <Bar name="Formatting" value10={m.formatting} />
      <Bar name="Content Quality" value10={m.content_quality} />
      <Bar name="ATS Compatibility" value10={m.ats_compatibility} />
      <Bar name="Keyword Usage" value10={m.keyword_usage} />
    </div>
  );
}