import React from 'react';
import { OnboardingState } from '../../types';

interface Step3Props {
  formData: OnboardingState;
  onChange: (field: keyof OnboardingState, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveProgress?: () => void;
}

const CALENDAR_OPTIONS = [
  { id: 'Google Calendar', label: 'Google Calendar', icon: 'calendar_month' },
  { id: 'Calendly', label: 'Calendly', icon: 'event' },
  { id: 'Cal.com', label: 'Cal.com', icon: 'schedule' },
  { id: 'Microsoft Outlook 365', label: 'Outlook 365', icon: 'mail' },
  { id: 'GoHighLevel / LeadConnector', label: 'GoHighLevel', icon: 'hub' },
  { id: 'HubSpot Meetings', label: 'HubSpot', icon: 'handshake' },
  { id: 'Jobber', label: 'Jobber', icon: 'construction' },
  { id: 'ServiceTitan', label: 'ServiceTitan', icon: 'engineering' },
  { id: 'Other', label: 'Other CRM / Custom', icon: 'more_horiz' },
];

export const Step3Integration: React.FC<Step3Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  const selectedCalendar = formData.calendarPlatform || 'Google Calendar';

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
            Select your calendar platform and connect your workflow automation accounts.
          </p>
        </div>
      </div>

      {/* Form Content (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Main Integration Card (8 cols) */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 lg:col-span-8 flex flex-col gap-8 border-white/5">
          
          {/* Calendar & Scheduling Section */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-[#c5a47e] text-[22px]">
                calendar_today
              </span>
              <h3 className="text-base font-light text-white tracking-wide">
                Calendar &amp; Scheduling System
              </h3>
            </div>
            <p className="text-xs text-white/50 mb-5 font-light leading-relaxed">
              Select which calendar or scheduling platform your business uses for appointments and bookings:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {CALENDAR_OPTIONS.map((cal) => {
                const isSelected = selectedCalendar === cal.id;
                return (
                  <button
                    key={cal.id}
                    type="button"
                    onClick={() => onChange('calendarPlatform', cal.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#c5a47e]/10 border-[#c5a47e] text-white shadow-[0_0_15px_rgba(197,164,126,0.15)]'
                        : 'bg-[#080808]/80 border-white/5 text-white/70 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-[#c5a47e]' : 'text-white/40'}`}>
                      {cal.icon}
                    </span>
                    <span className="text-xs font-medium truncate">{cal.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedCalendar === 'Other' && (
              <div className="mt-3 p-4 rounded-xl bg-[#080808] border border-white/5 animate-fadeIn">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] block mb-2">
                  Specify Your Calendar / CRM Tool
                </label>
                <input
                  type="text"
                  value={formData.calendarCustomName || ''}
                  onChange={(e) => onChange('calendarCustomName', e.target.value)}
                  placeholder="e.g., Acuity Scheduling, Housecall Pro, Jane App, Custom Webhook..."
                  className="w-full rounded-xl glass-input p-3 text-white text-xs"
                />
              </div>
            )}

            {/* Confidentiality Notice */}
            <div className="mt-4 p-4 rounded-xl bg-[#080808] border border-[#c5a47e]/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div>
                <h4 className="text-xs font-semibold text-white mb-1">
                  Confidential Live Connection
                </h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  To ensure complete confidentiality and security, specific calendar credentials, API keys, and account access permissions will be securely collected and connected during your live onboarding call.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

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
