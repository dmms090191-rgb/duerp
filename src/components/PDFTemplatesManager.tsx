import React, { useState, useEffect } from 'react';
import { FileText, Upload, Save, Edit, X, Plus, Image as ImageIcon, Settings, Palette, Type, Layout } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PDFTemplate {
  id: string;
  name: string;
  pdf_type: 'static' | 'dynamic';
  dynamic_type?: string;
  file_url?: string;
  description?: string;
}

interface PDFConfig {
  id?: string;
  pdf_template_id?: string;
  logo_url: string;
  company_name: string;
  subtitle: string;
  email: string;
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  header_height: number;
  footer_height: number;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  font_family: string;
  font_size: number;
}

const PDFTemplatesManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'logo'>('list');
  const [pdfTemplates, setPdfTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPdf, setEditingPdf] = useState<PDFTemplate | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [globalLogo, setGlobalLogo] = useState('');

  const [pdfConfig, setPdfConfig] = useState<PDFConfig>({
    logo_url: '',
    company_name: 'Cabinet FPE',
    subtitle: 'Sécurité Professionnelle',
    email: 'administration@securiteprofessionnelle.fr',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    footer_text: 'Cabinet FPE - Sécurité Professionnelle',
    header_height: 80,
    footer_height: 60,
    margin_top: 20,
    margin_bottom: 20,
    margin_left: 20,
    margin_right: 20,
    font_family: 'Arial',
    font_size: 12
  });

  useEffect(() => {
    loadPDFTemplates();
    loadGlobalLogo();
  }, []);

  const loadPDFTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPdfTemplates(data || []);
    } catch (error) {
      console.error('Erreur chargement PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalLogo = async () => {
    try {
      const { data } = await supabase.storage
        .from('signature-images')
        .list('pdf-logos', { limit: 1 });

      if (data && data.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('signature-images')
          .getPublicUrl(`pdf-logos/${data[0].name}`);
        setGlobalLogo(publicUrl);
        setPdfConfig(prev => ({ ...prev, logo_url: publicUrl }));
      }
    } catch (error) {
      console.error('Erreur chargement logo:', error);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `pdf-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('signature-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('signature-images')
        .getPublicUrl(filePath);

      setGlobalLogo(publicUrl);
      setPdfConfig(prev => ({ ...prev, logo_url: publicUrl }));
      setMessage({ type: 'success', text: 'Logo uploadé avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEditPdf = (pdf: PDFTemplate) => {
    setEditingPdf(pdf);
  };

  const handleSaveConfig = async () => {
    try {
      setMessage({ type: 'success', text: 'Configuration PDF enregistrée !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
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
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeSubTab === 'list'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Liste des PDFs
          </button>
          <button
            onClick={() => setActiveSubTab('logo')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeSubTab === 'logo'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Logo du PDF
          </button>
        </div>
      </div>

      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {pdfTemplates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Aucun template PDF</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pdfTemplates.map((pdf) => (
                <div key={pdf.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{pdf.name}</h3>
                          <p className="text-sm text-gray-500">
                            {pdf.pdf_type === 'dynamic' ? `Dynamique - ${pdf.dynamic_type}` : 'Statique'}
                          </p>
                        </div>
                      </div>
                      {pdf.description && (
                        <p className="text-sm text-gray-600 ml-13">{pdf.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditPdf(pdf)}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier le design
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'logo' && (
        <div className="bg-white rounded-lg border p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Logo des PDFs</h2>
              <p className="text-gray-600">
                Uploadez un logo qui sera utilisé sur tous vos documents PDF
              </p>
            </div>

            {globalLogo && (
              <div className="flex justify-center">
                <div className="w-64 h-64 border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-white p-4">
                  <img src={globalLogo} alt="Logo actuel" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <input
                type="file"
                accept="image/*"
                id="pdf-logo-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleLogoUpload(file);
                  }
                }}
              />
              <label
                htmlFor="pdf-logo-upload"
                className={`inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors ${
                  uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-5 h-5" />
                {uploadingLogo ? 'Upload en cours...' : globalLogo ? 'Changer le logo' : 'Uploader un logo'}
              </label>
              <p className="text-sm text-gray-500 text-center">
                Format recommandé: PNG transparent, 400x150px maximum<br />
                Formats acceptés: PNG, JPG, SVG
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration globale des PDFs</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Type className="w-4 h-4 inline mr-1" />
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={pdfConfig.company_name}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Type className="w-4 h-4 inline mr-1" />
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      value={pdfConfig.subtitle}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={pdfConfig.email}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Palette className="w-4 h-4 inline mr-1" />
                      Couleur principale
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pdfConfig.primary_color}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, primary_color: e.target.value })}
                        className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={pdfConfig.primary_color}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, primary_color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Palette className="w-4 h-4 inline mr-1" />
                      Couleur secondaire
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pdfConfig.secondary_color}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, secondary_color: e.target.value })}
                        className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={pdfConfig.secondary_color}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, secondary_color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte du pied de page
                  </label>
                  <input
                    type="text"
                    value={pdfConfig.footer_text}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, footer_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Layout className="w-4 h-4 inline mr-1" />
                    Marges du document (mm)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Haut</label>
                      <input
                        type="number"
                        value={pdfConfig.margin_top}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, margin_top: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Bas</label>
                      <input
                        type="number"
                        value={pdfConfig.margin_bottom}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, margin_bottom: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Gauche</label>
                      <input
                        type="number"
                        value={pdfConfig.margin_left}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, margin_left: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Droite</label>
                      <input
                        type="number"
                        value={pdfConfig.margin_right}
                        onChange={(e) => setPdfConfig({ ...pdfConfig, margin_right: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police de caractères
                    </label>
                    <select
                      value={pdfConfig.font_family}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, font_family: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier">Courier</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille de police (pt)
                    </label>
                    <input
                      type="number"
                      value={pdfConfig.font_size}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, font_size: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="8"
                      max="24"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSaveConfig}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer la configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Designer le PDF</h3>
                  <p className="text-sm text-gray-600">{editingPdf.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPdf(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Designer personnalisé:</strong> Modifiez l'apparence spécifique de ce PDF. Ces paramètres remplaceront la configuration globale pour ce document uniquement.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-600" />
                    Couleurs
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur principale
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#2563eb" className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer" />
                      <input type="text" defaultValue="#2563eb" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur d'accentuation
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#64748b" className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer" />
                      <input type="text" defaultValue="#64748b" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Type className="w-5 h-5 text-blue-600" />
                    Typographie
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police principale
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Arial</option>
                      <option>Helvetica</option>
                      <option>Times New Roman</option>
                      <option>Courier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille de titre
                    </label>
                    <input type="number" defaultValue="18" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Layout className="w-5 h-5 text-blue-600" />
                  Mise en page
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hauteur en-tête (px)
                    </label>
                    <input type="number" defaultValue="80" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hauteur pied (px)
                    </label>
                    <input type="number" defaultValue="60" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espacement (px)
                    </label>
                    <input type="number" defaultValue="20" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingPdf(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setMessage({ type: 'success', text: 'Design du PDF enregistré !' });
                    setEditingPdf(null);
                    setTimeout(() => setMessage(null), 3000);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer le design
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFTemplatesManager;
