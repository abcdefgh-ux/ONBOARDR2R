import React, { useState } from 'react';
import { OnboardingState } from '../../types';
import {
  BUILD_TIMELINE,
  CLIPBOARD_IMAGE_URL,
  GUIDE_AVATAR_URL,
} from '../../data/initialData';
import { GoogleSignInButton } from '../GoogleSignInButton';
import {
  signInWithGoogle,
  createRing2RevSpreadsheet,
} from '../../services/googleSheets';

interface Step5Props {
  formData: OnboardingState;
  onBack: () => void;
  onFinish: () => void;
  onChange?: (field: keyof OnboardingState, value: any) => void;
  isSubmitting?: boolean;
  googleUserEmail?: string | null;
  onGoogleSignInSuccess?: (email: string, token: string) => void;
}

export const Step5Expectations: React.FC<Step5Props> = ({
  formData,
  onBack,
  onFinish,
  onChange,
  isSubmitting = false,
  googleUserEmail,
  onGoogleSignInSuccess,
}) => {
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const res = await signInWithGoogle();
      if (res && res.user && onChange) {
        const email = res.user.email || 'Connected Google Account';
        onChange('googleAccountEmail', email);
        onChange('googleSyncEnabled', true);
        if (onGoogleSignInSuccess) {
          onGoogleSignInSuccess(email, res.accessToken);
        }
        if (!formData.spreadsheetId) {
          try {
            const sheet = await createRing2RevSpreadsheet(res.accessToken);
            onChange('spreadsheetId', sheet.spreadsheetId);
            onChange('spreadsheetUrl', sheet.spreadsheetUrl);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

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
          Specification complete. Below is the operational schedule for solution synthesis, Google Sheets live sync, and production rollout.
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
              Thank you{formData.primaryContactName ? `, ${formData.primaryContactName}` : ''}. We have securely catalogued your operational guidelines, voice prompts, integration webhooks, and safety rails.
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
              <h4 className="text-base font-light text-white mb-0.5">Shayan Ali Zafar</h4>
              <p className="text-[9px] font-bold text-[#c5a47e] uppercase tracking-[0.2em] mb-3">
                Solutions Architecture Lead
              </p>
              <a
                href="mailto:shayanalizafar@yahoo.com"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-[#c5a47e] transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">mail</span>
                shayanalizafar@yahoo.com
              </a>
            </div>
          </div>

          <div className="p-4 glass-card rounded-xl border-white/5">
            <p className="text-xs text-white/50 flex gap-2.5 items-start leading-relaxed font-light">
              <span className="material-symbols-outlined text-[#c5a47e] text-[16px] mt-0.5 shrink-0">
                info
              </span>
              <span>Keep an eye on your inbox and Google Sheet. Shayan will dispatch initial pipeline telemetry shortly.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Google Sheets Destination & Sync Status Banner */}
      <div className="mt-8 glass-panel rounded-2xl p-6 border-white/5 bg-[#080808]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f9d58]/10 border border-[#0f9d58]/30 flex items-center justify-center text-[#0f9d58] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">table_chart</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Google Sheets Automatic Update
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {formData.googleAccountEmail || googleUserEmail ? 'Connected' : 'Live Bridge Ready'}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                All business specifications and scenario routing details are synchronized into your connected Google Sheet upon submission.
              </p>
              {formData.spreadsheetUrl && (
                <a
                  href={formData.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#c5a47e] hover:text-white underline inline-flex items-center gap-1 mt-1 font-mono"
                >
                  <span>Open Synced Google Sheet</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              )}
            </div>
          </div>

          <div>
            {!formData.googleAccountEmail && !googleUserEmail ? (
              <GoogleSignInButton
                onClick={handleConnectGoogle}
                isLoading={isConnectingGoogle}
                variant="compact"
              />
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-black/60 px-3 py-2 rounded-xl border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Auto-sync enabled ({formData.googleAccountEmail || googleUserEmail})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Automated Response Copy Distribution Notice */}
      <div className="mt-6 glass-panel rounded-2xl p-6 border-white/5 bg-[#080808]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">outgoing_mail</span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Automated Response Copy Distribution
              </h3>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                Upon submitting, a complete timestamped transcript of all 5 onboarding steps is automatically recorded and emailed to:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-lg bg-black border border-white/10 text-white font-mono text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a47e]"></span>
                  shayanalizafar@yahoo.com (Admin Lead)
                </span>
                {formData.primaryContactEmail && (
                  <span className="px-2.5 py-1 rounded-lg bg-black border border-white/10 text-white font-mono text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {formData.primaryContactEmail} (Submitter)
                  </span>
                )}
                {formData.retellEmail && formData.retellEmail !== formData.primaryContactEmail && (
                  <span className="px-2.5 py-1 rounded-lg bg-black border border-white/10 text-white font-mono text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    {formData.retellEmail} (Retell Account)
                  </span>
                )}
              </div>
            </div>
          </div>
          {onChange && (
            <div className="md:w-72">
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#c5a47e] mb-1 font-medium">
                Add CC / Extra Recipient
              </label>
              <input
                type="email"
                value={formData.additionalCopyEmails || ''}
                onChange={(e) => onChange('additionalCopyEmails', e.target.value)}
                placeholder="colleague@company.com"
                className="w-full rounded-xl glass-input p-2.5 text-white text-xs font-mono"
              />
            </div>
          )}
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
              Syncing to Sheets &amp; Submitting...
            </>
          ) : (
            <>
              Complete &amp; Update Sheets
              <span className="material-symbols-outlined text-[18px]">done_all</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
