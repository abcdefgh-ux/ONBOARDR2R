import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 md:p-8 bg-[#0a0a0a] shadow-2xl border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#c5a47e] border border-white/5">
              <span className="material-symbols-outlined text-[18px]">help</span>
            </div>
            <div>
              <h3 className="text-base font-light text-white tracking-wide">Concierge &amp; Architecture Support</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.15em]">Technical Guidance &amp; Live SLA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3 mb-6 text-sm">
          <div className="p-4 rounded-xl bg-[#050505] border border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a47e] mb-1">
              Retell AI &amp; N8N Orchestration
            </h4>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Retell AI handles ultra-low latency voice synthesis and natural phone conversations, while N8N executes automated bidirectional syncing between calls, your CRM, and real-time scheduling databases.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a47e] mb-1">
              Zero-Trust Credential Security
            </h4>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              We do not capture secret API keys or payment tokens inside web forms. Secure authorizations occur during your live 1-on-1 encrypted video session.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a47e] mb-1">
              Dedicated Engineering Lead
            </h4>
            <p className="text-xs text-white/50 font-light">
              Need immediate architectural clarification? Contact Shayan at{' '}
              <a
                href="mailto:shayan@yaanandco.com"
                className="text-[#c5a47e] underline hover:text-white"
              >
                shayan@yaanandco.com
              </a>
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-gold px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
