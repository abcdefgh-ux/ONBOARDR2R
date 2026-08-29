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

    await setDoc(docRef, {
      id: submission.id,
      submittedAt: submission.submittedAt,
      recipientEmails: submission.recipientEmails || [],
      data: sanitizedData,
      webhookSent: submission.webhookSent || false,
      summaryText: submission.summaryText || '',
      createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`[Firestore] Successfully saved submission ${submission.id} to Cloud Firestore.`);
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving submission to Firestore:', err);
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
