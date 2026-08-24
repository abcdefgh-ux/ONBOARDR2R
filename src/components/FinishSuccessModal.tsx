import React from 'react';
import { OnboardingState } from '../types';

interface FinishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: OnboardingState;
  onRestart: () => void;
}

export const FinishSuccessModal: React.FC<FinishSuccessModalProps> = ({
  isOpen,
  onClose,
  formData,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8 md:p-10 bg-[#0a0a0a] shadow-2xl border border-[#c5a47e]/30 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#c5a47e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[#c5a47e]/40 flex items-center justify-center text-[#c5a47e] mx-auto mb-6 shadow-xl shadow-black/60">
          <span className="material-symbols-outlined text-3xl">
            celebration
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Deployment Initialized</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-light text-white mb-2 tracking-tight">
          Specification Finalized
        </h3>

        <p className="text-xs text-white/50 leading-relaxed mb-6 font-light">
          Your Ring2Rev enterprise profile has been registered for{' '}
          <strong className="text-[#c5a47e] font-medium">{formData.businessName || 'your organization'}</strong>.
          Our architecture team is provisioning dedicated execution nodes.
        </p>

        <div className="text-left bg-[#050505] border border-white/5 rounded-2xl p-5 mb-6 text-xs space-y-2.5">
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
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Assigned Architect:</span>
            <span className="text-white font-medium">Shayan (Solutions Lead)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="btn-secondary px-6 py-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Review Specs
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-gold px-8 py-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
