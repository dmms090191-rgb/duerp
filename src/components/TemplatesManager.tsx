import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Save, X, Eye, Send, FileText, CheckCircle, AlertCircle, Trash2, Settings, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  is_active: boolean;
  subject: string;
  body_html: string;
  created_at: string;
  updated_at: string;
}

interface PDFTemplate {
  id: string;
  name: string;
  pdf_type: 'static' | 'dynamic';
  dynamic_type?: string;
  file_url?: string;
  description?: string;
}

interface TemplateWithPDFs extends EmailTemplate {
  pdfs: PDFTemplate[];
}

const TemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateWithPDFs[]>([]);
  const [allPDFs, setAllPDFs] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithPDFs | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPdfConfig, setShowPdfConfig] = useState(false);
  const [configuringPdf, setConfiguringPdf] = useState<PDFTemplate | null>(null);
  const [pdfConfig, setPdfConfig] = useState({
    id: '',
    logo: '',
    companyName: 'Cabinet FPE',
    subtitle: 'Sécurité Professionnelle',
    email: 'administration@securiteprofessionnelle.fr',
    primaryColor: '#2563eb',
    footerText: 'Cabinet FPE - Sécurité Professionnelle'
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateWithPDFs | null>(null);
  const [clientIdForPreview, setClientIdForPreview] = useState('');
  const [generatingPreview, setGeneratingPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadPDFs();
    loadPdfConfiguration();
  }, []);

  const loadPdfConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_configuration')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPdfConfig({
          id: data.id,
          logo: data.logo_url || '',
          companyName: data.company_name || 'Cabinet FPE',
          subtitle: data.subtitle || 'Sécurité Professionnelle',
          email: data.email || 'administration@securiteprofessionnelle.fr',
          primaryColor: data.primary_color || '#2563eb',
          footerText: data.footer_text || 'Cabinet FPE - Sécurité Professionnelle'
        });
      }
    } catch (error) {
      console.error('Erreur chargement configuration PDF:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data: templatesData, error } = await supabase
        .from('email_templates')
        .select('*')
        .in('key', ['identifiants', 'relance', 'procedure_prise_en_charge'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const templatesWithPDFs = await Promise.all(
        (templatesData || []).map(async (template) => {
          const { data: pdfLinks } = await supabase
            .from('email_template_pdfs')
            .select(`
              pdf_template_id,
              display_order,
              pdf_templates (*)
            `)
            .eq('email_template_id', template.id)
            .order('display_order', { ascending: true });

          return {
            ...template,
            pdfs: pdfLinks?.map((link: any) => link.pdf_templates) || []
          };
        })
      );

      setTemplates(templatesWithPDFs);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPDFs = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .in('id', ['284267ff-78f2-434b-aa20-b909a04c5ecd', '801d7f25-aac4-4f9c-941b-84a13526a31e'])
        .order('name', { ascending: true });

      if (error) throw error;
      setAllPDFs(data || []);
    } catch (error) {
      console.error('Erreur chargement PDFs:', error);
    }
  };

  const handleEdit = (template: TemplateWithPDFs) => {
    setEditingTemplate({ ...template });
    setShowPreview(false);
  };

  const handleOpenPreviewModal = (template: TemplateWithPDFs) => {
    setPreviewingTemplate(template);
    setShowPreviewModal(true);
    setClientIdForPreview('');
  };

  const handleGeneratePreview = async () => {
    if (!previewingTemplate || !clientIdForPreview) return;

    setGeneratingPreview(true);
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
          clientId: parseInt(clientIdForPreview),
          templateKey: previewingTemplate.key,
          previewOnly: true
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la génération de l\'aperçu');
      }

      if (result.pdfUrls && result.pdfUrls.length > 0) {
        result.pdfUrls.forEach((url: string, index: number) => {
          setTimeout(() => {
            window.open(url, '_blank');
          }, index * 300);
        });

        setMessage({
          type: 'success',
          text: `${result.pdfUrls.length} PDF(s) ouvert(s) dans de nouveaux onglets`
        });

        setShowPreviewModal(false);
        setClientIdForPreview('');
      } else {
        setMessage({
          type: 'error',
          text: 'Aucun PDF généré'
        });
      }

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erreur lors de la génération de l\'aperçu'
      });
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('email_templates')
        .update({
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          body_html: editingTemplate.body_html,
          is_active: editingTemplate.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTemplate.id);

      if (updateError) throw updateError;

      await supabase
        .from('email_template_pdfs')
        .delete()
        .eq('email_template_id', editingTemplate.id);

      if (editingTemplate.pdfs.length > 0) {
        const { error: insertError } = await supabase
          .from('email_template_pdfs')
          .insert(
            editingTemplate.pdfs.map((pdf, index) => ({
              email_template_id: editingTemplate.id,
              pdf_template_id: pdf.id,
              display_order: index
            }))
          );

        if (insertError) throw insertError;
      }

      setMessage({ type: 'success', text: 'Template enregistré avec succès' });
      setEditingTemplate(null);
      loadTemplates();

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const togglePDF = (pdf: PDFTemplate) => {
    if (!editingTemplate) return;

    const exists = editingTemplate.pdfs.find(p => p.id === pdf.id);
    if (exists) {
      setEditingTemplate({
        ...editingTemplate,
        pdfs: editingTemplate.pdfs.filter(p => p.id !== pdf.id)
      });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        pdfs: [...editingTemplate.pdfs, pdf]
      });
    }
  };

  const renderVariablesHelp = () => (
    <div className="bg-blue-500/20 border-2 border-blue-400/30 rounded-lg p-3 text-xs sm:text-sm">
      <p className="font-semibold text-blue-300 mb-2">Variables disponibles :</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-blue-200">
        <code className="text-xs break-all">{'{{prenom}}'}</code>
        <code className="text-xs break-all">{'{{nom}}'}</code>
        <code className="text-xs break-all">{'{{email}}'}</code>
        <code className="text-xs break-all">{'{{password}}'}</code>
        <code className="text-xs break-all">{'{{societe}}'}</code>
        <code className="text-xs break-all">{'{{siret}}'}</code>
        <code className="text-xs break-all">{'{{full_name}}'}</code>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg border-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
            : 'bg-red-500/20 border-red-400/30 text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {!editingTemplate ? (
        <div className="grid gap-3 sm:gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all hover:border-blue-400/50">
              <div className="space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center ring-2 ring-white/20 flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white break-words">{template.name}</h3>
                      <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        template.is_active
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                          : 'bg-white/10 text-white/50 border border-white/20'
                      }`}>
                        {template.is_active ? 'Actif' : 'Inactif'}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 truncate">Clé: {template.key}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-white/80 break-words pl-0 sm:pl-[52px]">
                  <strong>Sujet:</strong> {template.subject}
                </p>

                {template.pdfs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pl-0 sm:pl-[52px]">
                    {template.pdfs.map((pdf) => (
                      <span key={pdf.id} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/30 text-purple-200 rounded border border-purple-400/30 text-xs">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{pdf.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => handleOpenPreviewModal(template)}
                    className="flex-1 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors border-2 border-white/20 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Aperçu</span>
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors border-2 border-white/20 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Édition du template</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center gap-2 border-2 border-white/20 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Édition' : 'Aperçu'}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 border-2 border-white/20 text-sm"
              >
                <Save className="w-4 h-4" />
                <span className="hidden xs:inline">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                <span className="xs:hidden">{saving ? '...' : 'Sauver'}</span>
              </button>
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border-2 border-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!showPreview ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Nom du template
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Statut
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.is_active}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-white">Template actif</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Sujet de l'email
                </label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 text-sm"
                  placeholder="Sujet de l'email..."
                />
              </div>

              {renderVariablesHelp()}

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Contenu de l'email (HTML)
                </label>
                <textarea
                  value={editingTemplate.body_html}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body_html: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 font-mono text-xs sm:text-sm text-white placeholder-white/50"
                  placeholder="Contenu HTML de l'email..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 sm:mb-3 uppercase tracking-wide">
                  PDFs attachés ({editingTemplate.pdfs.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {allPDFs.map((pdf) => {
                    const isSelected = editingTemplate.pdfs.find(p => p.id === pdf.id);
                    const isDynamic = pdf.pdf_type === 'dynamic' && (pdf.dynamic_type === 'facture' || pdf.dynamic_type === 'attestation');
                    return (
                      <div key={pdf.id} className="relative">
                        <button
                          onClick={() => togglePDF(pdf)}
                          className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-all ${
                            isSelected
                              ? 'border-blue-400/50 bg-blue-500/20'
                              : 'border-white/20 bg-[#1a2847]/50 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileText className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isSelected ? 'text-blue-300' : 'text-white/50'}`} />
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                  {pdf.name}
                                </p>
                                <p className="text-xs text-white/60 mt-1">
                                  {pdf.pdf_type === 'dynamic' ? `Dynamique (${pdf.dynamic_type})` : 'Statique'}
                                </p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 flex-shrink-0" />}
                          </div>
                        </button>
                        {isDynamic && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfiguringPdf(pdf);
                              setShowPdfConfig(true);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-[#1a2847] border-2 border-white/20 rounded-lg hover:bg-[#1a2847]/70 hover:border-blue-400/50 transition-colors shadow-sm"
                            title="Configurer le PDF"
                          >
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Sujet:</h4>
                <p className="text-white/80 text-sm break-words">{editingTemplate.subject}</p>
              </div>
              <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg p-3 sm:p-4 max-h-64 overflow-y-auto">
                <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Contenu:</h4>
                <div
                  className="prose prose-sm max-w-none text-white/80 text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: editingTemplate.body_html }}
                />
              </div>
              {editingTemplate.pdfs.length > 0 && (
                <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">PDFs attachés:</h4>
                  <ul className="space-y-2">
                    {editingTemplate.pdfs.map((pdf) => (
                      <li key={pdf.id} className="flex items-start sm:items-center gap-2 text-white/80 text-xs sm:text-sm">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="break-words flex-1">{pdf.name}</span>
                        <span className="text-xs text-white/60 flex-shrink-0">
                          ({pdf.pdf_type === 'dynamic' ? `Dynamique - ${pdf.dynamic_type}` : 'Statique'})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showPdfConfig && configuringPdf && (
        <div className="fixed inset-0 bg-[#1e3a5f]/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] border-2 border-white/10 rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a2847]/90 backdrop-blur-xl border-b-2 border-white/10 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center ring-2 ring-white/20 flex-shrink-0">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Configuration du PDF</h3>
                  <p className="text-xs sm:text-sm text-white/70 truncate">{configuringPdf.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPdfConfig(false);
                  setConfiguringPdf(null);
                }}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              <div className="bg-blue-500/20 border-2 border-blue-400/30 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-200">
                  <strong>Info:</strong> Personnalisez l'apparence de votre PDF. Ces modifications seront appliquées automatiquement lors de la génération du document.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Logo de l'entreprise
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  {pdfConfig.logo && (
                    <div className="w-32 h-32 border-2 border-white/20 rounded-lg flex items-center justify-center overflow-hidden bg-[#1a2847]/70">
                      <img src={pdfConfig.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPdfConfig({ ...pdfConfig, logo: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors border-2 border-white/20"
                    >
                      <Upload className="w-4 h-4" />
                      {pdfConfig.logo ? 'Changer le logo' : 'Ajouter un logo'}
                    </label>
                    <p className="text-xs text-white/60 mt-2">
                      Format recommandé: PNG transparent, 300x100px
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={pdfConfig.companyName}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, companyName: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 text-sm"
                    placeholder="Cabinet FPE"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={pdfConfig.subtitle}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 text-sm"
                    placeholder="Sécurité Professionnelle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={pdfConfig.email}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, email: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 text-sm"
                  placeholder="administration@securiteprofessionnelle.fr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Couleur principale
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={pdfConfig.primaryColor}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, primaryColor: e.target.value })}
                    className="h-10 w-full sm:w-20 rounded-lg border-2 border-white/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pdfConfig.primaryColor}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 font-mono text-white placeholder-white/50 text-sm"
                    placeholder="#2563eb"
                  />
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Cette couleur sera utilisée pour les titres et les éléments importants
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Texte du pied de page
                </label>
                <input
                  type="text"
                  value={pdfConfig.footerText}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, footerText: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 text-sm"
                  placeholder="Cabinet FPE - Sécurité Professionnelle"
                />
              </div>

              <div className="border-t-2 border-white/10 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowPdfConfig(false);
                    setConfiguringPdf(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border-2 border-white/20 text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    try {
                      setSaving(true);

                      let logoUrl = pdfConfig.logo;

                      // Si le logo est en base64, l'uploader dans Supabase Storage
                      if (pdfConfig.logo && pdfConfig.logo.startsWith('data:')) {
                        setUploadingLogo(true);

                        // Convertir base64 en blob
                        const base64Response = await fetch(pdfConfig.logo);
                        const blob = await base64Response.blob();

                        // Uploader dans Supabase Storage
                        const fileName = `logo_${Date.now()}.png`;
                        const { data: uploadData, error: uploadError } = await supabase.storage
                          .from('documents')
                          .upload(`logos/${fileName}`, blob, {
                            contentType: 'image/png',
                            upsert: true
                          });

                        if (uploadError) throw uploadError;

                        // Obtenir l'URL publique
                        const { data: urlData } = supabase.storage
                          .from('documents')
                          .getPublicUrl(`logos/${fileName}`);

                        logoUrl = urlData.publicUrl;
                        setUploadingLogo(false);
                      }

                      // Sauvegarder la configuration dans la base de données
                      const configData = {
                        logo_url: logoUrl,
                        company_name: pdfConfig.companyName,
                        subtitle: pdfConfig.subtitle,
                        email: pdfConfig.email,
                        primary_color: pdfConfig.primaryColor,
                        footer_text: pdfConfig.footerText,
                        updated_at: new Date().toISOString()
                      };

                      let error;
                      if (pdfConfig.id) {
                        // Mise à jour
                        const result = await supabase
                          .from('pdf_configuration')
                          .update(configData)
                          .eq('id', pdfConfig.id);
                        error = result.error;
                      } else {
                        // Insertion
                        const result = await supabase
                          .from('pdf_configuration')
                          .insert(configData)
                          .select()
                          .single();
                        error = result.error;
                        if (result.data) {
                          setPdfConfig({ ...pdfConfig, id: result.data.id, logo: logoUrl });
                        }
                      }

                      if (error) throw error;

                      setMessage({ type: 'success', text: 'Configuration PDF enregistrée avec succès !' });
                      setShowPdfConfig(false);
                      setConfiguringPdf(null);
                      await loadPdfConfiguration();
                      setTimeout(() => setMessage(null), 3000);
                    } catch (error: any) {
                      console.error('Erreur sauvegarde configuration:', error);
                      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'enregistrement' });
                      setTimeout(() => setMessage(null), 5000);
                    } finally {
                      setSaving(false);
                      setUploadingLogo(false);
                    }
                  }}
                  disabled={saving || uploadingLogo}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border-2 border-white/20 text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{uploadingLogo ? 'Upload du logo...' : saving ? 'Enregistrement...' : 'Enregistrer la configuration'}</span>
                  <span className="sm:hidden">{uploadingLogo ? 'Upload...' : saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 bg-[#1e3a5f]/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] border-2 border-white/10 rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white">Aperçu du template</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setClientIdForPreview('');
                }}
                className="text-white/70 hover:text-white flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-sm text-white/80 mb-2 break-words">
                  Template: <strong className="text-white">{previewingTemplate?.name}</strong>
                </p>
                <p className="text-xs text-white/60 mb-3 sm:mb-4">
                  Entrez l'ID d'un client pour générer un aperçu des PDFs qui seront joints à cet email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  ID du client
                </label>
                <input
                  type="number"
                  value={clientIdForPreview}
                  onChange={(e) => setClientIdForPreview(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full px-3 sm:px-4 py-2 border-2 border-white/20 bg-[#1a2847]/70 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 text-sm"
                  disabled={generatingPreview}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setClientIdForPreview('');
                  }}
                  className="flex-1 px-4 py-2 border-2 border-white/20 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  disabled={generatingPreview}
                >
                  Annuler
                </button>
                <button
                  onClick={handleGeneratePreview}
                  disabled={!clientIdForPreview || generatingPreview}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-white/20 text-sm"
                >
                  {generatingPreview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden xs:inline">Génération...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="hidden xs:inline">Générer l'aperçu</span>
                      <span className="xs:hidden">Aperçu</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesManager;
