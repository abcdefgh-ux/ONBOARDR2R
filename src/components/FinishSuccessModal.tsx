import React, { useState } from 'react';
import { OnboardingState } from '../types';
import { downloadOnboardingPDF } from '../utils/pdfGenerator';

interface FinishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: OnboardingState;
  onRestart: () => void;
}

export const FinishSuccessModal: React.FC<FinishSuccessModalProps> = ({
  isOpen,
  formData,
  onRestart,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const subResult = formData.submissionResult;

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
        {/* Ambient glow */}
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
          <strong className="text-[#c5a47e] font-medium">{formData.businessName || 'your business'}</strong> have been securely delivered to the team.
        </p>

        {/* Submission reference badge */}
        {subResult?.submissionId && (
          <div className="bg-[#050505] border border-white/10 rounded-2xl p-3.5 mb-5 text-left flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">Submission Reference</span>
              <span className="text-sm font-mono text-[#c5a47e] font-medium">{subResult.submissionId}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded-lg border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Delivered
            </span>
          </div>
        )}

        {/* Single Prominent Download PDF Action */}
        <div className="bg-gradient-to-r from-[#12100e] via-[#1a1714] to-[#12100e] border border-[#c5a47e]/40 rounded-2xl p-4 mb-5 text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a47e]/15 border border-[#c5a47e]/30 flex items-center justify-center text-[#c5a47e] shrink-0">
              <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wide">
                Onboarding PDF Copy
              </h4>
              <p className="text-[11px] text-white/50 font-light mt-0.5">
                Download a clean copy of your responses &amp; specs
              </p>
            </div>
          </div>

          <button
            type="button"
            id="download-summary-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full sm:w-auto btn-gold px-5 py-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.15em] flex items-center justify-center gap-2 shrink-0 shadow-md"
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
          {(formData.uploadedDocs || []).length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Files:</span>
              <span className="text-emerald-400 font-medium">{(formData.uploadedDocs || []).length} Uploaded to Drive</span>
            </div>
          )}
        </div>

        {/* Restart Action */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="btn-secondary w-full py-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Start New Submission
          </button>
        </div>
      </div>
    </div>
  );
};
