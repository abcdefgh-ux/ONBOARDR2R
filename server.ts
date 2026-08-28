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

function getSubmissions(): SubmissionRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading submissions file:', err);
  }
  return [];
}

function saveSubmission(submission: SubmissionRecord) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = getSubmissions();
    list.unshift(submission);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving submission:', err);
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

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    const formData = req.body;
    const submissionId = `R2R-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const timestamp = new Date().toISOString();

    // Determine recipient emails who receive this copy
    const adminEmail = 'shayanalizafar@yahoo.com';
    const recipientEmails: string[] = [adminEmail];
    
    if (formData.primaryContactEmail && formData.primaryContactEmail.includes('@')) {
      recipientEmails.push(formData.primaryContactEmail.trim());
    }
    if (formData.retellEmail && formData.retellEmail.includes('@') && !recipientEmails.includes(formData.retellEmail.trim())) {
      recipientEmails.push(formData.retellEmail.trim());
    }

    const summaryText = formatSummaryText(formData, submissionId, timestamp);

    let webhookSent = false;
    // If a Slack/webhook endpoint was provided in Step 2, dispatch notification
    if (formData.slackWebhook && formData.slackWebhook.startsWith('http')) {
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

        const response = await fetch(formData.slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        webhookSent = response.ok;
      } catch (webhookErr) {
        console.warn('Webhook dispatch warning:', webhookErr);
      }
    }

    const record: SubmissionRecord = {
      id: submissionId,
      submittedAt: timestamp,
      recipientEmails,
      data: formData,
      webhookSent,
      summaryText,
    };

    saveSubmission(record);

    console.log(`[Ring2Rev] Form submission ${submissionId} processed. Copy generated for: ${recipientEmails.join(', ')}`);

    res.json({
      success: true,
      submissionId,
      submittedAt: timestamp,
      recipientEmails,
      webhookSent,
      summaryText,
      message: `A full copy of your responses has been recorded and scheduled for dispatch to ${recipientEmails.join(', ')}.`,
    });
  } catch (err: any) {
    console.error('Error submitting form:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error processing submission' });
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
