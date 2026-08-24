import React from 'react';
import { LOGO_URL, STEP_CONFIG } from '../data/initialData';

interface SidebarProps {
  currentStep: number;
  completedSteps: number[];
  onSelectStep: (step: number) => void;
  onSaveAndExit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
  onSaveAndExit,
}) => {
  const progressPercent = Math.min(100, Math.max(20, currentStep * 20));

  return (
    <aside
      id="sidebar-navigation"
      className="hidden md:flex flex-col h-screen w-80 fixed left-0 top-0 pt-8 pb-6 px-6 bg-[#080808]/90 backdrop-blur-2xl border-r border-white/5 z-40"
    >
      {/* Brand Header */}
      <div className="mb-8 px-2">
        <div className="w-36 mb-4">
          <img
            src={LOGO_URL}
            alt="YAAN & Co."
            className="w-full h-auto object-contain drop-shadow-[0_2px_12px_rgba(197,164,126,0.2)]"
            onError={(e) => {
              // Fallback to stylized logo text if remote image is blocked
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-[#c5a47e]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a47e]">
            Onboarding Portal
          </span>
        </div>
        <h2 className="text-2xl font-light text-white tracking-tight">Ring2Rev</h2>
      </div>

      {/* Steps List */}
      <nav aria-label="Onboarding Steps" className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {STEP_CONFIG.map((item) => {
          const isCompleted = completedSteps.includes(item.step) && currentStep !== item.step;
          const isActive = currentStep === item.step;

          if (isActive) {
            return (
              <button
                key={item.step}
                id={`sidebar-step-${item.step}`}
                onClick={() => onSelectStep(item.step)}
                className="flex items-center gap-3 bg-[#c5a47e] text-black rounded-xl p-3.5 shadow-lg shadow-[#c5a47e]/20 nav-glow relative overflow-hidden transition-all text-left font-bold"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-shimmer" />
                <span
                  className="material-symbols-outlined text-black material-symbols-fill relative z-10 text-[20px]"
                >
                  {item.icon}
                </span>
                <span className="text-[11px] tracking-[0.15em] uppercase flex-1 relative z-10 font-bold">
                  {item.label}
                </span>
                <span className="w-2 h-2 rounded-full bg-black animate-pulse relative z-10" />
              </button>
            );
          }

          if (isCompleted) {
            return (
              <button
                key={item.step}
                id={`sidebar-step-${item.step}`}
                onClick={() => onSelectStep(item.step)}
                className="flex items-center gap-3 text-white/70 p-3.5 hover:bg-white/5 rounded-xl transition-all hover:translate-x-1 duration-200 group text-left"
              >
                <span
                  className="material-symbols-outlined text-[#c5a47e] material-symbols-fill text-[20px]"
                >
                  check_circle
                </span>
                <span className="text-[11px] tracking-[0.15em] uppercase font-semibold text-white/70 group-hover:text-white">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.step}
              id={`sidebar-step-${item.step}`}
              onClick={() => onSelectStep(item.step)}
              className="flex items-center gap-3 text-white/30 p-3.5 hover:bg-white/5 rounded-xl transition-all hover:translate-x-1 duration-200 group text-left hover:text-white/70"
            >
              <span className="material-symbols-outlined text-white/30 group-hover:text-white/60 text-[20px]">
                {item.icon}
              </span>
              <span className="text-[11px] tracking-[0.15em] uppercase font-medium text-white/30 group-hover:text-white/80">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Progress & Bottom Controls */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c5a47e] text-[16px]">
              analytics
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
              Progress: {progressPercent}%
            </span>
          </div>
          <span className="text-[10px] text-white/30 tracking-[0.15em] uppercase">Step {currentStep} / 5</span>
        </div>

        <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden mb-5 border border-white/5">
          <div
            className="bg-[#c5a47e] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(197,164,126,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <button
          id="sidebar-save-exit-btn"
          onClick={onSaveAndExit}
          className="w-full btn-secondary py-3 px-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex justify-center items-center gap-2 text-white/80"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          Save &amp; Exit
        </button>
      </div>
    </aside>
  );
};
