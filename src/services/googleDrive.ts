import { OnboardingState } from '../types';
import { generateOnboardingPDF } from '../utils/pdfGenerator';

export { generateOnboardingPdfBlob } from '../utils/pdfGenerator';

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGIjum7RTnDXtP8OoCij5pEcoBVexAYbxyPddZQD8OmW0K1JM-OXqaUZDEHH0NNPjUpw/exec';

/**
 * Universal Google Drive Auto-Sync
 * Automatically creates a client folder in your Google Drive with the PDF summary
 * and raw uploaded Knowledge Base files without requiring client sign-in.
 */
export async function sendToGoogleAppsScriptWebhook(
  appsScriptUrl: string,
  submissionData: any,
  pdfBase64?: string
): Promise<{ success: boolean; message?: string; folderUrl?: string; folderId?: string }> {
  const targetUrl = appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
  const payload = {
    ...submissionData,
    pdfBase64: pdfBase64 || null,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(targetUrl, {
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
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      return { success: true, message: 'Dispatched to Google Drive' };
    } catch (fallbackErr: any) {
      return { success: false, message: error.message || 'Drive dispatch failed' };
    }
  }
}
