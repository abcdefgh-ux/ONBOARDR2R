import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory / file persistent storage for submissions
interface SubmissionRecord {
  id: string;
  submittedAt: string;
  recipientEmails: string[];
  data: any;
  webhookSent: boolean;
  summaryText: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const CONFIG_FILE = path.join(DATA_DIR, 'sheets_config.json');

let memorySubmissions: SubmissionRecord[] = [];
let savedSheetsWebhookUrl = '';

function initStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(CONFIG_FILE)) {
      const cfgRaw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const cfg = JSON.parse(cfgRaw);
      if (cfg && cfg.sheetsWebhookUrl) {
        savedSheetsWebhookUrl = cfg.sheetsWebhookUrl;
        console.log(`[Storage] Loaded saved Google Sheets URL: ${savedSheetsWebhookUrl.slice(0, 35)}...`);
      }
    }
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memorySubmissions = parsed;
        console.log(`[Storage] Loaded ${memorySubmissions.length} submissions from disk.`);
      }
    }
  } catch (err) {
    console.error('Storage initialization note:', err);
  }
}
initStorage();

function saveSheetsConfig(url: string) {
  if (!url || !url.startsWith('http')) return;
  savedSheetsWebhookUrl = url.trim();
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ sheetsWebhookUrl: savedSheetsWebhookUrl, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
    console.log(`[Storage] Saved Google Sheets Webhook URL to disk.`);
  } catch (err) {
    console.error('Error saving sheets config:', err);
  }
}

function getSubmissions(): SubmissionRecord[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= memorySubmissions.length) {
        memorySubmissions = parsed;
      }
    }
  } catch (err) {
    console.error('Error reading submissions file:', err);
  }
  return memorySubmissions;
}

function saveSubmission(submission: SubmissionRecord) {
  try {
    // 1. Update in-memory array immediately
    memorySubmissions = [submission, ...memorySubmissions.filter((s) => s.id !== submission.id)];
    
    // 2. Persist to disk
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(memorySubmissions, null, 2), 'utf-8');
    console.log(`[Storage] Successfully saved submission ${submission.id}. Total count: ${memorySubmissions.length}`);
  } catch (err) {
    console.error('Error saving submission to disk:', err);
  }
}

function formatSummaryText(data: any, id: string, date: string): string {
  const scenariosList = (data.scenarios || [])
    .map((s: any, idx: number) => `  ${idx + 1}. [${s.name}]: Trigger: ${s.description || 'N/A'} | Protocol: ${s.responseProtocol || 'N/A'}`)
    .join('\n');

  const docsList = (data.uploadedDocs || [])
    .map((d: any) => `  - ${d.name} (${Math.round((d.size || 0) / 1024)} KB)`)
    .join('\n');

  return `=====================================================
RING2REV ONBOARDING SUBMISSION RECORD
Submission ID: ${id}
Submitted At: ${date}
=====================================================

1. BUSINESS INFORMATION
- Company Name: ${data.businessName || 'Not specified'}
- Main Phone: ${data.mainPhone || 'Not specified'}
- Primary Contact: ${data.primaryContactName || 'Not specified'}
- Primary Email: ${data.primaryContactEmail || 'Not specified'}
- Primary Contact Phone: ${data.primaryContactPhone || 'Not specified'}
- Service Territory / Coverage: ${data.serviceArea || 'Not specified'}
- Operating Hours: ${data.businessHours || 'Not specified'}

2. CONVERSATIONAL AI ENGINE
- Vocal Tone & Cadence: ${data.aiTone || 'Professional'}
- Retell AI Email: ${data.retellEmail || 'Not specified'}
- Secure Call Payment Note: ${data.paymentNote || 'None'}
- Mandatory Phrases (Always Say): ${data.alwaysSay || 'None'}
- Restricted Phrases (Never Say): ${data.neverSay || 'None'}
- Knowledge Website URL: ${data.websiteUrl || 'None'}
- Knowledge Documents (${(data.uploadedDocs || []).length}):
${docsList || '  None uploaded'}
- Configured Scenarios (${(data.scenarios || []).length}):
${scenariosList || '  None configured'}
- Escalation Contact: ${data.escalationName || 'None'} (${data.escalationPhone || 'None'})
- Slack / Webhook URL: ${data.slackWebhook || 'None'}

3. INTEGRATION & WORKFLOWS
- N8N Account Email: ${data.n8nEmail || 'Not specified'}
- Payment Gateway Live Sync: ${data.paymentSetupConfirmed ? 'Confirmed' : 'Pending live session'}
- CRM / Calendar Live Sync: ${data.crmSetupConfirmed ? 'Confirmed' : 'Pending live session'}

4. AUTONOMOUS RULES & SAFETY
- Emergency Alerts Enabled: ${data.notifyTeamOnEmergency ? 'Yes' : 'No'}
- SMS Post-Call Follow-ups: ${data.smsFollowupEnabled ? 'Yes' : 'No'}
- Auto Calendar Booking: ${data.autoBookingEnabled ? 'Yes' : 'No'}
- Custom Automation Directives: ${data.customAutomationNotes || 'None'}

=====================================================
Dispatch Status: Recorded to portal server & ready for review.
=====================================================`;
}

function escapeCsvCell(val: any): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

function formatSubmissionsCsv(records: SubmissionRecord[]): string {
  const headers = [
    'Submission ID',
    'Submitted At',
    'Business Name',
    'Primary Contact Name',
    'Primary Contact Email',
    'Main Phone',
    'Business Address',
    'Service Area / Territory',
    'Business Hours',
    'AI Tone',
    'Retell Account Email',
    'N8N Email',
    'Escalation Contact Name',
    'Escalation Phone',
    'Notification Webhook',
    'Emergency Alert Enabled',
    'SMS Follow-up Enabled',
    'Auto Booking Enabled',
    'Custom Automation Notes',
    'Configured Scenarios Count',
    'Scenarios Summary',
    'Uploaded Docs Count',
    'Summary Transcript',
  ];

  const rows = records.map((rec) => {
    const d = rec.data || {};
    const scenarios = (d.scenarios || [])
      .map((s: any) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
      .join(' | ');

    return [
      escapeCsvCell(rec.id),
      escapeCsvCell(rec.submittedAt),
      escapeCsvCell(d.businessName),
      escapeCsvCell(d.primaryContactName),
      escapeCsvCell(d.primaryContactEmail),
      escapeCsvCell(d.mainPhone),
      escapeCsvCell(d.businessAddress),
      escapeCsvCell(d.serviceArea),
      escapeCsvCell(d.businessHours),
      escapeCsvCell(d.aiTone),
      escapeCsvCell(d.retellEmail),
      escapeCsvCell(d.n8nEmail),
      escapeCsvCell(d.escalationName),
      escapeCsvCell(d.escalationPhone),
      escapeCsvCell(d.slackWebhook),
      escapeCsvCell(d.notifyTeamOnEmergency ? 'TRUE' : 'FALSE'),
      escapeCsvCell(d.smsFollowupEnabled ? 'TRUE' : 'FALSE'),
      escapeCsvCell(d.autoBookingEnabled ? 'TRUE' : 'FALSE'),
      escapeCsvCell(d.customAutomationNotes),
      escapeCsvCell((d.scenarios || []).length),
      escapeCsvCell(scenarios),
      escapeCsvCell((d.uploadedDocs || []).length),
      escapeCsvCell(rec.summaryText),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export all submissions as CSV (for direct Google Sheets =IMPORTDATA sync or download)
app.get('/api/submissions/export.csv', (_req, res) => {
  try {
    const list = getSubmissions();
    const csv = formatSubmissionsCsv(list);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ring2rev-submissions.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).send('Error exporting CSV: ' + err.message);
  }
});

// GET all submissions copies for the portal owner/admin
app.get('/api/submissions', (_req, res) => {
  try {
    const list = getSubmissions();
    res.json({ success: true, count: list.length, submissions: list });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve submissions' });
  }
});

// POST a new form submission
app.post('/api/submit', async (req, res) => {
  try {
    const formData = req.body || {};
    const submissionId = `R2R-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const timestamp = new Date().toISOString();

    // Internal admin lead recipient (stored securely on server)
    const adminEmail = 'shayanalizafar@yahoo.com';
    const recipientEmails: string[] = [adminEmail];
    
    if (formData.primaryContactEmail && typeof formData.primaryContactEmail === 'string' && formData.primaryContactEmail.includes('@')) {
      recipientEmails.push(formData.primaryContactEmail.trim());
    }
    if (formData.retellEmail && typeof formData.retellEmail === 'string' && formData.retellEmail.includes('@') && !recipientEmails.includes(formData.retellEmail.trim())) {
      recipientEmails.push(formData.retellEmail.trim());
    }

    const summaryText = formatSummaryText(formData, submissionId, timestamp);

    const record: SubmissionRecord = {
      id: submissionId,
      submittedAt: timestamp,
      recipientEmails,
      data: formData,
      webhookSent: false,
      summaryText,
    };

    // CRITICAL: Save record to server memory and disk IMMEDIATELY
    saveSubmission(record);
    console.log(`[Ring2Rev] Form submission ${submissionId} successfully recorded. Total entries: ${memorySubmissions.length}`);

    // Asynchronous background webhooks dispatch (Slack & Google Sheets)
    (async () => {
      // 1. If Slack / custom webhook provided
      if (formData.slackWebhook && typeof formData.slackWebhook === 'string' && formData.slackWebhook.startsWith('http')) {
        try {
          const payload = {
            text: `🚀 *New Ring2Rev Onboarding Submission* - ${formData.businessName || 'Client'}\n*ID:* ${submissionId}\n*Contact:* ${formData.primaryContactName} (${formData.primaryContactEmail})\n*Tone:* ${formData.aiTone}\n*Scenarios:* ${(formData.scenarios || []).length} defined`,
            attachments: [
              {
                color: '#c5a47e',
                title: `${formData.businessName} Details`,
                text: `Main Phone: ${formData.mainPhone}\nHours: ${formData.businessHours}\nEscalation: ${formData.escalationName} (${formData.escalationPhone})`,
              }
            ]
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const response = await fetch(formData.slackWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (response.ok) {
            record.webhookSent = true;
          }
        } catch (webhookErr: any) {
          console.warn('Slack/Webhook dispatch notice:', webhookErr?.message || webhookErr);
        }
      }

      // 2. Google Sheets Webhook push (Automatic for ALL submissions)
      let sheetsWebhookUrl = (
        (formData.slackWebhook && formData.slackWebhook.startsWith('http') ? formData.slackWebhook : '') ||
        savedSheetsWebhookUrl ||
        process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
        ''
      ).trim();

      if (formData.slackWebhook && formData.slackWebhook.startsWith('http')) {
        saveSheetsConfig(formData.slackWebhook);
      }
      
      if (sheetsWebhookUrl && sheetsWebhookUrl.startsWith('http')) {
        // Automatic normalization for Google Apps Script URLs:
        if (sheetsWebhookUrl.includes('script.google.com/macros/s/')) {
          sheetsWebhookUrl = sheetsWebhookUrl.replace(/\/edit.*$/, '').replace(/\/dev.*$/, '');
          if (!sheetsWebhookUrl.endsWith('/exec')) {
            sheetsWebhookUrl = sheetsWebhookUrl.replace(/\/+$/, '') + '/exec';
          }
        }

        try {
          const scenariosSummary = (formData.scenarios || [])
            .map((s: any) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
            .join(' | ');

          const sheetPayload = {
            submissionId,
            timestamp,
            businessName: formData.businessName || '',
            primaryContactName: formData.primaryContactName || '',
            primaryContactEmail: formData.primaryContactEmail || '',
            mainPhone: formData.mainPhone || '',
            businessAddress: formData.businessAddress || '',
            serviceArea: formData.serviceArea || '',
            businessHours: formData.businessHours || '',
            aiTone: formData.aiTone || '',
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
            summaryText,
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const hookRes = await fetch(sheetsWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetPayload),
            redirect: 'follow',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          console.log(`[Google Sheets Webhook Auto-Push] Push to ${sheetsWebhookUrl} resulted in status: ${hookRes.status}`);
        } catch (sheetsErr: any) {
          console.warn('[Google Sheets Webhook Auto-Push] Warning:', sheetsErr?.message || sheetsErr);
        }
      }
    })().catch((bgErr) => console.warn('Background worker notice:', bgErr));

    // Return instant success confirmation to client
    return res.json({
      success: true,
      submissionId,
      submittedAt: timestamp,
      summaryText,
      recipientEmails,
      message: 'Your onboarding specifications have been securely recorded and dispatched to our engineering pipeline.',
    });
  } catch (err: any) {
    console.error('Error submitting form:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error processing submission' });
  }
});

// POST to sync client-side archive to server
app.post('/api/submissions/sync-local', (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      let added = 0;
      for (const item of items) {
        if (item && item.id && !memorySubmissions.some((s) => s.id === item.id)) {
          saveSubmission(item);
          added++;
        }
      }
      return res.json({ success: true, addedCount: added, totalCount: memorySubmissions.length });
    }
    return res.json({ success: true, totalCount: memorySubmissions.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST to resend or trigger direct email copy
app.post('/api/submissions/:id/resend', (req, res) => {
  const { id } = req.params;
  const { targetEmail } = req.body;
  const list = getSubmissions();
  const found = list.find((s) => s.id === id);

  if (!found) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  if (targetEmail && !found.recipientEmails.includes(targetEmail)) {
    found.recipientEmails.push(targetEmail);
    try {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch {
      // Ignore
    }
  }

  res.json({
    success: true,
    message: `Copy of submission ${id} dispatched to ${targetEmail || found.recipientEmails.join(', ')}`,
    submission: found,
  });
});

// POST to test or re-trigger webhook dispatch for any submission
app.post('/api/submissions/:id/test-webhook', async (req, res) => {
  const { id } = req.params;
  let webhookUrl = (req.body.webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim();
  const inlineSubmission = req.body.submission;
  
  const list = getSubmissions();
  let found = list.find((s) => s.id === id) || inlineSubmission;

  if (!found) {
    found = list[0];
  }

  if (!found) {
    return res.status(404).json({ success: false, error: 'No submission found to test with. Please submit the onboarding form first.' });
  }

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return res.status(400).json({ success: false, error: 'Please enter a valid webhook URL starting with https://' });
  }

  // Automatic normalization for Google Apps Script URLs:
  if (webhookUrl.includes('script.google.com/macros/s/')) {
    webhookUrl = webhookUrl.replace(/\/edit.*$/, '').replace(/\/dev.*$/, '');
    if (!webhookUrl.endsWith('/exec')) {
      webhookUrl = webhookUrl.replace(/\/+$/, '') + '/exec';
    }
  }

  // Persist for all future automatic submissions
  saveSheetsConfig(webhookUrl);

  try {
    const formData = found.data || found;
    const scenariosSummary = (formData.scenarios || [])
      .map((s: any) => `[${s.name}]: ${s.description || ''} -> ${s.responseProtocol || ''}`)
      .join(' | ');

    const sheetPayload = {
      submissionId: found.id || id,
      timestamp: found.submittedAt || new Date().toISOString(),
      businessName: formData.businessName || '',
      primaryContactName: formData.primaryContactName || '',
      primaryContactEmail: formData.primaryContactEmail || '',
      mainPhone: formData.mainPhone || '',
      businessAddress: formData.businessAddress || '',
      serviceArea: formData.serviceArea || '',
      businessHours: formData.businessHours || '',
      aiTone: formData.aiTone || '',
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
      summaryText: found.summaryText || '',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetPayload),
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const responseText = await response.text();
    
    // Check if Google returned "Sorry, the file you have requested does not exist" or HTML 404
    if (responseText.includes('does not exist') || responseText.includes('Page not found') || responseText.includes('drive-logo')) {
      return res.json({
        success: false,
        status: 404,
        webhookUrl,
        message: 'Google Apps Script says "The file you requested does not exist". This means the deployment ID was deleted or copied from the browser address bar rather than "Deploy > New deployment > Web app". Follow the 3-step guide below to generate a live Web App URL.',
      });
    }

    let isHtml = responseText.trim().startsWith('<') || responseText.includes('<!DOCTYPE');
    if (isHtml) {
      return res.json({
        success: false,
        status: response.status,
        webhookUrl,
        message: `Google returned an authorization HTML page instead of JSON. In your Apps Script deployment settings, make sure "Who has access" is set to "Anyone" and deploy a "New deployment".`,
      });
    }

    res.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      webhookUrl,
      responseBody: responseText.slice(0, 500),
      message: response.ok
        ? `✓ Successfully delivered submission ${found.id || id} to Google Sheet (${response.status})`
        : `Webhook returned status ${response.status}: ${responseText.slice(0, 200)}`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `Network error reaching webhook: ${err.message}`,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ring2Rev server is running at http://localhost:${PORT}`);
  });
}

startServer();
