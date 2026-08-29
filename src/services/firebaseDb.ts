import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, getDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface FirestoreSubmissionRecord {
  id: string;
  submittedAt: string;
  recipientEmails: string[];
  data: any;
  webhookSent: boolean;
  summaryText: string;
  driveSyncResult?: {
    success: boolean;
    folderLink?: string;
    folderName?: string;
    webViewLink?: string;
    fileName?: string;
    kbDocsCount?: number;
    syncedAt?: string;
  };
}

/**
 * Save submission to global cloud Firestore collection so it is accessible from ANY device or browser
 */
export async function saveSubmissionToFirestore(submission: FirestoreSubmissionRecord): Promise<boolean> {
  try {
    const docRef = doc(db, 'submissions', submission.id);
    
    // Sanitize data (remove massive binary dataUrls for Firestore 1MB doc limits, URLs are preserved)
    const sanitizedData = { ...submission.data };
    if (Array.isArray(sanitizedData.uploadedDocs)) {
      sanitizedData.uploadedDocs = sanitizedData.uploadedDocs.map((d: any) => ({
        id: d.id,
        name: d.name,
        size: d.size,
        type: d.type,
        uploadedAt: d.uploadedAt,
        url: d.url,
      }));
    }

    const payload: any = {
      id: submission.id,
      submittedAt: submission.submittedAt,
      recipientEmails: submission.recipientEmails || [],
      data: sanitizedData,
      webhookSent: submission.webhookSent || false,
      summaryText: submission.summaryText || '',
      createdAt: new Date().toISOString(),
    };

    if (submission.driveSyncResult) {
      payload.driveSyncResult = submission.driveSyncResult;
    }

    await setDoc(docRef, payload, { merge: true });

    console.log(`[Firestore] Successfully saved submission ${submission.id} to Cloud Firestore.`);
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving submission to Firestore:', err);
    return false;
  }
}

const CONFIG_COLLECTION = 'system_config';
const CONFIG_DOC_ID = 'global_settings';

/**
 * Fetch global config (e.g. Google Drive Apps Script URL) shared across all devices & clients
 */
export async function fetchGlobalDriveWebhookUrl(): Promise<string> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data?.googleAppsScriptUrl || '';
    }
  } catch (err) {
    console.warn('[Firestore] Could not load global drive config:', err);
  }
  return '';
}

/**
 * Save global config (Google Drive Apps Script URL) so every client device sends to this Drive
 */
export async function saveGlobalDriveWebhookUrl(url: string): Promise<boolean> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    await setDoc(docRef, { googleAppsScriptUrl: url, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Failed to save global drive config:', err);
    return false;
  }
}

/**
 * Fetch all submissions from global cloud Firestore
 */
export async function fetchSubmissionsFromFirestore(): Promise<FirestoreSubmissionRecord[]> {
  try {
    const submissionsCol = collection(db, 'submissions');
    const q = query(submissionsCol, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const records: FirestoreSubmissionRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        records.push({
          id: data.id || docSnap.id,
          submittedAt: data.submittedAt || '',
          recipientEmails: data.recipientEmails || [],
          data: data.data || {},
          webhookSent: !!data.webhookSent,
          summaryText: data.summaryText || '',
          driveSyncResult: data.driveSyncResult,
        });
      }
    });

    console.log(`[Firestore] Retrieved ${records.length} submissions from Cloud Firestore.`);
    return records;
  } catch (err) {
    console.error('[Firestore] Error fetching from Cloud Firestore:', err);
    return [];
  }
}
