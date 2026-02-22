export default function KeywordChips({ items = [], tone = "neutral" }) {
  const styles =
    tone === "good"
      ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-100"
      : tone === "bad"
      ? "bg-red-400/10 border-red-400/20 text-red-100"
      : "bg-white/5 border-white/10 text-white/80";

  if (!items.length) {
    return <div className="text-sm text-white/50">No items</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k, i) => (
        <span
          key={i}
          className={`px-3 py-1 rounded-full border text-xs ${styles}`}
        >
          {k}
        </span>
      ))}
    </div>
  );
}