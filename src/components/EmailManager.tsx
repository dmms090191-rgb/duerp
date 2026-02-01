import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, Send, Eye, Clock, CheckCircle, XCircle, FileText, Users, File, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ClientEmailSender from './ClientEmailSender';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface EmailHistory {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  error_message?: string;
}

interface PDFTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  content: any;
  header_html?: string;
  footer_html?: string;
  styles?: string;
  created_at: string;
  updated_at: string;
}

const EmailManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'send' | 'quick-send' | 'history'>('templates');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [pdfTemplates, setPdfTemplates] = useState<PDFTemplate[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPdfTemplateModal, setShowPdfTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingPdfTemplate, setEditingPdfTemplate] = useState<PDFTemplate | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'general'
  });

  const [pdfTemplateForm, setPdfTemplateForm] = useState({
    name: '',
    type: '',
    description: '',
    content: '{}',
    header_html: '',
    footer_html: '',
    styles: ''
  });

  const [sendEmailForm, setSendEmailForm] = useState({
    template_id: '',
    recipient_email: '',
    recipient_name: '',
    custom_subject: '',
    custom_body: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchPdfTemplates();
    fetchEmailHistory();
    fetchClients();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('email_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmailHistory(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, email, full_name, prenom, nom')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const fetchPdfTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPdfTemplates(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates PDF:', error);
    }
  };

  const handleSavePdfTemplate = async () => {
    try {
      if (editingPdfTemplate) {
        const { error } = await supabase
          .from('pdf_templates')
          .update({
            name: pdfTemplateForm.name,
            type: pdfTemplateForm.type,
            description: pdfTemplateForm.description,
            content: JSON.parse(pdfTemplateForm.content || '{}'),
            header_html: pdfTemplateForm.header_html,
            footer_html: pdfTemplateForm.footer_html,
            styles: pdfTemplateForm.styles,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPdfTemplate.id);

        if (error) throw error;
        alert('Template PDF mis à jour avec succès!');
      } else {
        const { error } = await supabase
          .from('pdf_templates')
          .insert([{
            name: pdfTemplateForm.name,
            type: pdfTemplateForm.type,
            description: pdfTemplateForm.description,
            content: JSON.parse(pdfTemplateForm.content || '{}'),
            header_html: pdfTemplateForm.header_html,
            footer_html: pdfTemplateForm.footer_html,
            styles: pdfTemplateForm.styles
          }]);

        if (error) throw error;
        alert('Template PDF créé avec succès!');
      }

      setShowPdfTemplateModal(false);
      setEditingPdfTemplate(null);
      setPdfTemplateForm({
        name: '',
        type: '',
        description: '',
        content: '{}',
        header_html: '',
        footer_html: '',
        styles: ''
      });
      fetchPdfTemplates();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du template PDF');
    }
  };

  const handleDeletePdfTemplate = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce template PDF?')) return;

    try {
      const { error } = await supabase
        .from('pdf_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Template PDF supprimé avec succès!');
      fetchPdfTemplates();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du template PDF');
    }
  };

  const handleEditPdfTemplate = (template: PDFTemplate) => {
    setEditingPdfTemplate(template);
    setPdfTemplateForm({
      name: template.name,
      type: template.type,
      description: template.description || '',
      content: JSON.stringify(template.content, null, 2),
      header_html: template.header_html || '',
      footer_html: template.footer_html || '',
      styles: template.styles || ''
    });
    setShowPdfTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: templateForm.name,
            subject: templateForm.subject,
            body: templateForm.body,
            type: templateForm.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        alert('Template mis à jour avec succès!');
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([{
            name: templateForm.name,
            subject: templateForm.subject,
            body: templateForm.body,
            type: templateForm.type
          }]);

        if (error) throw error;
        alert('Template créé avec succès!');
      }

      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', subject: '', body: '', type: 'general' });
      fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Template supprimé avec succès!');
      fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du template');
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type
    });
    setShowTemplateModal(true);
  };

  const handleSendEmail = async () => {
    try {
      const { error } = await supabase
        .from('email_history')
        .insert([{
          recipient_email: sendEmailForm.recipient_email,
          recipient_name: sendEmailForm.recipient_name,
          subject: sendEmailForm.custom_subject,
          body: sendEmailForm.custom_body,
          status: 'sent',
          sent_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Email enregistré avec succès!');
      setSendEmailForm({
        template_id: '',
        recipient_email: '',
        recipient_name: '',
        custom_subject: '',
        custom_body: ''
      });
      fetchEmailHistory();
      setActiveTab('history');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'enregistrement de l\'email');
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSendEmailForm({
        ...sendEmailForm,
        template_id: templateId,
        custom_subject: template.subject,
        custom_body: template.body
      });
    }
  };

  const handleSelectClient = (email: string) => {
    const client = clients.find(c => c.email === email);
    if (client) {
      setSendEmailForm({
        ...sendEmailForm,
        recipient_email: email,
        recipient_name: client.full_name || `${client.prenom} ${client.nom}`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Emails</h2>
              <p className="text-sm text-gray-500">Créez et gérez vos templates d'emails</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'text-purple-700 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-purple-700 bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Templates Email
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'send'
                  ? 'text-purple-700 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-purple-700 bg-gray-50'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Envoyer
            </button>
            <button
              onClick={() => setActiveTab('quick-send')}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'quick-send'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-blue-700 bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Envoi rapide
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-purple-700 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-purple-700 bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Historique
            </button>
          </div>
        </div>

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Templates d'emails</h3>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setTemplateForm({ name: '', subject: '', body: '', type: 'general' });
                  setShowTemplateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouveau Template
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucun template d'email</p>
                <p className="text-sm text-gray-400">Créez votre premier template pour commencer</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          {template.type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Sujet:</strong> {template.subject}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-3">{template.body}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      Créé le {new Date(template.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === 'send' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Envoyer un email</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sélectionner un template (optionnel)
                  </label>
                  <select
                    value={sendEmailForm.template_id}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">-- Choisir un template --</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Sélectionner un client
                  </label>
                  <select
                    value={sendEmailForm.recipient_email}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">-- Choisir un client --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.email}>
                        {client.full_name || `${client.prenom} ${client.nom}`} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email du destinataire
                  </label>
                  <input
                    type="email"
                    value={sendEmailForm.recipient_email}
                    onChange={(e) => setSendEmailForm({ ...sendEmailForm, recipient_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="email@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du destinataire
                  </label>
                  <input
                    type="text"
                    value={sendEmailForm.recipient_name}
                    onChange={(e) => setSendEmailForm({ ...sendEmailForm, recipient_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sujet de l'email
                  </label>
                  <input
                    type="text"
                    value={sendEmailForm.custom_subject}
                    onChange={(e) => setSendEmailForm({ ...sendEmailForm, custom_subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Sujet de votre email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Corps de l'email
                  </label>
                  <textarea
                    value={sendEmailForm.custom_body}
                    onChange={(e) => setSendEmailForm({ ...sendEmailForm, custom_body: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-64"
                    placeholder="Contenu de votre email..."
                  />
                </div>

                <button
                  onClick={handleSendEmail}
                  disabled={!sendEmailForm.recipient_email || !sendEmailForm.custom_subject || !sendEmailForm.custom_body}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <Send className="w-5 h-5" />
                  Envoyer l'email
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quick-send' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Envoi rapide d'emails</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Sélectionner un client
                </label>
                <select
                  value={selectedClientId || ''}
                  onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">-- Choisir un client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name || `${client.prenom} ${client.nom}`} - {client.email}
                    </option>
                  ))}
                </select>

                {selectedClientId && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Client sélectionné:</p>
                    {(() => {
                      const client = clients.find(c => c.id === selectedClientId);
                      return client ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            <strong>Nom:</strong> {client.full_name || `${client.prenom} ${client.nom}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {client.email}
                          </p>
                          {client.phone && (
                            <p className="text-sm text-gray-600">
                              <strong>Téléphone:</strong> {client.phone}
                            </p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                {selectedClientId ? (
                  <ClientEmailSender
                    clientId={selectedClientId}
                    clientName={(() => {
                      const client = clients.find(c => c.id === selectedClientId);
                      return client ? (client.full_name || `${client.prenom} ${client.nom}`) : '';
                    })()}
                    clientEmail={(() => {
                      const client = clients.find(c => c.id === selectedClientId);
                      return client?.email || '';
                    })()}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Mail className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Aucun client sélectionné</p>
                    <p className="text-sm text-gray-500">Veuillez sélectionner un client pour envoyer un email</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Historique des emails</h3>

            {emailHistory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucun email envoyé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Destinataire
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Sujet
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emailHistory.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{email.recipient_name}</p>
                            <p className="text-sm text-gray-500">{email.recipient_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{email.subject}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(email.sent_at).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          {email.status === 'sent' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              <CheckCircle className="w-3 h-3" />
                              Envoyé
                            </span>
                          )}
                          {email.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              <XCircle className="w-3 h-3" />
                              Échoué
                            </span>
                          )}
                          {email.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                              <Clock className="w-3 h-3" />
                              En attente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
              </h3>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                }}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du template
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ex: Email de bienvenue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="general">Général</option>
                  <option value="welcome">Bienvenue</option>
                  <option value="reminder">Relance</option>
                  <option value="notification">Notification</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Sujet de l'email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Corps de l'email
                </label>
                <textarea
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-64"
                  placeholder="Contenu de l'email..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateForm.name || !templateForm.subject || !templateForm.body}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTemplate ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPdfTemplateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingPdfTemplate ? 'Modifier le template PDF' : 'Nouveau template PDF'}
              </h3>
              <button
                onClick={() => {
                  setShowPdfTemplateModal(false);
                  setEditingPdfTemplate(null);
                }}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du template
                  </label>
                  <input
                    type="text"
                    value={pdfTemplateForm.name}
                    onChange={(e) => setPdfTemplateForm({ ...pdfTemplateForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: DUERP Standard"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type / Clé unique
                  </label>
                  <input
                    type="text"
                    value={pdfTemplateForm.type}
                    onChange={(e) => setPdfTemplateForm({ ...pdfTemplateForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: duerp_standard"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={pdfTemplateForm.description}
                  onChange={(e) => setPdfTemplateForm({ ...pdfTemplateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description courte du template"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contenu JSON
                </label>
                <textarea
                  value={pdfTemplateForm.content}
                  onChange={(e) => setPdfTemplateForm({ ...pdfTemplateForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 font-mono text-sm"
                  placeholder='{"sections": [], "fields": []}'
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  En-tête HTML
                </label>
                <textarea
                  value={pdfTemplateForm.header_html}
                  onChange={(e) => setPdfTemplateForm({ ...pdfTemplateForm, header_html: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 font-mono text-sm"
                  placeholder="<div>En-tête du PDF</div>"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pied de page HTML
                </label>
                <textarea
                  value={pdfTemplateForm.footer_html}
                  onChange={(e) => setPdfTemplateForm({ ...pdfTemplateForm, footer_html: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 font-mono text-sm"
                  placeholder="<div>Pied de page du PDF</div>"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Styles CSS
                </label>
                <textarea
                  value={pdfTemplateForm.styles}
                  onChange={(e) => setPdfTemplateForm({ ...pdfTemplateForm, styles: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 font-mono text-sm"
                  placeholder=".header { font-size: 20px; }"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPdfTemplateModal(false);
                  setEditingPdfTemplate(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePdfTemplate}
                disabled={!pdfTemplateForm.name || !pdfTemplateForm.type}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingPdfTemplate ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManager;
