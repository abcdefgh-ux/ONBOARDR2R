import React, { useState } from 'react';
import { OnboardingState } from '../../types';
import { GoogleSignInButton } from '../GoogleSignInButton';
import {
  signInWithGoogle,
  signOutGoogle,
  getCachedAccessToken,
  createRing2RevSpreadsheet,
} from '../../services/googleSheets';

interface Step3Props {
  formData: OnboardingState;
  onChange: (field: keyof OnboardingState, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveProgress: () => void;
  googleUserEmail?: string | null;
  onGoogleSignInSuccess?: (email: string, token: string) => void;
  onGoogleSignOutSuccess?: () => void;
}

export const Step3Integration: React.FC<Step3Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveProgress,
  googleUserEmail,
  onGoogleSignInSuccess,
  onGoogleSignOutSuccess,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setSyncStatusMsg(null);
    try {
      const res = await signInWithGoogle();
      if (res && res.user) {
        const email = res.user.email || 'Connected Google Account';
        onChange('googleAccountEmail', email);
        onChange('googleSyncEnabled', true);
        if (onGoogleSignInSuccess) {
          onGoogleSignInSuccess(email, res.accessToken);
        }

        // Pre-create or link spreadsheet
        if (!formData.spreadsheetId) {
          try {
            const sheet = await createRing2RevSpreadsheet(res.accessToken);
            onChange('spreadsheetId', sheet.spreadsheetId);
            onChange('spreadsheetUrl', sheet.spreadsheetUrl);
            setSyncStatusMsg(`✓ Google Sheet created & connected: ${sheet.spreadsheetId.slice(0, 12)}...`);
          } catch (sheetErr: any) {
            console.warn('Could not auto-create sheet on connect:', sheetErr);
            setSyncStatusMsg('✓ Google Connected. Sheet will be initialized on submission.');
          }
        } else {
          setSyncStatusMsg('✓ Google Connected and ready to record submissions.');
        }
      }
    } catch (err: any) {
      console.error('Google connect error:', err);
      setSyncStatusMsg(`Connection notice: ${err?.message || 'Could not complete Google Sign-In'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await signOutGoogle();
      onChange('googleAccountEmail', undefined);
      onChange('googleSyncEnabled', false);
      if (onGoogleSignOutSuccess) {
        onGoogleSignOutSuccess();
      }
      setSyncStatusMsg('Google Account disconnected');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto pb-32">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 03</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            Workflow &amp; Integration Hub
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-2xl font-light tracking-wide">
            Establish secure orchestration bridges connecting conversational models and Google Sheets with your operational infrastructure.
          </p>
        </div>
        <button
          type="button"
          onClick={onSaveProgress}
          className="btn-secondary hidden md:flex py-2.5 px-6 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] items-center gap-2 self-start md:self-end"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          Save Progress
        </button>
      </div>

      {/* Form Content (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Main Integration Card (8 cols) */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 lg:col-span-8 flex flex-col gap-8 border-white/5">
          
          {/* Google Sheets Real-Time Sync Card */}
          <div className="bg-[#0b0b0b] border border-[#c5a47e]/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0f9d58]/10 border border-[#0f9d58]/30 flex items-center justify-center text-[#0f9d58]">
                  <span className="material-symbols-outlined text-[24px]">table_chart</span>
                </div>
                <div>
                  <h3 className="text-base font-light text-white flex items-center gap-2 tracking-wide">
                    Google Sheets Real-Time Sync
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#0f9d58]/20 text-[#34A853] border border-[#0f9d58]/40">
                      Live Bridge
                    </span>
                  </h3>
                  <p className="text-xs text-white/50 font-light">
                    Every onboarding portal submission is appended to a structured Google Sheet with permission.
                  </p>
                </div>
              </div>

              <div>
                <GoogleSignInButton
                  onClick={handleGoogleConnect}
                  isLoading={isConnecting}
                  userEmail={formData.googleAccountEmail || googleUserEmail}
                  onSignOut={handleGoogleDisconnect}
                />
              </div>
            </div>

            {/* Status & Spreadsheet Link details */}
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Spreadsheet Status</span>
                <div className="flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono text-xs">
                    {formData.spreadsheetId ? 'Linked & Configured' : 'Auto-initializes on submit'}
                  </span>
                </div>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Target Sheet URL</span>
                {formData.spreadsheetUrl ? (
                  <a
                    href={formData.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#c5a47e] hover:text-white underline font-mono text-xs flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{formData.spreadsheetUrl}</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                ) : (
                  <span className="text-white/40 font-mono text-xs">
                    Ring2Rev Onboarding Submissions.gsheet
                  </span>
                )}
              </div>
            </div>

            {syncStatusMsg && (
              <div className="mt-3 p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#c5a47e] font-mono">
                {syncStatusMsg}
              </div>
            )}
          </div>

          <hr className="border-white/5" />

          <div>
            <h3 className="text-base font-light text-white flex items-center gap-3 mb-2 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[22px]">
                account_tree
              </span>
              N8N Workflow Connection
            </h3>
            <p className="text-xs text-white/50 mb-6 font-light">
              We leverage enterprise N8N pipelines to orchestrate real-time telemetry, Google Sheets webhooks, and API requests.
            </p>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="n8n-email"
                className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e]"
              >
                N8N Account Email
              </label>
              <input
                id="n8n-email"
                type="email"
                value={formData.n8nEmail}
                onChange={(e) => onChange('n8nEmail', e.target.value)}
                placeholder="you@yourcompany.com"
                className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
              />
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Secure Call Info Cards */}
          <div>
            <h3 className="text-base font-light text-white flex items-center gap-3 mb-3 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[22px]">
                lock
              </span>
              Secure Live Handshake
            </h3>
            <p className="text-xs text-white/50 mb-6 font-light">
              High-sensitivity credentials and API tokens are exchanged over end-to-end encrypted video handshakes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Note */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 flex items-start gap-4 hover:border-[#c5a47e]/30 transition-all">
                <div className="bg-white/5 p-2.5 rounded-xl mt-1 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">
                    credit_card
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Payment Gateways</h4>
                  <p className="text-xs text-white/50 font-light">
                    Merchant accounts and Stripe webhooks configured live with mutual authentication.
                  </p>
                  <span className="inline-block mt-3 px-2.5 py-1 bg-[#c5a47e]/10 text-[#c5a47e] text-[9px] font-bold uppercase tracking-[0.2em] rounded-md border border-[#c5a47e]/30">
                    Live Session Required
                  </span>
                </div>
              </div>

              {/* CRM Note */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 flex items-start gap-4 hover:border-[#c5a47e]/30 transition-all">
                <div className="bg-white/5 p-2.5 rounded-xl mt-1 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">
                    contact_page
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Calendar &amp; CRM Sync</h4>
                  <p className="text-xs text-white/50 font-light">
                    Direct database binding and Google/Outlook calendar slot verification.
                  </p>
                  <span className="inline-block mt-3 px-2.5 py-1 bg-[#c5a47e]/10 text-[#c5a47e] text-[9px] font-bold uppercase tracking-[0.2em] rounded-md border border-[#c5a47e]/30">
                    Live Session Required
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Info Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden h-full border-white/5">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#c5a47e]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <h3 className="text-base font-light text-white mb-6 tracking-wide">Enterprise Protocol</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-[#0f9d58] text-[22px] mt-0.5">
                  sync
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Google Sheets Target</h4>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed font-light">
                    Portal responses update in your Google Sheet immediately upon user submission with timestamped columns.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-[#c5a47e] text-[22px] mt-0.5">
                  bolt
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Pre-Staged Pipelines</h4>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed font-light">
                    Providing your account email enables immediate asynchronous server setup.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-[#c5a47e] text-[22px] mt-0.5">
                  shield_lock
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Zero-Knowledge Storage</h4>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed font-light">
                    Secrets and API tokens are never saved to intermediate client forms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
        <button
          id="step3-back-btn"
          type="button"
          onClick={onBack}
          className="btn-secondary w-full sm:w-auto px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back
        </button>
        <button
          id="step3-next-btn"
          type="button"
          onClick={onNext}
          className="btn-gold w-full sm:w-auto px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2"
        >
          Next Step
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

