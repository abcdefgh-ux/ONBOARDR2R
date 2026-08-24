export interface Scenario {
  id: string;
  name: string;
  description: string;
  responseProtocol: string;
  isCustom?: boolean;
}

export interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface OnboardingState {
  // Step 1: Basic Business Info
  businessName: string;
  mainPhone: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  serviceArea: string;
  businessHours: string;

  // Step 2: Conversational AI
  retellEmail: string;
  paymentNote: string;
  aiTone: 'Friendly' | 'Professional' | 'Warm' | 'Direct';
  alwaysSay: string;
  neverSay: string;
  websiteUrl: string;
  uploadedDocs: UploadedDoc[];
  scenarios: Scenario[];
  escalationName: string;
  escalationPhone: string;
  slackWebhook: string;

  // Step 3: Integration
  n8nEmail: string;
  paymentSetupConfirmed: boolean;
  crmSetupConfirmed: boolean;

  // Step 4: Automation
  autoHandoffThreshold: string;
  notifyTeamOnEmergency: boolean;
  smsFollowupEnabled: boolean;
  autoBookingEnabled: boolean;
  customAutomationNotes: string;

  // Metadata
  currentStep: number; // 1 to 5
  completedSteps: number[]; // e.g. [1, 2]
  isSubmitted: boolean;
  lastSavedAt: string | null;
}
