import React, { useState, useEffect } from 'react';
import { Scenario } from '../types';

interface ScenarioModalProps {
  isOpen: boolean;
  scenario: Scenario | null;
  onClose: () => void;
  onSave: (scenario: Scenario) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  scenario,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [responseProtocol, setResponseProtocol] = useState('');

  useEffect(() => {
    if (scenario) {
      setName(scenario.name);
      setDescription(scenario.description);
      setResponseProtocol(scenario.responseProtocol);
    } else {
      setName('');
      setDescription('');
      setResponseProtocol('');
    }
  }, [scenario, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: scenario?.id || `scenario_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      responseProtocol: responseProtocol.trim(),
      isCustom: scenario?.isCustom ?? true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 md:p-8 bg-[#0a0a0a] shadow-2xl border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-light text-white flex items-center gap-2 tracking-wide">
            <span className="material-symbols-outlined text-[#c5a47e] text-[20px]">tune</span>
            {scenario ? 'Configure Scenario Branch' : 'Create Custom Scenario'}
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-1.5">
              Scenario Identifier / Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VIP Customer Inbound"
              className="w-full rounded-xl glass-input p-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-1.5">
              Activation Condition / Trigger
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe caller utterances or detected caller criteria..."
              className="w-full rounded-xl glass-input p-3 text-sm text-white resize-none font-light"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-1.5">
              Execution Protocol / Script Directives
            </label>
            <textarea
              rows={3}
              value={responseProtocol}
              onChange={(e) => setResponseProtocol(e.target.value)}
              placeholder="Vocal phrasing, tagging metadata, or transfer webhook parameters..."
              className="w-full rounded-xl glass-input p-3 text-sm text-white resize-none font-light"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold px-6 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em]"
            >
              Save Scenario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
