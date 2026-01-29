import React, { useState, useEffect } from 'react';
import { Save, Eye, Edit, CheckCircle, AlertCircle, FileSignature, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailSignature {
  id: string;
  signature_html: string;
  is_active: boolean;
  image_url: string;
  company_name: string;
  company_title: string;
  email_address: string;
  phone: string;
  website: string;
  additional_text: string;
  created_at: string;
  updated_at: string;
}

const EmailSignatureEditor: React.FC = () => {
  const [signature, setSignature] = useState<EmailSignature | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    image_url: '',
    company_name: 'Cabinet FPE',
    company_title: 'Expert en prévention des risques professionnels',
    email_address: 'contact@cabinet-fpe.fr',
    phone: '01 23 45 67 89',
    website: 'www.cabinet-fpe.fr',
    additional_text: ''
  });

  useEffect(() => {
    loadSignature();
  }, []);

  const loadSignature = async () => {
    try {
      const { data, error } = await supabase
        .from('email_signature')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSignature(data);
        setFormData({
          image_url: data.image_url || '',
          company_name: data.company_name || 'Cabinet FPE',
          company_title: data.company_title || 'Expert en prévention des risques professionnels',
          email_address: data.email_address || 'contact@cabinet-fpe.fr',
          phone: data.phone || '',
          website: data.website || '',
          additional_text: data.additional_text || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement signature:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement de la signature' });
    } finally {
      setLoading(false);
    }
  };

  const generateSignatureHTML = (): string => {
    const hasImage = formData.image_url.trim() !== '';

    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif; max-width: 650px; width: 100%; margin: 0; border-collapse: collapse;">
  <tr>
    <td style="padding: 0;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-radius: 18px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
        <tr>
          <td style="padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
              ${hasImage ? `
              <tr>
                <td style="padding: 20px 16px; text-align: left; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-bottom: 4px solid #e5e7eb;">
                  <img src="${formData.image_url}" alt="Logo" style="max-width: 100%; max-height: 110px; display: block;" />
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 20px 16px 16px 16px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
                    <tr>
                      <td style="padding-bottom: 16px; text-align: left;">
                        <h2 style="margin: 0 0 8px 0; padding: 0; font-size: clamp(20px, 5vw, 32px); font-weight: 800; color: #0f172a; letter-spacing: -0.9px; line-height: 1.1; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                          ${formData.company_name}
                        </h2>
                        ${formData.company_title ? `
                        <p style="margin: 0; padding: 0; font-size: clamp(13px, 3vw, 16px); font-weight: 600; color: #3b82f6; letter-spacing: 0.4px; line-height: 1.5;">
                          ${formData.company_title}
                        </p>
                        ` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="width: 60px; height: 5px; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%); border-radius: 4px; box-shadow: 0 3px 12px rgba(59, 130, 246, 0.4);">
                          <tr><td></td></tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background: #ffffff; border-radius: 12px; padding: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); width: 100%;">
                          ${formData.email_address ? `
                          <tr>
                            <td style="padding: 8px 0; text-align: left;">
                              <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                                <tr>
                                  <td style="padding-right: 12px; vertical-align: middle; width: 40px;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 10px; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);">
                                      <tr>
                                        <td style="text-align: center; vertical-align: middle; padding: 10px;">
                                          <table cellpadding="0" cellspacing="0" border="0" style="width: 20px; height: 15px; margin: 0 auto; background: transparent; border-collapse: collapse;">
                                            <tr>
                                              <td style="padding: 0; position: relative;">
                                                <div style="width: 20px; height: 15px; border: 2px solid #ffffff; border-radius: 3px; box-sizing: border-box; position: relative;">
                                                  <div style="position: absolute; top: -2px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 8px solid #ffffff;"></div>
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td style="vertical-align: middle;">
                                    <a href="mailto:${formData.email_address}" style="color: #1e293b; text-decoration: none; font-size: clamp(12px, 3vw, 16px); font-weight: 600; transition: color 0.2s; word-break: break-word;">
                                      ${formData.email_address}
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ` : ''}
                          ${formData.phone ? `
                          <tr>
                            <td style="padding: 8px 0; text-align: left;">
                              <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                                <tr>
                                  <td style="padding-right: 12px; vertical-align: middle; width: 40px;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);">
                                      <tr>
                                        <td style="text-align: center; vertical-align: middle; padding: 10px;">
                                          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                                            <tr>
                                              <td style="padding: 0;">
                                                <div style="width: 18px; height: 18px; border: 2.5px solid #ffffff; border-radius: 5px; box-sizing: border-box; position: relative;">
                                                  <div style="width: 7px; height: 12px; background: #ffffff; border-radius: 2px; margin: 2px 0 0 2px;"></div>
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td style="vertical-align: middle;">
                                    <a href="tel:${formData.phone.replace(/\s/g, '')}" style="color: #1e293b; text-decoration: none; font-size: clamp(12px, 3vw, 16px); font-weight: 600; transition: color 0.2s; word-break: break-word;">
                                      ${formData.phone}
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ` : ''}
                          ${formData.website ? `
                          <tr>
                            <td style="padding: 8px 0; text-align: left;">
                              <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                                <tr>
                                  <td style="padding-right: 12px; vertical-align: middle; width: 40px;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 10px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);">
                                      <tr>
                                        <td style="text-align: center; vertical-align: middle; padding: 10px;">
                                          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                                            <tr>
                                              <td style="padding: 0;">
                                                <div style="width: 22px; height: 22px; border: 2.5px solid #ffffff; border-radius: 50%; box-sizing: border-box; position: relative;">
                                                  <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td style="vertical-align: middle;">
                                    <a href="https://${formData.website.replace(/^https?:\/\//, '')}" style="color: #1e293b; text-decoration: none; font-size: clamp(12px, 3vw, 16px); font-weight: 600; transition: color 0.2s; word-break: break-word;">
                                      ${formData.website.replace(/^https?:\/\//, '')}
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${formData.additional_text ? `
              <tr>
                <td style="padding: 16px 16px 16px 16px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; height: 2px; background: linear-gradient(90deg, transparent 0%, #e5e7eb 20%, #e5e7eb 80%, transparent 100%); margin-bottom: 14px;">
                    <tr><td></td></tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; background: linear-gradient(135deg, #eff6ff 0%, #fef9c3 100%); border-radius: 12px; border: 2px solid #e0e7ff; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
                    <tr>
                      <td style="padding: 14px 16px;">
                        <p style="margin: 0; padding: 0; font-size: clamp(11px, 2.5vw, 13px); color: #475569; line-height: 1.7; text-align: left; font-weight: 500; word-break: break-word;">
                          ${formData.additional_text}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image valide' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `signature-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('signature-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('signature-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setMessage({ type: 'success', text: 'Image uploadée avec succès' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const signatureHTML = generateSignatureHTML();

      const signatureData = {
        ...formData,
        signature_html: signatureHTML,
        updated_at: new Date().toISOString()
      };

      if (signature?.id) {
        const { error } = await supabase
          .from('email_signature')
          .update(signatureData)
          .eq('id', signature.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_signature')
          .insert({
            ...signatureData,
            is_active: true
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Signature enregistrée avec succès' });
      loadSignature();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
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
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileSignature className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Signature Email</h3>
              <p className="text-xs md:text-sm text-gray-600">Configurez votre signature facilement</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
            >
              {showPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{showPreview ? 'Éditer' : 'Aperçu'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm md:text-base"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>

        {!showPreview ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Formulaire à gauche */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-blue-900">
                  💡 Remplissez les champs et voyez le rendu en direct!
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Logo / Image
                </label>
                <div className="space-y-3">
                  {formData.image_url ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.image_url}
                        alt="Logo"
                        className="max-w-[200px] md:max-w-xs max-h-24 md:max-h-32 border rounded-lg"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-24 md:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                      <div className="text-center">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-400 mb-2" />
                        <span className="text-xs md:text-sm text-gray-600 px-2">
                          {uploading ? 'Upload en cours...' : 'Cliquez pour uploader'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Cabinet FPE"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Titre / Fonction
                </label>
                <input
                  type="text"
                  value={formData.company_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Expert en prévention"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="contact@cabinet-fpe.fr"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="01 23 45 67 89"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Site web
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="www.cabinet-fpe.fr"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Texte additionnel
                </label>
                <input
                  type="text"
                  value={formData.additional_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_text: e.target.value }))}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Message personnalisé ou slogan"
                />
              </div>
            </div>

            {/* Aperçu en direct à droite */}
            <div className="xl:sticky xl:top-6 h-fit">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-3 md:p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3 md:mb-4 pb-2 md:pb-3 border-b-2 border-gray-300">
                  <Eye className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <h4 className="font-bold text-gray-900 text-sm md:text-lg">Aperçu en direct</h4>
                </div>
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                  <div className="min-w-0" dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-4 md:p-6">
            <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Aperçu plein écran:</h4>
            <div className="bg-white p-3 md:p-6 rounded border overflow-x-auto">
              <div className="min-w-0" dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSignatureEditor;
