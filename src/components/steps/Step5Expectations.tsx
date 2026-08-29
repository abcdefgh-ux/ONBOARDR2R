import React from 'react';
import { OnboardingState } from '../../types';
import { BUILD_TIMELINE } from '../../data/initialData';

interface Step5Props {
  formData: OnboardingState;
  onBack: () => void;
  onFinish: () => void;
  onChange?: (field: keyof OnboardingState, value: any) => void;
  isSubmitting?: boolean;
}

export const Step5Expectations: React.FC<Step5Props> = ({
  formData,
  onBack,
  onFinish,
  isSubmitting = false,
}) => {
  return (
    <div className="max-w-4xl w-full mx-auto pb-32">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 05</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-2">
          Review &amp; Final Submission
        </h2>
        <p className="text-sm text-white/50 font-light tracking-wide max-w-2xl">
          Review the implementation roadmap below and submit your onboarding configuration.
        </p>
      </header>

      {/* 15-Day Build Timeline */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border-white/5">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
              <span className="material-symbols-outlined text-[24px]">
                calendar_month
              </span>
            </div>
            <div>
              <h3 className="text-lg font-light text-white tracking-wide">
                15-Day Implementation Timeline
              </h3>
              <p className="text-xs text-white/50 font-light mt-0.5">
                Standard engineering build, stress testing, and live deployment roadmap
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e] bg-[#c5a47e]/10 px-4 py-2 rounded-full border border-[#c5a47e]/20 hidden sm:inline-block">
            15 Days Delivery
          </span>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-white/10 before:z-0">
          {BUILD_TIMELINE.map((item, idx) => (
            <div key={idx} className="relative z-10 flex items-start gap-4">
              <div
                className={`w-7 h-7 rounded-full bg-[#050505] border flex items-center justify-center text-[10px] text-white/80 shrink-0 font-mono mt-0.5 ${
                  item.highlight
                    ? 'border-[#c5a47e] text-[#c5a47e] shadow-[0_0_10px_rgba(197,164,126,0.3)]'
                    : 'border-white/10 text-white/50'
                }`}
              >
                {idx + 1}
              </div>
              <div
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  item.highlight
                    ? 'bg-white/[0.04] border-[#c5a47e]/30'
                    : 'bg-[#080808]/80 border-white/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <span className="text-sm font-medium text-white tracking-wide">
                    {item.title}
                  </span>
                  <span
                    className={`text-[11px] font-mono ${
                      item.highlight ? 'text-[#c5a47e] font-bold' : 'text-white/40'
                    }`}
                  >
                    {item.days}
                  </span>
                </div>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-10 flex items-center justify-between pt-8 border-t border-white/5">
        <button
          id="step5-back-btn"
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="btn-secondary px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 disabled:opacity-50"
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
            id="step5-finish-btn"
            type="button"
            disabled={isSubmitting}
            onClick={onFinish}
            className="btn-gold px-9 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 shadow-xl shadow-black/50 disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Submitting...
              </>
            ) : (
              <>
                Submit Form
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
