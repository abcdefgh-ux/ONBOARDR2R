import { jsPDF } from 'jspdf';
import { OnboardingState } from '../types';
import { BUILD_TIMELINE } from '../data/initialData';

export interface PDFGenerationOptions {
  formData: OnboardingState;
  submissionId?: string;
  submittedAt?: string;
}

export function generateOnboardingPDF({
  formData,
  submissionId,
  submittedAt,
}: PDFGenerationOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const subId = submissionId || formData.submissionResult?.submissionId || `R2R-${Date.now().toString(36).toUpperCase()}`;
  const subDate = submittedAt || formData.submissionResult?.submittedAt || new Date().toISOString();
  const formattedDate = new Date(subDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const GOLD = [197, 164, 126]; // #c5a47e
  const DARK = [15, 15, 18];
  const CHARCOAL = [30, 30, 35];
  const LIGHT_BG = [248, 248, 250];
  const TEXT_MAIN = [25, 25, 30];
  const TEXT_MUTED = [100, 100, 110];
  const BORDER_COLOR = [225, 225, 230];

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    // Top subtle bar
    doc.setFillColor(DARK[0], DARK[1], DARK[2]);
    doc.rect(margin, y, contentWidth, 20, 'F');

    // Brand accent line
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(margin, y, 3, 20, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('RING2REV  |  YAAN & CO.', margin + 8, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text('CLIENT ONBOARDING SPECIFICATION RECORD', margin + 8, y + 14);

    // Reference on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`REF: ${subId}`, pageWidth - margin - 6, y + 8, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 190);
    doc.text(formattedDate, pageWidth - margin - 6, y + 14, { align: 'right' });

    y += 25;
  };

  const drawSectionTitle = (title: string, phaseNum: string) => {
    checkPageBreak(14);
    doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
    doc.rect(margin, y, contentWidth, 8, 'F');

    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(margin, y, 2.5, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(phaseNum.toUpperCase(), margin + 5, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.text(title.toUpperCase(), margin + 25, y + 5.5);

    y += 11;
  };

  const drawFieldRow = (label: string, value: string | undefined | null, isFullWidth = false) => {
    const safeVal = value && String(value).trim() ? String(value).trim() : 'Not Provided';
    const rowHeight = 7;
    checkPageBreak(rowHeight + 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(label, margin + 2, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_MAIN[0], TEXT_MAIN[1], TEXT_MAIN[2]);

    const valueX = margin + 55;
    const maxValueWidth = contentWidth - 58;

    if (isFullWidth || safeVal.length > 55) {
      const lines = doc.splitTextToSize(safeVal, maxValueWidth);
      doc.text(lines, valueX, y + 4.5);
      y += Math.max(rowHeight, lines.length * 4.5 + 2);
    } else {
      doc.text(safeVal, valueX, y + 4.5);
      y += rowHeight;
    }

    // Divider
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.line(margin + 2, y, margin + contentWidth - 2, y);
    y += 1.5;
  };

  // Start building PDF
  drawHeader();

  // Executive Badge Box
  doc.setFillColor(245, 245, 248);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text(formData.businessName || 'Client Configuration', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(
    `Primary Contact: ${formData.primaryContactName || 'N/A'}  •  Email: ${formData.primaryContactEmail || 'N/A'}  •  Phone: ${formData.mainPhone || 'N/A'}`,
    margin + 6,
    y + 15
  );

  // Status Chip
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.roundedRect(pageWidth - margin - 36, y + 5, 30, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SUBMITTED & VERIFIED', pageWidth - margin - 21, y + 9.2, { align: 'center' });

  y += 28;

  // SECTION 1: BUSINESS IDENTITY & TERRITORY
  drawSectionTitle('Business Profile & Contact Details', 'Phase 01');
  drawFieldRow('Company / Business Name', formData.businessName);
  drawFieldRow('Primary Contact Name', formData.primaryContactName);
  drawFieldRow('Primary Email Address', formData.primaryContactEmail);
  drawFieldRow('Direct / Mobile Phone', formData.primaryContactPhone);
  drawFieldRow('Main Business Telephone', formData.mainPhone);
  drawFieldRow('Service Area / Territory', formData.serviceArea);
  drawFieldRow('Standard Business Hours', formData.businessHours);
  y += 4;

  // SECTION 2: CONVERSATIONAL AI ENGINE & VOICE PERSONA
  drawSectionTitle('Conversational AI Architecture', 'Phase 02');
  drawFieldRow('Vocal Persona & Cadence', `${formData.aiTone} Tone`);
  drawFieldRow('Retell AI Account Email', formData.retellEmail);
  drawFieldRow('Mandatory Phrases (Always Say)', formData.alwaysSay || 'Standard conversational greetings');
  drawFieldRow('Restricted Phrases (Never Say)', formData.neverSay || 'No custom restrictions specified');
  drawFieldRow('Knowledge Base Website URL', formData.websiteUrl || 'None specified');

  const uploadedDocsSummary = (formData.uploadedDocs || []).length > 0
    ? formData.uploadedDocs.map((d) => `${d.name} (${Math.round((d.size || 0) / 1024)} KB)`).join(', ')
    : 'No external documentation attached';
  drawFieldRow('Uploaded Reference Docs', uploadedDocsSummary, true);
  y += 4;

  // SECTION 3: INTEGRATION & WORKFLOWS
  drawSectionTitle('Workflow & Integration Hub', 'Phase 03');
  const calendarDisplay = formData.calendarPlatform === 'Other' && formData.calendarCustomName
    ? `Other CRM / Custom (${formData.calendarCustomName})`
    : (formData.calendarPlatform || 'Google Calendar');
  drawFieldRow('Calendar & Booking Engine', calendarDisplay);
  drawFieldRow('N8N Workflow Hub Email', formData.n8nEmail || 'Will be provisioned during live onboarding');
  drawFieldRow('Security & Credentials Handshake', 'Zero-Trust Protocol: Live Encrypted Handshake during Onboarding Call');
  y += 4;

  // SECTION 4: AUTONOMOUS RULES & SAFETY PROTOCOLS
  drawSectionTitle('Safety Protocols & Automation Rules', 'Phase 04');
  drawFieldRow('Escalation Contact Name', formData.escalationName);
  drawFieldRow('Escalation Phone Number', formData.escalationPhone);
  drawFieldRow('Urgent Emergency Alerts', formData.notifyTeamOnEmergency ? 'ENABLED - Immediate team dispatch upon emergency' : 'Standard Queue');
  drawFieldRow('Automated SMS Follow-up', formData.smsFollowupEnabled ? 'ENABLED - Instant calendar links & summaries via SMS' : 'Disabled');
  drawFieldRow('Autonomous Slot Booking', formData.autoBookingEnabled ? 'ENABLED - Directly book slots into connected calendar' : 'Disabled');
  drawFieldRow('Custom Automation Directives', formData.customAutomationNotes || 'None specified', true);
  y += 4;

  // SECTION 5: CONFIGURED SCENARIOS & PROTOCOLS
  drawSectionTitle(`Configured Voice Scenarios (${(formData.scenarios || []).length})`, 'Scenarios');
  
  if (!formData.scenarios || formData.scenarios.length === 0) {
    drawFieldRow('Configured Scenarios', 'Default customer inquiry and appointment booking workflows will be generated.');
  } else {
    formData.scenarios.forEach((sc, idx) => {
      checkPageBreak(24);
      doc.setFillColor(250, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'F');
      doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
      doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.text(`Scenario ${idx + 1}: ${sc.name.toUpperCase()}`, margin + 4, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text('TRIGGER:', margin + 4, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT_MAIN[0], TEXT_MAIN[1], TEXT_MAIN[2]);
      doc.text(doc.splitTextToSize(sc.description || 'N/A', contentWidth - 30), margin + 22, y + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text('PROTOCOL:', margin + 4, y + 15.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text(doc.splitTextToSize(sc.responseProtocol || 'N/A', contentWidth - 30), margin + 22, y + 15.5);

      y += 23;
    });
  }
  y += 4;

  // SECTION 6: 15-DAY IMPLEMENTATION ROADMAP
  drawSectionTitle('15-Day Engineering & Launch Roadmap', 'Phase 05');
  BUILD_TIMELINE.forEach((item, idx) => {
    checkPageBreak(12);
    doc.setFillColor(item.highlight ? 245 : 252, item.highlight ? 240 : 252, item.highlight ? 230 : 252);
    doc.roundedRect(margin, y, contentWidth, 9.5, 1, 1, 'F');
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.roundedRect(margin, y, contentWidth, 9.5, 1, 1, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(item.highlight ? GOLD[0] : DARK[0], item.highlight ? GOLD[1] : DARK[1], item.highlight ? GOLD[2] : DARK[2]);
    doc.text(`[${item.days}]  ${item.title}`, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(item.description, margin + 4, y + 8);

    y += 11.5;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle bottom rule
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text('CONFIDENTIAL & PROPRIETARY  •  RING2REV / YAAN & CO. AUTOMATION SYSTEMS', margin, pageHeight - 8);

    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  return doc;
}

export function downloadOnboardingPDF(options: PDFGenerationOptions) {
  const doc = generateOnboardingPDF(options);
  const safeBusinessName = (options.formData.businessName || 'Client')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const fileName = `Ring2Rev_Onboarding_Summary_${safeBusinessName}_${Date.now().toString(36).toUpperCase()}.pdf`;
  doc.save(fileName);
}

export function generateOnboardingPdfBlob(
  formData: OnboardingState,
  submissionId?: string,
  submittedAt?: string
): Promise<Blob> {
  return new Promise((resolve) => {
    const doc = generateOnboardingPDF({
      formData,
      submissionId,
      submittedAt,
    });
    const blob = doc.output('blob');
    resolve(blob);
  });
}
