import React, { useState, useEffect } from 'react';
import { OnboardingState, SubmissionResult } from './types';
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
import { SubmissionsModal } from './components/SubmissionsModal';
import { uploadOnboardingPdfToDrive, initAuth } from './services/googleDrive';

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
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }, 3500);
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
    showToast('Progress cached locally');
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    const subId = `R2R-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const subDate = new Date().toISOString();

    let subResult: SubmissionResult | undefined;

    // Check for saved Google Sheets Webhook URL
    const sheetsWebhookUrl = formData.slackWebhook || localStorage.getItem('ring2rev_sheets_webhook_url');

    try {
      // 1. Dispatch payload to backend server
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slackWebhook: sheetsWebhookUrl || formData.slackWebhook,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          subResult = {
            submissionId: data.submissionId || subId,
            submittedAt: data.submittedAt || subDate,
            recipientEmails: data.recipientEmails || [formData.primaryContactEmail].filter(Boolean),
            webhookSent: data.webhookSent || false,
            summaryText: data.summaryText,
          };
          showToast('✓ Onboarding submission saved to records');
        }
      }
    } catch (err) {
      console.warn('Submission network note:', err);
    }

    // 2. Direct browser webhook push to Google Sheets (no-cors mode guarantees bypass of CORS/proxy blocks)
    if (sheetsWebhookUrl && sheetsWebhookUrl.startsWith('http')) {
      try {
        const scenariosSummary = (formData.scenarios || [])
          .map((s) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
          .join(' | ');

        const sheetPayload = {
          submissionId: subResult?.submissionId || subId,
          timestamp: subResult?.submittedAt || subDate,
          businessName: formData.businessName || '',
          primaryContactName: formData.primaryContactName || '',
          primaryContactEmail: formData.primaryContactEmail || '',
          mainPhone: formData.mainPhone || '',
          businessAddress: formData.businessAddress || '',
          serviceArea: formData.serviceArea || '',
          businessHours: formData.businessHours || '',
          aiTone: formData.aiTone || 'Professional',
          retellEmail: formData.retellEmail || '',
          n8nEmail: formData.n8nEmail || '',
          escalationName: formData.escalationName || '',
          escalationPhone: formData.escalationPhone || '',
          notifyEmergency: formData.notifyTeamOnEmergency ? 'YES' : 'NO',
          smsFollowup: formData.smsFollowupEnabled ? 'YES' : 'NO',
          autoBooking: formData.autoBookingEnabled ? 'YES' : 'NO',
          customNotes: formData.customAutomationNotes || '',
          scenariosCount: (formData.scenarios || []).length,
          scenariosSummary,
          summaryText: subResult?.summaryText || `Ring2Rev Onboarding - ${formData.businessName || 'Submission'}`,
        };

        fetch(sheetsWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(sheetPayload),
        }).catch(() => {});
      } catch (clientPushErr) {
        console.warn('Client push note:', clientPushErr);
      }
    }

    const finalSubId = subResult?.submissionId || subId;
    const finalSubDate = subResult?.submittedAt || subDate;

    const summaryText =
      subResult?.summaryText ||
      `=====================================================
RING2REV ONBOARDING SUBMISSION RECORD
Submission ID: ${finalSubId}
Submitted At: ${finalSubDate}
=====================================================

1. BUSINESS INFORMATION
- Company Name: ${formData.businessName || 'Not specified'}
- Main Phone: ${formData.mainPhone || 'Not specified'}
- Primary Contact: ${formData.primaryContactName || 'Not specified'}
- Primary Email: ${formData.primaryContactEmail || 'Not specified'}
- Primary Contact Phone: ${formData.primaryContactPhone || 'Not specified'}
- Service Territory: ${formData.serviceArea || 'Not specified'}
- Operating Hours: ${formData.businessHours || 'Not specified'}

2. CONVERSATIONAL AI ENGINE
- Vocal Tone & Cadence: ${formData.aiTone || 'Professional'}
- Retell AI Email: ${formData.retellEmail || 'Not specified'}
- Mandatory Phrases: ${formData.alwaysSay || 'None'}
- Restricted Phrases: ${formData.neverSay || 'None'}
- Knowledge Website: ${formData.websiteUrl || 'None'}
- Knowledge Documents: ${(formData.uploadedDocs || []).length} uploaded
- Configured Scenarios (${(formData.scenarios || []).length}):
${(formData.scenarios || []).map((s, i) => `  ${i + 1}. [${s.name}]: ${s.description} -> ${s.responseProtocol}`).join('\n') || '  None'}
- Escalation: ${formData.escalationName || 'None'} (${formData.escalationPhone || 'None'})

3. INTEGRATION & WORKFLOWS
- N8N Email: ${formData.n8nEmail || 'Not specified'}

4. AUTONOMOUS RULES & SAFETY
- Emergency Alerts: ${formData.notifyTeamOnEmergency ? 'Yes' : 'No'}
- SMS Follow-up: ${formData.smsFollowupEnabled ? 'Yes' : 'No'}
- Auto Booking: ${formData.autoBookingEnabled ? 'Yes' : 'No'}
- Directives: ${formData.customAutomationNotes || 'None'}`;

    const submissionItem = {
      id: finalSubId,
      submittedAt: finalSubDate,
      recipientEmails: subResult?.recipientEmails || [formData.primaryContactEmail].filter(Boolean) as string[],
      data: { ...formData },
      webhookSent: subResult?.webhookSent || false,
      summaryText,
    };

    // Store in browser local storage archive for instant client redundancy
    try {
      const existingRaw = localStorage.getItem('ring2rev_submissions_history');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [submissionItem, ...existingList.filter((item: any) => item.id !== finalSubId)];
      localStorage.setItem('ring2rev_submissions_history', JSON.stringify(updatedList));
    } catch (storageErr) {
      console.warn('LocalStorage error:', storageErr);
    }

    setFormData((prev) => ({
      ...prev,
      completedSteps: [1, 2, 3, 4, 5],
      isSubmitted: true,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      submissionResult: {
        submissionId: finalSubId,
        submittedAt: finalSubDate,
        recipientEmails: submissionItem.recipientEmails,
        webhookSent: submissionItem.webhookSent,
        summaryText,
      },
    }));

    // 3. Automatic silent background archive to connected Google Drive
    uploadOnboardingPdfToDrive({
      formData: { ...formData },
      submissionId: finalSubId,
      submittedAt: finalSubDate,
    }).catch((driveErr) => {
      console.warn('Background Drive archive note:', driveErr);
    });

    setIsSubmitting(false);
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
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSubmissions={() => setIsSubmissionsOpen(true)}
        />

        <main className="flex-1 p-4 md:p-10 lg:p-12 w-full">
          {formData.currentStep === 1 && (
            <Step1BasicInfo
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
            />
          )}

          {formData.currentStep === 2 && (
            <Step2ConversationalAI
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {formData.currentStep === 3 && (
            <Step3Integration
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {formData.currentStep === 4 && (
            <Step4Automation
              formData={formData}
              onChange={handleFieldChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {formData.currentStep === 5 && (
            <Step5Expectations
              formData={formData}
              onChange={handleFieldChange}
              onBack={handleBack}
              onFinish={handleFinish}
              isSubmitting={isSubmitting}
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
        onOpenSubmissions={() => setIsSubmissionsOpen(true)}
      />
      <SubmissionsModal
        isOpen={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
      />
    </div>
  );
}
