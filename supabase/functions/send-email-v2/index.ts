import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.7";
import { jsPDF } from "npm:jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendEmailRequest {
  clientId: number;
  templateKey: string;
  emailOverride?: string;
  previewOnly?: boolean;
}

async function loadLogoFromSupabase(supabase: any): Promise<string | null> {
  try {
    const { data: config, error } = await supabase
      .from('pdf_configuration')
      .select('logo_url')
      .maybeSingle();

    if (error || !config || !config.logo_url) {
      console.log('⚠️ Aucun logo configuré');
      return null;
    }

    console.log('📥 Chargement du logo depuis:', config.logo_url);

    const response = await fetch(config.logo_url);
    if (!response.ok) {
      console.error('❌ Erreur chargement logo:', response.status);
      return null;
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('❌ Erreur loadLogoFromSupabase:', error);
    return null;
  }
}

async function generateFacturePDF(data: any, logoBase64?: string): Promise<Uint8Array> {
  const doc = new jsPDF();

  const primaryColor = [37, 99, 235];
  const darkBlue = [30, 80, 200];
  const darkGray = [31, 41, 55];
  const lightGray = [156, 163, 175];
  const bgLight = [245, 248, 255];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 48, 'F');

  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(0, 0, 210, 3, 'F');

  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 10, 40, 20, 3, 3, 'F');
      doc.addImage(logoBase64, 'PNG', 14, 12, 36, 16);
    } catch (error) {
      console.error('Erreur ajout logo:', error);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('FACTURE - PRISE EN CHARGE', 125, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Document Unique d\'Évaluation des Risques Professionnels', 125, 27, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 220, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(85, 32, 90, 10, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`N° ${data.numero_facture} | ${data.date_facture}`, 130, 38, { align: 'center' });

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(15, 54, 180, 40, 3, 3, 'F');

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1.5);
  doc.line(15, 54, 15, 94);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMATIONS CLIENT', 22, 62);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  const infoY = 70;

  doc.setFont(undefined, 'bold');
  doc.text('Nom :', 22, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(data.client_nom, 60, infoY);

  let currentY = infoY + 7;

  if (data.client_societe) {
    doc.setFont(undefined, 'bold');
    doc.text('Société :', 22, currentY);
    doc.setFont(undefined, 'normal');
    const societeLines = doc.splitTextToSize(data.client_societe, 130);
    doc.text(societeLines, 60, currentY);
    currentY += 7;
  }

  doc.setFont(undefined, 'bold');
  doc.text('Adresse :', 22, currentY);
  doc.setFont(undefined, 'normal');
  const adresseLines = doc.splitTextToSize(data.client_adresse || '', 130);
  doc.text(adresseLines, 60, currentY);

  if (data.client_siret) {
    currentY += 7;
    doc.setFont(undefined, 'bold');
    doc.text('SIRET :', 22, currentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(data.client_siret, 60, currentY);
    doc.setFontSize(9);
  }

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(15, 98, 180, 58, 3, 3, 'FD');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(15, 98, 180, 12, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION DE LA PRESTATION', 105, 106, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DUERP Numérique Article R4121-1', 22, 118);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const prestations = [
    'Rapport diagnostic conforme',
    'Accès à votre portail numérique',
    'Élaboration du document unique',
    'Suivi juridique en cas de contrôle',
    'Attestation de conformité DUERP'
  ];

  let yPrestation = 126;
  prestations.forEach(prestation => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.circle(24, yPrestation - 1.5, 1.5, 'F');
    doc.text(prestation, 30, yPrestation);
    yPrestation += 7;
  });

  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(200, 220, 255);
  doc.setLineWidth(1);
  doc.roundedRect(15, 164, 180, 46, 3, 3, 'FD');

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(2.5);
  doc.line(15, 164, 15, 210);

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, 'normal');

  const summaryY = 172;

  doc.text('Montant HT', 22, summaryY);
  doc.setFont(undefined, 'bold');
  doc.text(`${data.montant_ht} €`, 180, summaryY, { align: 'right' });

  doc.setFont(undefined, 'normal');
  doc.text('TVA (20%)', 22, summaryY + 10);
  doc.setFont(undefined, 'bold');
  doc.text(`${data.montant_tva} €`, 180, summaryY + 10, { align: 'right' });

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(22, summaryY + 15, 185, summaryY + 15);

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(22, summaryY + 20, 163, 14, 3, 3, 'F');

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC', 28, summaryY + 29);
  doc.setFontSize(15);
  doc.text(`${data.montant_ttc} €`, 180, summaryY + 29, { align: 'right' });

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(60, 218, 90, 18, 3, 3, 'FD');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.circle(70, 227, 5, 'F');

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.setLineCap('round');
  doc.setLineJoin('round');
  doc.line(67.5, 227, 69, 229);
  doc.line(69, 229, 73, 224.5);

  doc.setFontSize(7.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Document signé électroniquement', 105, 225, { align: 'center' });

  doc.setFontSize(6);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Cabinet FPE - ${currentDate} à ${currentTime}`, 105, 231, { align: 'center' });

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 258, 210, 39, 'F');

  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.setLineWidth(3);
  doc.line(0, 258, 210, 258);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Cabinet FPE - Sécurité Professionnelle', 105, 270, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont(undefined, 'normal');
  doc.text('administration@securiteprofessionnelle.fr', 105, 278, { align: 'center' });
  doc.text('www.securiteprofessionnelle.fr', 105, 285, { align: 'center' });

  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateAttestationPDF(data: any, logoBase64?: string): Promise<Uint8Array> {
  const doc = new jsPDF();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 48, 'F');

  doc.setFillColor(30, 80, 200);
  doc.rect(0, 0, 210, 3, 'F');

  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 10, 40, 20, 3, 3, 'F');

      doc.addImage(logoBase64, 'PNG', 14, 12, 36, 16);
    } catch (error) {
      console.error('Erreur ajout logo:', error);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('ATTESTATION DE PRISE EN CHARGE', 125, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Document Unique d\'Évaluation des Risques Professionnels', 125, 27, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 220, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(85, 32, 90, 10, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`N° ${data.numero_attestation}`, 130, 38, { align: 'center' });

  doc.setFillColor(245, 248, 255);
  doc.roundedRect(15, 54, 180, 40, 3, 3, 'F');

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.5);
  doc.line(15, 54, 15, 94);

  doc.setTextColor(37, 99, 235);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMATIONS CLIENT', 22, 62);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  const infoY = 70;

  doc.setFont(undefined, 'bold');
  doc.text('Nom :', 22, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(data.client_nom, 60, infoY);

  let currentY = infoY + 7;

  if (data.client_societe) {
    doc.setFont(undefined, 'bold');
    doc.text('Société :', 22, currentY);
    doc.setFont(undefined, 'normal');
    const societeLines = doc.splitTextToSize(data.client_societe, 130);
    doc.text(societeLines, 60, currentY);
    currentY += 7;
  }

  doc.setFont(undefined, 'bold');
  doc.text('Adresse :', 22, currentY);
  doc.setFont(undefined, 'normal');
  const adresseLines = doc.splitTextToSize(data.client_adresse || '', 130);
  doc.text(adresseLines, 60, currentY);

  if (data.client_siret) {
    currentY += 7;
    doc.setFont(undefined, 'bold');
    doc.text('SIRET :', 22, currentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(data.client_siret, 60, currentY);
    doc.setFontSize(9);
  }

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.roundedRect(15, 98, 180, 58, 3, 3, 'FD');

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(15, 98, 180, 12, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION DE LA PRESTATION', 105, 106, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('DUERP Numérique Article R4121-1', 22, 118);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const prestations = [
    'Rapport diagnostic conforme',
    'Accès à votre portail numérique',
    'Élaboration du document unique',
    'Suivi juridique en cas de contrôle',
    'Attestation de conformité DUERP'
  ];

  let yPrestation = 126;
  prestations.forEach(prestation => {
    doc.setFillColor(37, 99, 235);
    doc.circle(24, yPrestation - 1.5, 1.5, 'F');
    doc.text(prestation, 30, yPrestation);
    yPrestation += 7;
  });

  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(200, 220, 255);
  doc.setLineWidth(1);
  doc.roundedRect(15, 164, 180, 62, 3, 3, 'FD');

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2.5);
  doc.line(15, 164, 15, 226);

  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, 'normal');

  const texteParagraphe1 = `Nous, soussignés, Cabinet FPE (Formalités des Particuliers et des Entreprises), attestons par la présente avoir enregistré ce jour votre dossier N° ${data.numero_attestation} relatif aux formalités liées au Document Unique d'Évaluation des Risques Professionnels (DUERP). Ce document permet à votre entreprise de se conformer aux exigences du Code du travail, dans son article R4121-1`;

  const lignesParagraphe1 = doc.splitTextToSize(texteParagraphe1, 168);
  let yText = 171;
  lignesParagraphe1.forEach(ligne => {
    doc.text(ligne, 22, yText);
    yText += 4.2;
  });

  yText += 1.5;
  doc.setFont(undefined, 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Nos experts prennent en charge votre dossier en cas de contrôle :', 22, yText);
  yText += 5.5;

  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 30, 30);
  const organismes = [
    'L\'inspection du travail',
    'La médecine du travail (en cas d\'accident de travail)',
    'Le conseil de prud\'hommes (en cas de litige entre le salarié et son employeur)'
  ];

  organismes.forEach(organisme => {
    doc.setFillColor(37, 99, 235);
    doc.circle(24, yText - 1.5, 1.2, 'F');
    doc.text(organisme, 28, yText);
    yText += 4.8;
  });

  yText += 1;
  doc.setFont(undefined, 'italic');
  doc.setTextColor(60, 60, 60);
  const texteContact = 'Pour toute information complémentaire, vous pouvez joindre votre conseiller référent au service général.';
  const lignesContact = doc.splitTextToSize(texteContact, 168);
  lignesContact.forEach(ligne => {
    doc.text(ligne, 22, yText);
    yText += 4.2;
  });

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.roundedRect(60, 232, 90, 18, 3, 3, 'FD');

  doc.setFillColor(37, 99, 235);
  doc.circle(70, 241, 5, 'F');

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.setLineCap('round');
  doc.setLineJoin('round');
  doc.line(67.5, 241, 69, 243);
  doc.line(69, 243, 73, 238.5);

  doc.setFontSize(7.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Document signé électroniquement', 105, 239, { align: 'center' });

  doc.setFontSize(6);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Cabinet FPE - ${currentDate} à ${currentTime}`, 105, 245, { align: 'center' });

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 258, 210, 39, 'F');

  doc.setDrawColor(30, 80, 200);
  doc.setLineWidth(3);
  doc.line(0, 258, 210, 258);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Cabinet FPE - Sécurité Professionnelle', 105, 270, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont(undefined, 'normal');
  doc.text('administration@securiteprofessionnelle.fr', 105, 278, { align: 'center' });
  doc.text('www.securiteprofessionnelle.fr', 105, 285, { align: 'center' });

  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateModalitesPaiementPDF(data: any, logoBase64?: string): Promise<Uint8Array> {
  const doc = new jsPDF();

  const primaryColor = [37, 99, 235];
  const darkBlue = [30, 80, 200];
  const accentGreen = [16, 185, 129];
  const lightBlue = [239, 246, 255];
  const darkGray = [31, 41, 55];

  // En-tête moderne avec dégradé
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 50, 'F');

  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(0, 0, 210, 3, 'F');

  // Logo avec design moderne
  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 10, 40, 20, 3, 3, 'F');
      doc.addImage(logoBase64, 'PNG', 14, 12, 36, 16);
    } catch (error) {
      console.error('Erreur ajout logo:', error);
    }
  }

  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('MODALITÉS DE PAIEMENT', 125, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Procédure de prise en charge N° 4272', 125, 28, { align: 'center' });

  // Encadré date avec design moderne
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 220, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(70, 35, 70, 10, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Date : ${data.date_prise_en_charge}`, 105, 41, { align: 'center' });

  let yPos = 58;

  // Encadré informations client avec design moderne
  doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(15, yPos, 180, 22, 3, 3, 'FD');

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(2);
  doc.line(15, yPos, 15, yPos + 22);

  yPos += 8;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Société :', 22, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(data.client_societe, 45, yPos);

  yPos += 7;
  doc.setFont(undefined, 'bold');
  doc.text('Dossier DUERP :', 22, yPos);
  doc.setFont(undefined, 'normal');
  doc.text('N° 4272', 55, yPos);

  // Badge montant avec design moderne
  doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.roundedRect(145, 63, 43, 12, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('996.00 € TTC', 166.5, 70.5, { align: 'center' });

  yPos = 90;

  // Section introduction avec design amélioré
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(15, yPos, 180, 30, 3, 3, 'F');

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos, 180, 30, 3, 3, 'D');

  yPos += 7;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const texte1 = 'Dès réception de votre règlement, vous recevrez votre attestation de prise en charge, qui devra être présentée lors d\'un contrôle effectué par les organismes suivants :';
  const lignes1 = doc.splitTextToSize(texte1, 168);
  lignes1.forEach(ligne => {
    doc.text(ligne, 22, yPos);
    yPos += 5;
  });

  yPos += 2;
  doc.setFontSize(9);
  const organismes = [
    'L\'inspection du travail (en cas de contrôle)',
    'La médecine du travail (en cas d\'accident du travail)',
    'Le conseil de prud\'hommes (en cas de litige entre le salarié et son employeur)'
  ];

  organismes.forEach(org => {
    doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.circle(24, yPos - 1.5, 1.2, 'F');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(org, 28, yPos);
    yPos += 5;
  });

  yPos = 130;

  // Titre section modalités avec design moderne
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(15, yPos, 180, 10, 2, 2, 'F');

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MODALITÉS DE RÈGLEMENT', 105, yPos + 7, { align: 'center' });

  yPos += 15;

  // 1. Virement bancaire - Encadré moderne
  doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(15, yPos, 180, 38, 3, 3, 'FD');

  // Icône virement
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(20, yPos + 5, 8, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('€', 24, yPos + 10.5, { align: 'center' });

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Virement bancaire', 32, yPos + 10);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  yPos += 17;
  doc.setFont(undefined, 'bold');
  doc.text('Bénéficiaire :', 22, yPos);
  doc.setFont(undefined, 'normal');
  doc.text('Cabinet FPE', 52, yPos);

  yPos += 5.5;
  doc.setFont(undefined, 'bold');
  doc.text('Banque :', 22, yPos);
  doc.setFont(undefined, 'normal');
  doc.text('Société Générale', 42, yPos);

  yPos += 5.5;
  doc.setFont(undefined, 'bold');
  doc.text('IBAN :', 22, yPos);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8.5);
  doc.text('FR76 3000 3034 5100 0201 4014 377', 37, yPos);
  doc.setFontSize(9);

  yPos += 5.5;
  doc.setFont(undefined, 'bold');
  doc.text('BIC :', 22, yPos);
  doc.setFont(undefined, 'normal');
  doc.text('SOGEFRPP', 34, yPos);

  yPos += 9;

  // 2. Chèque - Encadré moderne
  doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(15, yPos, 180, 26, 3, 3, 'FD');

  // Icône chèque
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(20, yPos + 5, 8, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('✓', 24, yPos + 11, { align: 'center' });

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Chèque', 32, yPos + 10);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  yPos += 16;
  doc.text('À l\'ordre de : Cabinet FPE', 22, yPos);

  yPos += 5;
  doc.setFont(undefined, 'italic');
  doc.setFontSize(8);
  doc.text('91 Rue du Faubourg Saint-Honoré, 75008 Paris', 22, yPos);

  yPos += 8;

  // 3. Carte bancaire - Encadré moderne avec mise en valeur
  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(15, yPos, 180, 32, 3, 3, 'FD');

  // Badge "3x sans frais"
  doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.roundedRect(160, yPos + 6, 28, 8, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('3x SANS FRAIS', 174, yPos + 11, { align: 'center' });

  // Icône carte
  doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.roundedRect(20, yPos + 5, 8, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('%', 24, yPos + 11, { align: 'center' });

  doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Carte bancaire', 32, yPos + 10);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  yPos += 16;
  doc.text('Rendez-vous sur votre portail numérique :', 22, yPos);

  yPos += 5;
  doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.textWithLink('www.securiteprofessionnelle.fr', 22, yPos, { url: 'https://www.securiteprofessionnelle.fr/' });

  yPos += 5;
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('(Rubrique "Règlement de prise en charge")', 22, yPos);

  yPos += 9;

  // Note de contact avec design moderne
  doc.setFillColor(255, 250, 240);
  doc.setDrawColor(255, 200, 100);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos, 180, 12, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(100, 80, 50);
  const texteContact = 'Pour toute information complémentaire, vous pouvez joindre votre conseiller référent au service général.';
  const lignesContact = doc.splitTextToSize(texteContact, 168);
  let contactY = yPos + 5;
  lignesContact.forEach(ligne => {
    doc.text(ligne, 22, contactY);
    contactY += 4;
  });

  // Pied de page moderne
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 280, 210, 17, 'F');

  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.setLineWidth(2);
  doc.line(0, 280, 210, 280);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Cabinet FPE - Sécurité Professionnelle', 105, 287, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('administration@securiteprofessionnelle.fr  •  www.securiteprofessionnelle.fr', 105, 293, { align: 'center' });

  return new Uint8Array(doc.output('arraybuffer'));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { clientId, templateKey, emailOverride, previewOnly }: SendEmailRequest = await req.json();

    console.log(previewOnly ? '👁️ Génération aperçu:' : '📧 Envoi email:', { clientId, templateKey, emailOverride, previewOnly });

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !client) {
      throw new Error('Client non trouvé');
    }

    console.log('✅ Client trouvé:', client.email);

    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('key', templateKey)
      .maybeSingle();

    if (templateError || !template) {
      throw new Error(`Template non trouvé pour la clé: ${templateKey}`);
    }

    console.log('✅ Template trouvé:', template.name);

    const { data: pdfLinks, error: pdfLinksError } = await supabase
      .from('email_template_pdfs')
      .select(`
        pdf_template_id,
        display_order,
        pdf_templates (*)
      `)
      .eq('email_template_id', template.id)
      .order('display_order', { ascending: true });

    if (pdfLinksError) {
      console.error('Erreur chargement PDFs:', pdfLinksError);
    }

    console.log('📎 PDFs à attacher:', pdfLinks?.length || 0);

    let subject = template.subject;
    let body = template.body_html || template.body;

    const replacements: Record<string, string> = {
      '{{prenom}}': client.prenom || '',
      '{{nom}}': client.nom || '',
      '{{email}}': client.email || '',
      '{{password}}': client.client_password || '',
      '{{client_password}}': client.client_password || '',
      '{{societe}}': client.company_name || client.full_name || '',
      '{{siret}}': client.siret || '',
      '{{adresse}}': client.address || '',
      '{{full_name}}': client.full_name || `${client.prenom} ${client.nom}`,
      '{{numero_dossier}}': client.siret || '',
    };

    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(key, 'g'), value);
      body = body.replace(new RegExp(key, 'g'), value);
    }

    const { data: signature, error: signatureError } = await supabase
      .from('email_signature')
      .select('signature_html')
      .eq('is_active', true)
      .maybeSingle();

    if (signature && signature.signature_html) {
      console.log('✅ Signature trouvée, ajout au bas de l\'email');
      body = body + '\n\n' + signature.signature_html;
    } else {
      console.log('⚠️ Aucune signature active trouvée');
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'administration@securiteprofessionnelle.fr',
        pass: Deno.env.get('SMTP_PASSWORD') || ''
      }
    });

    const attachments: any[] = [];
    const attachmentsMeta: any[] = [];

    const logoBase64 = await loadLogoFromSupabase(supabase);
    if (logoBase64) {
      console.log('✅ Logo chargé avec succès');
    }

    if (pdfLinks && pdfLinks.length > 0) {
      for (const link of pdfLinks) {
        const pdfTemplate = link.pdf_templates;

        if (pdfTemplate.pdf_type === 'dynamic' && pdfTemplate.dynamic_type) {
          console.log('🔄 Génération PDF dynamique:', pdfTemplate.dynamic_type);

          if (pdfTemplate.dynamic_type === 'facture') {
            const adresseComplete = [
              client.address,
              client.code_postal && client.ville ? `${client.code_postal} ${client.ville}` : client.ville || client.code_postal,
              client.pays
            ].filter(Boolean).join(', ');

            const factureData = {
              numero_facture: `F-${client.id}-${Date.now()}`,
              date_facture: new Date().toLocaleDateString('fr-FR'),
              client_nom: client.full_name || `${client.prenom} ${client.nom}`,
              client_societe: client.company_name || '',
              client_siret: client.siret || '',
              client_adresse: adresseComplete,
              montant_ht: '830.00',
              montant_tva: '166.00',
              montant_ttc: '996.00',
              description_prestation: 'Document Unique d\'Évaluation des Risques Professionnels (DUERP)'
            };

            const facturePDF = await generateFacturePDF(factureData, logoBase64 || undefined);
            const filename = 'PRISE_EN_CHARGE_DUERP.pdf';

            attachments.push({
              filename,
              content: facturePDF,
              contentType: 'application/pdf'
            });

            attachmentsMeta.push({ filename, type: 'facture' });

            const filePath = `${clientId}/${filename}`;
            const pdfBlob = new Blob([facturePDF], { type: 'application/pdf' });

            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
              });

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

              const now = new Date();
              const datePrefix = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

              await supabase.from('documents').insert({
                client_id: clientId,
                document_type: 'Facture',
                title: `${datePrefix} - Facture DUERP`,
                file_path: filePath,
                file_url: urlData.publicUrl
              });

              console.log('✅ Facture sauvegardée dans les documents du client');
            }

          } else if (pdfTemplate.dynamic_type === 'attestation') {
            const adresseComplete = [
              client.address,
              client.code_postal && client.ville ? `${client.code_postal} ${client.ville}` : client.ville || client.code_postal,
              client.pays
            ].filter(Boolean).join(', ');

            const attestationData = {
              numero_attestation: client.siret || `ATT-DUERP-${client.id}`,
              date_attestation: new Date().toLocaleDateString('fr-FR'),
              client_nom: client.full_name || `${client.prenom} ${client.nom}`,
              client_societe: client.company_name || '',
              client_siret: client.siret || '',
              client_adresse: adresseComplete,
              date_prise_en_charge: new Date().toLocaleDateString('fr-FR'),
              montant_prise_en_charge: '600.00 €'
            };

            const attestationPDF = await generateAttestationPDF(attestationData, logoBase64 || undefined);
            const filename = 'ATTESTATION_PRISE_EN_CHARGE_DUERP.pdf';

            attachments.push({
              filename,
              content: attestationPDF,
              contentType: 'application/pdf'
            });

            attachmentsMeta.push({ filename, type: 'attestation' });

            const filePath = `${clientId}/${filename}`;
            const pdfBlob = new Blob([attestationPDF], { type: 'application/pdf' });

            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
              });

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

              const now = new Date();
              const datePrefix = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

              await supabase.from('documents').insert({
                client_id: clientId,
                document_type: 'Attestation',
                title: `${datePrefix} - Attestation de prise en charge DUERP`,
                file_path: filePath,
                file_url: urlData.publicUrl
              });

              console.log('✅ Attestation sauvegardée dans les documents du client');
            }

          } else if (pdfTemplate.dynamic_type === 'modalites_paiement') {
            const modalitesPaiementData = {
              client_societe: client.company_name || client.full_name || `${client.prenom} ${client.nom}`,
              date_prise_en_charge: new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            };

            const modalitesPDF = await generateModalitesPaiementPDF(modalitesPaiementData, logoBase64 || undefined);
            const filename = 'MODALITES_PAIEMENT_DUERP.pdf';

            attachments.push({
              filename,
              content: modalitesPDF,
              contentType: 'application/pdf'
            });

            attachmentsMeta.push({ filename, type: 'modalites_paiement' });

            const filePath = `${clientId}/${filename}`;
            const pdfBlob = new Blob([modalitesPDF], { type: 'application/pdf' });

            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
              });

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

              const now = new Date();
              const datePrefix = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

              await supabase.from('documents').insert({
                client_id: clientId,
                document_type: 'Modalités de paiement',
                title: `${datePrefix} - Modalités de paiement DUERP`,
                file_path: filePath,
                file_url: urlData.publicUrl
              });

              console.log('✅ Modalités de paiement sauvegardées dans les documents du client');
            }
          }
        } else if (pdfTemplate.pdf_type === 'static' && pdfTemplate.file_url) {
          console.log('📄 Ajout PDF statique:', pdfTemplate.file_url);
        }
      }
    }

    if (previewOnly) {
      console.log('👁️ Mode aperçu - récupération des URLs des PDFs');

      const pdfUrls: string[] = [];
      const { data: documents } = await supabase
        .from('documents')
        .select('file_url')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(attachmentsMeta.length);

      if (documents) {
        pdfUrls.push(...documents.map(doc => doc.file_url));
      }

      console.log('✅ Aperçu généré avec', pdfUrls.length, 'PDF(s)');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Aperçu généré avec succès',
          pdfUrls,
          attachmentsCount: attachments.length
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const recipientEmail = emailOverride || client.email;

    const mailOptions = {
      from: {
        name: 'Cabinet FPE',
        address: 'administration@securiteprofessionnelle.fr'
      },
      to: recipientEmail,
      subject: subject,
      text: body.replace(/<[^>]*>/g, ''),
      html: body,
      attachments: attachments
    };

    console.log('📤 Envoi email à:', recipientEmail);

    await transporter.sendMail(mailOptions);

    console.log('✅ Email envoyé avec succès');

    const { error: historyError } = await supabase
      .from('email_send_history')
      .insert({
        client_id: clientId,
        template_key: templateKey,
        email_type: templateKey,
        recipient_email: recipientEmail,
        recipient_name: client.full_name || `${client.prenom} ${client.nom}`,
        subject,
        body,
        attachments: JSON.stringify(attachmentsMeta),
        status: 'sent',
        sent_at: new Date().toISOString(),
        retry_count: 0
      });

    if (historyError) {
      console.error('⚠️ Erreur historique:', historyError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email envoyé avec succès',
        recipient: recipientEmail,
        attachmentsCount: attachments.length
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('❌ Erreur:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
