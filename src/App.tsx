import React, { useState, useEffect } from 'react';
import { OnboardingState } from './types';
import { INITIAL_STATE } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Step1BasicInfo } from './components/steps/Step1BasicInfo';
import { Step2ConversationalAI } from './components/steps/Step2ConversationalAI';
import { Step3Integration } from './components/steps/Step3Integration';
import { Step4Automation } from './components/steps/Step4Automation';
import { Step5Expectations } from './components/steps/Step5Expectations';
import { HelpModal } from './components/HelpModal';
import { SaveExitModal } from './components/SaveExitModal';
import { FinishSuccessModal } from './components/FinishSuccessModal';

const STORAGE_KEY = 'ring2rev_onboarding_state';

export default function App() {
  const [formData, setFormData] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATE;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSaveExitOpen, setIsSaveExitOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Ignore
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleFieldChange = (field: keyof OnboardingState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const markStepCompleteAndGo = (nextStep: number) => {
    setFormData((prev) => {
      const completed = new Set(prev.completedSteps);
      completed.add(prev.currentStep);
      return {
        ...prev,
        completedSteps: Array.from(completed),
        currentStep: nextStep,
        lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (formData.currentStep < 5) {
      markStepCompleteAndGo(formData.currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (formData.currentStep > 1) {
      setFormData((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectStep = (step: number) => {
    setFormData((prev) => ({
      ...prev,
      currentStep: step,
    }));
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProgress = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setFormData((prev) => ({
      ...prev,
      lastSavedAt: timeStr,
    }));
    showToast('Progress saved successfully');
  };

  const handleFinish = () => {
    setFormData((prev) => ({
      ...prev,
      completedSteps: [1, 2, 3, 4, 5],
      isSubmitted: true,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setIsFinishModalOpen(true);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(INITIAL_STATE);
    setIsSaveExitOpen(false);
    showToast('Form reset to initial state');
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-[#e5e5e5] relative selection:bg-[#c5a47e]/30 selection:text-[#d5b48e] font-sans">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#141414] via-[#050505] to-[#050505]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#c5a47e]/4 via-transparent to-transparent opacity-50 blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar
        currentStep={formData.currentStep}
        completedSteps={formData.completedSteps}
        onSelectStep={handleSelectStep}
        onSaveAndExit={() => setIsSaveExitOpen(true)}
      />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-[#0a0a0a] p-6 flex flex-col h-full z-10 border-r border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-[#e5e5e5]">Ring2Rev Portal</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/40 hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="space-y-2 flex-1">
              {[
                { step: 1, label: 'Basic Business Info', icon: 'info' },
                { step: 2, label: 'Conversational AI', icon: 'smart_toy' },
                { step: 3, label: 'Integration', icon: 'hub' },
                { step: 4, label: 'Automation', icon: 'settings_suggest' },
                { step: 5, label: 'Expectations', icon: 'auto_awesome' },
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => handleSelectStep(item.step)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-colors ${
                    formData.currentStep === item.step
                      ? 'bg-[#c5a47e] text-black shadow-lg shadow-[#c5a47e]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 md:ml-80 min-h-screen flex flex-col relative z-10">
        <Header
          currentStep={formData.currentStep}
          onSaveProgress={handleSaveProgress}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          lastSavedAt={formData.lastSavedAt}
        />

        <main className="flex-1 p-4 md:p-10 lg:p-12 w-full">
          {formData.currentStep === 1 && (
            <Step1BasicInfo
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
              onSaveProgress={handleSaveProgress}
            />
          )}

          {formData.currentStep === 2 && (
            <Step2ConversationalAI
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
              onBack={handleBack}
              onSaveProgress={handleSaveProgress}
            />
          )}

          {formData.currentStep === 3 && (
            <Step3Integration
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
              onBack={handleBack}
              onSaveProgress={handleSaveProgress}
            />
          )}

          {formData.currentStep === 4 && (
            <Step4Automation
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
              onBack={handleBack}
              onSaveProgress={handleSaveProgress}
            />
          )}

          {formData.currentStep === 5 && (
            <Step5Expectations
              formData={formData}
              onBack={handleBack}
              onFinish={handleFinish}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#0e0e0e] border border-[#c5a47e]/40 text-[#e5e5e5] shadow-2xl shadow-black/90 animate-fade-in text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[#c5a47e] text-[18px]">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SaveExitModal
        isOpen={isSaveExitOpen}
        onClose={() => setIsSaveExitOpen(false)}
        formData={formData}
        onReset={handleReset}
      />
      <FinishSuccessModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        formData={formData}
        onRestart={() => {
          setIsFinishModalOpen(false);
          handleSelectStep(1);
        }}
      />
    </div>
  );
}
