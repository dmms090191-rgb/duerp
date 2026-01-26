import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';

interface FormData {
  secteurActivite: string;
  nomConseiller: string;
  nomSociete: string;
  siretSiren: string;
  adresse: string;
  ville: string;
  codePostal: string;
  nomPrenomGerant: string;
  telephone: string;
  email: string;
  selectedActivities: string[];
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

export const generateDUERPPDF = async (formData: FormData, clientId: number): Promise<string | null> => {
  try {
    console.log('Starting PDF generation for client:', clientId);
    console.log('Form data:', formData);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Add logo - fetch from pdf_configuration
    try {
      const { data: pdfConfig, error: configError } = await supabase
        .from('pdf_configuration')
        .select('logo_url')
        .maybeSingle();

      if (!configError && pdfConfig?.logo_url) {
        const logoBase64 = await loadImageAsBase64(pdfConfig.logo_url);
        doc.addImage(logoBase64, 'PNG', 15, yPosition, 45, 13);
      } else {
        console.warn('No logo configured in pdf_configuration');
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    // Title aligned to the right of the page
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    const titleText = 'Diagnostic DUERP - Article L4121-1';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, pageWidth - titleWidth - 15, yPosition + 9);
    doc.setTextColor(0, 0, 0);

    yPosition += 18;

    // Separator line
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Date
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    doc.text(`Date : ${currentDate}`, 15, yPosition);
    yPosition += 12;

    // Subtitle
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Document Unique d\'Évaluation des Risques Professionnels (DUERP)', 15, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;

    // Description paragraph with background
    doc.setFillColor(245, 248, 251);
    doc.rect(15, yPosition - 3, pageWidth - 30, 22, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descriptionText = 'Conformément à l\'article L4121-1 du Code du travail, une évaluation des risques professionnels (EVRP) doit être réalisée au sein de votre entreprise afin d\'adapter les conditions de travail et de garantir la protection de la santé et de la sécurité de vos salariés.';
    const splitDescription = doc.splitTextToSize(descriptionText, pageWidth - 40);
    doc.text(splitDescription, 20, yPosition + 3);
    yPosition += 28;

    // Questionnaire pre-diagnostic section
    doc.setFillColor(0, 102, 204);
    doc.rect(15, yPosition, 4, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Questionnaire pré-diagnostic DUERP', 22, yPosition + 6);
    doc.setTextColor(0, 0, 0);
    yPosition += 14;

    // Secteur d'activité box
    const addBox = (label: string, value: string, isMultiline: boolean = false) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      // Draw rectangle for label with gradient effect
      doc.setDrawColor(200, 220, 240);
      doc.setFillColor(235, 242, 250);
      doc.rect(15, yPosition, pageWidth - 30, 8, 'FD');

      // Label
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102);
      doc.text(label, 17, yPosition + 5.5);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      // Value box
      doc.setFont('helvetica', 'normal');
      const splitValue = doc.splitTextToSize(value, pageWidth - 38);
      const boxHeight = Math.max(10, splitValue.length * 5 + 4);
      doc.setDrawColor(200, 220, 240);
      doc.setFillColor(255, 255, 255);
      doc.rect(15, yPosition, pageWidth - 30, boxHeight, 'FD');
      doc.text(splitValue, 19, yPosition + 5);
      yPosition += boxHeight + 4;
    };

    // Secteur d'activité with selected activities
    if (formData.selectedActivities && formData.selectedActivities.length > 0) {
      let activitiesText = formData.secteurActivite;
      formData.selectedActivities.forEach(activity => {
        activitiesText += '\n• ' + activity;
      });
      addBox('Secteur d\'activité', activitiesText, true);
    } else {
      addBox('Secteur d\'activité', formData.secteurActivite);
    }

    addBox('Nom de votre conseiller', formData.nomConseiller);
    addBox('Nom de société', formData.nomSociete);
    addBox('Siret / Siren', formData.siretSiren);
    addBox('Adresse', formData.adresse);
    addBox('Ville', formData.ville);
    addBox('Code postal', formData.codePostal);
    addBox('Nom & prénom du gérant', formData.nomPrenomGerant);
    addBox('Téléphone', formData.telephone);
    addBox('Email', formData.email);

    if (formData.covidInfo && formData.covidInfo !== '') {
      addBox('1. Informations transmises aux travailleurs sur le Covid-19, les recommandations sanitaires, les gestes barrières ?', formData.covidInfo);
    }

    if (formData.affichageSpecifique && formData.affichageSpecifique !== '') {
      addBox('2. Affichage spécifique dans les locaux (et les véhicules, les installations de chantier etc.) ?', formData.affichageSpecifique);
    }

    if (formData.solutionHydroalcoolique && formData.solutionHydroalcoolique !== '') {
      addBox('3. Mise à disposition de solution Hydroalcoolique ?', formData.solutionHydroalcoolique);
    }

    if (formData.processusNettoyage && formData.processusNettoyage !== '') {
      addBox('5. Définition et mise en œuvre de processus de nettoyage des équipements, engins et véhicules partagés ainsi que les locaux utilisés par plusieurs personnes ?', formData.processusNettoyage);
    }

    if (formData.processusAeration && formData.processusAeration !== '') {
      addBox('6. Définition et mise en œuvre de processus d\'aération des locaux de travail ?', formData.processusAeration);
    }

    if (formData.selectedCategories) {
      const categoryLabels = {
        circulation: '7. Catégorie: Circulation',
        stockage: '8. Catégorie: Stockage',
        enginsMecaniques: '9. Catégorie: Engins mécaniques',
        usineProduction: '10. Catégorie: Usine / Production',
        thermique: '11. Catégorie: Thermique',
        machineUsine: '12. Catégorie: Machine pour usine',
        autre: '13. Catégorie: Autre',
        manutentionCirculation: '14. Manutention Circulation',
        ambiance: '15. Ambiance',
        equipementOrganisation: '16. Equipement & Organisation'
      };

      Object.entries(formData.selectedCategories).forEach(([key, items]) => {
        if (items && items.length > 0) {
          let categoryText = '';
          items.forEach(item => {
            categoryText += '\n• ' + item;
          });
          if (categoryText) {
            addBox(categoryLabels[key as keyof typeof categoryLabels], categoryText.trim(), true);
          }
        }
      });
    }

    // Footer section
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 15;

    // Add footer separator line
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.3);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Document généré automatiquement par le système DUERP Cabinet FPE', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Ce document est conforme aux exigences réglementaires en vigueur.', pageWidth / 2, footerY + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Convert PDF to blob
    console.log('Converting PDF to blob...');
    const pdfBlob = doc.output('blob');
    console.log('PDF blob created, size:', pdfBlob.size);

    // Upload to Supabase Storage
    const fileName = `DUERP_${formData.nomSociete.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    const filePath = `${clientId}/${fileName}`;
    console.log('Uploading to path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      throw uploadError;
    }

    console.log('PDF uploaded successfully');

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save document record to database
    console.log('Saving document record to database...');
    console.log('Client ID:', clientId);
    console.log('File path:', filePath);
    console.log('File URL:', fileUrl);

    // Generate date prefix (DD-MM-YYYY)
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const datePrefix = `${day}-${month}-${year}`;

    const { data: insertData, error: dbError } = await supabase
      .from('documents')
      .insert({
        client_id: clientId,
        document_type: 'DUERP',
        title: `${datePrefix}-Diagnostic DUERP Article L4121-1`,
        file_path: filePath,
        file_url: fileUrl
      })
      .select();

    if (dbError) {
      console.error('Error saving document record:', dbError);
      console.error('Error details:', JSON.stringify(dbError, null, 2));
      throw dbError;
    }

    console.log('Document record saved successfully:', insertData);
    return fileUrl;
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Full error:', JSON.stringify(error, null, 2));

    // Re-throw the error with a more descriptive message
    throw new Error(error?.message || 'Erreur lors de la génération du PDF');
  }
};

export const getClientDocuments = async (clientId: number) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getClientDocuments:', error);
    return [];
  }
};

export const deleteDocument = async (documentId: string, filePath: string): Promise<boolean> => {
  try {
    console.log('Deleting document:', documentId, 'with file path:', filePath);

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      throw storageError;
    }

    console.log('File deleted from storage successfully');

    // Delete document record from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('Error deleting document record:', dbError);
      throw dbError;
    }

    console.log('Document record deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error in deleteDocument:', error);
    console.error('Error message:', error?.message);
    return false;
  }
};
