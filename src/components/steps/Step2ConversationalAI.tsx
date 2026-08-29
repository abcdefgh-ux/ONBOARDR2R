import React, { useState } from 'react';
import { OnboardingState, Scenario, UploadedDoc } from '../../types';
import { ScenarioModal } from '../ScenarioModal';

interface Step2Props {
  formData: OnboardingState;
  onChange: (field: keyof OnboardingState, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveProgress: () => void;
}

export const Step2ConversationalAI: React.FC<Step2Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveProgress,
}) => {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const tones: Array<'Friendly' | 'Professional' | 'Warm' | 'Direct'> = [
    'Friendly',
    'Professional',
    'Warm',
    'Direct',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files) as File[];
    const newFiles: UploadedDoc[] = fileList.map((f: File) => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'document',
      uploadedAt: new Date(),
    }));
    onChange('uploadedDocs', [...formData.uploadedDocs, ...newFiles]);
  };

  const removeDoc = (id: string) => {
    onChange(
      'uploadedDocs',
      formData.uploadedDocs.filter((d) => d.id !== id)
    );
  };

  const handleSaveScenario = (updated: Scenario) => {
    const exists = formData.scenarios.some((s) => s.id === updated.id);
    if (exists) {
      onChange(
        'scenarios',
        formData.scenarios.map((s) => (s.id === updated.id ? updated : s))
      );
    } else {
      onChange('scenarios', [...formData.scenarios, updated]);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto pb-32">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 02</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-2">
          Conversational AI Engine
        </h2>
        <p className="text-sm text-white/50 font-light tracking-wide">
          Configure the vocal characteristics, contextual knowledge, behavioral boundaries, and escalation protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Setup (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Account Basics */}
          <section className="glass-panel rounded-2xl p-6 md:p-7 border-white/5">
            <h3 className="text-base font-light text-white mb-5 flex items-center gap-2.5 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">manage_accounts</span>
              Account Basics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                  Retell AI Email
                </label>
                <input
                  type="email"
                  value={formData.retellEmail}
                  onChange={(e) => onChange('retellEmail', e.target.value)}
                  placeholder="email@company.com"
                  className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                  Secure Call Payment Note
                </label>
                <input
                  type="text"
                  value={formData.paymentNote}
                  onChange={(e) => onChange('paymentNote', e.target.value)}
                  placeholder="e.g. Requires authorization"
                  className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
                />
              </div>
            </div>
          </section>

          {/* Voice & Rules */}
          <section className="glass-panel rounded-2xl p-6 md:p-7 border-white/5">
            <h3 className="text-base font-light text-white mb-5 flex items-center gap-2.5 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">record_voice_over</span>
              Voice Persona &amp; Rules
            </h3>
            <div className="mb-6">
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-3">
                AI Tone &amp; Cadence
              </label>
              <div className="flex flex-wrap gap-3">
                {tones.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => onChange('aiTone', tone)}
                    className={`px-5 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                      formData.aiTone === tone
                        ? 'bg-[#c5a47e] text-black border-[#c5a47e] shadow-[0_0_14px_rgba(197,164,126,0.35)]'
                        : 'border-white/10 text-white/50 hover:border-[#c5a47e]/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#c5a47e]">check</span>
                  Mandatory Phrases (Always Say)
                </label>
                <textarea
                  rows={3}
                  value={formData.alwaysSay}
                  onChange={(e) => onChange('alwaysSay', e.target.value)}
                  placeholder="Phrases the AI must use..."
                  className="w-full rounded-xl glass-input p-3.5 text-white text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-red-400">close</span>
                  Restricted Phrases (Never Say)
                </label>
                <textarea
                  rows={3}
                  value={formData.neverSay}
                  onChange={(e) => onChange('neverSay', e.target.value)}
                  placeholder="Phrases the AI must avoid..."
                  className="w-full rounded-xl glass-input p-3.5 text-white text-sm resize-none"
                />
              </div>
            </div>
          </section>

          {/* Knowledge Base */}
          <section className="glass-panel rounded-2xl p-6 md:p-7 border-white/5">
            <h3 className="text-base font-light text-white mb-5 flex items-center gap-2.5 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">library_books</span>
              Knowledge Base
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                  Website URL (Domain to Crawl)
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => onChange('websiteUrl', e.target.value)}
                  placeholder="https://www.yourcompany.com"
                  className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
                />
              </div>
              <div className="pt-2">
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                  Upload Documentation (PDF, Audio, FAQ)
                </label>
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) {
                      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
                      const newDocs: UploadedDoc[] = droppedFiles.map((f: File) => ({
                        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                        name: f.name,
                        size: f.size,
                        type: f.type || 'file',
                        uploadedAt: new Date(),
                      }));
                      onChange('uploadedDocs', [...formData.uploadedDocs, ...newDocs]);
                    }
                  }}
                  className={`border border-dashed rounded-xl p-7 text-center transition-all cursor-pointer bg-[#080808]/60 flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-[#c5a47e] bg-[#c5a47e]/5'
                      : 'border-white/10 hover:border-[#c5a47e]/40'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx,.mp3,.wav"
                  />
                  <span className="material-symbols-outlined text-3xl text-[#c5a47e] mb-2">
                    upload_file
                  </span>
                  <p className="text-sm text-white font-medium">Drag and drop knowledge assets here</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
                    or click to browse local files
                  </p>
                </label>

                {/* Uploaded files preview list */}
                {formData.uploadedDocs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.uploadedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0a0a] border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="material-symbols-outlined text-[#c5a47e] text-[18px]">
                            description
                          </span>
                          <span className="truncate text-white font-medium">{doc.name}</span>
                          <span className="text-white/40">
                            ({(doc.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(doc.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Scenarios & Escalation (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Scenarios */}
          <section className="glass-panel rounded-2xl p-6 border-white/5">
            <h3 className="text-base font-light text-white mb-2 flex items-center gap-2.5 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">alt_route</span>
              Scenarios
            </h3>
            <p className="text-xs text-white/50 mb-4 font-light">
              Define specialized behavioral branches and logic flows.
            </p>
            <div className="space-y-2.5">
              {formData.scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-[#0a0a0a] p-3.5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-[#c5a47e]/40 transition-colors"
                >
                  <div className="pr-2">
                    <span className="text-xs text-white font-medium block">
                      {scenario.name}
                    </span>
                    {scenario.description && (
                      <span className="text-[10px] text-white/40 line-clamp-1">
                        {scenario.description}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScenario(scenario);
                      setIsScenarioModalOpen(true);
                    }}
                    className="text-white/40 group-hover:text-[#c5a47e] p-1 rounded hover:bg-white/5"
                    title="Edit Scenario"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setActiveScenario(null);
                  setIsScenarioModalOpen(true);
                }}
                className="w-full py-2.5 mt-2 border border-dashed border-white/10 rounded-xl text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#c5a47e] hover:border-[#c5a47e] transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Custom Scenario
              </button>
            </div>
          </section>

          {/* Escalation */}
          <section className="glass-panel rounded-2xl p-6 border-white/5">
            <h3 className="text-base font-light text-white mb-5 flex items-center gap-2.5 tracking-wide">
              <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">support_agent</span>
              Escalation Protocol
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-1.5">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.escalationName}
                  onChange={(e) => onChange('escalationName', e.target.value)}
                  placeholder="Manager / On-call Lead"
                  className="w-full rounded-xl glass-input p-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.escalationPhone}
                  onChange={(e) => onChange('escalationPhone', e.target.value)}
                  placeholder="(555) 987-6543"
                  className="w-full rounded-xl glass-input p-3 text-xs"
                />
              </div>
              <div className="pt-2 border-t border-white/5">
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-1.5 mt-2">
                  Slack/Chat Webhook
                </label>
                <input
                  type="text"
                  value={formData.slackWebhook}
                  onChange={(e) => onChange('slackWebhook', e.target.value)}
                  placeholder="https://hooks.slack.com/..."
                  className="w-full rounded-xl glass-input p-3 font-mono text-[11px]"
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/5">
        <button
          id="step2-back-btn"
          type="button"
          onClick={onBack}
          className="btn-secondary px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back
        </button>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Auto-saved
          </div>
          <button
            id="step2-next-btn"
            type="button"
            onClick={onNext}
            className="btn-gold px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/40"
          >
            Next Step
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        scenario={activeScenario}
        onClose={() => setIsScenarioModalOpen(false)}
        onSave={handleSaveScenario}
      />
    </div>
  );
};
