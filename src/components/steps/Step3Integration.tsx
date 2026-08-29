import React from 'react';
import { OnboardingState } from '../../types';

interface Step3Props {
  formData: OnboardingState;
  onChange: (field: keyof OnboardingState, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveProgress?: () => void;
}

export const Step3Integration: React.FC<Step3Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="max-w-6xl w-full mx-auto pb-32">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 03</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            Workflow &amp; Integrations
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-2xl font-light tracking-wide">
            Connect your workflow automation accounts and calendar scheduling tools.
          </p>
        </div>
      </div>

      {/* Form Content (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Main Integration Card (8 cols) */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 lg:col-span-8 flex flex-col gap-8 border-white/5">
          
          {/* N8N Workflow Connection */}
          <div>
            <h3 className="text-base font-light text-white flex items-center gap-3 mb-2 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[22px]">
                account_tree
              </span>
              N8N Workflow Hub
            </h3>
            <p className="text-xs text-white/50 mb-6 font-light leading-relaxed">
              Enter your N8N account email to connect real-time webhook pipelines and workflow automations.
            </p>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="n8n-email"
                className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e]"
              >
                N8N Account Email (Optional)
              </label>
              <input
                id="n8n-email"
                type="email"
                value={formData.n8nEmail || ''}
                onChange={(e) => onChange('n8nEmail', e.target.value)}
                placeholder="you@yourcompany.com"
                className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
              />
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Scheduling & CRM Setup */}
          <div>
            <h3 className="text-base font-light text-white flex items-center gap-3 mb-2 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[22px]">
                calendar_today
              </span>
              Calendar &amp; Scheduling
            </h3>
            <p className="text-xs text-white/50 mb-6 font-light leading-relaxed">
              Supported calendar platforms for real-time booking and appointment management:
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Google Calendar', 'Calendly', 'Cal.com', 'GoHighLevel', 'HubSpot', 'Outlook 365', 'Jobber', 'Custom CRM'].map((cal) => (
                <div
                  key={cal}
                  className="bg-[#050505] p-3 rounded-xl border border-white/5 flex items-center gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#c5a47e]"></span>
                  <span className="text-xs text-white font-light">{cal}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Security & API Handshake */}
          <div>
            <h3 className="text-base font-light text-white flex items-center gap-3 mb-3 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[22px]">
                lock
              </span>
              Zero-Trust Security &amp; Live API Handshake
            </h3>
            <p className="text-xs text-white/50 mb-4 font-light leading-relaxed">
              API keys and tokens (Stripe, Twilio, Retell AI) are paired live over encrypted video sessions for maximum security.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c5a47e] text-[20px] mt-0.5">
                  credit_card
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white mb-0.5">Payment Gateways</h4>
                  <p className="text-[11px] text-white/50 font-light">
                    Configured during your live onboarding session.
                  </p>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c5a47e] text-[20px] mt-0.5">
                  phone_in_talk
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white mb-0.5">Telephony &amp; CRM</h4>
                  <p className="text-[11px] text-white/50 font-light">
                    Phone numbers and routing synced securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Info Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden h-full border-white/5">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#c5a47e]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <h3 className="text-base font-light text-white mb-6 tracking-wide">Key Information</h3>
            <div className="space-y-6">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#c5a47e] text-[20px] mt-0.5">
                  speed
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Sub-Second Voice</h4>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed font-light">
                    Instant conversational response times.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#c5a47e] text-[20px] mt-0.5">
                  bolt
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Automated Pipelines</h4>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed font-light">
                    Workflows provisioned directly from your responses.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#c5a47e] text-[20px] mt-0.5">
                  shield
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Secure Credentials</h4>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed font-light">
                    No sensitive API keys required in forms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <button
          id="step3-back-btn"
          type="button"
          onClick={onBack}
          className="btn-secondary px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2"
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
            id="step3-next-btn"
            type="button"
            onClick={onNext}
            className="btn-gold px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/40"
          >
            Next Step
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
