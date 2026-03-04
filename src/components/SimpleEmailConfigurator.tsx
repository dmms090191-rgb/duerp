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
        <div className="text-lg text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10 backdrop-blur-2xl">
        <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex items-center gap-2 sm:gap-3 md:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight">
                Configuration des Emails
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium">
                Gérez vos 3 emails automatiques et leurs pièces jointes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {templates.map((template) => {
          const isEditing = editingId === template.id;
          const linkedPdfs = pdfsMap[template.id] || [];
          const unlinkedPdfs = availablePDFs.filter(
            pdf => !linkedPdfs.some(link => link.pdf_template_id === pdf.id)
          );

          return (
            <div
              key={template.id}
              className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/10 overflow-hidden hover:shadow-2xl transition-all"
            >
              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] p-4 sm:p-5 md:p-6 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative">
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">{getEmailIcon(template.key)}</div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-lg line-clamp-2">{template.name}</h3>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
                {isEditing ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-[#1a2847]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Sujet
                      </label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Contenu HTML
                      </label>
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={10}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 font-mono placeholder-white/50"
                      />
                      <p className="text-xs text-white/70 mt-2 break-words">
                        Variables: {'{{prenom}}'}, {'{{nom}}'}, {'{{email}}'}, {'{{password}}'}, {'{{societe}}'}, {'{{siret}}'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => saveTemplate(template.id)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all duration-300 font-bold shadow-lg disabled:opacity-50 border-2 border-white/20 text-sm sm:text-base"
                      >
                        <Check className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="sm:w-auto px-4 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border-2 border-white/20 flex items-center justify-center"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#1a2847]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <div className="text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">Sujet</div>
                      <div className="text-white font-medium text-sm sm:text-base break-words">{template.subject}</div>
                    </div>

                    {showPreview === template.id && (
                      <div className="border-2 border-blue-400/50 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-[#1a2847]/50 max-h-48 sm:max-h-64 overflow-y-auto">
                        <div
                          className="prose prose-sm prose-invert max-w-none text-white text-xs sm:text-sm"
                          dangerouslySetInnerHTML={{ __html: template.body_html || template.body }}
                        />
                      </div>
                    )}

                    <div className="space-y-2 bg-[#1a2847]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wide">
                        <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                        PDFs attachés ({linkedPdfs.length})
                      </div>
                      {linkedPdfs.length > 0 ? (
                        <div className="space-y-2">
                          {linkedPdfs.map((link) => (
                            <div
                              key={link.pdf_template_id}
                              className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-[#1a2847]/70 rounded-lg border-2 border-white/20"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-white truncate">
                                  {link.pdf_templates.name}
                                </span>
                              </div>
                              <button
                                onClick={() => removePDF(template.id, link.pdf_template_id)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-white/70 italic">Aucun PDF attaché</p>
                      )}

                      {unlinkedPdfs.length > 0 && (
                        <div className="pt-2">
                          <div className="text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">Ajouter un PDF:</div>
                          <div className="space-y-1">
                            {unlinkedPdfs.map(pdf => (
                              <button
                                key={pdf.id}
                                onClick={() => addPDF(template.id, pdf.id)}
                                className="w-full flex items-center gap-2 p-2 border-2 border-dashed border-white/30 rounded-lg hover:border-blue-400/50 hover:bg-[#1a2847]/70 transition-colors text-left"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300 flex-shrink-0" />
                                <span className="font-medium text-white text-xs sm:text-sm truncate">{pdf.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => startEdit(template)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white rounded-lg sm:rounded-xl hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 font-bold shadow-xl border border-blue-400/30 text-sm sm:text-base"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => setShowPreview(showPreview === template.id ? null : template.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl transition-colors font-medium border-2 border-white/20 text-sm sm:text-base"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden xs:inline">{showPreview === template.id ? 'Masquer aperçu' : 'Voir aperçu'}</span>
                        <span className="xs:hidden">{showPreview === template.id ? 'Masquer' : 'Aperçu'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/10 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white flex items-center justify-center ring-2 ring-white/30 shadow-lg flex-shrink-0">
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white mb-1 drop-shadow-lg">Envoyer un Email de Test</h3>
              <p className="text-white/70 mb-2 sm:mb-4 text-xs sm:text-sm md:text-base">
                Testez vos emails avant de les envoyer aux clients
              </p>
            </div>
          </div>
          <div className="bg-[#1a2847]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="votre-email@exemple.com"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 font-medium text-sm sm:text-base"
              />
              <select
                onChange={(e) => {
                  const template = templates.find(t => t.id === parseInt(e.target.value));
                  if (template) sendTest(template);
                }}
                disabled={sendingTest || !testEmail}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20 text-sm sm:text-base"
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
