export default function Card({ title, icon, right, children, className = "" }) {
  return (
    <div className={"rounded-2xl bg-white/5 border border-white/10 shadow-soft " + className}>
      {(title || right) && (
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-white/5 border border-white/10">
                {icon}
              </span>
            )}
            {title && <h3 className="font-semibold tracking-tight">{title}</h3>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}