import React, { useState, useEffect } from 'react';
import { Clock, Mail, CheckCircle, XCircle, RefreshCw, Eye, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailHistoryItem {
  id: string;
  client_id: number;
  template_key: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  attachments: string;
  status: string;
  error_message?: string;
  retry_count: number;
  sent_at: string;
  last_retry_at?: string;
}

const EmailHistory: React.FC = () => {
  const [history, setHistory] = useState<EmailHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailHistoryItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed'>('all');

  useEffect(() => {
    loadHistory();
  }, [filterStatus]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('email_send_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus === 'sent' ? 'sent' : 'error');
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (item: EmailHistoryItem) => {
    setRetrying(item.id);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-v2`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          clientId: item.client_id,
          templateKey: item.template_key,
          emailOverride: item.recipient_email
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors du réessai');
      }

      await supabase
        .from('email_send_history')
        .update({
          retry_count: item.retry_count + 1,
          last_retry_at: new Date().toISOString()
        })
        .eq('id', item.id);

      loadHistory();

    } catch (error: any) {
      console.error('Erreur réessai:', error);
      alert(`Erreur lors du réessai: ${error.message}`);
    } finally {
      setRetrying(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAttachmentsList = (attachmentsJson: string) => {
    try {
      const attachments = JSON.parse(attachmentsJson);
      return attachments;
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historique des envois</h2>
            <p className="text-sm text-gray-600">{history.length} emails</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus('sent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'sent'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Envoyés
          </button>
          <button
            onClick={() => setFilterStatus('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Échecs
          </button>
        </div>
      </div>

      {selectedEmail ? (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Détails de l'envoi</h3>
            <button
              onClick={() => setSelectedEmail(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              Fermer
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Destinataire</p>
                <p className="text-gray-900">{selectedEmail.recipient_name}</p>
                <p className="text-sm text-gray-600">{selectedEmail.recipient_email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date d'envoi</p>
                <p className="text-gray-900">{formatDate(selectedEmail.sent_at)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sujet</p>
              <p className="text-gray-900">{selectedEmail.subject}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Contenu</p>
              <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
              </div>
            </div>

            {selectedEmail.attachments && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Pièces jointes</p>
                <div className="flex flex-wrap gap-2">
                  {getAttachmentsList(selectedEmail.attachments).map((att: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {att.filename || att.type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedEmail.status !== 'sent' && selectedEmail.error_message && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-1">Erreur</p>
                <p className="text-sm text-red-700">{selectedEmail.error_message}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun email dans l'historique</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {item.status === 'sent' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.recipient_name}</p>
                        <p className="text-sm text-gray-600">{item.recipient_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(item.sent_at)}</p>
                        {item.retry_count > 0 && (
                          <p className="text-xs text-purple-600">
                            {item.retry_count} réessai{item.retry_count > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Sujet:</strong> {item.subject}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {item.template_key}
                      </span>
                      {item.attachments && getAttachmentsList(item.attachments).length > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {getAttachmentsList(item.attachments).length} PDF{getAttachmentsList(item.attachments).length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {item.status !== 'sent' && item.error_message && (
                      <p className="text-sm text-red-600 mt-2">
                        <strong>Erreur:</strong> {item.error_message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedEmail(item)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {item.status !== 'sent' && (
                      <button
                        onClick={() => handleRetry(item)}
                        disabled={retrying === item.id}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Réessayer"
                      >
                        {retrying === item.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EmailHistory;
