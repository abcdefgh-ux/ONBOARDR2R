import React from 'react';
import { STEP_CONFIG } from '../data/initialData';

interface HeaderProps {
  currentStep: number;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onOpenMobileMenu,
}) => {
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
              Step {currentStep} of 5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[9px] text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Auto-saving
          </div>
        </div>
      </header>

      {/* Desktop Sticky Header */}
      <header
        id="desktop-header"
        className="h-16 w-full justify-between items-center px-8 md:px-12 sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 hidden md:flex"
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.25em] font-medium text-[#c5a47e]">
            Client Onboarding
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span className="text-xs text-white/40 font-mono">
            Step {currentStep} of 5
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Progress automatically saved
          </div>
        </div>
      </header>
    </>
  );
};
