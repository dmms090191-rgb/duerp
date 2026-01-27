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

  const getButtonColor = (type: string) => {
    switch (type) {
      case 'identifiants':
        return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      case 'relance':
        return 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700';
      case 'procedure_prise_en_charge':
        return 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      case 'autre_moyen_paiement':
        return 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700';
      default:
        return 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
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
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Envoi d'emails</h3>
            {clientName && (
              <p className="text-sm text-gray-600">Client: {clientName}</p>
            )}
          </div>
        </div>
        {clientEmail && (
          <p className="text-sm text-gray-600 ml-13">
            <Mail className="w-4 h-4 inline mr-1" />
            {clientEmail}
          </p>
        )}
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">Succès</p>
            <p className="text-sm text-green-700">{message}</p>
          </div>
        </div>
      )}

      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Erreur</p>
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <button
          onClick={testConfiguration}
          className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
        >
          🧪 Test de Configuration
        </button>
        {testResult && (
          <div className="mt-3 p-3 bg-white rounded border border-yellow-300">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {emailTypes.map((type) => (
          <div key={type} className="space-y-2">
            <button
              onClick={() => {
                alert(`BOUTON CLIQUÉ!\n\nType: ${type}\nClient ID: ${clientId}\nClient Name: ${clientName}\nClient Email: ${clientEmail}`);
                addDebugLog(`🖱️ BOUTON CLIQUÉ: ${type}`);
                sendEmail(type);
              }}
              disabled={sending !== null}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r ${getButtonColor(type)} text-white rounded-lg font-semibold shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {sending === type ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  {getButtonIcon(type)}
                  {getButtonLabel(type)}
                </>
              )}
            </button>

            {lastSent[type] && (
              <p className="text-xs text-gray-500 text-center">
                Dernier envoi: {formatLastSent(lastSent[type])}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Les emails seront envoyés depuis <code className="bg-yellow-100 px-1 rounded">administration@securiteprofessionnelle.fr</code>
        </p>
        <ul className="text-xs text-yellow-700 mt-2 space-y-1 ml-4 list-disc">
          <li><strong>Identifiants:</strong> Envoie les identifiants de connexion au client</li>
          <li><strong>Relance:</strong> Envoie un email de relance au client</li>
          <li><strong>Procédure de prise en charge:</strong> Envoie la procédure avec facture et attestation PDF</li>
          <li><strong>Autre moyen de paiement:</strong> Envoie les informations sur les moyens de paiement disponibles</li>
        </ul>
      </div>

      {debugLogs.length > 0 && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 mt-4 max-h-96 overflow-y-auto">
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
