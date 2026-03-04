import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, FileText, Award } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const clientId = searchParams.get('client_id');
      const employeeRange = searchParams.get('employee_range');
      const sessionId = searchParams.get('session_id');

      if (!clientId || !employeeRange) {
        throw new Error('Informations de paiement manquantes');
      }

      if (!sessionId) {
        throw new Error('Session de paiement non trouvée');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('Vérification du statut du paiement...');

      const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/verify-payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ sessionId })
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Erreur lors de la vérification du paiement');
      }

      if (!verifyResult.isPaid || !verifyResult.isComplete) {
        throw new Error('Le paiement n\'a pas été validé par Stripe. Veuillez contacter le support si vous avez été débité.');
      }

      console.log('✅ Paiement confirmé par Stripe');
      console.log('📧 Envoi de la demande de génération des documents...');

      const response = await fetch(`${supabaseUrl}/functions/v1/send-payment-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          clientId: parseInt(clientId),
          employeeRange,
          invoiceUrl: '',
          certificateUrl: '',
          paymentType: '1x'
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la génération des documents');
      }

      console.log('✅ Documents générés et email envoyé avec succès');
    } catch (err: any) {
      console.error('❌ Error processing payment:', err);
      setError(err.message || 'Erreur lors du traitement de la confirmation de paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDocuments = () => {
    setNavigating(true);
    navigate('/client/dashboard?tab=documents');
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
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Création des documents PDF
              </p>
              <p className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde dans votre espace
              </p>
              <p className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi de l'email de confirmation
              </p>
            </div>
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
              onClick={handleGoToDocuments}
              disabled={navigating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {navigating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Accéder à mes documents'
              )}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Vos documents ont été générés
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Facture DUERP</h3>
                <p className="text-sm text-gray-600">Sauvegardée dans vos documents</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Attestation de conformité</h3>
                <p className="text-sm text-gray-600">À présenter lors d'un contrôle</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-700">
              Un email de confirmation a été envoyé avec vos documents.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Consultez vos documents dans la section "Mes documents"</li>
            <li>✓ Un conseiller vous contactera pour un rendez-vous téléphonique</li>
            <li>✓ Remplissage du rapport conforme avec notre expertise</li>
            <li>✓ Réception du formulaire de remboursement</li>
          </ul>
        </div>

        <button
          onClick={handleGoToDocuments}
          disabled={navigating}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {navigating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Chargement...
            </>
          ) : (
            'Accéder à mes documents maintenant'
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
