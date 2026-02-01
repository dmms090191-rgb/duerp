import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, FileText, Award, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateInvoiceFromPayment, generateConformityCertificatePDF } from '../services/invoiceService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  useEffect(() => {
    generateDocuments();
  }, []);

  const generateDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const clientId = searchParams.get('client_id');
      const employeeRange = searchParams.get('employee_range');

      if (!clientId || !employeeRange) {
        throw new Error('Informations de paiement manquantes');
      }

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', parseInt(clientId))
        .maybeSingle();

      if (clientError || !clientData) {
        throw new Error('Client introuvable');
      }

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('employee_range', employeeRange)
        .maybeSingle();

      if (productError || !productData) {
        throw new Error('Produit introuvable');
      }

      const [invoiceResult, certificateResult] = await Promise.all([
        generateInvoiceFromPayment(
          {
            id: clientData.id,
            nom_societe: clientData.nom_societe || '',
            nom_prenom_gerant: clientData.nom_prenom_gerant || '',
            siret_siren: clientData.siret_siren || '',
            adresse: clientData.adresse || '',
            code_postal: clientData.code_postal || '',
            ville: clientData.ville || ''
          },
          {
            name: productData.name,
            employee_range: productData.employee_range,
            price: parseFloat(productData.price)
          }
        ),
        generateConformityCertificatePDF(
          {
            id: clientData.id,
            nom_societe: clientData.nom_societe || '',
            nom_prenom_gerant: clientData.nom_prenom_gerant || '',
            siret_siren: clientData.siret_siren || '',
            adresse: clientData.adresse || '',
            code_postal: clientData.code_postal || '',
            ville: clientData.ville || ''
          },
          {
            name: productData.name,
            employee_range: productData.employee_range,
            price: parseFloat(productData.price)
          }
        )
      ]);

      setInvoiceUrl(invoiceResult);
      setCertificateUrl(certificateResult);

      await sendPaymentConfirmationEmail(parseInt(clientId), employeeRange, invoiceResult, certificateResult);
    } catch (err: any) {
      console.error('Error generating documents:', err);
      setError(err.message || 'Erreur lors de la génération des documents');
    } finally {
      setLoading(false);
    }
  };

  const sendPaymentConfirmationEmail = async (
    clientId: number,
    employeeRange: string,
    invoiceUrl: string,
    certificateUrl: string
  ) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-payment-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          clientId,
          employeeRange,
          invoiceUrl,
          certificateUrl
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Erreur envoi email:', result.error);
      } else {
        console.log('Email de confirmation envoyé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Traitement en cours</h2>
            <p className="text-gray-600 text-center">
              Génération de votre facture et attestation de conformité...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button
              onClick={() => navigate('/client-dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-lg text-gray-600">
            Votre prise en charge DUERP a été validée avec succès
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vos documents sont prêts
          </h2>
          <p className="text-gray-700 mb-6">
            Nous avons généré votre facture et votre attestation de conformité. Vous pouvez les télécharger ci-dessous :
          </p>

          <div className="space-y-3">
            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Facture</h3>
                  <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </a>
            )}

            {certificateUrl && (
              <a
                href={certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Attestation de conformité</h3>
                  <p className="text-sm text-gray-600">À présenter lors d'un contrôle</p>
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </a>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Vous recevrez un email avec les documents</li>
            <li>✓ Un conseiller vous contactera pour un rendez-vous téléphonique</li>
            <li>✓ Remplissage du rapport conforme avec notre expertise</li>
            <li>✓ Réception du formulaire de remboursement</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/client-dashboard')}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
