import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.7";
import { jsPDF } from "npm:jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendPaymentConfirmationRequest {
  clientId: number;
  employeeRange: string;
  invoiceUrl: string;
  certificateUrl: string;
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

  doc.setFillColor(245, 248, 255);
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

    const { clientId, employeeRange, invoiceUrl, certificateUrl }: SendPaymentConfirmationRequest = await req.json();

    console.log('📧 Envoi email confirmation paiement:', { clientId, employeeRange });

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !client) {
      throw new Error('Client non trouvé');
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('employee_range', employeeRange)
      .maybeSingle();

    if (productError || !product) {
      throw new Error('Produit non trouvé');
    }

    console.log('✅ Client et produit trouvés');

    const logoBase64 = await loadLogoFromSupabase(supabase);
    if (logoBase64) {
      console.log('✅ Logo chargé avec succès');
    }

    const priceHT = parseFloat(product.price);
    const priceTTC = priceHT * 1.20;
    const priceTVA = priceTTC - priceHT;

    const adresseComplete = [
      client.address,
      client.code_postal && client.ville ? `${client.code_postal} ${client.ville}` : client.ville || client.code_postal,
      client.pays
    ].filter(Boolean).join(', ');

    console.log('📄 Génération de la facture...');
    const factureData = {
      numero_facture: `F-${clientId}-${Date.now()}`,
      date_facture: new Date().toLocaleDateString('fr-FR'),
      client_nom: client.full_name || `${client.prenom} ${client.nom}`,
      client_societe: client.company_name || '',
      client_siret: client.siret || '',
      client_adresse: adresseComplete,
      montant_ht: priceHT.toFixed(2),
      montant_tva: priceTVA.toFixed(2),
      montant_ttc: priceTTC.toFixed(2),
      description_prestation: `Document Unique d\'Évaluation des Risques Professionnels (DUERP) - ${product.name}`
    };

    const facturePDF = await generateFacturePDF(factureData, logoBase64 || undefined);
    const factureFilename = 'PRISE_EN_CHARGE_DUERP.pdf';
    const factureFilePath = `${clientId}/${factureFilename}`;

    const facturePDFBlob = new Blob([facturePDF], { type: 'application/pdf' });
    const { error: factureUploadError } = await supabase.storage
      .from('documents')
      .upload(factureFilePath, facturePDFBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (factureUploadError) {
      console.error('❌ Erreur upload facture:', factureUploadError);
    } else {
      const { data: factureUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(factureFilePath);

      const now = new Date();
      const datePrefix = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

      await supabase.from('documents').insert({
        client_id: clientId,
        document_type: 'Facture',
        title: `${datePrefix} - Facture DUERP - ${product.name}`,
        file_path: factureFilePath,
        file_url: factureUrlData.publicUrl
      });

      console.log('✅ Facture sauvegardée dans les documents du client');
    }

    console.log('🏆 Génération de l\'attestation...');
    const attestationData = {
      numero_attestation: client.siret || `ATT-DUERP-${clientId}`,
      date_attestation: new Date().toLocaleDateString('fr-FR'),
      client_nom: client.full_name || `${client.prenom} ${client.nom}`,
      client_societe: client.company_name || '',
      client_siret: client.siret || '',
      client_adresse: adresseComplete,
      date_prise_en_charge: new Date().toLocaleDateString('fr-FR'),
      montant_prise_en_charge: `${priceHT.toFixed(2)} €`
    };

    const attestationPDF = await generateAttestationPDF(attestationData, logoBase64 || undefined);
    const attestationFilename = 'ATTESTATION_PRISE_EN_CHARGE_DUERP.pdf';
    const attestationFilePath = `${clientId}/${attestationFilename}`;

    const attestationPDFBlob = new Blob([attestationPDF], { type: 'application/pdf' });
    const { error: attestationUploadError } = await supabase.storage
      .from('documents')
      .upload(attestationFilePath, attestationPDFBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (attestationUploadError) {
      console.error('❌ Erreur upload attestation:', attestationUploadError);
    } else {
      const { data: attestationUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(attestationFilePath);

      const now = new Date();
      const datePrefix = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

      await supabase.from('documents').insert({
        client_id: clientId,
        document_type: 'Attestation',
        title: `${datePrefix} - Attestation de prise en charge DUERP - ${product.name}`,
        file_path: attestationFilePath,
        file_url: attestationUrlData.publicUrl
      });

      console.log('✅ Attestation sauvegardée dans les documents du client');
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'administration@securiteprofessionnelle.fr',
        pass: Deno.env.get('SMTP_PASSWORD') || ''
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    });

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .success-badge {
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .info-box {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box strong {
            color: #1e40af;
          }
          .document-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .document-section h2 {
            color: #1e40af;
            margin-top: 0;
            font-size: 18px;
          }
          .document-link {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 10px 10px 0;
            font-weight: 600;
          }
          .document-link:hover {
            background: #1e40af;
          }
          .next-steps {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .next-steps h3 {
            color: #92400e;
            margin-top: 0;
          }
          .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .next-steps li {
            margin: 8px 0;
            color: #78350f;
          }
          .footer {
            background: #f3f4f6;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
          .footer a {
            color: #2563eb;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Paiement confirmé</h1>
            <p style="margin: 10px 0 0 0;">Votre prise en charge DUERP est validée</p>
          </div>

          <div class="content">
            <div class="success-badge">
              Votre règlement a été traité avec succès
            </div>

            <p>Bonjour ${client.prenom || ''} ${client.nom || ''},</p>

            <p>Nous vous confirmons la bonne réception de votre paiement pour la prise en charge de votre <strong>Document Unique d'Évaluation des Risques Professionnels (DUERP)</strong>.</p>

            <div class="info-box">
              <strong>Prestation souscrite :</strong> ${product.name}<br>
              <strong>Nombre de salariés :</strong> ${employeeRange}<br>
              <strong>Montant HT :</strong> ${priceHT.toFixed(2)} €<br>
              <strong>Montant TTC :</strong> ${priceTTC.toFixed(2)} €
            </div>

            <div class="document-section">
              <h2>📄 Vos documents sont disponibles</h2>
              <p>Vous trouverez ci-joints :</p>
              <a href="${invoiceUrl}" class="document-link" target="_blank">📄 Télécharger la facture</a>
              <a href="${certificateUrl}" class="document-link" target="_blank">🏆 Télécharger l'attestation</a>
            </div>

            <div class="next-steps">
              <h3>📋 Prochaines étapes</h3>
              <ul>
                <li>Un conseiller vous contactera pour planifier un rendez-vous téléphonique</li>
                <li>Vous remplirez ensemble le rapport conforme avec notre expertise</li>
                <li>Vous recevrez ensuite le formulaire de remboursement</li>
                <li>Conservez votre attestation pour la présenter en cas de contrôle</li>
              </ul>
            </div>

            <p style="margin-top: 30px;">Pour toute question, notre équipe reste à votre disposition.</p>

            <p style="margin-bottom: 0;">Cordialement,<br><strong>L'équipe Cabinet FPE</strong></p>
          </div>

          <div class="footer">
            <p>
              <strong>Cabinet FPE - Sécurité Professionnelle</strong><br>
              <a href="mailto:administration@securiteprofessionnelle.fr">administration@securiteprofessionnelle.fr</a><br>
              <a href="https://www.securiteprofessionnelle.fr" target="_blank">www.securiteprofessionnelle.fr</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'Cabinet FPE',
        address: 'administration@securiteprofessionnelle.fr'
      },
      replyTo: 'administration@securiteprofessionnelle.fr',
      to: client.email,
      subject: `✓ Confirmation de paiement - Prise en charge DUERP - ${product.name}`,
      html: emailBody,
      headers: {
        'X-Mailer': 'Nodemailer',
        'X-Priority': '3',
        'Importance': 'high',
        'X-Entity-Ref-ID': `payment-${clientId}`,
        'Message-ID': `<payment-${Date.now()}.${clientId}@securiteprofessionnelle.fr>`
      }
    };

    console.log('📤 Envoi email à:', client.email);

    await transporter.sendMail(mailOptions);

    console.log('✅ Email envoyé avec succès');

    const { error: historyError } = await supabase
      .from('email_send_history')
      .insert({
        client_id: clientId,
        template_key: 'payment_confirmation',
        email_type: 'payment_confirmation',
        recipient_email: client.email,
        recipient_name: client.full_name || `${client.prenom} ${client.nom}`,
        subject: `Confirmation de paiement - ${product.name}`,
        body: emailBody,
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
        message: 'Email de confirmation envoyé avec succès',
        recipient: client.email
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
