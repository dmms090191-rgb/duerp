import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';

interface InvoiceItem {
  description: string;
  details: string[];
  unitPrice: number;
  quantity: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  clientId?: number;
  clientName: string;
  clientCompany: string;
  clientSiret: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

const loadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    throw error;
  }
};

const createRoundedImage = async (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          const cornerRadius = 50;

          ctx.beginPath();
          ctx.moveTo(cornerRadius, 0);
          ctx.lineTo(img.width - cornerRadius, 0);
          ctx.quadraticCurveTo(img.width, 0, img.width, cornerRadius);
          ctx.lineTo(img.width, img.height - cornerRadius);
          ctx.quadraticCurveTo(img.width, img.height, img.width - cornerRadius, img.height);
          ctx.lineTo(cornerRadius, img.height);
          ctx.quadraticCurveTo(0, img.height, 0, img.height - cornerRadius);
          ctx.lineTo(0, cornerRadius);
          ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(img, 0, 0);
        }

        const roundedImageData = canvas.toDataURL('image/png');
        resolve(roundedImageData);
      };
      img.onerror = () => reject(new Error('Failed to load image for rounding'));
      img.src = imageData;
    } catch (error) {
      reject(error);
    }
  });
};

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<string | null> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const primaryColor = [37, 99, 235];
    const darkGray = [31, 41, 55];
    const lightGray = [156, 163, 175];
    const bgLight = [249, 250, 251];

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 15, 180, 267, 3, 3, 'F');

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 70, 'F');

    let logoLoaded = false;
    try {
      const { data: pdfConfig, error: configError } = await supabase
        .from('pdf_configuration')
        .select('logo_url')
        .maybeSingle();

      if (!configError && pdfConfig?.logo_url) {
        const logoBase64 = await loadImageAsBase64(pdfConfig.logo_url);
        const roundedLogo = await createRoundedImage(logoBase64);

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(70, 15, 70, 32, 3, 3, 'F');

        doc.addImage(roundedLogo, 'PNG', 80, 20, 50, 22);
        logoLoaded = true;
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    if (!logoLoaded) {
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('Cabinet FPE', 105, 35, { align: 'center' });
    }

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('Sécurité Professionnelle', 105, 58, { align: 'center' });

    let yPosition = 80;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(130, yPosition, 60, 25, 2, 2, 'F');

    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 160, yPosition + 10, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`N° ${invoiceData.invoiceNumber}`, 160, yPosition + 16, { align: 'center' });
    doc.text(`Date : ${invoiceData.invoiceDate}`, 160, yPosition + 21, { align: 'center' });

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(25, yPosition, 100, 50, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', 30, yPosition + 10);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    let yClient = yPosition + 18;
    doc.text(invoiceData.clientName, 30, yClient);
    yClient += 6;

    if (invoiceData.clientCompany) {
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setFontSize(8.5);
      const companyText = doc.splitTextToSize(invoiceData.clientCompany, 92);
      doc.text(companyText, 30, yClient);
      yClient += 5;
    }

    doc.setFontSize(8);
    doc.text(`SIRET: ${invoiceData.clientSiret}`, 30, yClient);
    yClient += 5;
    const addressText = doc.splitTextToSize(invoiceData.clientAddress, 92);
    doc.text(addressText, 30, yClient);
    yClient += 5;
    doc.text(`${invoiceData.clientPostalCode} ${invoiceData.clientCity}`, 30, yClient);

    yPosition += 60;

    // Table
    const tableStartY = yPosition;
    const colWidths = {
      designation: 100,
      unitPrice: 28,
      quantity: 28,
      total: 29
    };

    // Draw table header with modern styling
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.3);

    let xPos = 25;
    const tableWidth = colWidths.designation + colWidths.unitPrice + colWidths.quantity + colWidths.total;

    // Header row with rounded corners
    doc.roundedRect(xPos, yPosition, tableWidth, 10, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Désignation', xPos + 2, yPosition + 6.5);
    doc.text('Prix Unit. HT', xPos + colWidths.designation + 2, yPosition + 6.5);
    doc.text('Qté', xPos + colWidths.designation + colWidths.unitPrice + 2, yPosition + 6.5);
    doc.text('Total HT', xPos + colWidths.designation + colWidths.unitPrice + colWidths.quantity + 2, yPosition + 6.5);

    yPosition += 10;

    // Draw table rows with content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    invoiceData.items.forEach((item) => {
      const startY = yPosition;

      // Calculate height needed for this row
      const descLines = [item.description, ...item.details.map(d => `• ${d}`)];
      const rowHeight = Math.max(20, descLines.length * 5 + 10);

      // Draw row borders with light styling
      xPos = 25;
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.2);
      doc.setFillColor(255, 255, 255);
      doc.rect(xPos, yPosition, tableWidth, rowHeight, 'FD');

      // Add content - Description in bold
      let textY = yPosition + 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(item.description, xPos + 2, textY);

      textY += 6;

      // Add bullet points
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      item.details.forEach(detail => {
        // Draw small circle as bullet
        doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.circle(xPos + 5, textY - 1, 0.8, 'F');
        doc.text(detail, xPos + 8, textY);
        textY += 5;
      });

      // Unit Price - centered vertically
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const priceText = `${item.unitPrice.toFixed(2)} EUR`;
      const priceY = yPosition + rowHeight / 2 + 2;
      doc.text(priceText, xPos + colWidths.designation + 2, priceY);

      // Quantity - centered
      doc.text(item.quantity.toString(), xPos + colWidths.designation + colWidths.unitPrice + 12, priceY);

      // Total - right aligned
      const totalText = `${item.total.toFixed(2)} EUR`;
      const totalX = xPos + colWidths.designation + colWidths.unitPrice + colWidths.quantity + colWidths.total - doc.getTextWidth(totalText) - 2;
      doc.text(totalText, totalX, priceY);

      yPosition += rowHeight;
    });

    yPosition += 5;

    // Summary section with modern design
    xPos = 25;
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(xPos + 70, yPosition, 90, 45, 2, 2, 'F');

    const summaryX = xPos + 80;
    const summaryY = yPosition + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    doc.text('Total HT', summaryX, summaryY);
    doc.text(`${invoiceData.subtotal.toFixed(2)} EUR`, summaryX + 70, summaryY, { align: 'right' });

    doc.text(`TVA (${invoiceData.vatRate}%)`, summaryX, summaryY + 10);
    doc.text(`${invoiceData.vatAmount.toFixed(2)} EUR`, summaryX + 70, summaryY + 10, { align: 'right' });

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.line(summaryX, summaryY + 15, summaryX + 70, summaryY + 15);

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(summaryX - 5, summaryY + 18, 80, 12, 2, 2, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL TTC', summaryX, summaryY + 26);
    doc.setFontSize(14);
    doc.text(`${invoiceData.total.toFixed(2)} EUR`, summaryX + 70, summaryY + 26, { align: 'right' });

    // Footer with modern design
    doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.rect(0, 270, 210, 27, 'F');

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Cabinet FPE - Sécurité Professionnelle', 105, 280, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('administration@securiteprofessionnelle.fr', 105, 286, { align: 'center' });
    doc.text('www.securiteprofessionnelle.fr', 105, 291, { align: 'center' });

    // Convert PDF to blob
    const pdfBlob = doc.output('blob');

    // Upload to Supabase Storage
    const fileName = `Facture_${invoiceData.invoiceNumber}_${Date.now()}.pdf`;
    const filePath = `invoices/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading invoice PDF:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save invoice to database
    const { error: dbError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceData.invoiceNumber,
        invoice_date: invoiceData.invoiceDate,
        client_id: invoiceData.clientId,
        client_name: invoiceData.clientName,
        client_company: invoiceData.clientCompany,
        client_siret: invoiceData.clientSiret,
        client_address: invoiceData.clientAddress,
        client_postal_code: invoiceData.clientPostalCode,
        client_city: invoiceData.clientCity,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        vat_rate: invoiceData.vatRate,
        vat_amount: invoiceData.vatAmount,
        total: invoiceData.total,
        pdf_url: fileUrl
      });

    if (dbError) {
      console.error('Error saving invoice:', dbError);
      throw dbError;
    }

    return fileUrl;
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    throw new Error(error?.message || 'Erreur lors de la génération de la facture');
  }
};

export const getAllInvoices = async () => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};

export const getClientInvoices = async (clientId: number) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching client invoices:', error);
    return [];
  }
};

export const deleteInvoice = async (invoiceId: string, pdfUrl: string): Promise<boolean> => {
  try {
    const urlParts = pdfUrl.split('/documents/');
    if (urlParts.length < 2) {
      throw new Error('Invalid PDF URL');
    }
    const filePath = urlParts[1];

    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting invoice file:', storageError);
    }

    const { error: dbError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
};

export const generateConformityCertificatePDF = async (
  clientData: {
    id: number;
    nom_societe: string;
    nom_prenom_gerant: string;
    siret_siren: string;
    adresse: string;
    code_postal: string;
    ville: string;
  },
  productData: {
    name: string;
    employee_range: string;
    price: number;
  }
): Promise<string | null> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = [37, 99, 235];
    const darkGray = [31, 41, 55];

    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 15, 180, 267, 3, 3, 'F');

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 70, 'F');

    let logoLoaded = false;
    try {
      const { data: pdfConfig, error: configError } = await supabase
        .from('pdf_configuration')
        .select('logo_url')
        .maybeSingle();

      if (!configError && pdfConfig?.logo_url) {
        const logoBase64 = await loadImageAsBase64(pdfConfig.logo_url);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(70, 15, 70, 32, 3, 3, 'F');
        doc.addImage(logoBase64, 'PNG', 80, 20, 50, 22);
        logoLoaded = true;
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    if (!logoLoaded) {
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('Cabinet FPE', 105, 35, { align: 'center' });
    }

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('Sécurité Professionnelle', 105, 58, { align: 'center' });

    let yPosition = 90;

    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTESTATION DE CONFORMITÉ', 105, yPosition, { align: 'center' });

    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Document Unique d\'Évaluation des Risques Professionnels', 105, yPosition, { align: 'center' });

    yPosition += 20;

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Délivrée le ${currentDate}`, 105, yPosition, { align: 'center' });

    yPosition += 25;

    doc.setFillColor(245, 248, 251);
    doc.roundedRect(25, yPosition, 160, 60, 3, 3, 'F');

    yPosition += 12;

    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DE L\'ENTREPRISE', 30, yPosition);

    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    doc.text(`Raison sociale : ${clientData.nom_societe}`, 30, yPosition);
    yPosition += 7;
    doc.text(`Gérant : ${clientData.nom_prenom_gerant}`, 30, yPosition);
    yPosition += 7;
    doc.text(`SIRET : ${clientData.siret_siren}`, 30, yPosition);
    yPosition += 7;
    doc.text(`Adresse : ${clientData.adresse}`, 30, yPosition);
    yPosition += 7;
    doc.text(`Code postal / Ville : ${clientData.code_postal} ${clientData.ville}`, 30, yPosition);

    yPosition += 20;

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(25, yPosition, 160, 80, 3, 3, 'F');

    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATION', 105, yPosition, { align: 'center' });

    yPosition += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const certificationText = `Nous attestons que l'entreprise ${clientData.nom_societe} a souscrit à notre service :`;
    doc.text(certificationText, 30, yPosition);

    yPosition += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`"${productData.name}"`, 30, yPosition);

    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre de salariés : ${productData.employee_range}`, 30, yPosition);
    yPosition += 7;
    doc.text(`Montant : ${productData.price.toFixed(2)} € HT`, 30, yPosition);

    yPosition += 30;

    doc.setFillColor(245, 248, 251);
    doc.roundedRect(25, yPosition, 160, 30, 3, 3, 'F');

    yPosition += 12;

    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    const includesText = [
      '✓ Recensement et évaluation des risques professionnels',
      '✓ Élaboration du Document Unique (DUERP)',
      '✓ Attestation de prise en charge',
      '✓ Accès au portail numérique sécurisé',
      '✓ Service expertise en cas de contrôle'
    ];

    includesText.forEach(text => {
      doc.text(text, 30, yPosition);
      yPosition += 5;
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 30;

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.3);
    doc.line(25, footerY, pageWidth - 25, footerY);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Ce document atteste de la prise en charge de votre DUERP conforme à l\'article R4121-1', 105, footerY + 5, { align: 'center' });
    doc.text('À présenter lors d\'un contrôle de l\'inspection du travail', 105, footerY + 10, { align: 'center' });

    doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Cabinet FPE - Sécurité Professionnelle', 105, pageHeight - 8, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('administration@securiteprofessionnelle.fr - www.securiteprofessionnelle.fr', 105, pageHeight - 4, { align: 'center' });

    const pdfBlob = doc.output('blob');

    const fileName = `Attestation_Conformite_${clientData.nom_societe.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    const filePath = `certificates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading certificate PDF:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const datePrefix = `${day}-${month}-${year}`;

    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        client_id: clientData.id,
        document_type: 'Attestation',
        title: `${datePrefix}-Attestation de conformité DUERP`,
        file_path: filePath,
        file_url: fileUrl
      });

    if (dbError) {
      console.error('Error saving certificate record:', dbError);
      throw dbError;
    }

    return fileUrl;
  } catch (error: any) {
    console.error('Error generating certificate PDF:', error);
    throw new Error(error?.message || 'Erreur lors de la génération de l\'attestation');
  }
};

export const generateInvoiceFromPayment = async (
  clientData: {
    id: number;
    nom_societe: string;
    nom_prenom_gerant: string;
    siret_siren: string;
    adresse: string;
    code_postal: string;
    ville: string;
  },
  productData: {
    name: string;
    employee_range: string;
    price: number;
  }
): Promise<string | null> => {
  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = randomNum.toString();

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const invoiceDate = `${day}-${month}-${year}`;

    const items: InvoiceItem[] = [
      {
        description: productData.name,
        details: [
          'Recensement et évaluation des risques',
          'Élaboration du document unique',
          'Attestation de prise en charge',
          'Rapport DUERP conforme',
          'Accès à votre portail numérique',
          'Service expertise en cas de contrôle',
          'Suivi de vos demandes avec un conseiller'
        ],
        unitPrice: productData.price,
        quantity: 1,
        total: productData.price
      }
    ];

    const subtotal = productData.price;
    const vatRate = 20;
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;

    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      clientId: clientData.id,
      clientName: clientData.nom_prenom_gerant,
      clientCompany: clientData.nom_societe,
      clientSiret: clientData.siret_siren,
      clientAddress: clientData.adresse,
      clientPostalCode: clientData.code_postal,
      clientCity: clientData.ville,
      items,
      subtotal,
      vatRate,
      vatAmount,
      total
    };

    return await generateInvoicePDF(invoiceData);
  } catch (error: any) {
    console.error('Error generating invoice from payment:', error);
    throw new Error(error?.message || 'Erreur lors de la génération de la facture');
  }
};
