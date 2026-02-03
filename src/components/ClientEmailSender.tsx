import React, { useState } from 'react';
import { Mail, Send, Clock, FileText, Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

interface ClientEmailSenderProps {
  clientId: number;
  clientName?: string;
  clientEmail?: string;
}

const ClientEmailSender: React.FC<ClientEmailSenderProps> = ({ clientId, clientName, clientEmail }) => {
  const [sending, setSending] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<{ [key: string]: Date }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (log: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${log}`]);
    console.log(log);
  };

  const testConfiguration = async () => {
    setTestResult('Test en cours...');
    console.log('🧪 Test de configuration');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl) {
        setTestResult('❌ VITE_SUPABASE_URL manquante');
        return;
      }

      if (!supabaseAnonKey) {
        setTestResult('❌ VITE_SUPABASE_ANON_KEY manquante');
        return;
      }

      const apiUrl = `${supabaseUrl}/functions/v1/envoyer-un-email`;
      console.log('🔍 URL de test:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          clientId: clientId,
          emailType: 'identifiants',
          generatePDFs: false
        })
      });

      const responseText = await response.text();
      console.log('📥 Réponse brute:', responseText);

      if (response.ok) {
        setTestResult(`✅ Test réussi! Status: ${response.status}`);
      } else {
        setTestResult(`❌ Erreur: ${response.status} - ${responseText}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Erreur: ${error.message}`);
      console.error('❌ Erreur test:', error);
    }
  };

  const sendEmail = async (emailType: 'identifiants' | 'relance' | 'procedure_prise_en_charge' | 'autre_moyen_paiement') => {
    setDebugLogs([]); // Reset logs
    addDebugLog('🚀 DÉBUT ENVOI EMAIL');
    addDebugLog(`Type: ${emailType}`);
    addDebugLog(`Client ID: ${clientId}`);
    addDebugLog(`Client Name: ${clientName}`);
    addDebugLog(`Client Email: ${clientEmail}`);

    if (!clientId) {
      addDebugLog('❌ ERREUR: clientId est manquant ou null!');
      setMessage('Erreur: ID client manquant');
      setShowError(true);
      return;
    }

    setSending(emailType);
    setShowSuccess(false);
    setShowError(false);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      addDebugLog(`📡 VITE_SUPABASE_URL: ${supabaseUrl}`);
      addDebugLog(`📡 Has Anon Key: ${!!supabaseAnonKey}`);

      if (!supabaseUrl || !supabaseAnonKey) {
        addDebugLog('❌ Configuration Supabase manquante!');
        throw new Error('Configuration Supabase manquante');
      }

      const apiUrl = `${supabaseUrl}/functions/v1/send-email-v2`;
      addDebugLog(`📤 URL: ${apiUrl}`);
      addDebugLog(`📦 Payload: clientId=${clientId}, templateKey=${emailType}`);
      addDebugLog('🔄 Envoi de la requête...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          clientId: clientId,
          templateKey: emailType
        })
      });

      addDebugLog(`📨 Réponse Status: ${response.status}`);
      addDebugLog(`📨 Réponse OK: ${response.ok}`);

      const responseText = await response.text();
      addDebugLog(`📄 Réponse: ${responseText.substring(0, 200)}`);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          addDebugLog('❌ Impossible de parser la réponse JSON');
        }
        addDebugLog(`❌ Erreur HTTP: ${response.status}`);
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = JSON.parse(responseText);
      addDebugLog(`✅ Email envoyé avec succès!`);

      if (!result.success) {
        addDebugLog(`❌ ${result.error}`);
        throw new Error(result.error || 'Erreur inconnue');
      }

      setLastSent(prev => ({
        ...prev,
        [emailType]: new Date()
      }));

      setMessage(`Email envoyé avec succès à ${result.recipient || clientEmail}!`);
      setShowSuccess(true);
      addDebugLog(`✅ Destinataire: ${result.recipient}`);

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error: any) {
      addDebugLog(`❌ ERREUR: ${error.message || 'Erreur inconnue'}`);

      setMessage(error.message || 'Erreur inconnue');
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } finally {
      addDebugLog('🏁 FIN');
      setSending(null);
    }
  };

  const getButtonLabel = (type: string) => {
    switch (type) {
      case 'identifiants':
        return 'Identifiants';
      case 'relance':
        return 'Relance';
      case 'procedure_prise_en_charge':
        return 'Procédure de prise en charge';
      case 'autre_moyen_paiement':
        return 'Autre moyen de paiement';
      default:
        return type;
    }
  };

  const getButtonIcon = (type: string) => {
    switch (type) {
      case 'identifiants':
        return <Mail className="w-5 h-5" />;
      case 'relance':
        return <Clock className="w-5 h-5" />;
      case 'procedure_prise_en_charge':
        return <FileText className="w-5 h-5" />;
      case 'autre_moyen_paiement':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Send className="w-5 h-5" />;
    }
  };


  const formatLastSent = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;

    return date.toLocaleDateString('fr-FR');
  };

  const emailTypes: Array<'identifiants' | 'relance' | 'procedure_prise_en_charge' | 'autre_moyen_paiement'> = [
    'identifiants',
    'relance',
    'procedure_prise_en_charge',
    'autre_moyen_paiement'
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Envoi d'emails</h3>
            {clientName && (
              <p className="text-xs text-white/60">Client: {clientName}</p>
            )}
          </div>
        </div>
        {clientEmail && (
          <p className="text-xs text-white/70 ml-11">
            <Mail className="w-3 h-3 inline mr-1" />
            {clientEmail}
          </p>
        )}
      </div>

      {showSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-start gap-2 animate-fade-in backdrop-blur-sm">
          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-300">Succès</p>
            <p className="text-xs text-green-200/80">{message}</p>
          </div>
        </div>
      )}

      {showError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2 animate-fade-in backdrop-blur-sm">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-300">Erreur</p>
            <p className="text-xs text-red-200/80">{message}</p>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <button
          onClick={testConfiguration}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white text-xs font-medium rounded-lg transition-all duration-200 backdrop-blur-sm"
        >
          Test de Configuration
        </button>
        {testResult && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <pre className="text-xs text-white/80 whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pb-8">
        {emailTypes.map((type) => {
          let buttonColors = 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40';

          if (type === 'identifiants') {
            buttonColors = 'bg-blue-700/30 hover:bg-blue-600/40 border-blue-600/40 hover:border-blue-500/60';
          } else if (type === 'relance') {
            buttonColors = 'bg-orange-700/30 hover:bg-orange-600/40 border-orange-600/40 hover:border-orange-500/60';
          } else if (type === 'procedure_prise_en_charge') {
            buttonColors = 'bg-green-700/30 hover:bg-green-600/40 border-green-600/40 hover:border-green-500/60';
          } else if (type === 'autre_moyen_paiement') {
            buttonColors = 'bg-yellow-700/30 hover:bg-yellow-600/40 border-yellow-600/40 hover:border-yellow-500/60';
          }

          return (
            <div key={type} className="relative group">
              <button
                onClick={() => {
                  alert(`BOUTON CLIQUÉ!\n\nType: ${type}\nClient ID: ${clientId}\nClient Name: ${clientName}\nClient Email: ${clientEmail}`);
                  addDebugLog(`🖱️ BOUTON CLIQUÉ: ${type}`);
                  sendEmail(type);
                }}
                disabled={sending !== null}
                className={`flex items-center gap-3 px-6 py-4 ${buttonColors} border-2 text-white text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105`}
              >
                {sending === type ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    {getButtonIcon(type)}
                    <span>{getButtonLabel(type)}</span>
                  </>
                )}
              </button>

              {lastSent[type] && (
                <div className="absolute -bottom-6 left-0 right-0 text-xs text-white/50 text-center whitespace-nowrap">
                  {formatLastSent(lastSent[type])}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
        <p className="text-xs text-white/70">
          <strong className="text-white/90">Note:</strong> Les emails seront envoyés depuis <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300">administration@securiteprofessionnelle.fr</code>
        </p>
        <ul className="text-[11px] text-white/60 mt-2 space-y-1 ml-4 list-disc">
          <li><strong className="text-white/80">Identifiants:</strong> Envoie les identifiants de connexion au client</li>
          <li><strong className="text-white/80">Relance:</strong> Envoie un email de relance au client</li>
          <li><strong className="text-white/80">Procédure de prise en charge:</strong> Envoie la procédure avec facture et attestation PDF</li>
          <li><strong className="text-white/80">Autre moyen de paiement:</strong> Envoie les informations sur les moyens de paiement disponibles</li>
        </ul>
      </div>

      {debugLogs.length > 0 && (
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] text-green-400 rounded-lg p-4 mt-4 max-h-96 overflow-y-auto border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">Debug Log (visible dans l'interface)</h4>
            <button
              onClick={() => setDebugLogs([])}
              className="text-xs text-gray-400 hover:text-white"
            >
              Effacer
            </button>
          </div>
          <div className="space-y-1 font-mono text-xs">
            {debugLogs.map((log, index) => (
              <div key={index} className="text-green-400">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientEmailSender;
