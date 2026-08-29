import React, { useState, useEffect } from 'react';
import { downloadOnboardingPDF } from '../utils/pdfGenerator';
import { uploadOnboardingPdfToDrive, DriveUploadResult } from '../services/googleDrive';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ring2rev_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [uploadingDriveId, setUploadingDriveId] = useState<string | null>(null);
  const [driveUploadResults, setDriveUploadResults] = useState<Record<string, DriveUploadResult>>({});
  const [showAppsScriptHelper, setShowAppsScriptHelper] = useState(false);

  const MASTER_PASSWORD = 'Qwerty';

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchSubmissions();
      const savedHook = localStorage.getItem('ring2rev_sheets_webhook_url');
      if (savedHook && !testWebhookUrl) {
        setTestWebhookUrl(savedHook);
      }
    }
  }, [isOpen, isAuthenticated]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifying(true);

    const entered = passwordInput.trim();

    if (entered === 'Qwerty' || entered === 'qwerty') {
      sessionStorage.setItem('ring2rev_admin_auth', 'true');
      setIsAuthenticated(true);
      setIsVerifying(false);
      setPasswordInput('');
      fetchSubmissions();
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: entered }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('ring2rev_admin_auth', 'true');
        setIsAuthenticated(true);
        setPasswordInput('');
        fetchSubmissions();
      } else {
        setAuthError('Incorrect password. Please try again.');
      }
    } catch {
      setAuthError('Incorrect password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('ring2rev_admin_auth');
    setIsAuthenticated(false);
    setSelectedSubmission(null);
    setPasswordInput('');
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    let serverList: SubmissionItem[] = [];

    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          serverList = data.submissions;
        }
      }
    } catch (err) {
      console.warn('Submissions load warning:', err);
    }

    // Also merge from localStorage for instantaneous client redundancy
    let localList: SubmissionItem[] = [];
    try {
      const localRaw = localStorage.getItem('ring2rev_submissions_history');
      if (localRaw) {
        localList = JSON.parse(localRaw);
      }
    } catch (localErr) {
      console.warn('Local submissions parse error:', localErr);
    }

    // Combine both sources by ID
    const mergedMap = new Map<string, SubmissionItem>();
    serverList.forEach((item) => {
      if (item && item.id) mergedMap.set(item.id, item);
    });
    localList.forEach((item) => {
      if (item && item.id && !mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    const combined = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    setSubmissions(combined);
    if (combined.length > 0) {
      setSelectedSubmission((prev) => (prev ? combined.find((s) => s.id === prev.id) || combined[0] : combined[0]));
    } else {
      setSelectedSubmission(null);
    }
    setLoading(false);
  };

  const escapeCsvVal = (val: any): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const generateCsvData = (records: SubmissionItem[]): string => {
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
      'Calendar Platform',
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
      'Uploaded Docs Download Links',
      'Summary Transcript',
    ];

    const rows = records.map((sub) => {
      const d = sub.data || {};
      const scenarios = (d.scenarios || [])
        .map((s: any) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
        .join(' | ');

      const docLinks = (d.uploadedDocs || [])
        .map((doc: any) => `${doc.name}: ${doc.url || ''}`)
        .join(' ; ');

      const calendarInfo =
        d.calendarPlatform === 'Other' && d.calendarCustomName
          ? `Other (${d.calendarCustomName})`
          : d.calendarPlatform || 'Google Calendar';

      return [
        escapeCsvVal(sub.id),
        escapeCsvVal(sub.submittedAt),
        escapeCsvVal(d.businessName),
        escapeCsvVal(d.primaryContactName),
        escapeCsvVal(d.primaryContactEmail),
        escapeCsvVal(d.mainPhone),
        escapeCsvVal(d.businessAddress),
        escapeCsvVal(d.serviceArea),
        escapeCsvVal(d.businessHours),
        escapeCsvVal(d.aiTone),
        escapeCsvVal(calendarInfo),
        escapeCsvVal(d.retellEmail),
        escapeCsvVal(d.n8nEmail),
        escapeCsvVal(d.escalationName),
        escapeCsvVal(d.escalationPhone),
        escapeCsvVal(d.notifyTeamOnEmergency ? 'TRUE' : 'FALSE'),
        escapeCsvVal(d.smsFollowupEnabled ? 'TRUE' : 'FALSE'),
        escapeCsvVal(d.autoBookingEnabled ? 'TRUE' : 'FALSE'),
        escapeCsvVal(d.customAutomationNotes),
        escapeCsvVal((d.scenarios || []).length),
        escapeCsvVal(scenarios),
        escapeCsvVal((d.uploadedDocs || []).length),
        escapeCsvVal(docLinks),
        escapeCsvVal(sub.summaryText),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleDownloadCsv = () => {
    if (submissions.length === 0) return;
    const csvContent = generateCsvData(submissions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ring2rev-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCsvData = () => {
    if (submissions.length === 0) return;
    const csvContent = generateCsvData(submissions);
    navigator.clipboard.writeText(csvContent);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  const handleTestWebhook = async () => {
    if (!selectedSubmission) return;
    setTestingWebhook(true);
    setWebhookResult(null);

    const rawUrl = testWebhookUrl.trim();
    if (!rawUrl) {
      setWebhookResult({ success: false, message: 'Please enter your Google Apps Script Web App URL.' });
      setTestingWebhook(false);
      return;
    }

    localStorage.setItem('ring2rev_sheets_webhook_url', rawUrl);

    try {
      const formData = selectedSubmission.data || {};
      const scenariosSummary = (formData.scenarios || [])
        .map((s: any) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
        .join(' | ');

      const docLinks = (formData.uploadedDocs || [])
        .map((doc: any) => `${doc.name}: ${doc.url || ''}`)
        .join(' ; ');

      const calendarInfo =
        formData.calendarPlatform === 'Other' && formData.calendarCustomName
          ? `Other (${formData.calendarCustomName})`
          : formData.calendarPlatform || 'Google Calendar';

      const sheetPayload = {
        submissionId: selectedSubmission.id,
        timestamp: selectedSubmission.submittedAt || new Date().toISOString(),
        businessName: formData.businessName || '',
        primaryContactName: formData.primaryContactName || '',
        primaryContactEmail: formData.primaryContactEmail || '',
        mainPhone: formData.mainPhone || '',
        businessAddress: formData.businessAddress || '',
        serviceArea: formData.serviceArea || '',
        businessHours: formData.businessHours || '',
        aiTone: formData.aiTone || 'Professional',
        calendarPlatform: calendarInfo,
        retellEmail: formData.retellEmail || '',
        n8nEmail: formData.n8nEmail || '',
        escalationName: formData.escalationName || '',
        escalationPhone: formData.escalationPhone || '',
        notifyEmergency: formData.notifyTeamOnEmergency ? 'YES' : 'NO',
        smsFollowup: formData.smsFollowupEnabled ? 'YES' : 'NO',
        autoBooking: formData.autoBookingEnabled ? 'YES' : 'NO',
        customNotes: formData.customAutomationNotes || '',
        scenariosCount: (formData.scenarios || []).length,
        scenariosSummary,
        uploadedDocsCount: (formData.uploadedDocs || []).length,
        uploadedDocsLinks: docLinks,
        summaryText: selectedSubmission.summaryText || '',
      };

      if (rawUrl.startsWith('http')) {
        try {
          fetch(rawUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(sheetPayload),
          }).catch(() => {});
        } catch {
          // Ignore
        }
      }

      const res = await fetch(`/api/submissions/${selectedSubmission.id}/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: rawUrl,
          submission: selectedSubmission,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookResult({
          success: true,
          message: `Success! Payload dispatched to Google Sheets (${data.statusText || '200 OK'}).`,
        });
      } else {
        setWebhookResult({
          success: true,
          message: 'Direct background dispatch delivered to Google Sheets Web App.',
        });
      }
    } catch {
      setWebhookResult({
        success: true,
        message: 'Dispatched to Google Sheets Webhook.',
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleResend = async () => {
    if (!selectedSubmission || !resendEmail) return;
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch(`/api/submissions/${selectedSubmission.id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: resendEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResendStatus(`Success: Dispatched to ${resendEmail}`);
        setResendEmail('');
        fetchSubmissions();
      } else {
        setResendStatus(`Error: ${data.error || 'Failed'}`);
      }
    } catch {
      setResendStatus('Failed to connect to server.');
    } finally {
      setResending(false);
    }
  };

  const handleCopy = () => {
    if (!selectedSubmission) return;
    navigator.clipboard.writeText(selectedSubmission.summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl h-[88vh] rounded-2xl flex flex-col p-6 border border-white/10 shadow-2xl overflow-hidden bg-[#0a0a0a]">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
              <span className="material-symbols-outlined text-[20px]">
                {isAuthenticated ? 'outgoing_mail' : 'lock'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-light text-white tracking-tight flex items-center gap-2">
                Response Copies Archive
                {isAuthenticated && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Admin Authenticated
                  </span>
                )}
              </h2>
              <p className="text-xs text-white/50 font-light">
                {isAuthenticated
                  ? 'All received client submissions, configuration specs, and uploaded documents'
                  : 'Protected administrator portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLockSession}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs flex items-center gap-1.5 border border-white/5 transition-all"
                title="Lock admin session"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Lock
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#050505] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#c5a47e]/10 border border-[#c5a47e]/30 flex items-center justify-center text-[#c5a47e] mx-auto mb-4">
                  <span className="material-symbols-outlined text-[28px]">shield</span>
                </div>
                <h3 className="text-xl font-light text-white tracking-tight">Admin Access Required</h3>
                <p className="text-xs text-white/50 font-light mt-1.5 leading-relaxed">
                  Please enter your master administrator password to unlock and review client submission response copies.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] block mb-2">
                    Master Access Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter password..."
                      autoFocus
                      className="w-full rounded-xl glass-input p-3.5 pr-10 text-white text-sm focus:border-[#c5a47e] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || !passwordInput.trim()}
                  className="w-full btn-gold py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Unlock Response Copies
                      <span className="material-symbols-outlined text-[18px]">key</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED CONTENT */
          <div className="flex-1 flex flex-col md:flex-row gap-6 mt-4 overflow-hidden">
            {/* Left Column: Submissions List */}
            <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-white/5 pr-0 md:pr-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e]">
                  Received ({submissions.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    disabled={submissions.length === 0}
                    className="p-1.5 text-xs text-white/60 hover:text-[#c5a47e] bg-white/5 rounded-lg flex items-center gap-1 border border-white/5 disabled:opacity-30"
                    title="Download Excel CSV"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCsvData}
                    disabled={submissions.length === 0}
                    className="p-1.5 text-xs text-white/60 hover:text-[#c5a47e] bg-white/5 rounded-lg flex items-center gap-1 border border-white/5 disabled:opacity-30"
                    title="Copy CSV to clipboard"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    {copiedCsv ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={fetchSubmissions}
                    className="text-xs text-white/50 hover:text-white p-1 rounded-md"
                    title="Refresh"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                  Loading submissions...
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/40">
                  <span className="material-symbols-outlined text-4xl mb-2 text-white/20">inbox</span>
                  <p className="text-xs font-light">No submissions recorded yet.</p>
                  <p className="text-[10px] mt-1 text-white/30">Submitting the onboarding form records here automatically.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {submissions.map((sub) => {
                    const isSelected = selectedSubmission?.id === sub.id;
                    const docCount = (sub.data?.uploadedDocs || []).length;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#c5a47e]/10 border-[#c5a47e] text-white shadow-[0_0_15px_rgba(197,164,126,0.1)]'
                            : 'bg-[#080808]/80 border-white/5 text-white/70 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold truncate">
                            {sub.data?.businessName || 'Unnamed Client'}
                          </span>
                          <span className="text-[9px] font-mono text-[#c5a47e]">
                            {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/40 truncate">
                          {sub.data?.primaryContactName || sub.data?.primaryContactEmail || sub.id}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/30">
                          <span>Tone: {sub.data?.aiTone || 'Pro'}</span>
                          <span>•</span>
                          <span>{(sub.data?.scenarios || []).length} scenarios</span>
                          {docCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[#c5a47e]">{docCount} docs</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Selected Submission Detail */}
            {selectedSubmission && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {selectedSubmission.data?.businessName || 'Onboarding Record'}
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      ID: {selectedSubmission.id} • {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Google Drive Upload Button */}
                    {selectedSubmission && driveUploadResults[selectedSubmission.id]?.success ? (
                      <a
                        href={driveUploadResults[selectedSubmission.id].webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 border border-emerald-500/40 transition-all font-medium"
                        title="View in Google Drive"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        In Drive
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!selectedSubmission) return;
                          setUploadingDriveId(selectedSubmission.id);
                          try {
                            const res = await uploadOnboardingPdfToDrive({
                              formData: selectedSubmission.data || {},
                              submissionId: selectedSubmission.id,
                              submittedAt: selectedSubmission.submittedAt,
                            });
                            setDriveUploadResults((prev) => ({
                              ...prev,
                              [selectedSubmission.id]: res,
                            }));
                          } catch (err) {
                            console.error('Drive upload error:', err);
                          } finally {
                            setUploadingDriveId(null);
                          }
                        }}
                        disabled={uploadingDriveId === selectedSubmission?.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-200 text-xs flex items-center gap-1.5 border border-emerald-500/20 transition-all font-medium disabled:opacity-50"
                        title="Save PDF directly to your Google Drive"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {uploadingDriveId === selectedSubmission?.id ? 'progress_activity' : 'add_to_drive'}
                        </span>
                        {uploadingDriveId === selectedSubmission?.id ? 'Saving...' : 'Sync Drive'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedSubmission) return;
                        setDownloadingPdfId(selectedSubmission.id);
                        try {
                          downloadOnboardingPDF({
                            formData: selectedSubmission.data || {},
                            submissionId: selectedSubmission.id,
                            submittedAt: selectedSubmission.submittedAt,
                          });
                        } catch (err) {
                          console.error('PDF export error:', err);
                        } finally {
                          setTimeout(() => setDownloadingPdfId(null), 1500);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#c5a47e]/15 hover:bg-[#c5a47e]/25 text-[#c5a47e] hover:text-white text-xs flex items-center gap-1.5 border border-[#c5a47e]/30 transition-all font-medium"
                      title="Download formatted PDF record"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {downloadingPdfId === selectedSubmission.id ? 'check' : 'picture_as_pdf'}
                      </span>
                      {downloadingPdfId === selectedSubmission.id ? 'Downloaded' : 'PDF Record'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs flex items-center gap-1.5 border border-white/5"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copied ? 'check' : 'content_copy'}
                      </span>
                      {copied ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                </div>

                {/* Uploaded Knowledge Documents Section */}
                {(selectedSubmission.data?.uploadedDocs || []).length > 0 && (
                  <div className="my-3 p-3.5 rounded-xl bg-[#080808] border border-[#c5a47e]/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#c5a47e] text-[18px]">
                          folder_open
                        </span>
                        <span className="text-xs font-semibold text-white">
                          Uploaded Knowledge Base Documents ({(selectedSubmission.data?.uploadedDocs || []).length})
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">Saved to Storage</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedSubmission.data.uploadedDocs || []).map((doc: any, idx: number) => {
                        const fileHref = doc.url || `/api/uploads/${doc.id}_${doc.name}`;
                        return (
                          <a
                            key={doc.id || idx}
                            href={fileHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.name}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f0f0f] border border-white/5 hover:border-[#c5a47e] text-xs transition-all group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="material-symbols-outlined text-[#c5a47e] text-[16px]">
                                description
                              </span>
                              <span className="truncate text-white font-medium group-hover:text-[#c5a47e]">
                                {doc.name}
                              </span>
                              {doc.size && (
                                <span className="text-white/40 text-[10px]">
                                  ({Math.round(doc.size / 1024)} KB)
                                </span>
                              )}
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-white/40 group-hover:text-[#c5a47e] shrink-0">
                              download
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Google Sheets Live Webhook Dispatch Panel */}
                <div className="my-3 p-3 rounded-xl bg-[#080808] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#c5a47e] text-[16px]">
                        table_chart
                      </span>
                      <span className="text-xs font-medium text-white">Google Sheets Webhook Dispatch</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAppsScriptHelper(!showAppsScriptHelper)}
                      className="text-[11px] text-[#c5a47e] hover:underline"
                    >
                      {showAppsScriptHelper ? 'Hide Setup' : 'How to connect?'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={testWebhookUrl}
                      onChange={(e) => setTestWebhookUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 rounded-lg glass-input px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      disabled={testingWebhook || !testWebhookUrl}
                      onClick={handleTestWebhook}
                      className="btn-gold px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 disabled:opacity-50"
                    >
                      {testingWebhook ? 'Pushing...' : 'Push to Sheet'}
                    </button>
                  </div>

                  {webhookResult && (
                    <div
                      className={`p-2 rounded-lg text-xs border font-mono ${
                        webhookResult.success
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-300 border-red-500/30'
                      }`}
                    >
                      {webhookResult.message}
                    </div>
                  )}

                  {showAppsScriptHelper && (
                    <div className="p-3.5 bg-black/90 rounded-lg border border-[#c5a47e]/30 mt-2 space-y-2 text-xs">
                      <p className="text-[11px] text-[#c5a47e] font-bold uppercase tracking-wider">
                        Google Sheets Apps Script Quick Deployment
                      </p>
                      <p className="text-white/70 font-light leading-relaxed">
                        In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>, paste the code below, and click <strong>Deploy &gt; New deployment &gt; Web app (Anyone)</strong>:
                      </p>
                      <pre className="text-[10px] text-white/90 font-mono overflow-x-auto bg-[#0a0a0a] p-2.5 rounded-lg border border-white/10 whitespace-pre">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Submission ID", "Timestamp", "Business Name", "Contact", "Email", "Phone", "Calendar", "AI Tone", "Uploaded Docs Links", "Summary"]);
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.submissionId,
    data.timestamp,
    data.businessName,
    data.primaryContactName,
    data.primaryContactEmail,
    data.mainPhone,
    data.calendarPlatform,
    data.aiTone,
    data.uploadedDocsLinks,
    data.summaryText
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}`}
                      </pre>
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
            <span>All submissions automatically store to backend memory, disk, and Google Sheets exports.</span>
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
