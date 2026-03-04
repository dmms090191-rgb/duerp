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

  // Logo Cabinet FPE (base64 encoded)
  const logo = 'data:image/png;base64,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 KiokmTZrE+fPnmT59erMjto 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';

  try {
    doc.addImage(logo, 'PNG', 15, 10, 35, 12);
  } catch (e) {
    console.error('Error adding logo:', e);
  }

  // Header - Title FACTURE on the right
  doc.setFontSize(26);
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 195, 20, { align: 'right' });

  // Invoice info box
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° F-${Date.now().toString().slice(-10)}`, 195, 27, { align: 'right' });
  doc.text(`Date : ${data.date_facture}`, 195, 33, { align: 'right' });

  // Decorative blue line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.line(15, 40, 195, 40);

  // From section (Cabinet FPE)
  let yPos = 55;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('DE :', 15, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text('Cabinet FPE', 15, yPos + 6);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Sécurité Professionnelle', 15, yPos + 12);
  doc.text('administration@securiteprofessionnelle.fr', 15, yPos + 17);

  // Client info section with background
  yPos = 55;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(105, yPos - 8, 90, 33, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À :', 110, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(data.client_nom, 110, yPos + 6);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  if (data.client_societe) {
    doc.text(data.client_societe, 110, yPos + 12);
    doc.text(`SIRET : ${data.client_siret}`, 110, yPos + 17);
  } else {
    doc.text(`SIRET : ${data.client_siret}`, 110, yPos + 12);
  }

  // Table section
  yPos = 105;

  // Table header with gradient effect
  doc.setFillColor(37, 99, 235);
  doc.rect(15, yPos, 180, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 20, yPos + 6.5);
  doc.text('MONTANT HT', 175, yPos + 6.5, { align: 'right' });

  // Table content
  yPos += 10;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.1);

  const rowHeight = 30;
  doc.rect(15, yPos, 180, rowHeight, 'S');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const splitDescription = doc.splitTextToSize(data.description_prestation, 140);
  doc.text(splitDescription, 20, yPos + 8);

  doc.setFont('helvetica', 'bold');
  doc.text(`${data.montant_ht} €`, 175, yPos + rowHeight / 2 + 2, { align: 'right' });

  // Summary section with modern styling
  yPos += rowHeight + 15;

  // Light background for totals
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(120, yPos - 5, 75, 35, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');

  doc.text('Sous-total HT :', 125, yPos);
  doc.text(`${data.montant_ht} €`, 190, yPos, { align: 'right' });

  yPos += 8;
  doc.text('TVA (20%) :', 125, yPos);
  doc.text(`${data.montant_tva} €`, 190, yPos, { align: 'right' });

  // Total TTC - highlighted
  yPos += 12;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(125, yPos - 3, 190, yPos - 3);

  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TTC :', 125, yPos + 3);
  doc.text(`${data.montant_ttc} €`, 190, yPos + 3, { align: 'right' });

  // Payment note
  yPos += 20;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('Paiement par virement bancaire ou chèque.', 15, yPos);
  doc.text('TVA non applicable, art. 293 B du CGI.', 15, yPos + 5);

  // Footer with modern design
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 270, 195, 270);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Cabinet FPE - Sécurité Professionnelle', 105, 278, { align: 'center' });
  doc.text('administration@securiteprofessionnelle.fr', 105, 283, { align: 'center' });

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

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !client) {
      throw new Error('Client non trouvé');
    }

    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', emailType)
      .maybeSingle();

    if (templateError || !template) {
      throw new Error('Template email non trouvé');
    }

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
    };

    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(key, 'g'), value);
      body = body.replace(new RegExp(key, 'g'), value);
    }

    const { data: signature } = await supabase
      .from('email_signature')
      .select('signature_html')
      .eq('is_active', true)
      .maybeSingle();

    if (signature?.signature_html) {
      body = `${body}\n\n${signature.signature_html}`;
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

    if (generatePDFs && emailType === 'procedure_prise_en_charge') {
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
        numero_attestation: `ATT-DUERP-${client.id}-${Date.now()}`,
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
      const attestationFilename = `Attestation_DUERP_${(client.societe || client.full_name).replace(/[^a-zA-Z0-9]/g, '_')}_${client.id}.pdf`;

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

    await transporter.sendMail(mailOptions);

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
