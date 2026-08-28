import React, { useState } from 'react';
import { OnboardingState } from '../types';

interface FinishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: OnboardingState;
  onRestart: () => void;
  onOpenSubmissions?: () => void;
}

export const FinishSuccessModal: React.FC<FinishSuccessModalProps> = ({
  isOpen,
  onClose,
  formData,
  onRestart,
  onOpenSubmissions,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subResult = formData.submissionResult;
  const recipientList = subResult?.recipientEmails || [
    'shayanalizafar@yahoo.com',
    formData.primaryContactEmail,
  ].filter(Boolean) as string[];

  const summaryText =
    subResult?.summaryText ||
    `RING2REV ONBOARDING SUBMISSION
Business: ${formData.businessName || 'N/A'}
Contact: ${formData.primaryContactName || 'N/A'} (${formData.primaryContactEmail || 'N/A'})
Phone: ${formData.mainPhone || 'N/A'}
Tone: ${formData.aiTone}
Hours: ${formData.businessHours || 'N/A'}
Territory: ${formData.serviceArea || 'N/A'}
Scenarios: ${(formData.scenarios || []).length} configured
Retell Email: ${formData.retellEmail || 'N/A'}
N8N Email: ${formData.n8nEmail || 'N/A'}
Escalation: ${formData.escalationName || 'N/A'} (${formData.escalationPhone || 'N/A'})
Automations: Emergency Alert=${formData.notifyTeamOnEmergency ? 'Yes' : 'No'}, SMS Followup=${formData.smsFollowupEnabled ? 'Yes' : 'No'}, Auto Booking=${formData.autoBookingEnabled ? 'Yes' : 'No'}`;

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTranscript = () => {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ring2rev-submission-${formData.businessName ? formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'response'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailSubject = encodeURIComponent(`Copy of Ring2Rev Responses - ${formData.businessName || 'Onboarding'}`);
  const emailBody = encodeURIComponent(summaryText);
  const mailtoLink = `mailto:${recipientList.join(',')}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-8 md:p-9 bg-[#0a0a0a] shadow-2xl border border-[#c5a47e]/30 text-center relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#c5a47e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-[#c5a47e]/40 flex items-center justify-center text-[#c5a47e] mx-auto mb-4 shadow-xl shadow-black/60">
          <span className="material-symbols-outlined text-3xl">celebration</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">
            Deployment Record Created
          </span>
        </div>

        <h3 className="text-2xl font-light text-white mb-2 tracking-tight">
          Form Submitted &amp; Copy Dispatched
        </h3>

        <p className="text-xs text-white/50 leading-relaxed mb-5 font-light">
          Your onboarding specifications for{' '}
          <strong className="text-[#c5a47e] font-medium">{formData.businessName || 'your enterprise'}</strong> have been saved to the portal server and response copies have been generated.
        </p>

        {/* Copy Delivery Confirmation Banner */}
        <div className="bg-[#050505] border border-emerald-500/30 rounded-2xl p-4 mb-5 text-left">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              Response Copies Dispatched To:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-white/80">
            {recipientList.map((em, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                {em}
              </span>
            ))}
          </div>
          {subResult?.submissionId && (
            <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-white/40">
              <span>Receipt ID: <strong className="text-white font-mono">{subResult.submissionId}</strong></span>
              <span>{new Date(subResult.submittedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Action Quick Links for Responses */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <button
            type="button"
            onClick={handleCopyTranscript}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#c5a47e]/40 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c5a47e] group-hover:scale-110 transition-transform">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              {copied ? 'Copied!' : 'Copy Text'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTranscript}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#c5a47e]/40 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c5a47e] group-hover:scale-110 transition-transform">
              download
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              Download .txt
            </span>
          </button>

          <a
            href={mailtoLink}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#c5a47e]/40 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c5a47e] group-hover:scale-110 transition-transform">
              forward_to_inbox
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              Email Client
            </span>
          </a>
        </div>

        {/* Details Summary Box */}
        <div className="text-left bg-[#050505] border border-white/5 rounded-2xl p-4 mb-6 text-xs space-y-2 font-light">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Company:</span>
            <span className="text-white font-medium">{formData.businessName || 'Provided'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Primary Contact:</span>
            <span className="text-white font-medium">{formData.primaryContactName || 'Provided'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">AI Vocal Profile:</span>
            <span className="text-[#c5a47e] font-medium">{formData.aiTone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Active Scenarios:</span>
            <span className="text-white font-medium">{formData.scenarios.length} Configured</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="btn-secondary px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Review Form
          </button>
          {onOpenSubmissions && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSubmissions();
              }}
              className="btn-secondary px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-1 text-[#c5a47e]"
            >
              <span className="material-symbols-outlined text-[14px]">history</span>
              Submissions Log
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-gold px-6 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
