import React, { useState } from 'react';
import { X, Mail, Euro, Users, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PricingTier {
  range: string;
  employees: string;
  priceHT: number;
  priceTTC: number;
  price3x: number | null;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  clientEmail?: string;
  clientName?: string;
}

const pricingTiers: PricingTier[] = [
  {
    range: '0-1',
    employees: '0 à 1 salarié',
    priceHT: 290.00,
    priceTTC: 348.00,
    price3x: null
  },
  {
    range: '1-5',
    employees: '1 à 5 salariés',
    priceHT: 830.00,
    priceTTC: 996.00,
    price3x: 332.00
  },
  {
    range: '6-10',
    employees: '6 à 10 salariés',
    priceHT: 1000.00,
    priceTTC: 1200.00,
    price3x: null
  },
  {
    range: '11-15',
    employees: '11 à 15 salariés',
    priceHT: 1230.00,
    priceTTC: 1476.00,
    price3x: 410.00
  },
  {
    range: '16-25',
    employees: '16 à 25 salariés',
    priceHT: 1625.00,
    priceTTC: 1950.00,
    price3x: 650.00
  },
  {
    range: '26-50',
    employees: '26 à 50 salariés',
    priceHT: 2150.00,
    priceTTC: 2580.00,
    price3x: 860.00
  }
];

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientEmail,
  clientName
}) => {
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSendEmail = async (tier: PricingTier, index: number) => {
    if (!clientId || !clientEmail) {
      setMessage({
        type: 'error',
        text: 'Informations client manquantes'
      });
      return;
    }

    setSendingIndex(index);
    setMessage(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-v2`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          clientId: clientId,
          templateKey: 'tarif_personnalise',
          customData: {
            employee_range: tier.employees,
            price_ht: tier.priceHT.toFixed(2),
            price_ttc: tier.priceTTC.toFixed(2),
            price_3x: tier.price3x.toFixed(2)
          }
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }

      setMessage({
        type: 'success',
        text: `Email du tarif "${tier.employees}" envoyé avec succès!`
      });

      setTimeout(() => {
        setMessage(null);
      }, 3000);

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erreur lors de l\'envoi de l\'email'
      });
    } finally {
      setSendingIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center ring-2 ring-white/50">
                <Euro className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Grille Tarifaire</h2>
                <p className="text-blue-50 text-sm">Tarifs par tranche de salariés</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-200 hover:rotate-90"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {message && (
            <div className={`p-4 rounded-lg border-2 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span className={`font-medium ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </span>
              </div>
            </div>
          )}

          {clientId && clientEmail && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Client sélectionné</span>
              </div>
              <p className="text-blue-800 font-medium">{clientName || clientEmail}</p>
              <p className="text-sm text-blue-600">{clientEmail}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.range}
                className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{tier.employees}</h3>
                    </div>

                    <div className={`grid gap-4 ${tier.price3x !== null ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Prix HT</p>
                        <p className="text-2xl font-bold text-gray-900">{tier.priceHT.toFixed(2)} €</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Prix TTC</p>
                        <p className="text-2xl font-bold text-gray-900">{tier.priceTTC.toFixed(2)} €</p>
                      </div>

                      {tier.price3x !== null && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-green-700 mb-1 font-medium flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            3x sans frais
                          </p>
                          <p className="text-2xl font-bold text-green-700">3 x {tier.price3x.toFixed(2)} €</p>
                        </div>
                      )}
                    </div>
                    {tier.price3x === null && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">
                          Paiement en 1 fois uniquement
                        </p>
                      </div>
                    )}
                  </div>

                  {clientId && clientEmail && (
                    <button
                      onClick={() => handleSendEmail(tier, index)}
                      disabled={sendingIndex !== null}
                      className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                      {sendingIndex === index ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!clientId && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Information</p>
                  <p className="text-sm text-amber-800">
                    Sélectionnez un client pour pouvoir envoyer les tarifs par email.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Tous les prix incluent la TVA à 20%
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
