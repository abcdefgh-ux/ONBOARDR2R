import React from 'react';
import { STEP_CONFIG } from '../data/initialData';

interface HeaderProps {
  currentStep: number;
  onSaveProgress: () => void;
  onOpenHelp: () => void;
  onOpenMobileMenu: () => void;
  onOpenSubmissions?: () => void;
  lastSavedAt: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSaveProgress,
  onOpenHelp,
  onOpenMobileMenu,
  onOpenSubmissions,
  lastSavedAt,
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
          <button
            id="mobile-help-btn"
            onClick={onOpenHelp}
            className="p-2 text-white/50 hover:text-[#c5a47e]"
            title="Help"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
          <button
            id="mobile-save-btn"
            onClick={onSaveProgress}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 font-medium flex items-center gap-1 hover:border-[#c5a47e]/50"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save
          </button>
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
          {lastSavedAt && (
            <span className="text-xs text-white/40 flex items-center gap-1.5 font-light tracking-wide mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a47e]"></span>
              Saved {lastSavedAt}
            </span>
          )}

          {onOpenSubmissions && (
            <button
              id="header-submissions-btn"
              onClick={onOpenSubmissions}
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#c5a47e] hover:text-white transition-colors px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-1.5"
              title="View all received response copies"
            >
              <span className="material-symbols-outlined text-[16px]">outgoing_mail</span>
              Response Copies
            </button>
          )}

          <button
            id="header-save-progress-btn"
            onClick={onSaveProgress}
            className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Progress
          </button>

          <button
            id="header-help-btn"
            onClick={onOpenHelp}
            className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/70 hover:text-[#c5a47e] transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[#c5a47e] text-[18px]">help</span>
            Help
          </button>

          <div
            id="header-user-avatar"
            className="w-9 h-9 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-white/70 shadow-md shadow-black/40 hover:border-[#c5a47e]/40 transition-colors"
            title="Client Portal Account"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </header>
    </>
  );
};
