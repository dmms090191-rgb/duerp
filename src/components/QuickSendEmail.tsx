import React, { useState, useEffect } from 'react';
import { Search, Send, Mail, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Client {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  societe?: string;
}

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  body_html: string;
  is_active: boolean;
}

interface PDFInfo {
  name: string;
  type: string;
}

const QuickSendEmail: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [pdfs, setPdfs] = useState<PDFInfo[]>([]);
  const [emailOverride, setEmailOverride] = useState('');
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchClients();
    } else {
      setClients([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (selectedTemplate) {
      loadPDFsForTemplate(selectedTemplate.id);
    } else {
      setPdfs([]);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const searchClients = async () => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, email, phone, societe')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur recherche clients:', error);
    } finally {
      setSearching(false);
    }
  };

  const loadPDFsForTemplate = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_template_pdfs')
        .select(`
          pdf_templates (
            name,
            pdf_type,
            dynamic_type
          )
        `)
        .eq('email_template_id', templateId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const pdfList = (data || []).map((item: any) => ({
        name: item.pdf_templates.name,
        type: item.pdf_templates.pdf_type === 'dynamic'
          ? `Dynamique (${item.pdf_templates.dynamic_type})`
          : 'Statique'
      }));

      setPdfs(pdfList);
    } catch (error) {
      console.error('Erreur chargement PDFs:', error);
    }
  };

  const handleSend = async () => {
    if (!selectedClient || !selectedTemplate) return;

    setSending(true);
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
          clientId: selectedClient.id,
          templateKey: selectedTemplate.key,
          emailOverride: emailOverride || undefined
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }

      setMessage({
        type: 'success',
        text: `Email envoyé avec succès à ${result.recipient}!`
      });

      setTimeout(() => {
        setSelectedClient(null);
        setSelectedTemplate(null);
        setEmailOverride('');
        setSearchTerm('');
        setMessage(null);
      }, 3000);

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erreur lors de l\'envoi de l\'email'
      });
    } finally {
      setSending(false);
    }
  };

  const getPreviewSubject = () => {
    if (!selectedTemplate || !selectedClient) return '';

    return selectedTemplate.subject
      .replace(/\{\{prenom\}\}/g, selectedClient.full_name.split(' ')[0] || '')
      .replace(/\{\{nom\}\}/g, selectedClient.full_name.split(' ')[1] || '')
      .replace(/\{\{full_name\}\}/g, selectedClient.full_name)
      .replace(/\{\{societe\}\}/g, selectedClient.societe || '')
      .replace(/\{\{email\}\}/g, selectedClient.email);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Send className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Envoi rapide</h2>
            <p className="text-sm text-gray-600">Idéal pour un envoi pendant un appel téléphonique</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Rechercher le client
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, email ou téléphone..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
              )}
            </div>

            {clients.length > 0 && !selectedClient && (
              <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setClients([]);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{client.full_name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    {client.phone && (
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedClient && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-green-900">{selectedClient.full_name}</p>
                    <p className="text-sm text-green-700">{selectedClient.email}</p>
                    {selectedClient.phone && (
                      <p className="text-sm text-green-600">{selectedClient.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedClient && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Choisir le type d'email
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className={`w-5 h-5 ${
                            selectedTemplate?.id === template.id ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <p className={`font-medium ${
                              selectedTemplate?.id === template.id ? 'text-green-900' : 'text-gray-900'
                            }`}>
                              {template.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Clé: {template.key}</p>
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Aperçu</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong className="text-blue-800">Sujet:</strong>{' '}
                        <span className="text-blue-700">{getPreviewSubject()}</span>
                      </p>
                      <p className="text-blue-700">
                        {selectedTemplate.body_html.substring(0, 150).replace(/<[^>]*>/g, '')}...
                      </p>
                      {pdfs.length > 0 && (
                        <div className="mt-3">
                          <strong className="text-blue-800">PDFs attachés ({pdfs.length}):</strong>
                          <ul className="mt-1 space-y-1">
                            {pdfs.map((pdf, index) => (
                              <li key={index} className="flex items-center gap-2 text-blue-700">
                                <FileText className="w-4 h-4" />
                                {pdf.name}
                                <span className="text-xs">({pdf.type})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3. Email destinataire (optionnel)
                    </label>
                    <input
                      type="email"
                      value={emailOverride}
                      onChange={(e) => setEmailOverride(e.target.value)}
                      placeholder={selectedClient.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide pour utiliser: {selectedClient.email}
                    </p>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Envoyer maintenant
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSendEmail;
