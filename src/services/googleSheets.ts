import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { OnboardingState } from '../types';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Scopes required for Google Sheets & Drive File creation
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

// In-memory cache for OAuth access token (per security mandate)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleAuthResult {
  user: User | null;
  accessToken: string | null;
  cancelled?: boolean;
  error?: string | null;
}

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      return {
        user: null,
        accessToken: null,
        error: 'No access token received from Google.',
      };
    }
    cachedAccessToken = credential.accessToken;
    return {
      user: result.user,
      accessToken: cachedAccessToken,
      cancelled: false,
    };
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      // Graceful cancellation: user simply closed or dismissed the popup
      return {
        user: null,
        accessToken: null,
        cancelled: true,
      };
    }
    if (error?.code === 'auth/popup-blocked') {
      return {
        user: null,
        accessToken: null,
        error: 'Popup was blocked by your browser. Please allow popups for this site and try again.',
      };
    }
    console.warn('Google Sign-In notice:', error?.message || error);
    return {
      user: null,
      accessToken: null,
      error: error?.message || 'Authentication with Google could not be completed.',
    };
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string) => {
  cachedAccessToken = token;
};

// Sheet column definitions
export const SHEET_COLUMNS = [
  'Submission ID',
  'Submitted Timestamp',
  'Company Name',
  'Primary Contact Name',
  'Primary Email',
  'Primary Phone',
  'Main Business Phone',
  'Service Area / Territory',
  'Operating Hours',
  'AI Vocal Tone',
  'Retell AI Account Email',
  'Payment Security Note',
  'Mandatory Phrases (Always Say)',
  'Restricted Phrases (Never Say)',
  'Knowledge Website URL',
  'Knowledge Documents',
  'Configured Scenarios Count',
  'Scenarios Breakdown',
  'Escalation Contact Name',
  'Escalation Phone',
  'Slack / Webhook URL',
  'N8N Account Email',
  'Payment Gateway Live Sync',
  'CRM / Calendar Live Sync',
  'Emergency Team Alert',
  'SMS Follow-ups Enabled',
  'Auto Calendar Booking',
  'Custom Automation Directives',
  'Response Copy Recipients',
];

export function buildSheetRow(
  formData: OnboardingState,
  submissionId: string,
  submittedAt: string,
  recipientEmails: string[] = []
): (string | number)[] {
  const scenariosStr = (formData.scenarios || [])
    .map((s, i) => `[${i + 1}] ${s.name}: Trigger: "${s.description}" | Action: "${s.responseProtocol}"`)
    .join(' \n');

  const docsStr = (formData.uploadedDocs || [])
    .map((d) => `${d.name} (${Math.round((d.size || 0) / 1024)} KB)`)
    .join(', ');

  const recipients = recipientEmails.length > 0
    ? recipientEmails.join(', ')
    : [formData.adminCopyEmail || 'shayanalizafar@yahoo.com', formData.primaryContactEmail].filter(Boolean).join(', ');

  return [
    submissionId,
    new Date(submittedAt).toLocaleString(),
    formData.businessName || 'N/A',
    formData.primaryContactName || 'N/A',
    formData.primaryContactEmail || 'N/A',
    formData.primaryContactPhone || 'N/A',
    formData.mainPhone || 'N/A',
    formData.serviceArea || 'N/A',
    formData.businessHours || 'N/A',
    formData.aiTone || 'Professional',
    formData.retellEmail || 'N/A',
    formData.paymentNote || 'N/A',
    formData.alwaysSay || 'N/A',
    formData.neverSay || 'N/A',
    formData.websiteUrl || 'N/A',
    docsStr || 'None',
    (formData.scenarios || []).length,
    scenariosStr || 'None configured',
    formData.escalationName || 'N/A',
    formData.escalationPhone || 'N/A',
    formData.slackWebhook || 'N/A',
    formData.n8nEmail || 'N/A',
    formData.paymentSetupConfirmed ? 'Confirmed (Day 7 Session)' : 'Pending',
    formData.crmSetupConfirmed ? 'Confirmed (Day 7 Session)' : 'Pending',
    formData.notifyTeamOnEmergency ? 'Yes' : 'No',
    formData.smsFollowupEnabled ? 'Yes' : 'No',
    formData.autoBookingEnabled ? 'Yes' : 'No',
    formData.customAutomationNotes || 'None',
    recipients,
  ];
}

/**
 * Creates a formatted Google Sheet specifically for Ring2Rev Onboarding Records
 */
export async function createRing2RevSpreadsheet(
  accessToken: string,
  title: string = 'Ring2Rev Onboarding Submissions (Live Portal)'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const createPayload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'All Submissions',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: SHEET_COLUMNS.map((col) => ({
                  userEnteredValue: { stringValue: col },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.04, green: 0.04, blue: 0.04 }, // Obsidian dark
                    textFormat: {
                      foregroundColor: { red: 0.77, green: 0.64, blue: 0.49 }, // Champagne Gold #c5a47e
                      bold: true,
                      fontSize: 10,
                    },
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'MIDDLE',
                    padding: { top: 6, bottom: 6, left: 8, right: 8 },
                  },
                })),
              },
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Failed to create Google Sheet');
  }

  const result = await response.json();
  const spreadsheetId = result.spreadsheetId;
  const spreadsheetUrl = result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Appends a row of submission data to a Google Sheet
 */
export async function appendSubmissionRow(
  accessToken: string,
  spreadsheetId: string,
  rowData: (string | number)[]
): Promise<any> {
  // First, verify or fetch sheet metadata to get tab name
  let sheetName = 'All Submissions';
  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (metaRes.ok) {
      const meta = await metaRes.json();
      if (meta.sheets && meta.sheets.length > 0) {
        sheetName = meta.sheets[0].properties.title;
      }
    }
  } catch (err) {
    console.warn('Could not read sheet metadata, fallback to default range', err);
  }

  const range = `'${sheetName}'!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const appendRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowData],
    }),
  });

  if (!appendRes.ok) {
    const err = await appendRes.json();
    throw new Error(err?.error?.message || 'Failed to append row to Google Sheet');
  }

  return await appendRes.json();
}

/**
 * End-to-end sync function: checks/creates sheet and appends the submission
 */
export async function syncFormDataToGoogleSheet(
  accessToken: string,
  formData: OnboardingState,
  submissionId: string,
  submittedAt: string,
  recipientEmails: string[] = [],
  existingSpreadsheetId?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  let spreadsheetId = existingSpreadsheetId || formData.spreadsheetId;
  let spreadsheetUrl = formData.spreadsheetUrl;

  if (!spreadsheetId) {
    // Create new dedicated sheet
    const created = await createRing2RevSpreadsheet(accessToken);
    spreadsheetId = created.spreadsheetId;
    spreadsheetUrl = created.spreadsheetUrl;
  }

  // Build row data
  const rowData = buildSheetRow(formData, submissionId, submittedAt, recipientEmails);

  // Append row
  await appendSubmissionRow(accessToken, spreadsheetId, rowData);

  return {
    spreadsheetId,
    spreadsheetUrl: spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}
