import { jsPDF } from 'jspdf';
import { OnboardingState } from '../types';
import { generateOnboardingPDF } from '../utils/pdfGenerator';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = 'Ring2Rev Onboarding Records';

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  folderName?: string;
  error?: string;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

// Load token from storage on boot if still valid
try {
  const savedToken = sessionStorage.getItem('ring2rev_gdrive_token');
  const savedExp = sessionStorage.getItem('ring2rev_gdrive_token_exp');
  if (savedToken && savedExp && Number(savedExp) > Date.now()) {
    cachedAccessToken = savedToken;
    tokenExpiresAt = Number(savedExp);
  }
} catch {
  // Ignore storage errors
}

export function getCachedDriveToken(): string | null {
  if (cachedAccessToken && tokenExpiresAt > Date.now()) {
    return cachedAccessToken;
  }
  return null;
}

export function saveDriveToken(token: string, expiresInSeconds: number = 3500) {
  cachedAccessToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  try {
    sessionStorage.setItem('ring2rev_gdrive_token', token);
    sessionStorage.setItem('ring2rev_gdrive_token_exp', String(tokenExpiresAt));
  } catch {
    // Ignore storage errors
  }
}

export function clearDriveToken() {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
  try {
    sessionStorage.removeItem('ring2rev_gdrive_token');
    sessionStorage.removeItem('ring2rev_gdrive_token_exp');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Acquire Google OAuth access token using Google Identity Services (GSI)
 */
export async function requestDriveAccessToken(): Promise<string> {
  const currentToken = getCachedDriveToken();
  if (currentToken) {
    return currentToken;
  }

  // Fetch client ID if available
  let clientId = '';
  try {
    const res = await fetch('/api/auth/client-id');
    const data = await res.json();
    if (data.clientId) {
      clientId = data.clientId;
    }
  } catch {
    // Continue
  }

  return new Promise((resolve, reject) => {
    // Check if google.accounts.oauth2 is loaded
    const google = (window as any).google;
    if (!google || !google.accounts || !google.accounts.oauth2) {
      // Wait for script to load or reject with clear message
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const g = (window as any).google;
        if (g?.accounts?.oauth2) {
          clearInterval(interval);
          initClient(g, clientId, resolve, reject);
        } else if (attempts > 20) {
          clearInterval(interval);
          reject(new Error('Google Identity Services script not available. Please check internet connection.'));
        }
      }, 200);
      return;
    }

    initClient(google, clientId, resolve, reject);
  });
}

function initClient(
  google: any,
  clientId: string,
  resolve: (token: string) => void,
  reject: (reason: any) => void
) {
  try {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId || undefined,
      scope: DRIVE_SCOPE,
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }
        if (tokenResponse.access_token) {
          const expiresIn = Number(tokenResponse.expires_in) || 3600;
          saveDriveToken(tokenResponse.access_token, expiresIn);
          resolve(tokenResponse.access_token);
        } else {
          reject(new Error('No access token received from Google'));
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: '' });
  } catch (err: any) {
    reject(err);
  }
}

/**
 * Find or create a dedicated folder in the user's Google Drive
 */
async function getOrCreateFolder(accessToken: string, folderName: string): Promise<string | null> {
  try {
    // Search existing folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    )}&fields=files(id,name)`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (createRes.ok) {
      const createData = await createRes.json();
      return createData.id;
    }
  } catch (err) {
    console.warn('Google Drive folder creation/check note:', err);
  }
  return null;
}

/**
 * Upload an onboarding PDF to Google Drive
 */
export async function uploadOnboardingPdfToDrive({
  formData,
  submissionId,
  submittedAt,
  customToken,
}: {
  formData: OnboardingState;
  submissionId?: string;
  submittedAt?: string;
  customToken?: string;
}): Promise<DriveUploadResult> {
  try {
    const token = customToken || (await requestDriveAccessToken());
    if (!token) {
      return { success: false, error: 'Google Drive authorization token required.' };
    }

    // 1. Generate the PDF instance
    const doc: jsPDF = generateOnboardingPDF({
      formData,
      submissionId,
      submittedAt,
    });

    // 2. Convert to Base64
    const dataUri = doc.output('datauristring');
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
      return { success: false, error: 'Failed to generate PDF byte stream.' };
    }

    const safeBusinessName = (formData.businessName || 'Client')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const subRef = submissionId || `R2R-${Date.now().toString(36).toUpperCase()}`;
    const fileName = `Ring2Rev_Onboarding_Summary_${safeBusinessName}_${subRef}.pdf`;

    // 3. Find or create dedicated folder
    const folderId = await getOrCreateFolder(token, FOLDER_NAME);

    // 4. Perform Multipart Upload
    const boundary = '-------ring2rev_multipart_boundary_314159';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata: any = {
      name: fileName,
      mimeType: 'application/pdf',
      description: `Ring2Rev Client Onboarding Specification Record for ${formData.businessName || 'Client'} (ID: ${subRef})`,
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/pdf\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Data +
      closeDelimiter;

    const uploadUrl =
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,parents';

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      const errText = await response.text();
      // If 401 Unauthorized, clear cached token
      if (response.status === 401) {
        clearDriveToken();
      }
      return {
        success: false,
        error: `Google Drive Upload failed (${response.status}): ${errText}`,
      };
    }

    const fileData = await response.json();
    const webViewLink =
      fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`;

    console.log('[Google Drive] Successfully uploaded PDF:', fileData.name, webViewLink);

    return {
      success: true,
      fileId: fileData.id,
      fileName: fileData.name,
      webViewLink,
      folderName: FOLDER_NAME,
    };
  } catch (err: any) {
    console.error('[Google Drive] Upload exception:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during Google Drive upload.',
    };
  }
}
