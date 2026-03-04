import React, { useState } from 'react';
import { FileText, Loader2, Download, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';

const TestInvoicePreview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generateTestInvoice = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();

      const primaryColor = [37, 99, 235];
      const darkBlue = [30, 80, 200];

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      doc.rect(0, 0, 210, 3, 'F');

      const logoUrl = '/kk.png';
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = reader.result as string;
        });

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
        doc.addImage(roundedImageData, 'PNG', 12, 8, 35, 28);
      } catch (error) {
        console.log('Logo non chargé:', error);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('FACTURE - PRISE EN CHARGE', 125, 15, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text('Document Unique d\'Évaluation des Risques Professionnels', 125, 23, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('Paiement en 3 fois sans frais', 125, 29, { align: 'center' });

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      const invoiceNumber = `F-TEST-${Date.now()}`;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.roundedRect(130, 47, 65, 14, 2, 2, 'FD');

      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('N° DE FACTURE', 162.5, 52, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceNumber, 162.5, 56.5, { align: 'center' });

      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(dateStr, 162.5, 59.5, { align: 'center' });

      doc.setFillColor(245, 248, 255);
      doc.roundedRect(15, 65, 180, 36, 3, 3, 'F');

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1.5);
      doc.line(15, 65, 15, 101);

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('INFORMATIONS CLIENT', 22, 72);

      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      const infoY = 79;

      doc.setFont(undefined, 'bold');
      doc.text('Nom :', 22, infoY);
      doc.setFont(undefined, 'normal');
      doc.text('Jean Dupont', 60, infoY);

      let currentY = infoY + 6;

      doc.setFont(undefined, 'bold');
      doc.text('Société :', 22, currentY);
      doc.setFont(undefined, 'normal');
      doc.text('Entreprise Test SARL', 60, currentY);
      currentY += 6;

      doc.setFont(undefined, 'bold');
      doc.text('Adresse :', 22, currentY);
      doc.setFont(undefined, 'normal');
      doc.text('123 Rue de la République, 75001 Paris', 60, currentY);
      currentY += 6;

      doc.setFont(undefined, 'bold');
      doc.text('SIRET :', 22, currentY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(7.5);
      doc.text('12345678901234', 60, currentY);
      doc.setFontSize(8.5);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.roundedRect(15, 106, 180, 54, 3, 3, 'FD');

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(15, 106, 180, 11, 3, 3, 'F');

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('DESCRIPTION DE LA PRESTATION', 105, 113, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('DUERP Numérique Article R4121-1', 22, 123);

      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      const prestations = [
        'Rapport diagnostic conforme',
        'Accès à votre portail numérique',
        'Élaboration du document unique',
        'Suivi juridique en cas de contrôle',
        'Attestation de conformité DUERP'
      ];

      let yPrestation = 130;
      prestations.forEach(prestation => {
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(24, yPrestation - 1.5, 1.3, 'F');
        doc.text(prestation, 30, yPrestation);
        yPrestation += 6;
      });

      const montantHT = 830;
      const montantTVA = (montantHT * 0.20);
      const montantTTC = montantHT + montantTVA;

      const boxHeight = 76;

      doc.setFillColor(250, 252, 255);
      doc.setDrawColor(200, 220, 255);
      doc.setLineWidth(1);
      doc.roundedRect(15, 165, 180, boxHeight, 3, 3, 'FD');

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(2.5);
      doc.line(15, 165, 15, 165 + boxHeight);

      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'normal');

      const summaryY = 172;

      doc.text('Montant HT', 22, summaryY);
      doc.setFont(undefined, 'bold');
      doc.text(`${montantHT.toFixed(2)} €`, 180, summaryY, { align: 'right' });

      doc.setFont(undefined, 'normal');
      doc.text('TVA (20%)', 22, summaryY + 8);
      doc.setFont(undefined, 'bold');
      doc.text(`${montantTVA.toFixed(2)} €`, 180, summaryY + 8, { align: 'right' });

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.line(22, summaryY + 13, 185, summaryY + 13);

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(22, summaryY + 17, 163, 12, 3, 3, 'F');

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('TOTAL TTC', 28, summaryY + 25);
      doc.setFontSize(13);
      doc.text(`${montantTTC.toFixed(2)} €`, 180, summaryY + 25, { align: 'right' });

      const montantParEcheance = (montantTTC / 3).toFixed(2);
      const today = new Date();

      const date1 = new Date(today);
      const date2 = new Date(today);
      date2.setMonth(date2.getMonth() + 1);
      const date3 = new Date(today);
      date3.setMonth(date3.getMonth() + 2);

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      };

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.line(22, summaryY + 33, 185, summaryY + 33);

      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('ÉCHÉANCIER DE PAIEMENT', 22, summaryY + 40);

      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 30, 30);

      const echeanceY = summaryY + 47;

      doc.text(`1ère échéance - ${formatDate(date1)}`, 28, echeanceY);
      doc.setFont(undefined, 'bold');
      doc.text(`${montantParEcheance} €`, 180, echeanceY, { align: 'right' });

      doc.setFont(undefined, 'normal');
      doc.text(`2ème échéance - ${formatDate(date2)}`, 28, echeanceY + 6);
      doc.setFont(undefined, 'bold');
      doc.text(`${montantParEcheance} €`, 180, echeanceY + 6, { align: 'right' });

      doc.setFont(undefined, 'normal');
      doc.text(`3ème échéance - ${formatDate(date3)}`, 28, echeanceY + 12);
      doc.setFont(undefined, 'bold');
      doc.text(`${montantParEcheance} €`, 180, echeanceY + 12, { align: 'right' });

      doc.setTextColor(0, 0, 0);

      const currentDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const currentTime = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const signatureY = 247;

      doc.setFillColor(240, 248, 255);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.roundedRect(70, signatureY, 70, 14, 2, 2, 'FD');

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(78, signatureY + 7, 4, 'F');

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1.5);
      doc.setLineCap('round');
      doc.setLineJoin('round');
      doc.line(76, signatureY + 7, 77.5, signatureY + 8.5);
      doc.line(77.5, signatureY + 8.5, 81, signatureY + 5);

      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Document signé électroniquement', 105, signatureY + 6, { align: 'center' });

      doc.setFontSize(5.5);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Cabinet FPE - ${currentDate} à ${currentTime}`, 105, signatureY + 10.5, { align: 'center' });

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 267, 210, 30, 'F');

      doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      doc.setLineWidth(2);
      doc.line(0, 267, 210, 267);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Cabinet FPE - Sécurité Professionnelle', 105, 277, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('administration@securiteprofessionnelle.fr | www.securiteprofessionnelle.fr', 105, 284, { align: 'center' });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Facture_Test_Paiement_3x_${Date.now()}.pdf`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Facture - Paiement en 3 fois</h1>
              <p className="text-gray-600 mt-1">Visualisez la facture avec l'échéancier de paiement</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Détails du test</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Montant: 830 € HT (996 € TTC)</li>
              <li>Paiement en 3 fois sans frais: 3 x 332 €</li>
              <li>Client test: Jean Dupont - Entreprise Test SARL</li>
              <li>SIRET: 12345678901234</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateTestInvoice}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Générer la facture test
                </>
              )}
            </button>

            {pdfUrl && (
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Télécharger le PDF
              </button>
            )}
          </div>
        </div>

        {pdfUrl && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aperçu de la facture</h2>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[800px]"
                title="Aperçu facture"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestInvoicePreview;
