import React, { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';

interface Client {
  id: string;
  email: string;
  full_name: string;
  prenom?: string;
  nom?: string;
  company_name?: string;
  siret?: string;
}

interface PaymentEmailSenderProps {
  client: Client;
}

interface PriceRange {
  label: string;
  priceHT: number;
  employees: string;
}

const priceRanges: PriceRange[] = [
  { label: '1 à 5 salariés', priceHT: 830, employees: '1-5' },
  { label: '6 à 10 salariés', priceHT: 1000, employees: '6-10' },
  { label: '11 à 15 salariés', priceHT: 1230, employees: '11-15' },
  { label: '16 à 25 salariés', priceHT: 1625, employees: '16-25' },
  { label: '26 à 50 salariés', priceHT: 2150, employees: '26-50' },
];

const PaymentEmailSender: React.FC<PaymentEmailSenderProps> = ({ client }) => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendingRange, setSendingRange] = useState<string | null>(null);

  const handleRangeClick = async (range: PriceRange) => {
    setSendingRange(range.employees);
    setSending(true);
    setMessage(null);

    try {
      const montantTTC = range.priceHT * 1.2;
      const montantParEcheance = montantTTC / 3;

      const emailData = {
        clientId: parseInt(client.id),
        templateKey: 'procedure_prise_en_charge',
        emailOverride: client.email,
        previewOnly: false,
        customData: {
          numero_dossier: client.siret || client.id,
          societe: client.company_name || client.full_name,
          siret: client.siret || 'Non renseigné',
          adresse: 'Non renseigné',
          price_ht: range.priceHT.toFixed(2),
          price_ttc: montantTTC.toFixed(2),
          price_3x: montantParEcheance.toFixed(2),
          employee_range: range.label
        }
      };

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-email-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi de l\'email');
      }

      const result = await response.json();

      setMessage({
        type: 'success',
        text: `Email de prise en charge avec facture de ${montantTTC.toFixed(2)}€ TTC (3 x ${montantParEcheance.toFixed(2)}€) envoyé avec succès`
      });

      setTimeout(() => {
        setMessage(null);
      }, 5000);

    } catch (error: any) {
      console.error('Erreur envoi email:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'envoi de l\'email' });
    } finally {
      setSending(false);
      setSendingRange(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/10 rounded-2xl p-6 shadow-xl">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Prise en charge DUERP - Cliquez pour envoyer l'email avec la facture
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {priceRanges.map((range) => (
            <button
              key={range.employees}
              onClick={() => handleRangeClick(range)}
              disabled={sending}
              className="flex flex-col items-center justify-center gap-2 px-6 py-5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 bg-gradient-to-r from-blue-600 to-blue-700 border-blue-400 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {sendingRange === range.employees ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Users className="w-6 h-6" />
              )}
              <span className="text-center">{range.label}</span>
              <span className="text-lg font-extrabold">{range.priceHT.toFixed(2)} € HT</span>
              <span className="text-xs opacity-80">{(range.priceHT * 1.2).toFixed(2)} € TTC</span>
              <span className="text-sm font-bold mt-1 text-yellow-300">3 x {((range.priceHT * 1.2) / 3).toFixed(2)} €</span>
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-500/20 border-green-400/50 text-green-200'
            : 'bg-red-500/20 border-red-400/50 text-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentEmailSender;
