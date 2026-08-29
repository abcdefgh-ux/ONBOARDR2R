import React from 'react';
import { OnboardingState } from '../../types';

interface Step4Props {
  formData: OnboardingState;
  onChange: (field: keyof OnboardingState, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveProgress?: () => void;
}

export const Step4Automation: React.FC<Step4Props> = ({
  onNext,
  onBack,
}) => {
  return (
    <div className="max-w-3xl w-full mx-auto pb-32">
      <div className="glass-panel rounded-3xl p-8 md:p-14 mb-10 relative overflow-hidden border-white/5 text-center">
        {/* Decorative ambient blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a47e]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#c5a47e]/40 flex items-center justify-center p-4 shadow-xl shadow-black/60 text-[#c5a47e]">
            <span className="material-symbols-outlined text-3xl">
              check_circle
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">
              Phase 04
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            All Required Details Gathered
          </h2>

          <p className="text-sm md:text-base text-white/60 leading-relaxed font-light">
            All required details are gathered. Nothing else is needed at this stage.
          </p>

          <div className="w-full mt-4 p-5 rounded-2xl bg-[#080808] border border-white/5 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-white/80 font-light">
                Information &amp; scenarios successfully verified
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <button
          id="step4-back-btn"
          type="button"
          onClick={onBack}
          className="btn-secondary px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Auto-saved
          </div>
          <button
            id="step4-next-btn"
            type="button"
            onClick={onNext}
            className="btn-gold px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 shadow-lg shadow-black/40"
          >
            Next Step
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
