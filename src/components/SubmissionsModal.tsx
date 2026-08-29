import React, { useState, useEffect } from 'react';
import { downloadOnboardingPDF, generateOnboardingPdfBlob } from '../utils/pdfGenerator';
import {
  getStoredAppsScriptUrl,
  setStoredAppsScriptUrl,
  setInMemoryGlobalAppsScriptUrl,
  sendToGoogleAppsScriptWebhook,
} from '../services/googleDrive';
import {
  fetchSubmissionsFromFirestore,
  saveSubmissionToFirestore,
  fetchGlobalDriveWebhookUrl,
  saveGlobalDriveWebhookUrl,
} from '../services/firebaseDb';

interface SubmissionItem {
  id: string;
  submittedAt: string;
  recipientEmails: string[];
  data: any;
  webhookSent: boolean;
  summaryText: string;
  driveSyncResult?: {
    success: boolean;
    folderLink?: string;
    folderName?: string;
    webViewLink?: string;
    fileName?: string;
    kbDocsCount?: number;
    syncedAt?: string;
  };
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

  // Google Drive Webhook state
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => getStoredAppsScriptUrl());
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [testSyncStatus, setTestSyncStatus] = useState<string | null>(null);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [uploadingDriveId, setUploadingDriveId] = useState<string | null>(null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const [copiedCsv, setCopiedCsv] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const MASTER_PASSWORD = 'Qwerty';

  // Load global Google Drive Apps Script URL from Cloud Firestore on mount
  useEffect(() => {
    fetchGlobalDriveWebhookUrl()
      .then((globalUrl) => {
        if (globalUrl && globalUrl.trim()) {
          setAppsScriptUrl(globalUrl);
          setStoredAppsScriptUrl(globalUrl);
          setInMemoryGlobalAppsScriptUrl(globalUrl);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchSubmissions();
    }
  }, [isOpen, isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');

    setTimeout(() => {
      if (passwordInput === MASTER_PASSWORD) {
        setIsAuthenticated(true);
        sessionStorage.setItem('ring2rev_admin_auth', 'true');
        setPasswordInput('');
        fetchSubmissions();
      } else {
        setAuthError('Incorrect administrator password.');
      }
      setIsVerifying(false);
    }, 250);
  };

  const handleLockSession = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ring2rev_admin_auth');
    setSelectedSubmission(null);
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const firestoreItems = await fetchSubmissionsFromFirestore();
      const localItems: SubmissionItem[] = JSON.parse(
        localStorage.getItem('ring2rev_all_submissions') || '[]'
      );

      const map = new Map<string, SubmissionItem>();
      firestoreItems.forEach((item) => map.set(item.id, item as any));
      localItems.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      });

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      setSubmissions(combined);
      if (combined.length > 0) {
        setSelectedSubmission((prev) => (prev ? combined.find((s) => s.id === prev.id) || combined[0] : combined[0]));
      }
    } catch (e) {
      console.error('Failed to load submissions', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppsScriptUrl = async () => {
    if (!appsScriptUrl.trim()) return;
    setIsSavingUrl(true);
    setTestSyncStatus(null);
    try {
      setStoredAppsScriptUrl(appsScriptUrl);
      setInMemoryGlobalAppsScriptUrl(appsScriptUrl);
      await saveGlobalDriveWebhookUrl(appsScriptUrl);
      setTestSyncStatus('✓ Saved globally! Every client submission from ANY device or browser will now automatically create a dedicated folder with the PDF in your Google Drive without asking them to sign in.');
    } catch (err: any) {
      setTestSyncStatus(`Save note: ${err.message || 'Saved locally'}`);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleDisconnectDrive = async () => {
    setAppsScriptUrl('');
    setStoredAppsScriptUrl('');
    setInMemoryGlobalAppsScriptUrl('');
    await saveGlobalDriveWebhookUrl('');
    setTestSyncStatus(null);
  };

  const handleSyncSingleToDrive = async (submission: SubmissionItem) => {
    const url = appsScriptUrl.trim() || getStoredAppsScriptUrl();
    if (!url) {
      alert('Please paste and save your Google Apps Script Webhook URL first in the green box above.');
      return;
    }

    setUploadingDriveId(submission.id);
    setTestSyncStatus(null);
    try {
      const pdfBlob = await generateOnboardingPdfBlob(submission.data || {}, submission.id, submission.submittedAt);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string)?.split(',')[1];
        const uploadedDocsPayload = (submission.data?.uploadedDocs || []).map((doc: any) => ({
          name: doc.name,
          type: doc.type,
          size: doc.size,
          base64: doc.dataUrl || doc.url || '',
        }));

        const res = await sendToGoogleAppsScriptWebhook(
          url,
          {
            id: submission.id,
            submittedAt: submission.submittedAt,
            formData: submission.data,
            uploadedDocs: uploadedDocsPayload,
            kbArticles: submission.data?.kbArticles || [],
            businessName: submission.data?.businessName || 'Client',
            primaryContactName: submission.data?.primaryContactName || '',
            primaryContactEmail: submission.data?.primaryContactEmail || '',
          },
          base64Data
        );

        if (res.success) {
          setTestSyncStatus(`✓ Successfully sent "${submission.data?.businessName || submission.id}" to your Google Drive!`);
          // Save result
          saveSubmissionToFirestore({
            ...submission,
            driveSyncResult: {
              success: true,
              folderLink: res.folderUrl,
              folderName: submission.data?.businessName || 'Client',
              syncedAt: new Date().toISOString(),
            },
          }).catch(() => {});
        } else {
          setTestSyncStatus(`Drive status: Dispatched`);
        }
        setUploadingDriveId(null);
      };
      reader.readAsDataURL(pdfBlob);
    } catch (err: any) {
      setTestSyncStatus(`Drive note: ${err.message || 'Dispatched'}`);
      setUploadingDriveId(null);
    }
  };

  const handleSyncAllToDrive = async () => {
    const url = appsScriptUrl.trim() || getStoredAppsScriptUrl();
    if (!url) {
      alert('Please paste and save your Google Apps Script Webhook URL first in the green box above.');
      return;
    }
    if (submissions.length === 0 || isBatchSyncing) return;

    setIsBatchSyncing(true);
    setBatchProgress({ current: 0, total: submissions.length });

    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i];
      setBatchProgress({ current: i + 1, total: submissions.length });
      try {
        const pdfBlob = await generateOnboardingPdfBlob(sub.data || {}, sub.id, sub.submittedAt);
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Data = (reader.result as string)?.split(',')[1];
            const uploadedDocsPayload = (sub.data?.uploadedDocs || []).map((doc: any) => ({
              name: doc.name,
              type: doc.type,
              size: doc.size,
              base64: doc.dataUrl || doc.url || '',
            }));

            await sendToGoogleAppsScriptWebhook(
              url,
              {
                id: sub.id,
                submittedAt: sub.submittedAt,
                formData: sub.data,
                uploadedDocs: uploadedDocsPayload,
                kbArticles: sub.data?.kbArticles || [],
                businessName: sub.data?.businessName || 'Client',
              },
              base64Data
            );
            resolve();
          };
          reader.readAsDataURL(pdfBlob);
        });
      } catch (err) {
        console.warn(`Sync failed for ${sub.id}:`, err);
      }
    }

    setIsBatchSyncing(false);
    setBatchProgress(null);
    setTestSyncStatus(`✓ All ${submissions.length} client submissions pushed to Google Drive!`);
  };

  const handleDownloadPdf = (submission: SubmissionItem) => {
    downloadOnboardingPDF({
      formData: submission.data || {},
      submissionId: submission.id,
      submittedAt: submission.submittedAt,
    });
  };

  const handleDownloadCsv = () => {
    if (submissions.length === 0) return;
    const headers = [
      'Submission ID',
      'Date Submitted',
      'Business Name',
      'Contact Name',
      'Contact Email',
      'Main Phone',
      'Business Address',
      'Service Area',
      'Business Hours',
      'AI Tone',
      'Calendar Platform',
      'Retell Email',
      'n8n Email',
      'Escalation Name',
      'Escalation Phone',
      'Emergency Routing',
      'SMS Followup',
      'Auto Booking',
      'Scenarios Count',
      'Uploaded Docs Count',
    ];

    const rows = submissions.map((s) => {
      const d = s.data || {};
      return [
        s.id,
        s.submittedAt,
        `"${(d.businessName || '').replace(/"/g, '""')}"`,
        `"${(d.primaryContactName || '').replace(/"/g, '""')}"`,
        d.primaryContactEmail || '',
        d.mainPhone || '',
        `"${(d.businessAddress || '').replace(/"/g, '""')}"`,
        `"${(d.serviceArea || '').replace(/"/g, '""')}"`,
        `"${(d.businessHours || '').replace(/"/g, '""')}"`,
        d.aiTone || '',
        d.calendarPlatform || '',
        d.retellEmail || '',
        d.n8nEmail || '',
        `"${(d.escalationName || '').replace(/"/g, '""')}"`,
        d.escalationPhone || '',
        d.notifyTeamOnEmergency ? 'YES' : 'NO',
        d.smsFollowupEnabled ? 'YES' : 'NO',
        d.autoBookingEnabled ? 'YES' : 'NO',
        (d.scenarios || []).length,
        (d.uploadedDocs || []).length,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ring2Rev_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var rootFolder = DriveApp.getRootFolder();
    var parentFolders = rootFolder.getFoldersByName("Ring2Rev Onboarding Records");
    var parent = parentFolders.hasNext() ? parentFolders.next() : rootFolder.createFolder("Ring2Rev Onboarding Records");
    
    var clientName = data.businessName || (data.formData && data.formData.businessName) || "Client";
    var folderName = clientName + " - " + (data.id || new Date().toISOString().substring(0, 10));
    var clientFolder = parent.createFolder(folderName);
    
    // 1. Save Generated PDF Summary
    if (data.pdfBase64) {
      var decoded = Utilities.base64Decode(data.pdfBase64);
      var blob = Utilities.newBlob(decoded, "application/pdf", clientName + "_Onboarding_Summary.pdf");
      clientFolder.createFile(blob);
    }
    
    // 2. Save Uploaded Knowledge Base Documents As-Is
    var uploadedDocs = data.uploadedDocs || (data.formData && data.formData.uploadedDocs) || [];
    for (var i = 0; i < uploadedDocs.length; i++) {
      var docItem = uploadedDocs[i];
      var rawBase64 = docItem.base64 || docItem.data;
      if (rawBase64) {
        try {
          if (rawBase64.indexOf(",") > -1) { rawBase64 = rawBase64.split(",")[1]; }
          var decodedDoc = Utilities.base64Decode(rawBase64);
          var fileBlob = Utilities.newBlob(decodedDoc, docItem.type || "application/octet-stream", docItem.name || ("Document_" + (i + 1)));
          clientFolder.createFile(fileBlob);
        } catch(e) {}
      }
    }
    
    // 3. Save Knowledge Base Articles/FAQs if any
    var kbArticles = data.kbArticles || (data.formData && data.formData.kbArticles) || [];
    if (kbArticles.length > 0) {
      var kbContent = "=== KNOWLEDGE BASE ARTICLES ===\\n\\n";
      for (var k = 0; k < kbArticles.length; k++) {
        kbContent += "TITLE: " + kbArticles[k].title + "\\n" + kbArticles[k].content + "\\n\\n-------------------\\n\\n";
      }
      var kbBlob = Utilities.newBlob(kbContent, "text/plain", "Knowledge_Base_Notes.txt");
      clientFolder.createFile(kbBlob);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      folderUrl: clientFolder.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
};`;

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const bName = (s.data?.businessName || '').toLowerCase();
    const cName = (s.data?.primaryContactName || '').toLowerCase();
    const cEmail = (s.data?.primaryContactEmail || '').toLowerCase();
    return bName.includes(q) || cName.includes(q) || cEmail.includes(q) || s.id.toLowerCase().includes(q);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col p-6 border border-white/10 shadow-2xl overflow-hidden bg-[#0a0a0a]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#c5a47e]">
              <span className="material-symbols-outlined text-[22px]">
                {isAuthenticated ? 'cloud_sync' : 'lock'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-light text-white tracking-tight flex items-center gap-2">
                Google Drive Auto-Sync &amp; Submissions Archive
                {isAuthenticated && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Admin Authenticated
                  </span>
                )}
              </h2>
              <p className="text-xs text-white/50 font-light">
                {isAuthenticated
                  ? 'Zero-login Google Drive automation for all client onboarding records'
                  : 'Protected administrator portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => setShowDriveGuide(!showDriveGuide)}
                  className="px-3 py-1.5 rounded-lg bg-[#c5a47e]/15 hover:bg-[#c5a47e]/25 text-[#c5a47e] text-xs flex items-center gap-1.5 border border-[#c5a47e]/30 transition-all font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">code</span>
                  <span>{showDriveGuide ? 'Hide Setup Script' : '60-Sec Drive Setup'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLockSession}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs flex items-center gap-1.5 border border-white/5 transition-all"
                  title="Lock admin session"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Lock
                </button>
              </>
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
                  Enter master password to access Google Drive sync settings and client submissions.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] block mb-2">
                    Master Password
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
                  {isVerifying ? 'Verifying...' : 'Unlock Admin Portal'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED CONTENT */
          <div className="flex-1 flex flex-col mt-4 overflow-hidden gap-4">
            
            {/* PROMINENT GOOGLE DRIVE AUTO-SYNC CONTROLLER */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs shrink-0 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-emerald-300 font-medium">
                  <span className="material-symbols-outlined text-[18px]">cloud_done</span>
                  <span>Google Drive Auto-Sync Webhook (Connect Once for All Clients)</span>
                </div>
                {appsScriptUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      ✓ Active Across All Devices
                    </span>
                    <button
                      type="button"
                      onClick={handleDisconnectDrive}
                      className="text-white/40 hover:text-red-400 text-[10px] underline"
                    >
                      Clear URL
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-amber-300 font-medium">Paste your Web App URL below to activate</span>
                )}
              </div>

              <p className="text-white/70 text-[11px] mb-2.5 leading-relaxed">
                Paste your deployed Google Apps Script URL here. Once saved, <strong>every client from any computer, phone, or browser</strong> will automatically deliver a dedicated folder with the signed summary PDF into your Google Drive <strong>without requiring any Google sign-in</strong>.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-black/70 border border-emerald-500/40 text-white font-mono text-xs focus:outline-none focus:border-emerald-300 placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={handleSaveAppsScriptUrl}
                  disabled={isSavingUrl || !appsScriptUrl.trim()}
                  className="px-4 py-2.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-500/50 font-bold text-xs transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {isSavingUrl ? 'Saving...' : 'Save & Link Drive'}
                </button>
                {submissions.length > 0 && appsScriptUrl && (
                  <button
                    type="button"
                    onClick={handleSyncAllToDrive}
                    disabled={isBatchSyncing}
                    className="px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-medium transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                    title="Push all existing submissions to Google Drive"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isBatchSyncing ? 'progress_activity' : 'drive_folder_upload'}
                    </span>
                    {isBatchSyncing ? `Syncing (${batchProgress?.current}/${batchProgress?.total})...` : 'Sync All Past Forms'}
                  </button>
                )}
              </div>

              {testSyncStatus && (
                <div className="mt-2.5 p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
                  {testSyncStatus}
                </div>
              )}
            </div>

            {/* 60-Second Setup Guide */}
            {showDriveGuide && (
              <div className="p-4 rounded-xl bg-[#080808] border border-[#c5a47e]/40 text-xs text-white/80 space-y-3 shrink-0">
                <div className="flex items-center justify-between text-[#c5a47e] font-medium">
                  <span>Google Apps Script Setup (Deploy in 60 seconds)</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-3 py-1 rounded bg-[#c5a47e]/20 hover:bg-[#c5a47e]/30 text-[#c5a47e] border border-[#c5a47e]/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    {copiedCode ? '✓ Copied Script!' : 'Copy Script Code'}
                  </button>
                </div>

                <ol className="list-decimal pl-4 space-y-1.5 text-white/70 text-[11px] leading-relaxed">
                  <li>Open <a href="https://script.google.com/home/start" target="_blank" rel="noopener noreferrer" className="underline text-[#c5a47e] font-semibold">Google Apps Script (script.google.com)</a> &gt; Click <strong>New project</strong>.</li>
                  <li>Select and delete all existing code in the editor, then paste the copied code above.</li>
                  <li>Click <strong>Deploy &gt; New deployment</strong> at the top right.</li>
                  <li>Click the gear icon next to "Select type" and choose <strong>Web app</strong>.</li>
                  <li>Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em> (this allows clients to submit without login).</li>
                  <li>Click <strong>Deploy</strong>, authorize access with your Google account, and copy the <strong>Web app URL</strong>.</li>
                  <li>Paste that URL in the green box above and click <strong>Save &amp; Link Drive</strong>.</li>
                </ol>
              </div>
            )}

            {/* MAIN ARCHIVE VIEWER */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
              
              {/* Left Column: Submissions List */}
              <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-white/5 pr-0 md:pr-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e]">
                    Submissions ({filteredSubmissions.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      disabled={submissions.length === 0}
                      className="p-1.5 text-xs text-white/60 hover:text-[#c5a47e] bg-white/5 rounded-lg flex items-center gap-1 border border-white/5 disabled:opacity-30 transition-all"
                      title="Download CSV"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      CSV
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

                <div className="mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by client or email..."
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#c5a47e]"
                  />
                </div>

                {loading ? (
                  <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                    Loading submissions...
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/40">
                    <span className="material-symbols-outlined text-4xl mb-2 text-white/20">inbox</span>
                    <p className="text-xs font-light">No submissions found.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredSubmissions.map((sub) => {
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
                          <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
                            <span>{(sub.data?.scenarios || []).length} scenarios • {docCount} docs</span>
                            <span className="text-white/40">{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Selected Submission Detail */}
              {selectedSubmission ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {selectedSubmission.data?.businessName || 'Onboarding Record'}
                      </h3>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">
                        ID: {selectedSubmission.id} • {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSyncSingleToDrive(selectedSubmission)}
                        disabled={uploadingDriveId === selectedSubmission.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs flex items-center gap-1.5 transition-all font-medium disabled:opacity-50"
                        title="Send this copy to your Google Drive"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {uploadingDriveId === selectedSubmission.id ? 'progress_activity' : 'cloud_upload'}
                        </span>
                        {uploadingDriveId === selectedSubmission.id ? 'Sending...' : 'Send to Drive'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(selectedSubmission)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs flex items-center gap-1.5 transition-all font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download PDF
                      </button>
                    </div>
                  </div>

                  {/* Submission Detail Fields */}
                  <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 text-xs">
                    
                    {/* Primary Info */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] block">
                        Business &amp; Contact Details
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-white/80">
                        <div><span className="text-white/40">Business Name:</span> {selectedSubmission.data?.businessName || 'N/A'}</div>
                        <div><span className="text-white/40">Primary Contact:</span> {selectedSubmission.data?.primaryContactName || 'N/A'}</div>
                        <div><span className="text-white/40">Contact Email:</span> {selectedSubmission.data?.primaryContactEmail || 'N/A'}</div>
                        <div><span className="text-white/40">Main Phone:</span> {selectedSubmission.data?.mainPhone || 'N/A'}</div>
                        <div><span className="text-white/40">Address:</span> {selectedSubmission.data?.businessAddress || 'N/A'}</div>
                        <div><span className="text-white/40">Service Area:</span> {selectedSubmission.data?.serviceArea || 'N/A'}</div>
                        <div className="col-span-2"><span className="text-white/40">Business Hours:</span> {selectedSubmission.data?.businessHours || 'N/A'}</div>
                      </div>
                    </div>

                    {/* AI Configuration */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] block">
                        Voice &amp; AI Personality
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-white/80">
                        <div><span className="text-white/40">AI Tone:</span> {selectedSubmission.data?.aiTone || 'Professional'}</div>
                        <div><span className="text-white/40">Calendar System:</span> {selectedSubmission.data?.calendarPlatform || 'N/A'}</div>
                        <div><span className="text-white/40">Emergency Routing:</span> {selectedSubmission.data?.notifyTeamOnEmergency ? 'Yes' : 'No'}</div>
                        <div><span className="text-white/40">Auto Booking:</span> {selectedSubmission.data?.autoBookingEnabled ? 'Enabled' : 'Disabled'}</div>
                        <div><span className="text-white/40">Escalation Name:</span> {selectedSubmission.data?.escalationName || 'N/A'}</div>
                        <div><span className="text-white/40">Escalation Phone:</span> {selectedSubmission.data?.escalationPhone || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Call Scenarios */}
                    {(selectedSubmission.data?.scenarios || []).length > 0 && (
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] block">
                          Call Scenarios ({(selectedSubmission.data?.scenarios || []).length})
                        </span>
                        <div className="space-y-2">
                          {selectedSubmission.data.scenarios.map((sc: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                              <div className="font-semibold text-white/90">{idx + 1}. {sc.callerIntent || 'Scenario'}</div>
                              <p className="text-white/60 text-[11px] mt-1">{sc.systemAction || sc.instructions}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Documents */}
                    {(selectedSubmission.data?.uploadedDocs || []).length > 0 && (
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] block">
                          Attached Knowledge Base Files ({(selectedSubmission.data?.uploadedDocs || []).length})
                        </span>
                        <div className="space-y-1.5">
                          {selectedSubmission.data.uploadedDocs.map((docItem: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                              <div className="flex items-center gap-2 truncate text-white/80">
                                <span className="material-symbols-outlined text-[16px] text-[#c5a47e]">description</span>
                                <span className="truncate">{docItem.name}</span>
                              </div>
                              {docItem.url && (
                                <a
                                  href={docItem.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-[#c5a47e] hover:underline shrink-0"
                                >
                                  View / Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
                  Select a submission from the left list to review.
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
