import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, FileText, Save, Eye, Send, Edit2, X, Check, Paperclip, Trash2, Plus } from 'lucide-react';

interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  body: string;
  body_html: string | null;
}

interface PDFTemplate {
  id: number;
  name: string;
  pdf_type: 'static' | 'dynamic';
  dynamic_type: string | null;
  file_url: string | null;
}

interface TemplatePDFLink {
  pdf_template_id: number;
  pdf_templates: PDFTemplate;
}

export default function SimpleEmailConfigurator() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [pdfsMap, setPdfsMap] = useState<Record<number, TemplatePDFLink[]>>({});
  const [availablePDFs, setAvailablePDFs] = useState<PDFTemplate[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [showPreview, setShowPreview] = useState<number | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('*')
        .in('key', ['identifiants', 'relance', 'procedure_prise_en_charge'])
        .order('name');

      if (templatesData) {
        setTemplates(templatesData);

        const pdfsData: Record<number, TemplatePDFLink[]> = {};
        for (const template of templatesData) {
          const { data: linkedPdfs } = await supabase
            .from('email_template_pdfs')
            .select('pdf_template_id, pdf_templates(*)')
            .eq('email_template_id', template.id);

          pdfsData[template.id] = linkedPdfs || [];
        }
        setPdfsMap(pdfsData);
      }

      const { data: pdfsData } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('name');

      setAvailablePDFs(pdfsData || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (template: EmailTemplate) => {
    setEditingId(template.id);
    setEditSubject(template.subject);
    setEditBody(template.body_html || template.body);
    setShowPreview(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSubject('');
    setEditBody('');
  };

  const saveTemplate = async (templateId: number) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: editSubject,
          body_html: editBody,
          body: editBody.replace(/<[^>]*>/g, '')
        })
        .eq('id', templateId);

      if (error) throw error;

      await loadData();
      setEditingId(null);
      alert('✅ Email enregistré!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addPDF = async (templateId: number, pdfId: number) => {
    try {
      const currentPdfs = pdfsMap[templateId] || [];
      const maxOrder = currentPdfs.length > 0
        ? Math.max(...currentPdfs.map((_, idx) => idx + 1))
        : 0;

      const { error } = await supabase
        .from('email_template_pdfs')
        .insert({
          email_template_id: templateId,
          pdf_template_id: pdfId,
          display_order: maxOrder + 1
        });

      if (error) throw error;

      await loadData();
      alert('✅ PDF ajouté!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'ajout');
    }
  };

  const removePDF = async (templateId: number, pdfId: number) => {
    if (!confirm('Retirer ce PDF?')) return;

    try {
      const { error } = await supabase
        .from('email_template_pdfs')
        .delete()
        .eq('email_template_id', templateId)
        .eq('pdf_template_id', pdfId);

      if (error) throw error;

      await loadData();
      alert('✅ PDF retiré!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const sendTest = async (template: EmailTemplate) => {
    if (!testEmail) {
      alert('Entrez une adresse email de test');
      return;
    }

    if (!confirm(`Envoyer à ${testEmail}?`)) return;

    setSendingTest(true);
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!client) {
        alert('❌ Aucun client disponible');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-v2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            clientId: client.id,
            templateKey: template.key,
            emailOverride: testEmail
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`✅ Email envoyé à ${testEmail}!`);
        setTestEmail('');
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'envoi');
    } finally {
      setSendingTest(false);
    }
  };

  const getEmailIcon = (key: string) => {
    switch (key) {
      case 'identifiants':
        return '🔑';
      case 'relance':
        return '🔔';
      case 'procedure_prise_en_charge':
        return '📋';
      default:
        return '📧';
    }
  };

  const getEmailColor = (key: string) => {
    switch (key) {
      case 'identifiants':
        return 'from-slate-700 to-slate-800';
      case 'relance':
        return 'from-orange-500 to-orange-600';
      case 'procedure_prise_en_charge':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configuration des Emails</h1>
            <p className="text-blue-100 text-lg">
              Gérez vos 3 emails automatiques et leurs pièces jointes
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <Mail className="w-16 h-16" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isEditing = editingId === template.id;
          const linkedPdfs = pdfsMap[template.id] || [];
          const unlinkedPdfs = availablePDFs.filter(
            pdf => !linkedPdfs.some(link => link.pdf_template_id === pdf.id)
          );

          return (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className={`bg-gradient-to-r ${getEmailColor(template.key)} p-6 text-white`}>
                <div className="text-5xl mb-3">{getEmailIcon(template.key)}</div>
                <h3 className="text-2xl font-bold">{template.name}</h3>
              </div>

              <div className="p-6 space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sujet
                      </label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contenu HTML
                      </label>
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Variables: {'{{prenom}}'}, {'{{nom}}'}, {'{{email}}'}, {'{{password}}'}, {'{{societe}}'}, {'{{siret}}'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveTemplate(template.id)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 mb-1">Sujet</div>
                      <div className="text-gray-900 font-medium">{template.subject}</div>
                    </div>

                    {showPreview === template.id && (
                      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 max-h-64 overflow-y-auto">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: template.body_html || template.body }}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Paperclip className="w-4 h-4" />
                        PDFs attachés ({linkedPdfs.length})
                      </div>
                      {linkedPdfs.length > 0 ? (
                        <div className="space-y-2">
                          {linkedPdfs.map((link) => (
                            <div
                              key={link.pdf_template_id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {link.pdf_templates.name}
                                </span>
                              </div>
                              <button
                                onClick={() => removePDF(template.id, link.pdf_template_id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Aucun PDF attaché</p>
                      )}

                      {unlinkedPdfs.length > 0 && (
                        <div className="pt-2">
                          <div className="text-xs font-semibold text-gray-600 mb-2">Ajouter un PDF:</div>
                          <div className="space-y-1">
                            {unlinkedPdfs.map(pdf => (
                              <button
                                key={pdf.id}
                                onClick={() => addPDF(template.id, pdf.id)}
                                className="w-full flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left text-sm"
                              >
                                <Plus className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-gray-700">{pdf.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => startEdit(template)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => setShowPreview(showPreview === template.id ? null : template.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        {showPreview === template.id ? 'Masquer aperçu' : 'Voir aperçu'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
        <div className="flex items-start gap-6">
          <div className="bg-green-600 rounded-2xl p-4 text-white">
            <Send className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Envoyer un Email de Test</h3>
            <p className="text-gray-600 mb-4">
              Testez vos emails avant de les envoyer aux clients
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="votre-email@exemple.com"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                onChange={(e) => {
                  const template = templates.find(t => t.id === parseInt(e.target.value));
                  if (template) sendTest(template);
                }}
                disabled={sendingTest || !testEmail}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Envoyer...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
