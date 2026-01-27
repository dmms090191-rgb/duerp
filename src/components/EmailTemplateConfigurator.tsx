import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, FileText, Plus, Trash2, Save, Eye, Send, Edit2, X, Check, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Type } from 'lucide-react';

interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  body: string;
  body_html: string | null;
  created_at: string;
}

interface PDFTemplate {
  id: number;
  name: string;
  pdf_type: 'static' | 'dynamic';
  dynamic_type: string | null;
  file_url: string | null;
}

interface TemplatePDFLink {
  id: number;
  pdf_template_id: number;
  display_order: number;
  pdf_templates: PDFTemplate;
}

export default function EmailTemplateConfigurator() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [linkedPDFs, setLinkedPDFs] = useState<TemplatePDFLink[]>([]);
  const [availablePDFs, setAvailablePDFs] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const [editedSubject, setEditedSubject] = useState('');
  const [editedBodyHTML, setEditedBodyHTML] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTemplates();
    loadAvailablePDFs();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      loadLinkedPDFs(selectedTemplate.id);
      setEditedSubject(selectedTemplate.subject);
      setEditedBodyHTML(selectedTemplate.body_html || selectedTemplate.body);
      if (editorRef.current && editMode) {
        editorRef.current.innerHTML = selectedTemplate.body_html || selectedTemplate.body;
      }
    }
  }, [selectedTemplate, editMode]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePDFs = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailablePDFs(data || []);
    } catch (error) {
      console.error('Erreur chargement PDFs:', error);
    }
  };

  const loadLinkedPDFs = async (templateId: number) => {
    try {
      const { data, error } = await supabase
        .from('email_template_pdfs')
        .select(`
          id,
          pdf_template_id,
          display_order,
          pdf_templates (*)
        `)
        .eq('email_template_id', templateId)
        .order('display_order');

      if (error) throw error;
      setLinkedPDFs(data || []);
    } catch (error) {
      console.error('Erreur chargement PDFs liés:', error);
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate || !editorRef.current) return;

    setSaving(true);
    try {
      const htmlContent = editorRef.current.innerHTML;
      const textContent = editorRef.current.innerText;

      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: editedSubject,
          body_html: htmlContent,
          body: textContent
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      alert('✅ Template enregistré avec succès!');
      setEditMode(false);
      await loadTemplates();

      const updated = templates.find(t => t.id === selectedTemplate.id);
      if (updated) {
        setSelectedTemplate({
          ...updated,
          subject: editedSubject,
          body_html: htmlContent
        });
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertVariable = (variable: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.backgroundColor = '#dbeafe';
      span.style.padding = '2px 6px';
      span.style.borderRadius = '4px';
      span.style.fontWeight = '500';
      span.style.color = '#1e40af';
      span.textContent = variable;
      range.insertNode(span);
      range.collapse(false);
    }
    editorRef.current?.focus();
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', '7');
    const fontElements = document.getElementsByTagName('font');
    for (let i = 0; i < fontElements.length; i++) {
      if (fontElements[i].size === '7') {
        fontElements[i].removeAttribute('size');
        fontElements[i].style.fontSize = size;
      }
    }
  };

  const addPDFToTemplate = async (pdfId: number) => {
    if (!selectedTemplate) return;

    try {
      const maxOrder = linkedPDFs.length > 0
        ? Math.max(...linkedPDFs.map(p => p.display_order))
        : 0;

      const { error } = await supabase
        .from('email_template_pdfs')
        .insert({
          email_template_id: selectedTemplate.id,
          pdf_template_id: pdfId,
          display_order: maxOrder + 1
        });

      if (error) throw error;

      await loadLinkedPDFs(selectedTemplate.id);
      alert('✅ PDF ajouté au template!');
    } catch (error) {
      console.error('Erreur ajout PDF:', error);
      alert('❌ Erreur lors de l\'ajout du PDF');
    }
  };

  const removePDFFromTemplate = async (linkId: number) => {
    if (!confirm('Retirer ce PDF du template?')) return;

    try {
      const { error } = await supabase
        .from('email_template_pdfs')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      await loadLinkedPDFs(selectedTemplate!.id);
      alert('✅ PDF retiré du template!');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) {
      alert('Veuillez entrer une adresse email de test');
      return;
    }

    if (!confirm(`Envoyer un email de test à ${testEmail}?`)) return;

    setSendingTest(true);
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!clients) {
        alert('❌ Aucun client dans la base pour générer l\'email');
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
            clientId: clients.id,
            templateKey: selectedTemplate.key,
            emailOverride: testEmail
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`✅ Email de test envoyé à ${testEmail}!`);
        setTestEmail('');
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur envoi test:', error);
      alert('❌ Erreur lors de l\'envoi du test');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const unlinkedPDFs = availablePDFs.filter(
    pdf => !linkedPDFs.some(link => link.pdf_template_id === pdf.id)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-7 h-7 text-blue-600" />
              Configuration des Emails
            </h2>
            <p className="text-gray-600 mt-1">
              Éditeur d'emails - Écrivez comme dans une boîte mail
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-2">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Templates Email</h3>
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setEditMode(false);
                  setShowPreview(true);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all shadow-sm ${
                  selectedTemplate?.id === template.id
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500 text-blue-900 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow'
                }`}
              >
                <div className="font-semibold text-sm">{template.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 font-medium">{template.key}</div>
              </button>
            ))}
          </div>

          <div className="col-span-9">
            {selectedTemplate && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedTemplate.name}
                    </h3>
                    <div className="flex gap-2">
                      {!editMode ? (
                        <>
                          <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Modifier
                          </button>
                          <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {showPreview ? 'Masquer' : 'Aperçu'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={saveTemplate}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setEditedSubject(selectedTemplate.subject);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editMode ? (
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sujet de l'email
                        </label>
                        <input
                          type="text"
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Sujet de l'email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Corps de l'email
                        </label>

                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                            <select
                              onChange={(e) => changeFontSize(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
                              defaultValue="14px"
                            >
                              <option value="12px">12px</option>
                              <option value="14px">14px</option>
                              <option value="16px">16px</option>
                              <option value="18px">18px</option>
                              <option value="20px">20px</option>
                              <option value="24px">24px</option>
                            </select>

                            <div className="w-px bg-gray-300 mx-1" />

                            <button
                              onClick={() => execCommand('bold')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Gras"
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => execCommand('italic')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Italique"
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => execCommand('underline')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Souligné"
                            >
                              <Underline className="w-4 h-4" />
                            </button>

                            <div className="w-px bg-gray-300 mx-1" />

                            <button
                              onClick={() => execCommand('justifyLeft')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Aligner à gauche"
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => execCommand('justifyCenter')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Centrer"
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => execCommand('justifyRight')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Aligner à droite"
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>

                            <div className="w-px bg-gray-300 mx-1" />

                            <button
                              onClick={() => execCommand('insertUnorderedList')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Liste à puces"
                            >
                              <List className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => execCommand('insertOrderedList')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Liste numérotée"
                            >
                              <ListOrdered className="w-4 h-4" />
                            </button>

                            <div className="w-px bg-gray-300 mx-1" />

                            <input
                              type="color"
                              onChange={(e) => execCommand('foreColor', e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer"
                              title="Couleur du texte"
                            />

                            <div className="w-px bg-gray-300 mx-1" />

                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold text-gray-600 px-2">Variables:</span>
                              <button
                                onClick={() => insertVariable('{{prenom}}')}
                                className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all font-semibold shadow-sm hover:shadow"
                              >
                                Prénom
                              </button>
                              <button
                                onClick={() => insertVariable('{{nom}}')}
                                className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all font-semibold shadow-sm hover:shadow"
                              >
                                Nom
                              </button>
                              <button
                                onClick={() => insertVariable('{{societe}}')}
                                className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all font-semibold shadow-sm hover:shadow"
                              >
                                Société
                              </button>
                              <button
                                onClick={() => insertVariable('{{siret}}')}
                                className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all font-semibold shadow-sm hover:shadow"
                              >
                                SIRET
                              </button>
                              <button
                                onClick={() => insertVariable('{{adresse}}')}
                                className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all font-semibold shadow-sm hover:shadow"
                              >
                                Adresse
                              </button>
                              <button
                                onClick={() => insertVariable('{{email}}')}
                                className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all font-semibold shadow-sm hover:shadow"
                              >
                                Email
                              </button>
                              <button
                                onClick={() => insertVariable('{{client_password}}')}
                                className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md hover:from-blue-200 hover:to-blue-300 transition-all font-semibold shadow-sm hover:shadow"
                              >
                                Mot de passe
                              </button>
                            </div>
                          </div>

                          <div
                            ref={editorRef}
                            contentEditable
                            className="min-h-[400px] p-8 bg-white focus:outline-none"
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              fontSize: '15px',
                              lineHeight: '1.7',
                              color: '#000000',
                              letterSpacing: '0.01em'
                            }}
                            suppressContentEditableWarning
                          />
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          💡 Écrivez normalement comme dans Gmail ou Outlook. Utilisez les boutons pour formater le texte et insérer des variables.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Sujet:</span>
                        <p className="text-gray-900 mt-1">{selectedTemplate.subject}</p>
                      </div>

                      {showPreview && (
                        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-300">
                            <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Aperçu de l'email</div>
                            <div className="space-y-2">
                              <div className="flex items-start">
                                <span className="text-sm font-semibold text-gray-700 w-16">De:</span>
                                <span className="text-sm text-gray-900">Cabinet FPE &lt;contact@cabinet-fpe.fr&gt;</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-sm font-semibold text-gray-700 w-16">À:</span>
                                <span className="text-sm text-gray-900">Jean Dupont &lt;jean.dupont@exemple.fr&gt;</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-sm font-semibold text-gray-700 w-16">Sujet:</span>
                                <span className="text-sm text-gray-900 font-medium">{selectedTemplate.subject}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-sm font-semibold text-gray-700 w-16">Date:</span>
                                <span className="text-sm text-gray-900">{new Date().toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-8 bg-white">
                            <div
                              className="email-preview-content"
                              style={{
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: '#000000'
                              }}
                              dangerouslySetInnerHTML={{
                                __html: (selectedTemplate.body_html || selectedTemplate.body)
                                  .replace(/{{prenom}}/g, '<strong>Jean</strong>')
                                  .replace(/{{nom}}/g, '<strong>Dupont</strong>')
                                  .replace(/{{email}}/g, '<strong>jean.dupont@exemple.fr</strong>')
                                  .replace(/{{password}}/g, '<strong>hzc1elEt</strong>')
                                  .replace(/{{client_password}}/g, '<strong>hzc1elEt</strong>')
                                  .replace(/{{societe}}/g, '<strong>Entreprise Dupont SARL</strong>')
                                  .replace(/{{siret}}/g, '<strong>84870559600015</strong>')
                                  .replace(/{{adresse}}/g, '<strong>123 Rue de la République, 75001 Paris</strong>')
                                  .replace(/{{full_name}}/g, '<strong>Jean Dupont</strong>')
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    PDFs attachés à cet email
                  </h3>

                  {linkedPDFs.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {linkedPDFs.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {link.pdf_templates.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {link.pdf_templates.pdf_type === 'dynamic'
                                  ? `Dynamique (${link.pdf_templates.dynamic_type})`
                                  : 'Statique'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removePDFFromTemplate(link.id)}
                            className="p-1.5 text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">Aucun PDF attaché</p>
                  )}

                  {unlinkedPDFs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Ajouter un PDF:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {unlinkedPDFs.map(pdf => (
                          <button
                            key={pdf.id}
                            onClick={() => addPDFToTemplate(pdf.id)}
                            className="flex items-center gap-2 p-2.5 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all text-left shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                          >
                            <div className="p-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-md shadow-md">
                              <Plus className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {pdf.name}
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                {pdf.pdf_type === 'dynamic'
                                  ? `Dynamique (${pdf.dynamic_type})`
                                  : 'Statique'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-green-600" />
                    Envoyer un email de test
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="votre-email@exemple.com"
                      className="flex-1 px-4 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                    />
                    <button
                      onClick={sendTestEmail}
                      disabled={sendingTest || !testEmail}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                    >
                      {sendingTest ? 'Envoi...' : 'Envoyer Test'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    L'email sera envoyé avec les données d'un client existant et tous les PDFs configurés
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
