import React from 'react';
import { OnboardingState } from '../../types';

interface Step1Props {
  formData: OnboardingState;
  onChange: (field: keyof OnboardingState, value: any) => void;
  onNext: () => void;
  onSaveProgress: () => void;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({
  formData,
  onChange,
  onNext,
  onSaveProgress,
}) => {
  return (
    <div className="max-w-4xl w-full mx-auto pb-32">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-[#c5a47e]">Phase 01</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-2">
          Basic Business Information
        </h2>
        <p className="text-sm text-white/50 font-light tracking-wide">
          Establish the foundational credentials and operational parameters for your Ring2Rev instance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* General Details */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 md:col-span-2 border-white/5">
          <h3 className="text-lg font-light text-white mb-6 border-b border-white/5 pb-4 tracking-wide">
            General Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="business-name" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                Business Name
              </label>
              <input
                id="business-name"
                type="text"
                value={formData.businessName}
                onChange={(e) => onChange('businessName', e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="main-phone" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                Main Business Phone
              </label>
              <input
                id="main-phone"
                type="tel"
                value={formData.mainPhone}
                onChange={(e) => onChange('mainPhone', e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
              />
            </div>
          </div>
        </section>

        {/* Primary Contact */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 border-white/5">
          <h3 className="text-lg font-light text-white mb-6 border-b border-white/5 pb-4 tracking-wide">
            Primary Contact
          </h3>
          <div className="space-y-5">
            <div>
              <label htmlFor="contact-name" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={formData.primaryContactName}
                onChange={(e) => onChange('primaryContactName', e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                value={formData.primaryContactEmail}
                onChange={(e) => onChange('primaryContactEmail', e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                Direct Phone
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={formData.primaryContactPhone}
                onChange={(e) => onChange('primaryContactPhone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full rounded-xl glass-input p-3.5 text-white text-sm"
              />
            </div>
          </div>
        </section>

        {/* Operations */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col justify-between border-white/5">
          <div>
            <h3 className="text-lg font-light text-white mb-6 border-b border-white/5 pb-4 tracking-wide">
              Operations
            </h3>
            <div className="space-y-5">
              <div>
                <label htmlFor="service-area" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                  Service Area (Zip Codes / Radius)
                </label>
                <textarea
                  id="service-area"
                  rows={3}
                  value={formData.serviceArea}
                  onChange={(e) => onChange('serviceArea', e.target.value)}
                  placeholder="e.g., 90210, 50-mile radius from HQ"
                  className="w-full rounded-xl glass-input p-3.5 text-white text-sm resize-none"
                />
              </div>
              <div>
                <label htmlFor="business-hours" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a47e] mb-2">
                  Business Hours (Regular &amp; Emergency)
                </label>
                <textarea
                  id="business-hours"
                  rows={3}
                  value={formData.businessHours}
                  onChange={(e) => onChange('businessHours', e.target.value)}
                  placeholder="Mon-Fri: 9am-5pm. Emergency: 24/7"
                  className="w-full rounded-xl glass-input p-3.5 text-white text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Actions */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
        <button
          id="step1-save-btn"
          type="button"
          onClick={onSaveProgress}
          className="btn-secondary w-full sm:w-auto px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold"
        >
          Save Progress
        </button>
        <button
          id="step1-next-btn"
          type="button"
          onClick={onNext}
          className="btn-gold w-full sm:w-auto px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2"
        >
          Next Step
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
