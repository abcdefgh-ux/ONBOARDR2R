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
  const [copiedCsv, setCopiedCsv] = useState(false);

  if (!isOpen) return null;

  const subResult = formData.submissionResult;

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

  const escapeCell = (val: any): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleDownloadCsv = () => {
    const headers = [
      'Submission ID',
      'Submitted At',
      'Business Name',
      'Primary Contact Name',
      'Primary Contact Email',
      'Main Phone',
      'Business Address',
      'Service Area / Territory',
      'Business Hours',
      'AI Tone',
      'Retell Account Email',
      'N8N Email',
      'Escalation Contact Name',
      'Escalation Phone',
      'Emergency Alert Enabled',
      'SMS Follow-up Enabled',
      'Auto Booking Enabled',
      'Custom Automation Notes',
      'Configured Scenarios Count',
      'Scenarios Summary',
      'Uploaded Docs Count',
      'Summary Transcript'
    ];

    const scenariosSummary = (formData.scenarios || [])
      .map((s) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
      .join(' | ');

    const row = [
      escapeCell(subResult?.submissionId || 'R2R-REC'),
      escapeCell(subResult?.submittedAt || new Date().toISOString()),
      escapeCell(formData.businessName),
      escapeCell(formData.primaryContactName),
      escapeCell(formData.primaryContactEmail),
      escapeCell(formData.mainPhone),
      escapeCell(formData.businessAddress),
      escapeCell(formData.serviceArea),
      escapeCell(formData.businessHours),
      escapeCell(formData.aiTone),
      escapeCell(formData.retellEmail),
      escapeCell(formData.n8nEmail),
      escapeCell(formData.escalationName),
      escapeCell(formData.escalationPhone),
      escapeCell(formData.notifyTeamOnEmergency ? 'TRUE' : 'FALSE'),
      escapeCell(formData.smsFollowupEnabled ? 'TRUE' : 'FALSE'),
      escapeCell(formData.autoBookingEnabled ? 'TRUE' : 'FALSE'),
      escapeCell(formData.customAutomationNotes),
      escapeCell((formData.scenarios || []).length),
      escapeCell(scenariosSummary),
      escapeCell((formData.uploadedDocs || []).length),
      escapeCell(summaryText),
    ].join(',');

    const csvContent = `${headers.join(',')}\n${row}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ring2rev-onboarding-${(formData.businessName || 'submission').toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCsv = () => {
    const headers = [
      'Submission ID',
      'Submitted At',
      'Business Name',
      'Primary Contact Name',
      'Primary Contact Email',
      'Main Phone',
      'Business Address',
      'Service Area / Territory',
      'Business Hours',
      'AI Tone',
      'Retell Account Email',
      'N8N Email',
      'Escalation Contact Name',
      'Escalation Phone',
      'Emergency Alert Enabled',
      'SMS Follow-up Enabled',
      'Auto Booking Enabled',
      'Custom Automation Notes',
      'Configured Scenarios Count',
      'Scenarios Summary',
      'Uploaded Docs Count',
      'Summary Transcript'
    ];

    const scenariosSummary = (formData.scenarios || [])
      .map((s) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
      .join(' | ');

    const row = [
      escapeCell(subResult?.submissionId || 'R2R-REC'),
      escapeCell(subResult?.submittedAt || new Date().toISOString()),
      escapeCell(formData.businessName),
      escapeCell(formData.primaryContactName),
      escapeCell(formData.primaryContactEmail),
      escapeCell(formData.mainPhone),
      escapeCell(formData.businessAddress),
      escapeCell(formData.serviceArea),
      escapeCell(formData.businessHours),
      escapeCell(formData.aiTone),
      escapeCell(formData.retellEmail),
      escapeCell(formData.n8nEmail),
      escapeCell(formData.escalationName),
      escapeCell(formData.escalationPhone),
      escapeCell(formData.notifyTeamOnEmergency ? 'TRUE' : 'FALSE'),
      escapeCell(formData.smsFollowupEnabled ? 'TRUE' : 'FALSE'),
      escapeCell(formData.autoBookingEnabled ? 'TRUE' : 'FALSE'),
      escapeCell(formData.customAutomationNotes),
      escapeCell((formData.scenarios || []).length),
      escapeCell(scenariosSummary),
      escapeCell((formData.uploadedDocs || []).length),
      escapeCell(summaryText),
    ].join(',');

    navigator.clipboard.writeText(`${headers.join(',')}\n${row}`);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

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
    a.download = `ring2rev-onboarding-${formData.businessName ? formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'submission'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const payload = {
      submissionId: subResult?.submissionId,
      submittedAt: subResult?.submittedAt || new Date().toISOString(),
      businessName: formData.businessName,
      contact: {
        name: formData.primaryContactName,
        email: formData.primaryContactEmail,
        phone: formData.mainPhone,
      },
      operations: {
        address: formData.businessAddress,
        serviceArea: formData.serviceArea,
        hours: formData.businessHours,
        aiTone: formData.aiTone,
      },
      scenarios: formData.scenarios,
      integrations: {
        retellEmail: formData.retellEmail,
        n8nEmail: formData.n8nEmail,
      },
      safety: {
        escalationName: formData.escalationName,
        escalationPhone: formData.escalationPhone,
        notifyTeamOnEmergency: formData.notifyTeamOnEmergency,
        smsFollowupEnabled: formData.smsFollowupEnabled,
        autoBookingEnabled: formData.autoBookingEnabled,
        customAutomationNotes: formData.customAutomationNotes,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ring2rev-payload-${subResult?.submissionId || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8 md:p-9 bg-[#0a0a0a] shadow-2xl border border-[#c5a47e]/30 text-center relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#c5a47e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-[#c5a47e]/40 flex items-center justify-center text-[#c5a47e] mx-auto mb-4 shadow-xl shadow-black/60">
          <span className="material-symbols-outlined text-3xl">celebration</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">
            Onboarding Completed
          </span>
        </div>

        <h3 className="text-2xl font-light text-white mb-2 tracking-tight">
          Form Submitted Successfully
        </h3>

        <p className="text-xs text-white/50 leading-relaxed mb-6 font-light">
          Your onboarding specifications for{' '}
          <strong className="text-[#c5a47e] font-medium">{formData.businessName || 'your enterprise'}</strong> have been securely recorded into our engineering pipeline.
        </p>

        {/* Receipt ID card */}
        {subResult?.submissionId && (
          <div className="bg-[#050505] border border-white/10 rounded-2xl p-4 mb-5 text-left flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">Submission Reference</span>
              <span className="text-sm font-mono text-white font-medium">{subResult.submissionId}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded-lg border border-emerald-500/20">
              ✓ Logged
            </span>
          </div>
        )}

        {/* Quick Tools */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#c5a47e]/40 transition-all flex flex-col items-center justify-center gap-1 group"
            title="Download CSV spreadsheet"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c5a47e] group-hover:scale-110 transition-transform">
              file_download
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              Save CSV
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyCsv}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#c5a47e]/40 transition-all flex flex-col items-center justify-center gap-1 group"
            title="Copy CSV to clipboard to paste in Sheets or Excel"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c5a47e] group-hover:scale-110 transition-transform">
              {copiedCsv ? 'check' : 'content_paste'}
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              {copiedCsv ? 'Copied!' : 'Copy CSV'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTranscript}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#c5a47e]/40 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c5a47e] group-hover:scale-110 transition-transform">
              description
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              Save .TXT
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#c5a47e]/40 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c5a47e] group-hover:scale-110 transition-transform">
              data_object
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              Save .JSON
            </span>
          </button>
        </div>

        {/* Details Summary Box */}
        <div className="text-left bg-[#050505] border border-white/5 rounded-2xl p-4 mb-6 text-xs space-y-2 font-light">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Enterprise:</span>
            <span className="text-white font-medium">{formData.businessName || 'Provided'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Primary Contact:</span>
            <span className="text-white font-medium">{formData.primaryContactName || 'Provided'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Voice Tone:</span>
            <span className="text-[#c5a47e] font-medium">{formData.aiTone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Configured Scenarios:</span>
            <span className="text-white font-medium">{formData.scenarios.length} Scenarios</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="btn-secondary px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Review Responses
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
              Portal Records
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-gold px-7 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
