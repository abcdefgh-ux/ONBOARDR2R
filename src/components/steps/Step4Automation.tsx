import React from 'react';
import { OnboardingState } from '../../types';

interface Step4Props {
  formData: OnboardingState;
  onChange: (field: keyof OnboardingState, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveProgress: () => void;
}

export const Step4Automation: React.FC<Step4Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveProgress,
}) => {
  return (
    <div className="max-w-4xl w-full mx-auto pb-32">
      <div className="glass-panel rounded-3xl p-8 md:p-14 mb-10 relative overflow-hidden border-white/5">
        {/* Decorative ambient blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a47e]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-white/10 flex items-center justify-center p-4 shadow-xl shadow-black/60">
            <span className="material-symbols-outlined text-3xl text-[#c5a47e]">
              robot_2
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 04</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            Autonomous Workflows &amp; Safety Rails
          </h2>

          <p className="text-sm md:text-base text-white/50 leading-relaxed font-light">
            With integrations connected, establish operational constraints, escalation thresholds, and automated follow-up channels for dependable execution.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6 text-left">
            <div className="glass-card p-5 rounded-2xl flex gap-4 items-start border-white/5">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px] mt-0.5">
                rule
              </span>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white mb-1">
                  Deterministic Rules
                </h3>
                <p className="text-xs text-white/50 leading-normal font-light">
                  Strict boundaries specifying actions the agent is permitted to execute autonomously.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex gap-4 items-start border-white/5">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px] mt-0.5">
                support_agent
              </span>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white mb-1">
                  Failsafe Handoff
                </h3>
                <p className="text-xs text-white/50 leading-normal font-light">
                  Instant escalation to on-call human staff whenever anomalies or conflicts arise.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Automation Toggles */}
          <div className="w-full mt-6 pt-6 border-t border-white/5 text-left space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a47e]">
              Preset Autonomous Triggers
            </h4>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#080808] border border-white/5 cursor-pointer hover:border-[#c5a47e]/30 transition-colors">
              <div className="pr-4">
                <span className="text-xs font-semibold text-white block">
                  Instant Emergency Broadcast
                </span>
                <span className="text-[11px] text-white/40 font-light">
                  Send SMS &amp; Webhook alerts immediately when an emergency keyword is detected.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyTeamOnEmergency}
                onChange={(e) => onChange('notifyTeamOnEmergency', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#c5a47e] bg-black"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#080808] border border-white/5 cursor-pointer hover:border-[#c5a47e]/30 transition-colors">
              <div className="pr-4">
                <span className="text-xs font-semibold text-white block">
                  Post-Call SMS Confirmation
                </span>
                <span className="text-[11px] text-white/40 font-light">
                  Text caller a summary recap and booking link after every completed inquiry.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.smsFollowupEnabled}
                onChange={(e) => onChange('smsFollowupEnabled', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#c5a47e] bg-black"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between mt-auto pt-6">
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
          <button
            id="step4-save-btn"
            type="button"
            onClick={onSaveProgress}
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white transition-colors hidden sm:block px-4 py-2"
          >
            Save Progress
          </button>
          <button
            id="step4-next-btn"
            type="button"
            onClick={onNext}
            className="btn-primary px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 shadow-lg shadow-black/40"
          >
            Next Step
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
