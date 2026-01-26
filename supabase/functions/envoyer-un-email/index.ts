import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.7";
import { jsPDF } from "npm:jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  clientId: number;
  emailType: 'identifiants' | 'relance' | 'procedure_prise_en_charge';
  generatePDFs?: boolean;
}

function generateFacturePDF(data: any): Buffer {
  const doc = new jsPDF();

  const primaryColor = [37, 99, 235];
  const darkBlue = [30, 80, 200];
  const bgLight = [245, 248, 255];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 48, 'F');

  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.rect(0, 0, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('FACTURE - PRISE EN CHARGE', 105, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Document Unique d\'Évaluation des Risques Professionnels', 105, 27, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 220, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(85, 32, 90, 10, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`N° ${data.numero_facture} | ${data.date_facture}`, 130, 38, { align: 'center' });

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(15, 54, 180, 36, 3, 3, 'F');

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1.5);
  doc.line(15, 54, 15, 90);

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
    doc.text(data.client_societe, 60, currentY);
    currentY += 7;
  }

  doc.setFont(undefined, 'bold');
  doc.text('Adresse :', 22, currentY);
  doc.setFont(undefined, 'normal');
  doc.text(data.client_adresse || '', 60, currentY);

  if (data.client_siret) {
    currentY += 7;
    doc.setFont(undefined, 'bold');
    doc.text('SIRET :', 22, currentY);
    doc.setFont(undefined, 'normal');
    doc.text(data.client_siret, 60, currentY);
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

  return Buffer.from(doc.output('arraybuffer'));
}

function generateAttestationPDF(data: any): Buffer {
  const doc = new jsPDF();

  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, 210, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('ATTESTATION DE PRISE EN CHARGE', 105, 25, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Document Unique d\'Évaluation des Risques Professionnels', 105, 35, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`N° ${data.numero_attestation}`, 105, 43, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  doc.text('INFORMATIONS CLIENT', 20, 70);
  doc.setLineWidth(0.5);
  doc.line(20, 72, 190, 72);

  doc.setFontSize(10);
  const infoY = 82;
  doc.text('Nom :', 25, infoY);
  doc.text(data.client_nom, 70, infoY);

  if (data.client_societe) {
    doc.text('Société :', 25, infoY + 10);
    doc.text(data.client_societe, 70, infoY + 10);
  }

  if (data.client_siret) {
    doc.text('SIRET :', 25, infoY + 20);
    doc.text(data.client_siret, 70, infoY + 20);
  }

  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, 120, 170, 80, 3, 3, 'F');

  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(2);
  doc.line(20, 120, 20, 200);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const texte = [
    'Nous, Cabinet FPE, certifions par la présente que nous prenons en charge',
    'l\'élaboration du Document Unique d\'Évaluation des Risques Professionnels',
    '(DUERP) pour le client mentionné ci-dessus.',
    '',
    'Cette prise en charge est conforme à la réglementation en vigueur et',
    'respecte les obligations légales définies par le Code du Travail.',
    '',
    `Date de prise en charge : ${data.date_prise_en_charge}`,
    `Montant de la prestation : ${data.montant_prise_en_charge}`
  ];

  let yText = 130;
  texte.forEach(ligne => {
    doc.text(ligne, 30, yText);
    yText += 7;
  });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Fait à _____________________, le __________________', 30, 230);

  doc.text('Signature et cachet', 30, 250);
  doc.setLineWidth(0.5);
  doc.line(30, 255, 100, 255);

  doc.setFillColor(5, 150, 105);
  doc.rect(0, 280, 210, 17, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Cabinet FPE - Sécurité Professionnelle', 105, 287, { align: 'center' });
  doc.text('administration@securiteprofessionnelle.fr | www.securiteprofessionnelle.fr', 105, 293, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
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

    const { clientId, emailType, generatePDFs = false }: EmailRequest = await req.json();

    console.log('Requête reçue:', { clientId, emailType, generatePDFs });

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !client) {
      console.error('Erreur client:', clientError);
      throw new Error('Client non trouvé');
    }

    console.log('Client trouvé:', client.email);

    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', emailType)
      .maybeSingle();

    if (templateError || !template) {
      console.error('Erreur template:', templateError);
      throw new Error(`Template email non trouvé pour le type: ${emailType}`);
    }

    console.log('Template trouvé:', template.name);

    let subject = template.subject;
    let body = template.body;

    const replacements: Record<string, string> = {
      '{{prenom}}': client.prenom || '',
      '{{nom}}': client.nom || '',
      '{{email}}': client.email || '',
      '{{password}}': client.client_password || '',
      '{{societe}}': client.societe || client.full_name || '',
      '{{siret}}': client.siret || '',
      '{{full_name}}': client.full_name || `${client.prenom} ${client.nom}`,
      '{{numero_dossier}}': client.siret || '',
    };

    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(key, 'g'), value);
      body = body.replace(new RegExp(key, 'g'), value);
    }

    console.log('Connexion SMTP...');

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

    if (generatePDFs && emailType === 'procedure_prise_en_charge') {
      console.log('Génération des PDFs...');

      const factureData = {
        numero_facture: `F-${client.id}-${Date.now()}`,
        date_facture: new Date().toLocaleDateString('fr-FR'),
        client_nom: client.full_name || `${client.prenom} ${client.nom}`,
        client_societe: client.societe || '',
        client_siret: client.siret || '',
        client_adresse: client.adresse || '',
        montant_ht: '500.00',
        montant_tva: '100.00',
        montant_ttc: '600.00',
        description_prestation: 'Document Unique d\'Évaluation des Risques Professionnels (DUERP)'
      };

      const attestationData = {
        numero_attestation: client.siret || `ATT-DUERP-${client.id}`,
        date_attestation: new Date().toLocaleDateString('fr-FR'),
        client_nom: client.full_name || `${client.prenom} ${client.nom}`,
        client_societe: client.societe || '',
        client_siret: client.siret || '',
        client_adresse: client.adresse || '',
        date_prise_en_charge: new Date().toLocaleDateString('fr-FR'),
        montant_prise_en_charge: '600.00 €'
      };

      const facturePDF = generateFacturePDF(factureData);
      const attestationPDF = generateAttestationPDF(attestationData);

      const factureFilename = 'PRISE_EN_CHARGE_DUERP.pdf';
      const attestationFilename = 'ATTESTATION_PRISE_EN_CHARGE_DUERP.pdf';

      attachments.push(
        {
          filename: factureFilename,
          content: facturePDF,
          contentType: 'application/pdf'
        },
        {
          filename: attestationFilename,
          content: attestationPDF,
          contentType: 'application/pdf'
        }
      );

      attachmentsMeta.push(
        {
          filename: factureFilename,
          type: 'facture'
        },
        {
          filename: attestationFilename,
          type: 'attestation'
        }
      );

      console.log('PDFs générés');
    }

    const mailOptions = {
      from: {
        name: 'Cabinet FPE',
        address: 'administration@securiteprofessionnelle.fr'
      },
      to: client.email,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
      attachments: attachments
    };

    console.log('Envoi de l\'email à:', client.email);

    await transporter.sendMail(mailOptions);

    console.log('Email envoyé avec succès');

    const { error: historyError } = await supabase
      .from('email_send_history')
      .insert({
        client_id: clientId,
        email_type: emailType,
        recipient_email: client.email,
        recipient_name: client.full_name || `${client.prenom} ${client.nom}`,
        subject,
        body,
        attachments: JSON.stringify(attachmentsMeta),
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('Erreur lors de l\'enregistrement dans l\'historique:', historyError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email envoyé avec succès',
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
    console.error('Erreur:', error);

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
