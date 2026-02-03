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

      if (selectedPaymentMethod === 'cb-3fois' && selectedProduct.payment_link_3x) {
        localStorage.setItem('stripy_payment_pending', JSON.stringify({
          clientId: client.id,
          employeeRange: selectedEmployeeRange,
          timestamp: Date.now()
        }));
        window.location.href = selectedProduct.payment_link_3x;
        return;
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
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden border border-white/10 backdrop-blur-2xl p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mr-3" />
        <span className="text-white font-medium">Chargement des tarifs...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">

      <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
              <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                Dossier de prise en charge
              </h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Procédure de règlement</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
        <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
          <p className="text-sm md:text-base text-white font-medium">
            Veuillez compléter les informations ci-dessous pour finaliser votre prise en charge
          </p>
        </div>

          {error && (
            <div className="bg-red-900/30 border-2 border-red-400/40 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-200 font-bold mb-1">Erreur</h4>
                <p className="text-sm text-red-100">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border-2 border-green-400/40 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-green-200 font-bold mb-1">Succès</h4>
                <p className="text-sm text-green-100">{success}</p>
              </div>
            </div>
          )}

          {!diagnosticCompleted && (
            <div className="bg-amber-900/30 border-2 border-amber-400/40 p-4 sm:p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-200 font-bold mb-2 text-base">Diagnostic DUERP requis</h4>
                  <p className="text-sm text-amber-100 mb-3 leading-relaxed">
                    Vous devez d'abord compléter le <strong>Diagnostic DUERP Article L4121-1</strong> avant de pouvoir effectuer le règlement de votre prise en charge.
                  </p>
                  <p className="text-sm text-amber-100">
                    Veuillez vous rendre dans l'onglet <strong>"Diagnostic DUERP Article L4121-1"</strong> pour remplir et valider le formulaire.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
              <label className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                <User className="w-3 h-3 md:w-4 md:h-4 text-blue-300" />
                Nombre de salariés
                <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedEmployeeRange}
                onChange={(e) => {
                  setSelectedEmployeeRange(e.target.value);
                  setError(null);
                }}
                disabled={!diagnosticCompleted}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-[#1a2847] text-gray-400">Sélectionnez le nombre de salariés</option>
                {products.map((product) => (
                  <option key={product.id} value={product.employee_range} className="bg-[#1a2847] text-white">
                    {product.name} - {product.price.toFixed(2)} € HT
                  </option>
                ))}
              </select>
              {selectedEmployeeRange && (
                <div className="mt-3 text-right">
                  <span className="text-sm font-semibold text-blue-300">
                    Prix: <span className="text-lg text-white font-bold">{getSelectedProductPrice()} HT</span>
                  </span>
                </div>
              )}
            </div>

            <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
              <label className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Méthode de règlement
                <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  setError(null);
                }}
                disabled={!diagnosticCompleted}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-[#1a2847] text-gray-400">Choisissez votre mode de paiement</option>
                <option value="cb-1fois" className="bg-[#1a2847] text-white">Règlement CB en 1 fois</option>
                <option value="cb-3fois" className="bg-[#1a2847] text-white">Règlement CB en 3 fois sans frais</option>
              </select>
            </div>

            <div className="pt-3 md:pt-4">
              <button
                onClick={handlePayment}
                disabled={!diagnosticCompleted || processing || !selectedEmployeeRange || !selectedPaymentMethod}
                className={`w-full font-extrabold py-3 md:py-4 px-6 md:px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base flex items-center justify-center gap-2 md:gap-3 ${
                  diagnosticCompleted && selectedEmployeeRange && selectedPaymentMethod && !processing
                    ? 'bg-green-900/60 hover:bg-green-800/70 border-2 border-green-500/50 text-white'
                    : 'bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] text-white border border-blue-400/30'
                }`}
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

          <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-white/20">
            <div className="bg-blue-900/30 border-2 border-blue-400/40 p-4 md:p-6 rounded-xl backdrop-blur-sm">
              <div className="flex gap-3 md:gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-200 font-bold mb-1 md:mb-2 text-sm md:text-base">Informations importantes</h4>
                  <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
                    Une fois le règlement de la prise en charge effectué, vous recevrez <strong>l'attestation</strong> à présenter lors d'un contrôle, ainsi qu'un <strong>rendez-vous téléphonique</strong> avec le service expertise pour remplir le rapport conforme, suivi du <strong>formulaire de remboursement</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default PaymentSection;
