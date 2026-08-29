import React from 'react';
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
}) => {
  if (!isOpen) return null;

  const subResult = formData.submissionResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 bg-[#0a0a0a] shadow-2xl border border-[#c5a47e]/30 text-center relative overflow-hidden">
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
          Your onboarding details for{' '}
          <strong className="text-[#c5a47e] font-medium">{formData.businessName || 'your business'}</strong> have been received.
        </p>

        {/* Submission reference */}
        {subResult?.submissionId && (
          <div className="bg-[#050505] border border-white/10 rounded-2xl p-3.5 mb-5 text-left flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">Submission Reference</span>
              <span className="text-sm font-mono text-white font-medium">{subResult.submissionId}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded-lg border border-emerald-500/20">
              ✓ Logged
            </span>
          </div>
        )}

        {/* Details Summary */}
        <div className="text-left bg-[#050505] border border-white/5 rounded-2xl p-4 mb-6 text-xs space-y-2 font-light">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Business:</span>
            <span className="text-white font-medium">{formData.businessName || 'Provided'}</span>
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
            className="btn-gold flex-1 py-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
