import { OnboardingState, Scenario } from '../types';

export const INITIAL_SCENARIOS: Scenario[] = [
  {
    id: 'emergency',
    name: 'Emergency Call',
    description: 'Urgent requests such as severe heating/cooling failure or water leak.',
    responseProtocol: 'Immediate escalation: transfer call directly to on-call dispatcher after gathering caller address.',
  },
  {
    id: 'human_request',
    name: 'Human Request',
    description: 'Caller explicitly asks to speak with a human agent or manager.',
    responseProtocol: 'Politely acknowledge, collect caller name & phone, then initiate smooth transfer to the front desk.',
  },
  {
    id: 'out_of_area',
    name: 'Out of Area',
    description: 'Customer location falls outside specified zip code service radius.',
    responseProtocol: 'Inform caller of radius politely, recommend partner network if available, and offer to record details for special review.',
  },
  {
    id: 'silent_caller',
    name: 'Silent Caller',
    description: 'No audio detected from caller after greeting or during pause.',
    responseProtocol: 'Prompt caller twice with gentle check-in ("Hello, are you still there?"), if silence continues, offer to text them and terminate politely.',
  },
];

export const INITIAL_STATE: OnboardingState = {
  businessName: '',
  mainPhone: '',
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactPhone: '',
  serviceArea: '',
  businessHours: '',

  retellEmail: '',
  paymentNote: '',
  aiTone: 'Friendly',
  alwaysSay: '',
  neverSay: '',
  websiteUrl: '',
  uploadedDocs: [],
  scenarios: INITIAL_SCENARIOS,
  escalationName: '',
  escalationPhone: '',
  slackWebhook: '',

  n8nEmail: '',
  calendarPlatform: 'Google Calendar',
  calendarCustomName: '',
  paymentSetupConfirmed: false,
  crmSetupConfirmed: false,

  autoHandoffThreshold: 'instant',
  notifyTeamOnEmergency: true,
  smsFollowupEnabled: true,
  autoBookingEnabled: true,
  customAutomationNotes: '',

  adminCopyEmail: 'shayanalizafar@yahoo.com',
  additionalCopyEmails: '',

  currentStep: 1,
  completedSteps: [],
  isSubmitted: false,
  lastSavedAt: null,
};

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuArTak1v2uLPb9dj_jUI_VZIPw-_nE2g8nmf4SgQKCvH1I8AQw6Pg4OiS9yvkqhIdotkJaNRJ7JpZUsI9GH1Tfc6rSzUXItmV_Rrb8grdytA4v_tK7R9cDGgobQlT3Ekc8uSrbyde1nSvsNRLEiLNhChx47vXqfcmBhi-VwZPCGG--8oRnXiDDSjXxIQD1W96k3o-dH-n30IEWk5-RlrRYbaFh6wBTszw0uO5-F7BHg-fGRKgbK6vsuv0QX_uXkUav1qg';

export const CLIPBOARD_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnYz8pxoD8_eMdTkSLOScUvN-DHoSpD175CtlMUCvCZLpldaircJ3_8yoVtz19F8VmrA6xZHod718MTlOpwuKjwhyJAz8D7BG6JwDfGfcr6jCFMmmm9puQGsQbmhofbv4WGo_jrVPWe1syi0kGsAkb2_BI4IxyJU4L-j5ie7tSvnUNCDQX5rVBc9kcI6XyFn6qhg7oHda90JunvGQUPlbdvxhq3jh2DOk813HjOfhID-BaGsX6Z_0L';

export const GUIDE_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdqKdVHSFt8ZqE_ryZhhnmqKLiIGJKIfiBEOxOFfv4xN4VPMpwTwWvSoZOs-WfVloJo8Vgp1vmeu11u_g-K5kRtasF2QrUltYtQ_Mcg61mp9hkAzSlGJL-OoENpnzbkTQl9xa7GvffVdgYK6YQkCMvwWXaYDwsarEJ6IenITvJG1Kne88D1Jfz99JlIc6LjW3abBsmfYhLaQM8u2uCzeOF6bzHxP8VsEB6WtGgRx0UC54_nh0R5T6r';

export const STEP_CONFIG = [
  { step: 1, id: 'basic_info', label: 'Basic Business Info', icon: 'info' },
  { step: 2, id: 'conversational_ai', label: 'Conversational AI', icon: 'smart_toy' },
  { step: 3, id: 'integration', label: 'Integration', icon: 'hub' },
  { step: 4, id: 'automation', label: 'Automation', icon: 'settings_suggest' },
  { step: 5, id: 'expectations', label: 'Expectations', icon: 'auto_awesome' },
];

export const BUILD_TIMELINE = [
  {
    days: 'Days 1 - 7',
    title: 'Infrastructure',
    description: 'We set up the main system, link your phone numbers, and connect your software.',
    highlight: false,
    dotColor: 'border-[#e9c349] shadow-[0_0_8px_rgba(233,195,73,0.4)]',
  },
  {
    days: 'Day 7',
    title: 'Stress Test & Approval Call',
    description: 'We will call you to show you the basic setup and make sure you like it.',
    highlight: true,
    dotColor: 'border-[#8f9194]',
  },
  {
    days: 'Days 8 - 10',
    title: 'Intelligence',
    description: 'We teach the AI your business rules and how to talk to your customers.',
    highlight: false,
    dotColor: 'border-[#8f9194]',
  },
  {
    days: 'Days 10 - 13',
    title: 'Automations',
    description: 'We build the tasks that happen after a call, like booking or sending texts.',
    highlight: false,
    dotColor: 'border-[#8f9194]',
  },
  {
    days: 'Day 13',
    title: 'Final Test & Approval',
    description: 'One last check to ensure everything works perfectly before we turn it on.',
    highlight: true,
    dotColor: 'border-[#8f9194]',
  },
  {
    days: 'Day 15',
    title: 'Live & Training',
    description: 'Your system is live. We will send you short videos on how to use it.',
    highlight: false,
    dotColor: 'border-[#8f9194]',
  },
];
