import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { jsPDF } from 'jspdf';
import { OnboardingState, UploadedDoc } from '../types';
import { generateOnboardingPDF } from '../utils/pdfGenerator';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const ROOT_FOLDER_NAME = 'Ring2Rev Onboarding Records';

export interface DriveUploadedItem {
  name: string;
  id: string;
  webViewLink?: string;
  size?: number;
  type?: string;
}

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  folderId?: string;
  folderName?: string;
  folderLink?: string;
  kbDocsCount?: number;
  uploadedKbDocs?: DriveUploadedItem[];
  error?: string;
}

// Initialize Firebase App & Auth
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope(DRIVE_SCOPE);

export interface DriveConnectedUser {
  email?: string;
  name?: string;
  picture?: string;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;
let cachedDriveUser: DriveConnectedUser | null = null;

// Check sessionStorage for persisted token & user across reloads
try {
  const savedToken = sessionStorage.getItem('ring2rev_gdrive_token');
  const savedExp = sessionStorage.getItem('ring2rev_gdrive_token_exp');
  const savedUser = sessionStorage.getItem('ring2rev_gdrive_user');
  if (savedToken && savedExp && Number(savedExp) > Date.now()) {
    cachedAccessToken = savedToken;
    tokenExpiresAt = Number(savedExp);
  }
  if (savedUser) {
    cachedDriveUser = JSON.parse(savedUser);
  }
} catch {
  // Ignore storage errors
}

export function getCachedDriveToken(): string | null {
  if (cachedAccessToken && (tokenExpiresAt === 0 || tokenExpiresAt > Date.now())) {
    return cachedAccessToken;
  }
  return null;
}

export function getStoredDriveUser(): DriveConnectedUser | null {
  return cachedDriveUser;
}

export function saveDriveToken(token: string, expiresInSeconds: number = 3500, user?: DriveConnectedUser | null) {
  cachedAccessToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  if (user) {
    cachedDriveUser = user;
  }
  try {
    sessionStorage.setItem('ring2rev_gdrive_token', token);
    sessionStorage.setItem('ring2rev_gdrive_token_exp', String(tokenExpiresAt));
    if (cachedDriveUser) {
      sessionStorage.setItem('ring2rev_gdrive_user', JSON.stringify(cachedDriveUser));
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearDriveToken() {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
  cachedDriveUser = null;
  try {
    sessionStorage.removeItem('ring2rev_gdrive_token');
    sessionStorage.removeItem('ring2rev_gdrive_token_exp');
    sessionStorage.removeItem('ring2rev_gdrive_user');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Fetch Google User Info using the Access Token
 */
export async function fetchGoogleUserInfo(token: string): Promise<DriveConnectedUser | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    }
  } catch (err) {
    console.warn('Could not fetch Google user profile info:', err);
  }
  return null;
}

/**
 * Perform Google Sign In using Google Identity Services (GSI) OAuth Client
 */
export const googleSignIn = async (): Promise<{ user: DriveConnectedUser; accessToken: string } | null> => {
  const clientId = firebaseConfig.oAuthClientId || '';
  if (!clientId) {
    throw new Error('OAuth client configuration not found.');
  }

  // Ensure GSI script is ready
  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    throw new Error('Google Identity Services is loading. Please try again in a moment.');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: `${DRIVE_SCOPE} email profile`,
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }
          if (tokenResponse.access_token) {
            const expiresIn = Number(tokenResponse.expires_in) || 3600;
            const userProfile = await fetchGoogleUserInfo(tokenResponse.access_token);
            const user: DriveConnectedUser = userProfile || { email: 'Connected' };
            saveDriveToken(tokenResponse.access_token, expiresIn, user);
            resolve({ user, accessToken: tokenResponse.access_token });
          } else {
            reject(new Error('No access token received from Google'));
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(err);
    }
  });
};

/**
 * Logout / Unlink Google Drive
 */
export const logout = async () => {
  clearDriveToken();
};

/**
 * Acquire Google OAuth access token
 */
export async function requestDriveAccessToken(): Promise<string> {
  const currentToken = getCachedDriveToken();
  if (currentToken) {
    return currentToken;
  }

  const res = await googleSignIn();
  if (res?.accessToken) {
    return res.accessToken;
  }

  throw new Error('Google Drive authorization required. Please link Google Drive.');
}

/**
 * Find or create a folder in Google Drive
 */
async function getOrCreateFolder(
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<{ id: string; webViewLink?: string } | null> {
  try {
    let query = `name='${folderName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=files(id,name,webViewLink)`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return {
          id: searchData.files[0].id,
          webViewLink: searchData.files[0].webViewLink,
        };
      }
    }

    // Create folder
    const createBody: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
      createBody.parents = [parentId];
    }

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });

    if (createRes.ok) {
      const createData = await createRes.json();
      return {
        id: createData.id,
        webViewLink: createData.webViewLink || `https://drive.google.com/drive/folders/${createData.id}`,
      };
    }
  } catch (err) {
    console.warn('Drive folder creation note:', err);
  }
  return null;
}

/**
 * Upload a single binary or text file to Google Drive via multipart upload
 */
async function uploadRawFileToDrive({
  token,
  name,
  mimeType,
  base64Data,
  folderId,
  description,
}: {
  token: string;
  name: string;
  mimeType: string;
  base64Data: string;
  folderId?: string;
  description?: string;
}): Promise<DriveUploadedItem | null> {
  try {
    const boundary = '-------ring2rev_gdrive_upload_' + Math.random().toString(36).substring(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata: any = {
      name,
      mimeType: mimeType || 'application/octet-stream',
      description: description || `Uploaded via Ring2Rev Onboarding Portal`,
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const cleanBase64 = base64Data.includes('base64,')
      ? base64Data.substring(base64Data.indexOf('base64,') + 7)
      : base64Data;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType || 'application/octet-stream'}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      cleanBase64 +
      closeDelimiter;

    const uploadUrl =
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size,mimeType';

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (response.ok) {
      const fileData = await response.json();
      return {
        id: fileData.id,
        name: fileData.name,
        webViewLink: fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`,
        size: Number(fileData.size) || 0,
        type: fileData.mimeType,
      };
    } else {
      const errText = await response.text();
      console.warn(`[Drive] File upload failed for ${name} (${response.status}):`, errText);
    }
  } catch (err) {
    console.error(`[Drive] Exception uploading ${name}:`, err);
  }
  return null;
}

/**
 * Upload the full Onboarding Submission:
 * 1. Formatted Specification PDF
 * 2. All Knowledge Base documents provided by the client
 * Directly into organized Google Drive folders!
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
    const token = customToken || getCachedDriveToken() || (await requestDriveAccessToken());
    if (!token) {
      return { success: false, error: 'Google Drive authorization token required.' };
    }

    const safeBusinessName = (formData.businessName || 'Client')
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .trim()
      .slice(0, 35) || 'Client';
    const subRef = submissionId || `R2R-${Date.now().toString(36).toUpperCase()}`;

    // 1. Root Archive Folder: "Ring2Rev Onboarding Records"
    const rootFolder = await getOrCreateFolder(token, ROOT_FOLDER_NAME);
    const rootFolderId = rootFolder?.id;

    // 2. Client Submission Dedicated Folder: "BusinessName - Ref"
    const clientFolderName = `${safeBusinessName} - ${subRef}`;
    const clientFolder = await getOrCreateFolder(token, clientFolderName, rootFolderId);
    const targetFolderId = clientFolder?.id || rootFolderId;
    const folderLink =
      clientFolder?.webViewLink ||
      (clientFolder?.id ? `https://drive.google.com/drive/folders/${clientFolder.id}` : undefined);

    // 3. Generate & Upload Onboarding PDF
    const doc: jsPDF = generateOnboardingPDF({
      formData,
      submissionId,
      submittedAt,
    });
    const dataUri = doc.output('datauristring');
    const pdfBase64 = dataUri.split(',')[1];
    const pdfFileName = `Ring2Rev_Onboarding_Summary_${safeBusinessName.replace(/\s+/g, '_')}_${subRef}.pdf`;

    const uploadedPdf = await uploadRawFileToDrive({
      token,
      name: pdfFileName,
      mimeType: 'application/pdf',
      base64Data: pdfBase64,
      folderId: targetFolderId,
      description: `Ring2Rev Onboarding Specification Record for ${formData.businessName || 'Client'} (ID: ${subRef})`,
    });

    if (!uploadedPdf) {
      return { success: false, error: 'Failed to upload onboarding summary PDF to Google Drive.' };
    }

    // 4. Upload all Knowledge Base documents attached by client
    const uploadedKbDocs: DriveUploadedItem[] = [];
    const kbDocs: UploadedDoc[] = formData.uploadedDocs || [];

    if (kbDocs.length > 0) {
      // Create subfolder for Knowledge Base if multiple docs
      const kbFolder = await getOrCreateFolder(token, 'Knowledge Base Assets', targetFolderId);
      const kbFolderId = kbFolder?.id || targetFolderId;

      for (const kbDoc of kbDocs) {
        let base64Content = '';
        if (kbDoc.dataUrl && typeof kbDoc.dataUrl === 'string') {
          base64Content = kbDoc.dataUrl;
        } else if (kbDoc.url) {
          // If only URL is present, fetch server copy and convert to base64
          try {
            const fetchRes = await fetch(kbDoc.url);
            if (fetchRes.ok) {
              const blob = await fetchRes.blob();
              base64Content = await new Promise<string>((res) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result as string);
                reader.onerror = () => res('');
                reader.readAsDataURL(blob);
              });
            }
          } catch (fetchErr) {
            console.warn(`Could not fetch server document ${kbDoc.name}:`, fetchErr);
          }
        }

        if (base64Content) {
          const kbUploaded = await uploadRawFileToDrive({
            token,
            name: kbDoc.name || 'knowledge_base_doc',
            mimeType: kbDoc.type || 'application/octet-stream',
            base64Data: base64Content,
            folderId: kbFolderId,
            description: `Knowledge Base asset for ${formData.businessName || 'Client'} - ${kbDoc.name}`,
          });

          if (kbUploaded) {
            uploadedKbDocs.push(kbUploaded);
          }
        }
      }
    }

    return {
      success: true,
      fileId: uploadedPdf.id,
      fileName: uploadedPdf.name,
      webViewLink: uploadedPdf.webViewLink,
      folderId: targetFolderId,
      folderName: clientFolderName,
      folderLink,
      kbDocsCount: uploadedKbDocs.length,
      uploadedKbDocs,
    };
  } catch (err: any) {
    console.error('[Google Drive] Master upload error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during Google Drive upload.',
    };
  }
}

export { generateOnboardingPdfBlob } from '../utils/pdfGenerator';

/**
 * Universal Google Apps Script Webhook Integration
 * Allows any client on any browser or device to auto-sync to your Google Drive
 * without any Google OAuth login requirement.
 */
export const APPS_SCRIPT_STORAGE_KEY = 'ring2rev_apps_script_url';

let inMemoryGlobalAppsScriptUrl = '';

export function getStoredAppsScriptUrl(): string {
  try {
    const url = localStorage.getItem(APPS_SCRIPT_STORAGE_KEY);
    if (url && url.trim()) return url.trim();
  } catch {}
  return (
    inMemoryGlobalAppsScriptUrl ||
    (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL ||
    ''
  );
}

export function setInMemoryGlobalAppsScriptUrl(url: string) {
  if (url && url.trim()) {
    inMemoryGlobalAppsScriptUrl = url.trim();
  }
}

export function setStoredAppsScriptUrl(url: string) {
  try {
    if (url && url.trim()) {
      localStorage.setItem(APPS_SCRIPT_STORAGE_KEY, url.trim());
      inMemoryGlobalAppsScriptUrl = url.trim();
    } else {
      localStorage.removeItem(APPS_SCRIPT_STORAGE_KEY);
      inMemoryGlobalAppsScriptUrl = '';
    }
  } catch {}
}

export async function sendToGoogleAppsScriptWebhook(
  appsScriptUrl: string,
  submissionData: any,
  pdfBase64?: string
): Promise<{ success: boolean; message?: string; folderUrl?: string; folderId?: string }> {
  const payload = {
    ...submissionData,
    pdfBase64: pdfBase64 || null,
    timestamp: new Date().toISOString(),
  };

  return sendToGoogleDriveAppsScript(appsScriptUrl, payload);
}

export async function sendToGoogleDriveAppsScript(
  appsScriptUrl: string,
  payload: any
): Promise<{ success: boolean; message?: string; folderUrl?: string; folderId?: string }> {
  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({ success: true }));
    return {
      success: true,
      folderUrl: data.folderUrl || data.url,
      folderId: data.folderId || data.id,
      message: data.message,
    };
  } catch (error: any) {
    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      return { success: true, message: 'Dispatched to Google Apps Script' };
    } catch (fallbackErr: any) {
      return { success: false, message: error.message || 'Apps script dispatch failed' };
    }
  }
}
