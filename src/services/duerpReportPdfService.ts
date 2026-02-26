import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { getCategoriesForSector } from '../data/sectorQuestions';

interface ClientInfo {
  fullName: string;
  companyName: string;
  siret: string;
  email: string;
  phone: string;
  address: string;
  ville: string;
  codePostal: string;
}

interface DuerpResponseData {
  question_id: string;
  category: string;
  selected_measures: string[];
  custom_measures: Array<{ id: string; description: string }>;
  risk_status: string | null;
  action_plan_measures: Array<{
    text?: string;
    description?: string;
    responsible?: string;
    budget?: string;
    startDate?: string;
    endDate?: string;
  }>;
  risk_priority: string | null;
  remarks: string;
  custom_risk_title?: string;
  custom_risk_information?: string;
}

const COLORS = {
  primary: [0, 51, 102] as [number, number, number],
  secondary: [44, 82, 130] as [number, number, number],
  accent: [0, 102, 204] as [number, number, number],
  success: [34, 139, 34] as [number, number, number],
  warning: [204, 102, 0] as [number, number, number],
  danger: [178, 34, 34] as [number, number, number],
  lightBg: [245, 248, 251] as [number, number, number],
  headerBg: [235, 242, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  lightGray: [220, 220, 220] as [number, number, number],
  borderBlue: [200, 220, 240] as [number, number, number],
};

const loadImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
};

const createRoundedImage = async (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        const r = 50;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(img.width - r, 0);
        ctx.quadraticCurveTo(img.width, 0, img.width, r);
        ctx.lineTo(img.width, img.height - r);
        ctx.quadraticCurveTo(img.width, img.height, img.width - r, img.height);
        ctx.lineTo(r, img.height);
        ctx.quadraticCurveTo(0, img.height, 0, img.height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

function getRiskStatusLabel(status: string | null): string {
  switch (status) {
    case 'maitrise': return 'Maitrise';
    case 'non_maitrise': return 'Non maitrise';
    case 'non_applicable': return 'Non applicable';
    case 'oui': return 'Oui';
    case 'non': return 'Non';
    default: return 'Non evalue';
  }
}

function getRiskStatusColor(status: string | null): [number, number, number] {
  switch (status) {
    case 'maitrise': case 'oui': return COLORS.success;
    case 'non_maitrise': case 'non': return COLORS.danger;
    case 'non_applicable': return COLORS.gray;
    default: return COLORS.gray;
  }
}

function getRiskPriorityLabel(priority: string | null): string {
  switch (priority) {
    case 'faible': return 'Faible';
    case 'moyenne': return 'Moyenne';
    case 'elevee': return 'Elevee';
    default: return '';
  }
}

function getRiskPriorityColor(priority: string | null): [number, number, number] {
  switch (priority) {
    case 'faible': return COLORS.success;
    case 'moyenne': return COLORS.warning;
    case 'elevee': return COLORS.danger;
    default: return COLORS.gray;
  }
}

export const generateDuerpReportPDF = async (
  clientId: string,
  typeDiagnostic: string,
  reportRemarks: string,
  clientInfo: ClientInfo
): Promise<string | null> => {
  const duerpCategories = getCategoriesForSector(typeDiagnostic);
  try {
    const { data: responsesData, error: respError } = await supabase
      .from('duerp_evaluation_responses')
      .select('*')
      .eq('client_id', clientId)
      .eq('type_diagnostic', typeDiagnostic)
      .order('created_at', { ascending: true });

    if (respError) throw respError;

    const responses: DuerpResponseData[] = responsesData || [];

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;
    let pageNum = 1;

    const checkPageBreak = (needed: number) => {
      if (y + needed > pageHeight - 25) {
        addFooter();
        doc.addPage();
        pageNum++;
        y = 20;
      }
    };

    const addFooter = () => {
      doc.setDrawColor(...COLORS.accent);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLORS.gray);
      doc.text('Rapport DUERP - Document Unique d\'Evaluation des Risques Professionnels', margin, pageHeight - 13);
      doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 13, { align: 'right' });
      doc.text('Cabinet FPE - Ce document est conforme aux exigences reglementaires en vigueur.', pageWidth / 2, pageHeight - 9, { align: 'center' });
      doc.setTextColor(...COLORS.black);
    };

    // === COVER PAGE ===
    try {
      const { data: pdfConfig } = await supabase
        .from('pdf_configuration')
        .select('logo_url')
        .maybeSingle();

      if (pdfConfig?.logo_url) {
        const logoBase64 = await loadImageAsBase64(pdfConfig.logo_url);
        const roundedLogo = await createRoundedImage(logoBase64);
        doc.addImage(roundedLogo, 'PNG', margin, y, 45, 13);
      }
    } catch {
      // logo not available
    }

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.gray);
    doc.text(`Date : ${currentDate}`, pageWidth - margin, y + 5, { align: 'right' });

    y += 22;

    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Rapport d\'Evaluation des Risques', pageWidth / 2, y, { align: 'center' });
    y += 9;
    doc.setFontSize(14);
    doc.text('Document Unique (DUERP)', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.secondary);
    doc.text('Article L4121-1 du Code du travail', pageWidth / 2, y, { align: 'center' });
    y += 8;

    const toolLabel = typeDiagnostic.replace(/^\d+\s*/, '').replace(/_/g, ' ');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text(`Outil : ${toolLabel}`, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(...COLORS.black);

    y += 12;

    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Client info box
    doc.setFillColor(...COLORS.lightBg);
    doc.setDrawColor(...COLORS.borderBlue);
    doc.roundedRect(margin, y, contentWidth, 52, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Informations de l\'entreprise', margin + 5, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.black);
    const infoStartY = y + 15;
    const col1X = margin + 5;
    const col2X = pageWidth / 2 + 5;
    const lineH = 7;

    const addInfoLine = (label: string, value: string, x: number, lineY: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text(`${label} :`, x, lineY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.black);
      const labelW = doc.getTextWidth(`${label} : `);
      doc.text(value || '-', x + labelW, lineY);
    };

    addInfoLine('Societe', clientInfo.companyName, col1X, infoStartY);
    addInfoLine('SIRET', clientInfo.siret, col2X, infoStartY);
    addInfoLine('Gerant', clientInfo.fullName, col1X, infoStartY + lineH);
    addInfoLine('Email', clientInfo.email, col2X, infoStartY + lineH);
    addInfoLine('Telephone', clientInfo.phone, col1X, infoStartY + lineH * 2);
    addInfoLine('Adresse', clientInfo.address, col2X, infoStartY + lineH * 2);
    addInfoLine('Ville', clientInfo.ville, col1X, infoStartY + lineH * 3);
    addInfoLine('Code Postal', clientInfo.codePostal, col2X, infoStartY + lineH * 3);
    const sectorLabel = typeDiagnostic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    addInfoLine('Secteur', sectorLabel, col1X, infoStartY + lineH * 4);

    y += 60;

    // Summary statistics
    const totalQuestions = duerpCategories.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answered = responses.filter(r => r.risk_status).length;
    const maitrise = responses.filter(r => r.risk_status === 'maitrise').length;
    const nonMaitrise = responses.filter(r => r.risk_status === 'non_maitrise').length;
    const nonApplicable = responses.filter(r => r.risk_status === 'non_applicable').length;
    const highPriority = responses.filter(r => r.risk_priority === 'elevee').length;

    checkPageBreak(40);

    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('Synthese generale', margin + 5, y + 5.5);
    y += 12;

    const statBoxW = (contentWidth - 8) / 5;
    const stats = [
      { label: 'Total', value: `${answered}/${totalQuestions}`, color: COLORS.accent },
      { label: 'Maitrises', value: `${maitrise}`, color: COLORS.success },
      { label: 'Non maitrises', value: `${nonMaitrise}`, color: COLORS.danger },
      { label: 'N/A', value: `${nonApplicable}`, color: COLORS.gray },
      { label: 'Priorite elevee', value: `${highPriority}`, color: COLORS.danger },
    ];

    stats.forEach((stat, i) => {
      const sx = margin + i * (statBoxW + 2);
      doc.setFillColor(...COLORS.lightBg);
      doc.setDrawColor(...stat.color);
      doc.setLineWidth(0.5);
      doc.roundedRect(sx, y, statBoxW, 22, 2, 2, 'FD');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...stat.color);
      doc.text(stat.value, sx + statBoxW / 2, y + 10, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.gray);
      doc.text(stat.label, sx + statBoxW / 2, y + 17, { align: 'center' });
    });

    y += 28;

    addFooter();
    doc.addPage();
    pageNum++;
    y = 20;

    // === DETAILED EVALUATION PER CATEGORY ===
    for (const category of duerpCategories) {
      const categoryResponses = responses.filter(r => r.category === category.id);
      if (categoryResponses.length === 0 && category.id !== 'risques_personnalises') continue;

      checkPageBreak(20);

      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.white);
      doc.text(category.label, margin + 5, y + 6.5);

      const catAnswered = categoryResponses.filter(r => r.risk_status).length;
      doc.setFontSize(8);
      doc.text(`${catAnswered}/${category.questions.length} evalues`, pageWidth - margin - 5, y + 6.5, { align: 'right' });
      y += 13;

      for (const question of category.questions) {
        const resp = categoryResponses.find(r => r.question_id === question.id);
        if (!resp) continue;

        const questionText = resp.custom_risk_title || question.text;
        const wrappedQuestion = doc.splitTextToSize(questionText, contentWidth - 70);
        const qHeight = Math.max(wrappedQuestion.length * 4.5 + 8, 14);

        checkPageBreak(qHeight + 30);

        doc.setFillColor(...COLORS.headerBg);
        doc.setDrawColor(...COLORS.borderBlue);
        doc.roundedRect(margin, y, contentWidth, qHeight, 1.5, 1.5, 'FD');

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text(wrappedQuestion, margin + 4, y + 5.5);

        const statusLabel = getRiskStatusLabel(resp.risk_status);
        const statusColor = getRiskStatusColor(resp.risk_status);
        const statusW = doc.getTextWidth(statusLabel) + 8;
        const statusX = pageWidth - margin - statusW - 3;

        doc.setFillColor(...statusColor);
        doc.roundedRect(statusX, y + 2, statusW, 6, 1.5, 1.5, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        doc.text(statusLabel, statusX + statusW / 2, y + 6, { align: 'center' });

        if (resp.risk_priority) {
          const prioLabel = getRiskPriorityLabel(resp.risk_priority);
          const prioColor = getRiskPriorityColor(resp.risk_priority);
          const prioW = doc.getTextWidth(prioLabel) + 8;
          const prioX = statusX - prioW - 3;

          doc.setFillColor(...prioColor);
          doc.roundedRect(prioX, y + 2, prioW, 6, 1.5, 1.5, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.white);
          doc.text(prioLabel, prioX + prioW / 2, y + 6, { align: 'center' });
        }

        y += qHeight + 2;

        // Selected measures
        if (resp.selected_measures && resp.selected_measures.length > 0) {
          checkPageBreak(12);

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.secondary);
          doc.text('Mesures en place :', margin + 4, y + 4);
          y += 6;

          for (const measureId of resp.selected_measures) {
            const measure = question.measures.find(m => m.id === measureId);
            if (measure) {
              const measureText = `- ${measure.text}`;
              const wrappedMeasure = doc.splitTextToSize(measureText, contentWidth - 12);
              const mHeight = wrappedMeasure.length * 3.8;

              checkPageBreak(mHeight + 2);

              doc.setFontSize(7);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(...COLORS.black);
              doc.text(wrappedMeasure, margin + 8, y + 3);
              y += mHeight + 1;
            }
          }
          y += 2;
        }

        // Custom measures
        if (resp.custom_measures && resp.custom_measures.length > 0) {
          checkPageBreak(12);

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.secondary);
          doc.text('Mesures personnalisees :', margin + 4, y + 4);
          y += 6;

          for (const cm of resp.custom_measures) {
            const desc = typeof cm === 'string' ? cm : cm.description || '';
            if (!desc) continue;
            const cmText = `- ${desc}`;
            const wrappedCm = doc.splitTextToSize(cmText, contentWidth - 12);
            const cmHeight = wrappedCm.length * 3.8;

            checkPageBreak(cmHeight + 2);

            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.black);
            doc.text(wrappedCm, margin + 8, y + 3);
            y += cmHeight + 1;
          }
          y += 2;
        }

        // Action plan measures
        if (resp.action_plan_measures && resp.action_plan_measures.length > 0) {
          checkPageBreak(12);

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.warning);
          doc.text('Plan d\'action :', margin + 4, y + 4);
          y += 6;

          for (const action of resp.action_plan_measures) {
            const actionDesc = typeof action === 'string' ? action : (action.description || action.text || '');
            if (!actionDesc) continue;

            const actionText = `- ${actionDesc}`;
            const wrappedAction = doc.splitTextToSize(actionText, contentWidth - 12);
            const aHeight = wrappedAction.length * 3.8;

            checkPageBreak(aHeight + 10);

            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.black);
            doc.text(wrappedAction, margin + 8, y + 3);
            y += aHeight + 1;

            if (typeof action === 'object') {
              const details: string[] = [];
              if (action.responsible) details.push(`Responsable: ${action.responsible}`);
              if (action.budget) details.push(`Budget: ${action.budget}`);
              if (action.startDate) details.push(`Debut: ${action.startDate}`);
              if (action.endDate) details.push(`Fin: ${action.endDate}`);

              if (details.length > 0) {
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(...COLORS.gray);
                doc.text(details.join('  |  '), margin + 12, y + 3);
                y += 5;
              }
            }
          }
          y += 2;
        }

        // Remarks
        if (resp.remarks && resp.remarks.trim()) {
          checkPageBreak(12);

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.secondary);
          doc.text('Remarques :', margin + 4, y + 4);
          y += 5;

          const wrappedRemarks = doc.splitTextToSize(resp.remarks, contentWidth - 12);
          const rHeight = wrappedRemarks.length * 3.8;

          checkPageBreak(rHeight + 4);

          doc.setFillColor(255, 255, 240);
          doc.setDrawColor(...COLORS.borderBlue);
          doc.roundedRect(margin + 4, y, contentWidth - 8, rHeight + 4, 1, 1, 'FD');

          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...COLORS.black);
          doc.text(wrappedRemarks, margin + 8, y + 4);
          y += rHeight + 7;
        }

        y += 4;
      }

      y += 4;
    }

    // === REPORT COMMENTS SECTION ===
    if (reportRemarks && reportRemarks.trim()) {
      checkPageBreak(30);

      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.white);
      doc.text('Commentaires du rapport', margin + 5, y + 6.5);
      y += 13;

      const wrappedReport = doc.splitTextToSize(reportRemarks, contentWidth - 12);
      const reportHeight = wrappedReport.length * 4.5;

      checkPageBreak(reportHeight + 8);

      doc.setFillColor(255, 255, 240);
      doc.setDrawColor(...COLORS.borderBlue);
      doc.roundedRect(margin, y, contentWidth, reportHeight + 8, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.black);
      doc.text(wrappedReport, margin + 5, y + 6);
      y += reportHeight + 14;
    }

    // === ACTION PLAN SUMMARY ===
    const actionItems = responses.filter(
      r => r.action_plan_measures && r.action_plan_measures.length > 0
    );

    if (actionItems.length > 0) {
      checkPageBreak(20);

      doc.setFillColor(...COLORS.warning);
      doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.white);
      doc.text('Synthese du plan d\'action', margin + 5, y + 6.5);
      y += 13;

      // Table header
      const colWidths = [70, 40, 25, 22, 22];
      const colLabels = ['Action', 'Responsable', 'Budget', 'Debut', 'Fin'];
      const tableX = margin;

      doc.setFillColor(...COLORS.primary);
      doc.rect(tableX, y, contentWidth, 7, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.white);

      let cx = tableX + 2;
      colLabels.forEach((label, i) => {
        doc.text(label, cx, y + 5);
        cx += colWidths[i];
      });
      y += 8;

      let rowIndex = 0;
      for (const item of actionItems) {
        for (const action of item.action_plan_measures) {
          const actionDesc = typeof action === 'string' ? action : (action.description || action.text || '');
          if (!actionDesc) continue;

          const wrappedDesc = doc.splitTextToSize(actionDesc, colWidths[0] - 4);
          const rowH = Math.max(wrappedDesc.length * 3.5 + 3, 8);

          checkPageBreak(rowH + 2);

          if (rowIndex % 2 === 0) {
            doc.setFillColor(...COLORS.lightBg);
            doc.rect(tableX, y, contentWidth, rowH, 'F');
          }

          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.black);

          cx = tableX + 2;
          doc.text(wrappedDesc, cx, y + 4);
          cx += colWidths[0];

          if (typeof action === 'object') {
            doc.text(action.responsible || '-', cx, y + 4);
            cx += colWidths[1];
            doc.text(action.budget || '-', cx, y + 4);
            cx += colWidths[2];
            doc.text(action.startDate || '-', cx, y + 4);
            cx += colWidths[3];
            doc.text(action.endDate || '-', cx, y + 4);
          } else {
            doc.text('-', cx, y + 4);
            cx += colWidths[1];
            doc.text('-', cx, y + 4);
            cx += colWidths[2];
            doc.text('-', cx, y + 4);
            cx += colWidths[3];
            doc.text('-', cx, y + 4);
          }

          doc.setDrawColor(...COLORS.lightGray);
          doc.setLineWidth(0.1);
          doc.line(tableX, y + rowH, tableX + contentWidth, y + rowH);

          y += rowH;
          rowIndex++;
        }
      }
      y += 6;
    }

    // === SIGNATURE SECTION ===
    checkPageBreak(40);

    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.black);
    doc.text(`Fait le ${currentDate}`, margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.text('Signature du responsable :', margin, y);
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin + 50, y + 1, margin + 120, y + 1);
    y += 15;

    doc.text('Signature du conseiller :', margin, y);
    doc.line(margin + 50, y + 1, margin + 120, y + 1);

    addFooter();

    // Upload PDF
    const pdfBlob = doc.output('blob');
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    const companySlug = clientInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_') || 'entreprise';
    const fileName = `Diagnostic_Final_${companySlug}_${Date.now()}.pdf`;
    const filePath = `${clientId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        client_id: parseInt(clientId),
        document_type: 'DIAGNOSTIC_FINAL',
        title: `${dateStr}-Diagnostic Final`,
        file_path: filePath,
        file_url: fileUrl
      });

    if (dbError) throw dbError;

    return fileUrl;
  } catch (error: any) {
    console.error('Error generating DUERP report PDF:', error);
    throw new Error(error?.message || 'Erreur lors de la generation du rapport PDF');
  }
};
