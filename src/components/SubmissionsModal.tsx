import React, { useState, useEffect } from 'react';

interface SubmissionItem {
  id: string;
  submittedAt: string;
  recipientEmails: string[];
  data: any;
  webhookSent: boolean;
  summaryText: string;
}

interface SubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionsModal: React.FC<SubmissionsModalProps> = ({ isOpen, onClose }) => {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
        if (data.submissions.length > 0 && !selectedSubmission) {
          setSelectedSubmission(data.submissions[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTranscript = () => {
    if (!selectedSubmission) return;
    navigator.clipboard.writeText(selectedSubmission.summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    if (!selectedSubmission) return;
    const blob = new Blob([JSON.stringify(selectedSubmission, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission-${selectedSubmission.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResendCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !resendEmail.trim()) return;
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch(`/api/submissions/${selectedSubmission.id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: resendEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setResendStatus(`✓ Response copy successfully dispatched to ${resendEmail}`);
        setResendEmail('');
        fetchSubmissions();
      } else {
        setResendStatus('Failed to dispatch copy');
      }
    } catch {
      setResendStatus('Network error sending copy');
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-5xl rounded-3xl p-6 md:p-8 bg-[#0a0a0a] shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#c5a47e] border border-white/5">
              <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
            </div>
            <div>
              <h3 className="text-base font-light text-white tracking-wide">
                Received Response Copies ({submissions.length})
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.15em]">
                Live Portal Submissions &amp; Response Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-white/40 text-xs">
            <span className="material-symbols-outlined animate-spin mr-2 text-[#c5a47e]">progress_activity</span>
            Loading response records...
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 mb-3">
              <span className="material-symbols-outlined text-[24px]">inbox</span>
            </div>
            <p className="text-sm text-white font-medium mb-1">No Form Submissions Yet</p>
            <p className="text-xs text-white/40 font-light max-w-sm">
              When anyone completes and submits the 5-step onboarding flow, a copy of all responses will instantly populate here and be dispatched to your inbox.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 flex-1 min-h-0 overflow-hidden">
            {/* Left list of submissions */}
            <div className="lg:col-span-4 overflow-y-auto space-y-2.5 pr-2 border-r border-white/5 max-h-[60vh]">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubmission(sub)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedSubmission?.id === sub.id
                      ? 'bg-[#141414] border-[#c5a47e]/50 shadow-[0_0_12px_rgba(197,164,126,0.15)]'
                      : 'bg-[#050505] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c5a47e]">
                      {sub.id}
                    </span>
                    <span className="text-[9px] text-white/30 font-mono">
                      {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-xs text-white font-medium truncate">
                    {sub.data?.businessName || 'Untitled Business'}
                  </h4>
                  <p className="text-[11px] text-white/40 truncate mt-0.5">
                    {sub.data?.primaryContactName || 'No contact'} ({sub.data?.primaryContactEmail || 'No email'})
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[9px] text-white/30">
                    <span className="material-symbols-outlined text-[12px] text-[#c5a47e]">outgoing_mail</span>
                    <span className="truncate">Sent to: {sub.recipientEmails?.join(', ') || 'Admin'}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Selected submission detail & actions */}
            {selectedSubmission && (
              <div className="lg:col-span-8 flex flex-col min-h-0 overflow-y-auto max-h-[60vh] space-y-4">
                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a47e]">
                      Record: {selectedSubmission.id}
                    </span>
                    <span className="px-2 py-0.5 bg-[#c5a47e]/10 text-[#c5a47e] text-[9px] rounded font-medium border border-[#c5a47e]/20">
                      Copy Dispatched
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="px-3 py-1.5 rounded-lg bg-black border border-white/10 hover:border-[#c5a47e]/40 text-xs text-white flex items-center gap-1.5 transition-colors"
                      title="Copy plain text response transcript"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copied ? 'check' : 'content_copy'}
                      </span>
                      {copied ? 'Copied' : 'Copy Text'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadJSON}
                      className="px-3 py-1.5 rounded-lg bg-black border border-white/10 hover:border-[#c5a47e]/40 text-xs text-white flex items-center gap-1.5 transition-colors"
                      title="Download JSON Payload"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Download JSON
                    </button>
                    <a
                      href={`mailto:${selectedSubmission.recipientEmails.join(',')}?subject=Copy of Ring2Rev Onboarding - ${encodeURIComponent(selectedSubmission.data?.businessName || 'Response Record')}&body=${encodeURIComponent(selectedSubmission.summaryText)}`}
                      className="px-3 py-1.5 rounded-lg bg-[#c5a47e] text-black font-semibold text-xs flex items-center gap-1.5 transition-opacity hover:opacity-90"
                      title="Open formatted copy in default email client"
                    >
                      <span className="material-symbols-outlined text-[14px]">send</span>
                      Email Draft
                    </a>
                  </div>
                </div>

                {/* Recipient Distribution Card */}
                <div className="p-3.5 bg-[#050505] rounded-xl border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                      Dispatched Copy Recipients:
                    </span>
                    <span className="text-white/80 font-mono text-[11px]">
                      {selectedSubmission.recipientEmails?.join(' • ')}
                    </span>
                  </div>
                  {/* Resend input form */}
                  <form onSubmit={handleResendCopy} className="flex gap-2 pt-2 border-t border-white/5">
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Dispatch extra copy to email address..."
                      className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#c5a47e] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={resending}
                      className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {resending ? 'Sending...' : 'Send Extra Copy'}
                    </button>
                  </form>
                  {resendStatus && (
                    <p className="text-[11px] text-[#c5a47e] mt-1">{resendStatus}</p>
                  )}
                </div>

                {/* Plain text preview box */}
                <div className="flex-1 bg-[#050505] border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-[11px] text-white/70 leading-relaxed whitespace-pre-wrap selection:bg-[#c5a47e]/30">
                  {selectedSubmission.summaryText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] text-white/40">
            Automatic copy generation enabled for <strong className="text-white font-normal">shayanalizafar@yahoo.com</strong> and submitter.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-6 py-2 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
