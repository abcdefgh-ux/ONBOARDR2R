import React from 'react';
import { OnboardingState } from '../../types';
import {
  BUILD_TIMELINE,
  CLIPBOARD_IMAGE_URL,
} from '../../data/initialData';
import { LeadAvatar } from '../LeadAvatar';

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
    <div className="max-w-6xl w-full mx-auto pb-32">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 05</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-2">
          Review &amp; Final Submission
        </h2>
        <p className="text-sm text-white/50 font-light tracking-wide max-w-2xl">
          Review your onboarding summary below and submit your details.
        </p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-7 lg:col-span-1 flex flex-col justify-between border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
                <span className="material-symbols-outlined text-[20px]">
                  fact_check
                </span>
              </div>
              <h3 className="text-base font-light text-white tracking-wide">Summary</h3>
            </div>

            <p className="text-xs text-white/50 leading-relaxed mb-6 font-light">
              {formData.businessName ? `${formData.businessName}: ` : ''}
              {(formData.scenarios || []).length} call scenario{(formData.scenarios || []).length === 1 ? '' : 's'} configured with {formData.aiTone} voice tone.
            </p>
          </div>

          <div className="rounded-xl overflow-hidden h-32 relative border border-white/5 glass-card bg-black/40">
            <img
              src={CLIPBOARD_IMAGE_URL}
              alt="Verification Clipboard"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold">
                  All Systems Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 15-Day Build Timeline */}
        <div className="glass-panel rounded-2xl p-6 md:p-7 lg:col-span-2 border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
                <span className="material-symbols-outlined text-[20px]">
                  calendar_month
                </span>
              </div>
              <div>
                <h3 className="text-base font-light text-white tracking-wide">
                  15-Day Implementation Timeline
                </h3>
                <p className="text-xs text-white/50 font-light">
                  Standard deployment process
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e] bg-[#c5a47e]/10 px-3 py-1.5 rounded-full border border-[#c5a47e]/20 hidden sm:inline-block">
              15 Days
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
                  className={`flex-1 p-3.5 rounded-xl border transition-all ${
                    item.highlight
                      ? 'bg-white/[0.04] border-[#c5a47e]/30'
                      : 'bg-[#080808]/80 border-white/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold text-white tracking-wide">
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
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

        {/* Implementation Lead (with photo attached by user) */}
        <div className="glass-panel rounded-2xl p-6 md:p-7 lg:col-span-1 border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
                <span className="material-symbols-outlined text-[20px]">
                  support_agent
                </span>
              </div>
              <h3 className="text-base font-light text-white tracking-wide">Implementation Lead</h3>
            </div>

            <div className="flex flex-col items-center text-center p-5 glass-card rounded-2xl mb-4 border-white/5 bg-black/40">
              <LeadAvatar className="mb-3" />
              <h4 className="text-sm font-medium text-white mb-0.5">Shayan Ali Zafar</h4>
              <p className="text-[9px] font-bold text-[#c5a47e] uppercase tracking-[0.2em] mb-2">
                Solutions Lead
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Ring2Rev Engineering
              </span>
            </div>
          </div>

          <div className="p-3.5 glass-card rounded-xl border-white/5">
            <p className="text-[11px] text-white/50 flex gap-2 items-start leading-relaxed font-light">
              <span className="material-symbols-outlined text-[#c5a47e] text-[15px] mt-0.5 shrink-0">
                info
              </span>
              <span>Our engineering team will review your submission and contact you for live testing.</span>
            </p>
          </div>
        </div>

        {/* Submission Confirmation Panel */}
        <div className="glass-panel rounded-2xl p-6 md:p-7 lg:col-span-2 border-white/5 bg-[#080808] flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#c5a47e]/10 border border-[#c5a47e]/30 flex items-center justify-center text-[#c5a47e] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-1">
                Ready for Submission
              </h3>
              <p className="text-xs text-white/50 font-light leading-relaxed mb-4">
                Submit your onboarding form to initiate your build.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-white/5">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1">Contact Email</span>
                  <span className="font-mono text-white text-xs truncate block">
                    {formData.primaryContactEmail || 'Email provided'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/5">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1">Assigned Lead</span>
                  <span className="text-white text-xs font-medium block">
                    Shayan Ali Zafar (Solutions Lead)
                  </span>
                </div>
              </div>
            </div>
          </div>
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
