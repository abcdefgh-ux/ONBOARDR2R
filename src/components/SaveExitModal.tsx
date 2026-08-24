import React from 'react';
import { OnboardingState } from '../types';

interface SaveExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: OnboardingState;
  onReset: () => void;
}

export const SaveExitModal: React.FC<SaveExitModalProps> = ({
  isOpen,
  onClose,
  formData,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 md:p-8 bg-[#0a0a0a] shadow-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#c5a47e] border border-white/5">
            <span className="material-symbols-outlined text-[20px]">save</span>
          </div>
          <div>
            <h3 className="text-base font-light text-white tracking-wide">State Synchronized</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.15em]">Phase {formData.currentStep} of 5</p>
          </div>
        </div>

        <p className="text-xs text-white/50 leading-relaxed mb-6 font-light">
          Configuration parameters for <strong className="text-white font-medium">{formData.businessName || 'your enterprise'}</strong> have been securely persisted to local encrypted cache. You can safely return at any point.
        </p>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] uppercase tracking-[0.2em] text-red-400/80 hover:text-red-400 px-3 py-2 text-left sm:text-center transition-colors"
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-gold px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            Resume Session
          </button>
        </div>
      </div>
    </div>
  );
};
