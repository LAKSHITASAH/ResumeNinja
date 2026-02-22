export default function NavBar({ active = "cv", onNavigate }) {
  const isCV = active === "cv";
  const isBuilder = active === "builder";

  return (
    <header className="sticky top-0 z-40">
      {/* glass / gradient shell */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white shadow-[0_10px_30px_rgba(2,6,23,0.18)]">
        <div className="backdrop-blur-md bg-white/5 border-b border-white/15">
          <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Left brand */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex items-center justify-center">
                <span className="text-xl">◐</span>
              </div>

              <div className="leading-tight">
                <div className="font-extrabold tracking-tight text-[18px]">
                  ResumeNinja
                </div>
                <div className="text-[12px] text-white/80 -mt-0.5">
                  ATS resume analyzer + builder
                </div>
              </div>
            </div>

            {/* Center pill */}
            <div className="hidden md:flex">
              <div className="px-5 py-2 rounded-full bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] text-sm font-semibold">
                ResumeNinja <span className="text-white/80">(ATS)</span>
              </div>
            </div>

            {/* Right: segmented switcher (bigger + premium) */}
            <div className="flex items-center">
              <div className="flex items-center rounded-2xl bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] p-1">
                <button
                  type="button"
                  onClick={() => onNavigate?.("cv")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    isCV
                      ? "bg-white text-slate-900 shadow-[0_10px_22px_rgba(2,6,23,0.18)]"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  Analyzer
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.("builder")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    isBuilder
                      ? "bg-white text-slate-900 shadow-[0_10px_22px_rgba(2,6,23,0.18)]"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  Builder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}