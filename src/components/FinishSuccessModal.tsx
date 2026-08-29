import React, { useState, useEffect } from 'react';
import { OnboardingState } from '../types';
import { downloadOnboardingPDF } from '../utils/pdfGenerator';
import {
  uploadOnboardingPdfToDrive,
  getCachedDriveToken,
  DriveUploadResult,
} from '../services/googleDrive';

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
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Google Drive state
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveResult, setDriveResult] = useState<DriveUploadResult | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  const subResult = formData.submissionResult;

  // Attempt auto-upload on open if user already has an active drive token
  useEffect(() => {
    if (isOpen) {
      const activeToken = getCachedDriveToken();
      if (activeToken && !driveResult && !isUploadingToDrive) {
        handleUploadToGoogleDrive(activeToken);
      }
    }
  }, [isOpen]);

  const handleUploadToGoogleDrive = async (overrideToken?: string) => {
    setIsUploadingToDrive(true);
    setDriveError(null);

    try {
      const result = await uploadOnboardingPdfToDrive({
        formData,
        submissionId: subResult?.submissionId,
        submittedAt: subResult?.submittedAt,
        customToken: overrideToken,
      });

      if (result.success) {
        setDriveResult(result);
      } else {
        setDriveError(result.error || 'Failed to upload to Google Drive.');
      }
    } catch (err: any) {
      setDriveError(err.message || 'Google Drive connection error.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      downloadOnboardingPDF({
        formData,
        submissionId: subResult?.submissionId,
        submittedAt: subResult?.submittedAt,
      });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#0a0a0a] shadow-2xl border border-[#c5a47e]/30 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#c5a47e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-[#c5a47e]/40 flex items-center justify-center text-[#c5a47e] mx-auto mb-4 shadow-xl shadow-black/60">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">
            Onboarding Completed
          </span>
        </div>

        <h3 className="text-2xl font-light text-white mb-2 tracking-tight">
          Form Submitted Successfully
        </h3>

        <p className="text-xs text-white/50 leading-relaxed mb-5 font-light">
          Your onboarding specifications for{' '}
          <strong className="text-[#c5a47e] font-medium">{formData.businessName || 'your business'}</strong> have been securely recorded and queued for deployment.
        </p>

        {/* Submission reference */}
        {subResult?.submissionId && (
          <div className="bg-[#050505] border border-white/10 rounded-2xl p-3.5 mb-4 text-left flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">Submission Reference</span>
              <span className="text-sm font-mono text-[#c5a47e] font-medium">{subResult.submissionId}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded-lg border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Logged &amp; Synced
            </span>
          </div>
        )}

        {/* Google Drive Automatic Upload Card */}
        <div className="bg-[#090b0c] border border-white/10 rounded-2xl p-4 mb-3 text-left shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <span className="material-symbols-outlined text-[18px]">add_to_drive</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wide">
                  Google Drive Auto-Archive
                </h4>
                <p className="text-[10px] text-white/40">
                  Folder: <span className="text-white/70 font-mono">{driveResult?.folderName || 'Ring2Rev Onboarding Records'}</span>
                </p>
              </div>
            </div>

            {driveResult?.success && (
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-mono rounded-md border border-emerald-500/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">check</span>
                Synced to Drive
              </span>
            )}
          </div>

          {driveResult?.success ? (
            <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-2">
              <div className="text-[11px] text-emerald-300/90 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[14px]">task</span>
                  <span className="truncate">
                    PDF Record &amp; {driveResult.kbDocsCount || 0} Knowledge Doc(s) uploaded
                  </span>
                </div>
                {driveResult.folderLink && (
                  <a
                    href={driveResult.folderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1 border border-emerald-500/40 transition-all shrink-0"
                  >
                    <span>Open Drive Folder</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-[11px] text-white/50 font-light">
                {isUploadingToDrive
                  ? 'Authorizing and syncing PDF & Knowledge Base docs to your Google Drive...'
                  : driveError
                  ? driveError
                  : 'Automatically syncs PDF summary & all Knowledge Base files to your Drive folder.'}
              </p>

              <button
                type="button"
                id="upload-to-google-drive-btn"
                onClick={() => handleUploadToGoogleDrive()}
                disabled={isUploadingToDrive}
                className="btn-gold px-3.5 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-[0.15em] flex items-center justify-center gap-1.5 shrink-0 shadow-md disabled:opacity-50"
              >
                {isUploadingToDrive ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                    Save to Google Drive
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Local Download PDF Action Card */}
        <div className="bg-gradient-to-r from-[#12100e] via-[#1a1714] to-[#12100e] border border-[#c5a47e]/40 rounded-2xl p-4 mb-4 text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a47e]/15 border border-[#c5a47e]/30 flex items-center justify-center text-[#c5a47e] shrink-0">
              <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wide">
                Download Onboarding PDF Record
              </h4>
              <p className="text-[11px] text-white/50 font-light mt-0.5">
                Formatted copy of all your responses, workflows &amp; roadmap
              </p>
            </div>
          </div>

          <button
            type="button"
            id="download-summary-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full sm:w-auto btn-gold px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.15em] flex items-center justify-center gap-1.5 shrink-0 shadow-md"
          >
            {isGeneratingPdf ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Generating...
              </>
            ) : pdfDownloaded ? (
              <>
                <span className="material-symbols-outlined text-[16px]">check</span>
                Downloaded!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Details Summary */}
        <div className="text-left bg-[#050505] border border-white/5 rounded-2xl p-4 mb-6 text-xs space-y-2 font-light">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Business:</span>
            <span className="text-white font-medium truncate max-w-[200px]">{formData.businessName || 'Provided'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Contact:</span>
            <span className="text-white font-medium">{formData.primaryContactName || 'Provided'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Voice Tone:</span>
            <span className="text-[#c5a47e] font-medium">{formData.aiTone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Scenarios:</span>
            <span className="text-white font-medium">{(formData.scenarios || []).length} Configured</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="btn-secondary flex-1 py-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Review Responses
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 py-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] hover:border-[#c5a47e]/40"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
