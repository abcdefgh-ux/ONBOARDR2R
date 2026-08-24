import React from 'react';
import { OnboardingState } from '../../types';
import {
  BUILD_TIMELINE,
  CLIPBOARD_IMAGE_URL,
  GUIDE_AVATAR_URL,
} from '../../data/initialData';

interface Step5Props {
  formData: OnboardingState;
  onBack: () => void;
  onFinish: () => void;
}

export const Step5Expectations: React.FC<Step5Props> = ({
  formData,
  onBack,
  onFinish,
}) => {
  return (
    <div className="max-w-6xl w-full mx-auto pb-32">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 05</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-2">
          Deployment Roadmap &amp; Delivery
        </h2>
        <p className="text-sm text-white/50 font-light tracking-wide max-w-2xl">
          Specification complete. Below is the operational schedule for solution synthesis, validation testing, and production rollout.
        </p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card (1 col) */}
        <div className="glass-panel rounded-2xl p-6 md:p-7 lg:col-span-1 flex flex-col justify-between border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
                <span className="material-symbols-outlined text-[20px]">
                  fact_check
                </span>
              </div>
              <h3 className="text-base font-light text-white tracking-wide">Payload Registered</h3>
            </div>

            <p className="text-xs text-white/50 leading-relaxed mb-6 font-light">
              Thank you{formData.primaryContactName ? `, ${formData.primaryContactName}` : ''}. We have securely catalogued your operational guidelines, voice prompts, integration webhooks, and safety rails. Synthesis begins immediately.
            </p>
          </div>

          {/* Illustrative Clipboard Image */}
          <div className="rounded-xl overflow-hidden h-36 relative border border-white/5 glass-card bg-black/40">
            <img
              src={CLIPBOARD_IMAGE_URL}
              alt="Verification Clipboard"
              className="w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Timeline Card (2 cols) */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 lg:col-span-2 relative overflow-hidden border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
                <span className="material-symbols-outlined text-[20px]">
                  calendar_month
                </span>
              </div>
              <h3 className="text-base font-light text-white tracking-wide">14-Day Delivery Pipeline</h3>
            </div>
            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-[0.2em] text-[#c5a47e]">
              Standard SLA
            </span>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {BUILD_TIMELINE.map((item, idx) => (
              <div key={idx} className="relative glass-card p-4 rounded-xl -ml-6 pl-8 hover:border-[#c5a47e]/30 transition-colors border-white/5">
                <div
                  className={`absolute left-[-4px] top-5 w-3 h-3 rounded-full bg-black border-2 ${
                    idx === 0
                      ? 'border-[#c5a47e] shadow-[0_0_10px_rgba(197,164,126,0.6)]'
                      : 'border-white/20'
                  } z-10`}
                />
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
                  <h4
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                      idx === 0 ? 'text-[#c5a47e]' : 'text-white/40'
                    }`}
                  >
                    {item.days}
                  </h4>
                  <span
                    className={`text-sm font-medium ${
                      item.highlight ? 'text-[#c5a47e]' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-normal font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Guide Card (1 col) */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-1 flex flex-col justify-between border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
                <span className="material-symbols-outlined text-[20px]">
                  support_agent
                </span>
              </div>
              <h3 className="text-base font-light text-white tracking-wide">Implementation Lead</h3>
            </div>

            <div className="flex flex-col items-center text-center p-6 glass-card rounded-xl mb-6 border-white/5">
              <div className="w-20 h-20 rounded-full mb-4 border border-[#c5a47e]/40 overflow-hidden shadow-xl shadow-black/40 p-0.5">
                <img
                  src={GUIDE_AVATAR_URL}
                  alt="Shayan"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <h4 className="text-base font-light text-white mb-0.5">Shayan</h4>
              <p className="text-[9px] font-bold text-[#c5a47e] uppercase tracking-[0.2em] mb-3">
                Solutions Architecture Lead
              </p>
              <a
                href="mailto:shayan@yaanandco.com"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-[#c5a47e] transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">mail</span>
                shayan@yaanandco.com
              </a>
            </div>
          </div>

          <div className="p-4 glass-card rounded-xl border-white/5">
            <p className="text-xs text-white/50 flex gap-2.5 items-start leading-relaxed font-light">
              <span className="material-symbols-outlined text-[#c5a47e] text-[16px] mt-0.5 shrink-0">
                info
              </span>
              <span>Keep an eye on your inbox. Shayan will dispatch initial pipeline telemetry shortly.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
        <button
          id="step5-back-btn"
          type="button"
          onClick={onBack}
          className="btn-secondary px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back
        </button>

        <button
          id="step5-finish-btn"
          type="button"
          onClick={onFinish}
          className="btn-gold px-9 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 shadow-xl shadow-black/50"
        >
          Complete Deployment
          <span className="material-symbols-outlined text-[18px]">done_all</span>
        </button>
      </div>
    </div>
  );
};
