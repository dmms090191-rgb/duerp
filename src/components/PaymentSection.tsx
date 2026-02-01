import React, { useState, useEffect } from 'react';
import { FileCheck, Building2, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { stripeService, StripeProduct } from '../services/stripeService';

interface PaymentSectionProps {
  client: {
    id: string;
    siret?: string;
    email?: string;
  };
  diagnosticCompleted?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ client, diagnosticCompleted = false }) => {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [selectedEmployeeRange, setSelectedEmployeeRange] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let productsData = await stripeService.getProducts();

      if (productsData.length === 0) {
        const syncResult = await stripeService.syncProducts();
        if (syncResult.success) {
          productsData = await stripeService.getProducts();
        } else {
          setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
        }
      }

      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Erreur lors du chargement des produits.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedEmployeeRange || !selectedPaymentMethod) {
      setError('Veuillez sélectionner le nombre de salariés et la méthode de règlement.');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedProduct = products.find(p => p.employee_range === selectedEmployeeRange);

      if (!selectedProduct) {
        throw new Error('Produit non trouvé');
      }

      const result = await stripeService.createCheckoutSession(
        selectedProduct.stripe_price_id,
        parseInt(client.id),
        selectedEmployeeRange
      );

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Erreur lors de la création de la session de paiement');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement du paiement');
      setProcessing(false);
    }
  };

  const getSelectedProductPrice = () => {
    const selectedProduct = products.find(p => p.employee_range === selectedEmployeeRange);
    return selectedProduct ? `${selectedProduct.price.toFixed(2)} €` : '';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-4 md:py-8">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
          <span className="text-gray-700">Chargement des tarifs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8">
      <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-[#e8edf5] to-[#dde4f0] px-4 md:px-8 py-4 md:py-6 border-b border-blue-200">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
              <FileCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-[#2d4578] to-[#1a2847] bg-clip-text text-transparent">
                {client.siret || 'Votre entreprise'}
              </h2>
              <p className="text-xs md:text-sm text-gray-700 font-semibold">Dossier de prise en charge</p>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-700 h-32 md:h-48 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full mb-2 md:mb-4">
                <Building2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Procédure de règlement</h3>
              <p className="text-blue-50 text-sm md:text-lg font-medium max-w-2xl">
                Veuillez compléter les informations ci-dessous pour finaliser votre prise en charge
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 md:w-48 md:h-48 bg-white/5 rounded-full -ml-18 md:-ml-24 -mb-18 md:-mb-24"></div>
        </div>

        <div className="px-4 md:px-8 py-6 md:py-10">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
              <h3 className="text-blue-700 font-bold text-sm md:text-lg tracking-wide uppercase">
                Procédure de prise en charge
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
            </div>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-900 font-bold mb-1">Erreur</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="max-w-2xl mx-auto mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-green-900 font-bold mb-1">Succès</h4>
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          {!diagnosticCompleted && (
            <div className="max-w-2xl mx-auto mb-6 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-900 font-bold mb-2 text-base">Diagnostic DUERP requis</h4>
                  <p className="text-sm text-amber-800 mb-3 leading-relaxed">
                    Vous devez d'abord compléter le <strong>Diagnostic DUERP Article L4121-1</strong> avant de pouvoir effectuer le règlement de votre prise en charge.
                  </p>
                  <p className="text-sm text-amber-800">
                    Veuillez vous rendre dans l'onglet <strong>"Diagnostic DUERP Article L4121-1"</strong> pour remplir et valider le formulaire.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
            <div className="bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-200/50 shadow-sm">
              <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                Nombre de salariés
                <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedEmployeeRange}
                onChange={(e) => {
                  setSelectedEmployeeRange(e.target.value);
                  setError(null);
                }}
                disabled={!diagnosticCompleted}
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 text-xs md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="" className="text-gray-500">Sélectionnez le nombre de salariés</option>
                {products.map((product) => (
                  <option key={product.id} value={product.employee_range}>
                    {product.name} - {product.price.toFixed(2)} € HT
                  </option>
                ))}
              </select>
              {selectedEmployeeRange && (
                <div className="mt-3 text-right">
                  <span className="text-sm font-semibold text-blue-900">
                    Prix: <span className="text-lg text-blue-700">{getSelectedProductPrice()} HT</span>
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-200/50 shadow-sm">
              <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Méthode de règlement
                <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  setError(null);
                }}
                disabled={!diagnosticCompleted}
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="" className="text-gray-500">Choisissez votre mode de paiement</option>
                <option value="cb-1fois">Règlement CB en 1 fois</option>
                <option value="cb-3fois">Règlement CB en 3 fois sans frais</option>
              </select>
            </div>

            <div className="pt-3 md:pt-4">
              <button
                onClick={handlePayment}
                disabled={!diagnosticCompleted || processing || !selectedEmployeeRange || !selectedPaymentMethod}
                className="w-full bg-gradient-to-r from-[#2d4578] to-[#1a2847] hover:from-[#3a5488] hover:to-[#223761] text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    Redirection vers le paiement...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 md:w-5 md:h-5" />
                    Valider le règlement de prise en charge
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-gray-200">
            <div className="max-w-2xl mx-auto bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6 rounded-r-lg">
              <div className="flex gap-3 md:gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-900 font-bold mb-1 md:mb-2 text-sm md:text-base">Informations importantes</h4>
                  <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                    Une fois le règlement de la prise en charge effectué, vous recevrez <strong>l'attestation</strong> à présenter lors d'un contrôle, ainsi qu'un <strong>rendez-vous téléphonique</strong> avec le service expertise pour remplir le rapport conforme, suivi du <strong>formulaire de remboursement</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
