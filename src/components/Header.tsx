import React from 'react';
import { STEP_CONFIG } from '../data/initialData';

interface HeaderProps {
  currentStep: number;
  onOpenMobileMenu: () => void;
  onOpenSubmissions?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onOpenMobileMenu,
  onOpenSubmissions,
}) => {
  const currentConfig = STEP_CONFIG.find((s) => s.step === currentStep) || STEP_CONFIG[0];

  return (
    <>
      {/* Mobile Top Bar */}
      <header
        id="mobile-header"
        className="md:hidden flex justify-between items-center px-4 h-16 w-full bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30"
      >
        <div className="flex items-center gap-2">
          <button
            id="mobile-menu-toggle"
            onClick={onOpenMobileMenu}
            className="text-white/60 p-1.5 hover:bg-white/5 rounded-lg"
            aria-label="Open Menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              YAAN &amp; Co.
            </h1>
            <p className="text-[10px] uppercase font-medium text-[#c5a47e] tracking-widest mt-0.5">
              Step {currentStep}/5: {currentConfig.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSubmissions && (
            <button
              id="mobile-submissions-btn"
              onClick={onOpenSubmissions}
              className="p-2 text-white/50 hover:text-[#c5a47e]"
              title="Response Copies"
            >
              <span className="material-symbols-outlined text-[20px]">outgoing_mail</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[9px] text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Auto-saved
          </div>
        </div>
      </header>

      {/* Desktop Sticky Header */}
      <header
        id="desktop-header"
        className="h-20 w-full justify-between items-center px-8 md:px-12 sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 hidden md:flex"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#c5a47e] uppercase tracking-[0.2em]">
              Phase 0{currentStep} / 05
            </span>
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight mt-0.5">
            {currentConfig.label}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Progress automatically saved
          </div>

          {onOpenSubmissions && (
            <button
              id="header-submissions-btn"
              onClick={onOpenSubmissions}
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#c5a47e] hover:text-white transition-colors px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-1.5"
              title="View all received response copies"
            >
              <span className="material-symbols-outlined text-[16px]">outgoing_mail</span>
              Response Copies
            </button>
          )}
        </div>
      </header>
    </>
  );
};
