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
  const [testWebhookUrl, setTestWebhookUrl] = useState('');
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showAppsScriptHelper, setShowAppsScriptHelper] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  const handleTestWebhook = async () => {
    if (!selectedSubmission) return;
    setTestingWebhook(true);
    setWebhookResult(null);
    try {
      const res = await fetch(`/api/submissions/${selectedSubmission.id}/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: testWebhookUrl.trim() || undefined }),
      });
      const data = await res.json();
      setWebhookResult({
        success: data.success,
        message: data.message || data.error || (data.success ? 'Webhook pushed successfully' : 'Webhook test failed'),
      });
    } catch (err: any) {
      setWebhookResult({
        success: false,
        message: `Network error: ${err.message}`,
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // 1. Fetch from server
      let serverList: SubmissionItem[] = [];
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
            serverList = data.submissions;
          }
        }
      } catch (e) {
        console.warn('Server fetch notice:', e);
      }

      // 2. Read from localStorage backup archive
      let localList: SubmissionItem[] = [];
      try {
        const rawLocal = localStorage.getItem('ring2rev_submissions_history');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            localList = parsed;
          }
        }
      } catch (e) {
        console.warn('LocalStorage parse notice:', e);
      }

      // 3. Merge seamlessly by ID (prefer server items, add missing local items)
      const mergedMap = new Map<string, SubmissionItem>();
      for (const item of serverList) {
        if (item && item.id) mergedMap.set(item.id, item);
      }
      for (const item of localList) {
        if (item && item.id && !mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      }

      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      setSubmissions(combined);
      if (combined.length > 0) {
        setSelectedSubmission((prev) => {
          if (prev && combined.some((c) => c.id === prev.id)) {
            return prev;
          }
          return combined[0];
        });
      } else {
        setSelectedSubmission(null);
      }

      // 4. If any local items are missing from server, sync them to server
      const missingOnServer = localList.filter((loc) => !serverList.some((srv) => srv.id === loc.id));
      if (missingOnServer.length > 0) {
        fetch('/api/submissions/sync-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: missingOnServer }),
        }).catch((syncErr) => console.warn('Background sync notice:', syncErr));
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

  const handleCopySheetsFormula = () => {
    const origin = window.location.origin;
    const formula = `=IMPORTDATA("${origin}/api/submissions/export.csv")`;
    navigator.clipboard.writeText(formula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 3000);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#c5a47e] border border-white/5">
              <span className="material-symbols-outlined text-[20px]">table_chart</span>
            </div>
            <div>
              <h3 className="text-base font-light text-white tracking-wide">
                Portal Submissions &amp; Google Sheet Bridge ({submissions.length})
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.15em]">
                Live Storage &amp; Data Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSubmissions}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              title="Refresh and sync submissions"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>sync</span>
              Sync
            </button>
            <a
              href="/api/submissions/export.csv"
              download="ring2rev-submissions.csv"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#c5a47e] flex items-center gap-1.5 transition-colors font-medium"
              title="Download full CSV of all submissions"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              CSV
            </a>
            <button
              type="button"
              onClick={handleCopySheetsFormula}
              className="px-3 py-1.5 rounded-xl bg-[#0f9d58]/20 hover:bg-[#0f9d58]/30 border border-[#0f9d58]/40 text-xs text-[#34A853] flex items-center gap-1.5 transition-colors font-medium"
              title="Copy Google Sheets =IMPORTDATA formula"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedFormula ? 'check' : 'table_view'}
              </span>
              {copiedFormula ? 'Copied!' : 'Sheets Formula'}
            </button>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors ml-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading && submissions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20 text-white/40 text-xs">
            <span className="material-symbols-outlined animate-spin mr-2 text-[#c5a47e]">progress_activity</span>
            Loading submission records...
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 mb-1">
              <span className="material-symbols-outlined text-[24px]">inbox</span>
            </div>
            <p className="text-sm text-white font-medium">No Submissions Recorded Yet</p>
            <p className="text-xs text-white/40 font-light max-w-sm">
              Complete and submit the 5-step onboarding portal (click <strong>&quot;Complete &amp; Submit Portal&quot;</strong> in Step 5), and your full submission record will appear here instantly.
            </p>
            <button
              type="button"
              onClick={fetchSubmissions}
              className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#c5a47e] rounded-xl font-medium flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Check / Refresh Records
            </button>
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
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded font-medium border border-emerald-500/20">
                      ✓ Recorded
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
                  </div>
                </div>

                {/* Recipient / Forwarding Card */}
                <div className="p-3.5 bg-[#050505] rounded-xl border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                      Submitter Email:
                    </span>
                    <span className="text-white/80 font-mono text-[11px]">
                      {selectedSubmission.data?.primaryContactEmail || 'N/A'}
                    </span>
                  </div>
                  {/* Resend input form */}
                  <form onSubmit={handleResendCopy} className="flex gap-2 pt-2 border-t border-white/5">
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Forward submission copy to email..."
                      className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#c5a47e] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={resending}
                      className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {resending ? 'Sending...' : 'Forward'}
                    </button>
                  </form>
                  {resendStatus && (
                    <p className="text-[11px] text-[#c5a47e] mt-1">{resendStatus}</p>
                  )}
                </div>

                {/* Google Sheet / Webhook Push Tester */}
                <div className="p-3.5 bg-[#080808] rounded-xl border border-[#0f9d58]/30 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#34A853] font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                      Live Google Sheets / Webhook Sync Tester
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAppsScriptHelper(!showAppsScriptHelper)}
                      className="text-[10px] text-white/50 hover:text-white underline"
                    >
                      {showAppsScriptHelper ? 'Hide Script Code' : 'View Google Sheet Script'}
                    </button>
                  </div>

                  <p className="text-[11px] text-white/50 font-light">
                    Test or push this submission immediately to your Google Sheet Webhook / Apps Script endpoint.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={testWebhookUrl}
                      onChange={(e) => setTestWebhookUrl(e.target.value)}
                      placeholder="Enter Google Apps Script URL or Webhook (e.g. https://script.google.com/...)"
                      className="flex-1 bg-black/70 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#34A853] focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={testingWebhook}
                      onClick={handleTestWebhook}
                      className="px-4 py-1.5 bg-[#0f9d58]/30 hover:bg-[#0f9d58]/40 border border-[#0f9d58]/60 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {testingWebhook ? (
                        <>
                          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                          Testing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[14px]">send</span>
                          Push to Sheet
                        </>
                      )}
                    </button>
                  </div>

                  {webhookResult && (
                    <div
                      className={`p-2.5 rounded-lg text-xs border font-mono ${
                        webhookResult.success
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-300 border-red-500/30'
                      }`}
                    >
                      {webhookResult.message}
                    </div>
                  )}

                  {showAppsScriptHelper && (
                    <div className="p-3 bg-black/80 rounded-lg border border-white/10 mt-2 space-y-2">
                      <p className="text-[10px] text-[#c5a47e] font-bold uppercase tracking-wider">
                        Google Sheets Apps Script (Copy &amp; Paste in Extensions &gt; Apps Script):
                      </p>
                      <pre className="text-[10px] text-white/70 font-mono overflow-x-auto bg-black p-2 rounded border border-white/5 whitespace-pre">
{`function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.submissionId,
      data.timestamp,
      data.businessName,
      data.primaryContactName,
      data.primaryContactEmail,
      data.mainPhone,
      data.businessHours,
      data.aiTone,
      data.escalationName,
      data.escalationPhone,
      data.scenariosCount,
      data.scenariosSummary,
      data.summaryText
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                      </pre>
                      <p className="text-[10px] text-white/40">
                        *Important: When deploying Apps Script, set "Who has access" to <strong>"Anyone"</strong> (so Google allows incoming background form webhooks).
                      </p>
                    </div>
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
        <div className="pt-4 mt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-white/40 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>All submissions automatically store to the backend database &amp; Google Sheets export.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-6 py-2 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] self-end sm:self-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
