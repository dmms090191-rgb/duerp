import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, FileText, Calendar, LogOut, MessageSquare, Home, ArrowLeft, Lock, Briefcase, Building2, ClipboardCheck, FileCheck, Download, X, ChevronDown, ChevronUp, Users, CheckCircle2, AlertTriangle, FileCheck2, UserCircle2, UserCog, Eye, EyeOff, Save, Menu, Send } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { generateDUERPPDF, getClientDocuments, deleteDocument } from '../services/pdfService';
import { diagnosticNotesService } from '../services/diagnosticNotesService';
import { supabase } from '../lib/supabase';
import { sendEmail, EmailType } from '../services/emailSendService';

interface ClientDashboardProps {
  clientData: {
    user: any;
    token: string;
    client: {
      id: string;
      email: string;
      full_name: string;
      company_name?: string;
      phone?: string;
      address?: string;
      project_description?: string;
      status: string;
      created_at: string;
      assigned_agent_name?: string;
      vendeur?: string;
      siret?: string;
      ville?: string;
      code_postal?: string;
      portable?: string;
      nom?: string;
      prenom?: string;
    };
  };
  onLogout: () => void;
  isAdminViewing?: boolean;
  onReturnToAdmin?: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientData, onLogout, isAdminViewing, onReturnToAdmin }) => {
  const { client } = clientData;
  const [activeTab, setActiveTab] = useState('info-juridiques');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [secteurActivite, setSecteurActivite] = useState('');

  const [nomConseiller, setNomConseiller] = useState('');
  const [nomSociete, setNomSociete] = useState('');
  const [siretSiren, setSiretSiren] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [nomPrenomGerant, setNomPrenomGerant] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [accepteTermes, setAccepteTermes] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [editableCompanyName, setEditableCompanyName] = useState(client.company_name || '');
  const [editableSiret, setEditableSiret] = useState(client.siret || '');
  const [editableNom, setEditableNom] = useState(client.nom || client.full_name?.split(' ').pop() || '');
  const [editablePrenom, setEditablePrenom] = useState(client.prenom || client.full_name?.split(' ')[0] || '');
  const [editableAddress, setEditableAddress] = useState(client.address || '');
  const [editableVille, setEditableVille] = useState(client.ville || '');
  const [editableCodePostal, setEditableCodePostal] = useState(client.code_postal || '');
  const [editableEmail, setEditableEmail] = useState(client.email || '');
  const [editablePhone, setEditablePhone] = useState(client.phone || '');
  const [editablePortable, setEditablePortable] = useState(client.portable || '');
  const [editablePassword, setEditablePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [covidInfo, setCovidInfo] = useState('');
  const [affichageSpecifique, setAffichageSpecifique] = useState('');
  const [solutionHydroalcoolique, setSolutionHydroalcoolique] = useState('');
  const [processusNettoyage, setProcessusNettoyage] = useState('');
  const [processusAeration, setProcessusAeration] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<{[key: string]: string[]}>({
    circulation: [],
    stockage: [],
    enginsMecaniques: [],
    usineProduction: [],
    thermique: [],
    machineUsine: [],
    autre: [],
    manutentionCirculation: [],
    ambiance: [],
    equipementOrganisation: []
  });

  const [adminNotes, setAdminNotes] = useState<Record<string, Record<string, string>>>({});
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string>('');

  useEffect(() => {
    loadDocuments();
    if (isAdminViewing) {
      loadAdminNotes();
    }
  }, []);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        const clientId = parseInt(client.id);
        console.log('🔵 [ClientDashboard] Chargement des données du client ID:', clientId);

        const { data: freshData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) {
          console.error('❌ [ClientDashboard] Erreur lors du chargement:', error);
          return;
        }

        console.log('🔵 [ClientDashboard] Données fraîches récupérées:', freshData);

        setEditableCompanyName(freshData.company_name || '');
        setEditableSiret(freshData.siret || '');
        setEditableNom(freshData.nom || freshData.full_name?.split(' ').pop() || '');
        setEditablePrenom(freshData.prenom || freshData.full_name?.split(' ')[0] || '');
        setEditableAddress(freshData.address || '');
        setEditableVille(freshData.ville || '');
        setEditableCodePostal(freshData.code_postal || '');
        setEditableEmail(freshData.email || '');
        setEditablePhone(freshData.phone || '');
        setEditablePortable(freshData.portable || '');

        Object.assign(client, freshData);
      } catch (err) {
        console.error('❌ [ClientDashboard] Erreur:', err);
      }
    };

    loadClientData();
  }, [client.id]);

  const loadAdminNotes = async () => {
    const clientId = parseInt(client.id);
    const notes = await diagnosticNotesService.getNotesByClientId(clientId);
    setAdminNotes(notes);

    const flatNotes: Record<string, string> = {};
    Object.keys(notes).forEach(category => {
      Object.keys(notes[category]).forEach(item => {
        const key = `${category}__${item}`;
        flatNotes[key] = notes[category][item];
      });
    });
    setEditingNotes(flatNotes);
  };

  const loadDocuments = async () => {
    const clientId = parseInt(client.id);
    const docs = await getClientDocuments(clientId);
    setDocuments(docs);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(activity)) {
        return prev.filter(a => a !== activity);
      } else {
        return [...prev, activity];
      }
    });
  };

  const toggleCategory = (category: string, item: string) => {
    setSelectedCategories(prev => {
      const currentItems = prev[category] || [];
      if (currentItems.includes(item)) {
        return {
          ...prev,
          [category]: currentItems.filter(i => i !== item)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentItems, item]
        };
      }
    });
  };

  const toggleAdminNote = (category: string, item: string) => {
    const key = `${category}__${item}`;
    setOpenNotes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateEditingNote = (category: string, item: string, value: string) => {
    const key = `${category}__${item}`;
    setEditingNotes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAdminNote = async (category: string, item: string) => {
    const clientId = parseInt(client.id);
    const key = `${category}__${item}`;
    const noteContent = editingNotes[key] || '';

    setSavingNotes(prev => ({ ...prev, [key]: true }));

    const success = await diagnosticNotesService.saveNote(clientId, category, item, noteContent);

    if (success) {
      setAdminNotes(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] || {}),
          [item]: noteContent
        }
      }));
    }

    setSavingNotes(prev => ({ ...prev, [key]: false }));
  };

  const handleSaveJuridicalInfo = async () => {
    setSavingInfo(true);
    setSaveMessage('');

    try {
      const clientId = parseInt(client.id);

      if (isNaN(clientId)) {
        throw new Error('ID client invalide');
      }

      const updateData: any = {
        company_name: editableCompanyName.trim(),
        siret: editableSiret.trim(),
        nom: editableNom.trim(),
        prenom: editablePrenom.trim(),
        address: editableAddress.trim(),
        ville: editableVille.trim(),
        code_postal: editableCodePostal.trim(),
        email: editableEmail.trim(),
        phone: editablePhone.trim(),
        portable: editablePortable.trim(),
        full_name: `${editablePrenom.trim()} ${editableNom.trim()}`
      };

      if (editablePassword && editablePassword.length >= 6) {
        updateData.client_password = editablePassword;
      }

      console.log('💾 [ClientDashboard] Client ID original:', client.id);
      console.log('💾 [ClientDashboard] Client ID converti:', clientId, '(type:', typeof clientId, ')');
      console.log('💾 [ClientDashboard] Données à sauvegarder:', updateData);

      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('❌ [ClientDashboard] Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ [ClientDashboard] Données sauvegardées et vérifiées:', data);

      setSaveMessage('Informations enregistrées avec succès');
      setTimeout(() => setSaveMessage(''), 3000);

      Object.assign(client, updateData);

      const storedData = sessionStorage.getItem('clientData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData.client = { ...parsedData.client, ...updateData };
        sessionStorage.setItem('clientData', JSON.stringify(parsedData));
        console.log('✅ [ClientDashboard] SessionStorage mis à jour avec les nouvelles données');
      }

      if (editablePassword && editablePassword.length >= 6) {
        setEditablePassword('');
      }

    } catch (error: any) {
      console.error('❌ [ClientDashboard] Erreur lors de la sauvegarde:', error);
      setSaveMessage(`Erreur: ${error.message || 'Erreur lors de la sauvegarde'}`);
    } finally {
      setSavingInfo(false);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!secteurActivite.trim()) errors.push('Secteur d\'activité');
    if (!nomConseiller.trim()) errors.push('Nom de votre conseiller');
    if (!nomSociete.trim()) errors.push('Nom de société');
    if (!siretSiren.trim()) errors.push('Siret / Siren');
    if (!adresse.trim()) errors.push('Adresse');
    if (!ville.trim()) errors.push('Ville');
    if (!codePostal.trim()) errors.push('Code postal');
    if (!nomPrenomGerant.trim()) errors.push('Nom & prénom du gérant');
    if (!telephone.trim()) errors.push('Téléphone');
    if (!email.trim()) errors.push('E-mail');
    if (!accepteTermes) errors.push('J\'accepte les termes et conditions de prise en charge');

    setFormErrors(errors);

    if (errors.length > 0) {
      setErrorMessage('Veuillez remplir toutes les cases obligatoires');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsGeneratingPDF(true);

      try {
        const clientId = parseInt(client.id);
        const formData = {
          secteurActivite,
          nomConseiller,
          nomSociete,
          siretSiren,
          adresse,
          ville,
          codePostal,
          nomPrenomGerant,
          telephone,
          email,
          selectedActivities,
          covidInfo,
          affichageSpecifique,
          solutionHydroalcoolique,
          processusNettoyage,
          processusAeration,
          selectedCategories
        };

        const pdfUrl = await generateDUERPPDF(formData, clientId);

        await loadDocuments();
        setErrorMessage('');
        setActiveTab('reglement');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error: any) {
        console.error('Error in handleSubmit:', error);
        const errorMsg = error?.message || 'Erreur lors de la génération du PDF. Veuillez réessayer.';
        setErrorMessage(errorMsg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsGeneratingPDF(false);
      }
    }
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      const success = await deleteDocument(documentId, filePath);
      if (success) {
        await loadDocuments();
      } else {
        alert('Erreur lors de la suppression du document');
      }
    }
  };

  const handleSendEmail = async (emailType: EmailType, generatePDFs: boolean = false) => {
    setSendingEmail(emailType);
    setEmailMessage('');

    try {
      const result = await sendEmail({
        clientId: parseInt(client.id),
        emailType,
        generatePDFs
      });

      if (result.success) {
        setEmailMessage(`✅ ${result.message || 'Email envoyé avec succès!'}`);
      } else {
        setEmailMessage(`❌ ${result.error || 'Erreur lors de l\'envoi'}`);
      }
    } catch (error) {
      setEmailMessage('❌ Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(null);
    }
  };

  const menuItems = [
    { id: 'info-juridiques', label: 'Renseignements juridiques', icon: User },
    { id: 'documents', label: 'Accéder à mes documents', icon: FileText },
    { id: 'diagnostic', label: 'Diagnostic DUERP Article L4121-1', icon: ClipboardCheck },
    { id: 'duerp-conforme', label: 'DUERP CONFORME', icon: Users },
    { id: 'opco', label: 'OPCO opérateur de compétences', icon: Building2 },
    { id: 'reglement', label: 'Règlement de prise en charge', icon: FileCheck },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'chat', label: 'Messagerie', icon: MessageSquare },
    { id: 'password', label: 'Changer votre mot de passe', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-4">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              {isAdminViewing && onReturnToAdmin && (
                <button
                  onClick={onReturnToAdmin}
                  className="hidden md:flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg md:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-sm"
                  title="Retour au panel admin"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-semibold">Retour Admin</span>
                </button>
              )}
              {isAdminViewing && (
                <div className="hidden md:block">
                  <p className="text-xs text-blue-600 font-semibold">Mode visualisation admin</p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <img
                src="/kk.png"
                alt="Cabinet FPE"
                className="h-14 md:h-16 lg:h-20 w-auto"
              />
            </div>
            <div className="w-10 md:w-auto">
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 md:pt-24 lg:pt-28 pb-8 md:pb-16 flex">
        <aside className={`fixed left-0 top-20 md:top-24 lg:top-28 bottom-0 w-64 md:w-72 bg-white/95 backdrop-blur-lg shadow-xl border-r border-blue-100 flex flex-col transition-transform duration-300 z-30 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="p-4 md:p-6 space-y-2 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-200 text-xs md:text-sm ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-left">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 md:p-6 border-t border-blue-100 space-y-3">
            {isAdminViewing && onReturnToAdmin && (
              <button
                onClick={onReturnToAdmin}
                className="w-full flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg md:rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-sm"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span>Retour Admin</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-lg md:rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-sm"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className="lg:ml-72 flex-1 px-4 md:px-6 lg:px-8">
          {activeTab === 'info-juridiques' && (
            <>
              <div className="mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8 border border-blue-200">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">Client</p>
                    <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                      {client.full_name}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-blue-100">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-blue-100">
                  <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                    <User className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Renseignements Juridiques
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">Vos informations juridiques et personnelles</p>
                  </div>
                </div>

              <div className="space-y-3 md:space-y-5 max-w-3xl">
                {saveMessage && (
                  <div className={`p-3 md:p-4 rounded-lg text-sm md:text-base ${saveMessage.includes('succès') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                    {saveMessage}
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Société
                  </label>
                  <input
                    type="text"
                    value={editableCompanyName}
                    onChange={(e) => setEditableCompanyName(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={editableSiret}
                    onChange={(e) => setEditableSiret(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editableNom}
                    onChange={(e) => setEditableNom(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editablePrenom}
                    onChange={(e) => setEditablePrenom(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editablePassword}
                      onChange={(e) => setEditablePassword(e.target.value)}
                      placeholder="Laisser vide pour ne pas modifier"
                      className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  </div>
                  {editablePassword && editablePassword.length < 6 && (
                    <p className="text-xs md:text-sm text-red-600 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={editableAddress}
                    onChange={(e) => setEditableAddress(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editableVille}
                    onChange={(e) => setEditableVille(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={editableCodePostal}
                    onChange={(e) => setEditableCodePostal(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Numéro de portable
                  </label>
                  <input
                    type="text"
                    value={editablePortable}
                    onChange={(e) => setEditablePortable(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSaveJuridicalInfo}
                  disabled={savingInfo}
                  className="w-full flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm md:text-base font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingInfo ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm md:text-base">Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-sm md:text-base">Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            </>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-blue-100">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                  <FileText className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Mes documents</h2>
              </div>
              {documents.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg md:rounded-xl border-2 border-dashed border-blue-200">
                  <FileText className="w-16 h-16 md:w-20 md:h-20 text-blue-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-gray-600 font-medium px-4">Aucun document disponible pour le moment</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-2 px-4">Remplissez le formulaire DUERP pour générer votre premier document</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all relative">
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                        className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all transform hover:scale-110 shadow-md"
                        title="Supprimer le document"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between pr-8 md:pr-10 gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900">{doc.title}</h3>
                            <p className="text-xs md:text-sm text-gray-600">Type: {doc.document_type}</p>
                            <p className="text-xs text-gray-500">Créé le {formatDate(doc.created_at)}</p>
                          </div>
                        </div>
                        <a
                          href={doc.file_url}
                          download={`${doc.title}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-all transform hover:scale-105 text-sm md:text-base"
                        >
                          <Download className="w-4 h-4 md:w-5 md:h-5" />
                          Télécharger
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="max-w-7xl mx-auto py-4 md:py-8">
              {errorMessage && (
                <div className="mb-4 md:mb-6 bg-red-100 border-2 border-red-500 text-red-800 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl shadow-lg">
                  <p className="font-bold text-base md:text-lg">{errorMessage}</p>
                </div>
              )}
              <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-blue-100 lg:sticky lg:top-28">
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-blue-100">
                      <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                        <ClipboardCheck className="w-5 h-5 md:w-7 md:h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Diagnostic DUERP</h2>
                        <p className="text-xs text-gray-600 font-medium mt-1">Article L4121-1</p>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                        <h3 className="text-base md:text-lg font-bold text-blue-900 mb-2 md:mb-3">Le DUERP</h3>
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                          Document unique d'évaluation des risques professionnels
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                          Une évaluation des risques professionnels (EVRP) doit être menée au sein de votre entreprise afin d'adapter les conditions de travail et d'assurer la protection de la santé de vos salariés, une mise à jour de votre DUERP est donc indispensable !
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-emerald-200">
                        <h4 className="text-xs md:text-sm font-bold text-emerald-900 mb-2">Secteur d'activité</h4>
                        <p className="text-xs text-gray-600">
                          Sélectionnez votre secteur pour personnaliser votre diagnostic
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-blue-100">
                    <div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-blue-100">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Formulaire de diagnostic</h3>
                      <p className="text-xs md:text-sm text-gray-600">Veuillez remplir les informations ci-dessous</p>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                          Secteur d'activité <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={secteurActivite}
                          onChange={(e) => setSecteurActivite(e.target.value)}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="personnel-sante">A - Personnel de santé</option>
                          <option value="commerce-grande-consommation">B - Commerce de produits de grande consommation</option>
                          <option value="commerce-electronique">C - Commerce électronique, vente hors magasin</option>
                          <option value="immobilier-logement">D - Immobilier, logement</option>
                          <option value="energie-eau-assainissement">E - Energie, eau, assainissement</option>
                          <option value="travaux-batiment">F - Travaux du bâtiment, travaux d'aménagement extérieur et intérieur</option>
                          <option value="transport-public">G - Transport public de voyageurs, transport de marchandises</option>
                          <option value="automobile">H - Automobile</option>
                          <option value="hotellerie-restauration">I - Hôtellerie, restauration</option>
                          <option value="tourisme-voyage">J - Tourisme, voyage</option>
                          <option value="culture-loisirs-sport">K - Culture, loisirs, sport</option>
                          <option value="bricolage-jardinage-animaux">L - Bricolage, jardinage, animaux</option>
                          <option value="produits-services-personne">M - Produits et services à la personne</option>
                          <option value="franchise">N - Franchise</option>
                          <option value="metallurgie">O - Métallurgie</option>
                          <option value="fabrication-produits-metalliques">P - Fabrication de produits métalliques</option>
                          <option value="tri-collecte-dechets">Q - Tri et collecte des déchets</option>
                          <option value="culture-production-animale">R - Culture et production animale chasse et services annexes</option>
                          <option value="sylviculture-exploitation-forestiere">S - Sylviculture et exploitation forestière</option>
                        </select>
                      </div>

                      {secteurActivite === 'personnel-sante' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">A - Personnel de santé</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                checked={selectedActivities.includes('A01 - Pharmacie')}
                                onChange={() => toggleActivity('A01 - Pharmacie')}
                              />
                              <span className="text-sm text-gray-800">A01 - Pharmacie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                checked={selectedActivities.includes('A02 - Laboratoire')}
                                onChange={() => toggleActivity('A02 - Laboratoire')}
                              />
                              <span className="text-sm text-gray-800">A02 - Laboratoire</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                checked={selectedActivities.includes('A03 - Médecine générale')}
                                onChange={() => toggleActivity('A03 - Médecine générale')}
                              />
                              <span className="text-sm text-gray-800">A03 - Médecine générale</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                checked={selectedActivities.includes('A04 - Médecin spécialistes')}
                                onChange={() => toggleActivity('A04 - Médecin spécialistes')}
                              />
                              <span className="text-sm text-gray-800">A04 - Médecin spécialistes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                checked={selectedActivities.includes('A05 - Infirmières')}
                                onChange={() => toggleActivity('A05 - Infirmières')}
                              />
                              <span className="text-sm text-gray-800">A05 - Infirmières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">A06 - Kinésithérapie, ostéopathe</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">A07 - Orthophoniste</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">A08 - Psychologue, psychanalyste, hypnose</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">A09 - Radiologue, échographe</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'commerce-grande-consommation' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">B - Commerce de produits de grande consommation</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B01 - Commerce alimentaire et non alimentaire généraliste (grande distribution)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B02 - Commerce alimentaire spécialisé (boulangerie, boucherie, poissonnerie, bio, caviste...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B03 - Commerce non alimentaire généraliste ou spécialisé (grands magasins, produits techniques, solderies, bazars...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B04 - Eventaires, marchés de plein air</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B05 - Commerce de tabac (débits de tabac), cigarette électronique</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B06 - Equipement de la personne (habillement, chaussures, accessoires...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B07 - Equipement de la maison (ameublement, appareils électro-ménagers, décoration, consommables....)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B08 - Horlogerie, bijouterie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">B09 - Biens d'occasion (antiquaires, dépôts-vente, brocantes...)</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'commerce-electronique' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">C - Commerce électronique, vente hors magasin</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">C01 - Vente en ligne, vente à distance</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">C02 - Foires et salons</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">C03 - Distribution automatique</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">C04 - Vente en réunion</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">C05 - Vente directe, démarchage</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'immobilier-logement' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">D - Immobilier, logement</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D01 - Promotion, construction</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D02 - Travaux d'architecte</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D03 - Ingénierie, expertises (géomètres-expert, expertise technique, diagnostics immobiliers...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D04 - Transactions immobilières, administration de biens immobiliers</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D05 - Gestion, vente de biens immobiliers (agences immobilières, mandataires immobiliers, viager...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D06 - Facilitation pour valoriser la vente d'un bien immobilier (conseil dans le domaine immobilier, mise en scène d'intérieur...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D07 - Syndics de copropriétés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D08 - Déménagement</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">D09 - Entreposage, stockage (garde-meuble...)</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'energie-eau-assainissement' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">E - Energie, eau, assainissement</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">E01 - Distribution d'électricité et/ou distribution de gaz</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">E02 - Distribution de fioul domestique, combustibles solides (bois, charbon), gaz de pétrole liquéfiés (GPL)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">E03 - Distribution d'eau chaude (chauffage urbain)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">E04 - Energies renouvelables</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">E05 - Services Publics de l'eau et de l'assainissement collectif et non collectif</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">E06 - Collecte, traitement des eaux</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'travaux-batiment' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">F - Travaux du bâtiment, travaux d'aménagement extérieur et intérieur</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F01 - Installation de cuisines et salles de bains</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F02 - Installation de piscines</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F03 - Installation et réparation d'équipements (chauffage, climatisation, efficacité énergétique...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F04 - Aménagement de l'habitat, travaux d'installation, de réparation, de rénovation et activités de décoration</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F05 - Aménagement extérieur (gros travaux)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F06 - Réparation de matériels (électroménager, télévision, vidéo...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F07 - Dépannages urgents à domicile</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">F08 - Location de matériels</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'transport-public' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">G - Transport public de voyageurs, transport de marchandises</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G01 - Transport ferroviaire de voyageurs</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G02 - Transports publics urbains et suburbains</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G03 - Autocars</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G04 - Taxis, véhicules de transport avec chauffeur (VTC)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G05 - Transport maritime, transport fluvial</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G06 - Transport aérien</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G07 - Services aéroportuaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G08 - Transport scolaire</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G09 - Remontées mécaniques et téléphériques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">G10 - Transport de marchandises, livraisons</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'automobile' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">H - Automobile</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H01 - Construction et/ou commerce de véhicules (automobile, motocycle, cycle, bateau, aéronef...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H02 - Location longue durée (LDD), location avec option d'achat (LOA) de véhicules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H03 - Location de courte durée de véhicules : contrats spécifiques, autopartage, véhicules en libre-service</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H04 - Accessoires pour véhicules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H05 - Entretien et réparation de véhicules (concessionnaires, agents, réparateurs indépendants, centres auto...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H06 - Engins motorisés non réceptionnés (mini-motos, quads, trottinettes électriques, gyropodes...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H07 - Contrôle technique de véhicules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H08 - Stationnement des véhicules (parcmètres, parcs de stationnement...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H09 - Autoroutes (péages)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H10 - Dépannage, remorquage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H11 - Enlèvement de véhicules, fourrières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H12 - Destruction des véhicules hors d'usage (VHU)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H13 - Distribution de carburants (stations-services)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H14 - Lavage des véhicules (haute pression...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">H15 - Formation des conducteurs (auto-ecole)</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'hotellerie-restauration' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">I - Hôtellerie, restauration</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">I01 - Hôtellerie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">I02 - Centrales de réservation hôtelière</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">I03 - Restauration</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">I04 - Organisation d'évènements</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">I05 - Livraison de repas à domicile</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">I06 - Débits de boissons (cafés, brasserie)</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'tourisme-voyage' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">J - Tourisme, voyage</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">J01 - Agences de voyage, voyagistes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">J02 - Villages, clubs de vacances</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">J03 - Biens immobiliers saisonniers et temporaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">J04 - Séjours en temps partagé</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">J05 - Hôtellerie de plein air (camping, caravaning...)</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'culture-loisirs-sport' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">K - Culture, loisirs, sport</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K01 - Biens culturels (livres, musique, peinture, photos...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K02 - Presse</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K03 - Articles de puériculture, jouets</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K04 - Articles de sport, articles de loisirs</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K05 - Location d'articles de loisirs et de sport</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K06 - Activités et manifestations sportives (leçons, locations d'installations sportives, billetterie...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K07 - Activités récréatives et de loisirs (parcs d'attraction, parcours acrobatiques...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K08 - Théâtres, spectacles, musées</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K09 - Cinéma</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K10 - Travaux photographiques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K11 - Coffret-cadeau (séjours, gastronomie, bien-être, sport-aventure, multi-activités...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">K12 - Jeux de hasard et d'argent</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'bricolage-jardinage-animaux' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">L - Bricolage, jardinage, animaux</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">L01 - Bricolage et équipements spécialisés (matériels agricoles, d'espaces verts...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">L02 - Fleurs, plantes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">L03 - Aménagement paysager (y compris élagage et abattage)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">L04 - Jardinerie, animalerie (animaux domestiques et leurs aliments, matériels d'élevage)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">L05 - Commercialisation d'animaux, services pour les animaux (toilettage, gardiennage...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">L06 - Soins vétérinaires et produits vétérinaires (médicaments, aliments et produits d'hygiène pour animaux)</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'produits-services-personne' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">M - Produits et services à la personne</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M01 - Parfumerie, produits de beauté</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M02 - Parapharmacie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M03 - Matériels et dispositifs médicaux (optique, audition,...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M04 - Coiffure, instituts de beauté (produits et services)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M05 - Services d'esthétique corporelle (bronzage, onglerie, épilation, tatouage .....)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M06 - Services de bien-être (thalassothérapie, spa..., hypnose,...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M07 - Services à domicile (garde d'enfants, ménage...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M08 - Crèches, assistantes maternelles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M09 - Maisons de retraite, établissements d'hébergement</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M10 - Cordonnerie, reproduction de clés,...</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M11 - Blanchisseries, teintureries, repassage, laveries en libre-service</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">M12 - Services funéraires</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'franchise' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">N - Franchise</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">N01 - Franchise</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'metallurgie' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">O - Métallurgie</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O01 - Sidérurgie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O02 - Fabrication de tubes, tuyaux, profilés creux et accessoires correspondants en acier</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O03 - étirage à froid de barres</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O04 - Laminage à froid de feuillards</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O05 - Profilage à froid par formage ou pliage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O06 - Tréfilage à froid</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O07 - Production de métaux précieux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O08 - Métallurgie de l'aluminium</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O09 - Métallurgie du plomb, du zinc ou de l'étain</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O10 - Métallurgie du cuivre</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O11 - Métallurgie des autres métaux non ferreux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O12 - élaboration et transformation de matières nucléaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O13 - Fonderie de fonte</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O14 - Fonderie d'acier</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O15 - Fonderie de métaux légers</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">O16 - Fonderie d'autres métaux non ferreux</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'fabrication-produits-metalliques' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">P - Fabrication de produits métalliques</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P01 - Fabrication de structures métalliques et de parties de structures</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P02 - Fabrication de portes et fenêtres en métal</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P03 - Fabrication de radiateurs et de chaudières pour le chauffage central</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P04 - Fabrication d'autres réservoirs, citernes et conteneurs métalliques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P05 - Fabrication de générateurs de vapeur, à l'exception des chaudières pour le chauffage central</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P06 - Fabrication d'armes et de munitions</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P07 - Forge, estampage, matriçage , métallurgie des poudres</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P08 - Découpage, emboutissage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P09 - Traitement et revêtement des métaux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P10 - Décolletage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P11 - Mécanique industrielle</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P12 - Fabrication de coutellerie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P13 - Fabrication de serrures et de ferrures</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P14 - Fabrication de moules et modèles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P15 - Fabrication d'autres outillages</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P16 - Fabrication de fûts et emballages métalliques similaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P17 - Fabrication d'emballages métalliques légers</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">P18 - Fabrication d'articles en fils métalliques, de chaînes et de ressorts</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'tri-collecte-dechets' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">Q - Tri et collecte des déchets</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">Q01 - Collecte des déchets non dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">Q02 - Collecte des déchets dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">Q03 - Traitement et élimination des déchets non dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">Q04 - Traitement et élimination des déchets dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">Q05 - Démantèlement d'épaves</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">Q06 - Récupération de déchets triés</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'culture-production-animale' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">R - Culture et production animale chasse et services annexes</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0111Z Culture de céréales (à l'exception du riz), de légumineuses et de graines oléagineuses</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0112Z Culture du riz</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0113Z Culture de légumes, de melons, de racines et de tubercules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0114Z Culture de la canne à sucre</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0115Z Culture du tabac</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0116Z Culture de plantes à fibres</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0119Z Autres cultures non permanentes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0121Z Culture de la vigne</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0122Z Culture de fruits tropicaux et subtropicaux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0123Z Culture d'agrumes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0124Z Culture de fruits à pépins et à noyau</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0125Z Culture d'autres fruits d'arbres ou d'arbustes et de fruits à coque</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0126Z Culture de fruits oléagineux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0127Z Culture de plantes à boissons</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0128Z Culture de plantes à épices, aromatiques, médicinales et pharmaceutiques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0129Z Autres cultures permanentes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0130Z Reproduction de plantes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0141Z Élevage de vaches laitières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0142Z Élevage d'autres bovins et de buffles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0143Z Élevage de chevaux et d'autres équidés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0144Z Élevage de chameaux et d'autres camélidés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0145Z Élevage d'ovins et de caprins</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0146Z Élevage de porcins</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0147Z Élevage de volailles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0149Z Élevage d'autres animaux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0150Z Culture et élevage associés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0161Z Activités de soutien aux cultures</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0162Z Activités de soutien à la production animale</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0163Z Traitement primaire des récoltes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0164Z Traitement des semences</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0170Z Chasse, piégeage et services annexes</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {secteurActivite === 'sylviculture-exploitation-forestiere' && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                          <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-blue-300">S - Sylviculture et exploitation forestière</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0210Z Sylviculture et autres activités forestières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0220Z Exploitation forestière</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0230Z Récolte de produits forestiers non ligneux poussant à l'état sauvage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-gray-800">0240Z Services de soutien à l'exploitation forestière</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Nom de votre conseiller <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={nomConseiller}
                          onChange={(e) => setNomConseiller(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Nom du conseiller"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Nom de société <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={nomSociete}
                          onChange={(e) => setNomSociete(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Nom de la société"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Siret / Siren <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={siretSiren}
                          onChange={(e) => setSiretSiren(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Siret / Siren"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Adresse <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={adresse}
                          onChange={(e) => setAdresse(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Adresse"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Ville <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={ville}
                          onChange={(e) => setVille(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Ville"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Code postal <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={codePostal}
                          onChange={(e) => setCodePostal(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Code postal"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Nom & prénom du gérant <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={nomPrenomGerant}
                          onChange={(e) => setNomPrenomGerant(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Nom & prénom du gérant"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={telephone}
                          onChange={(e) => setTelephone(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Téléphone"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="E-mail"
                        />
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <h4 className="text-base font-bold text-gray-900 mb-4">Salariés de l'entreprise</h4>
                        <select className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer">
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="1-3">1 à 3</option>
                          <option value="3-6">3 à 6</option>
                          <option value="6-9">6 à 9</option>
                          <option value="10-19">10 à 19</option>
                          <option value="20-49">20 à 49</option>
                          <option value="49+">+ 49</option>
                        </select>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          1. Informations transmises aux travailleurs sur le Covid-19, les recommandations sanitaires, les gestes barrières ?
                        </label>
                        <select
                          value={covidInfo}
                          onChange={(e) => setCovidInfo(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          2. Affichage spécifique dans les locaux (et les véhicules, les installations de chantier etc.) ?
                        </label>
                        <select
                          value={affichageSpecifique}
                          onChange={(e) => setAffichageSpecifique(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          5. Mise à disposition de solution Hydroalcoolique ?
                        </label>
                        <select
                          value={solutionHydroalcoolique}
                          onChange={(e) => setSolutionHydroalcoolique(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          5. Définition et mise en œuvre de processus de nettoyage des équipements, engins et véhicules partagés ainsi que les locaux utilisés par plusieurs personnes (vestiaires, salle de pause, accueil, etc.) ?
                        </label>
                        <select
                          value={processusNettoyage}
                          onChange={(e) => setProcessusNettoyage(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          6. Définition et mise en œuvre de processus d'aération des locaux de travail ?
                        </label>
                        <select
                          value={processusAeration}
                          onChange={(e) => setProcessusAeration(e.target.value)}
                          className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">7. Catégorie: Circulation</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('circulation', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['circulation__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['circulation__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['circulation__'] || ''}
                              onChange={(e) => updateEditingNote('circulation', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Circulation..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('circulation', '')}
                              disabled={savingNotes['circulation__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['circulation__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.circulation.includes('Intervention hors site')}
                                  onChange={() => toggleCategory('circulation', 'Intervention hors site')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Intervention hors site</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('circulation', 'Intervention hors site')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['circulation__Intervention hors site'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['circulation__Intervention hors site'] || ''}
                                  onChange={(e) => updateEditingNote('circulation', 'Intervention hors site', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('circulation', 'Intervention hors site')}
                                  disabled={savingNotes['circulation__Intervention hors site']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['circulation__Intervention hors site'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.circulation.includes('Tout déplacement hors société / dépannage / commercial')}
                                  onChange={() => toggleCategory('circulation', 'Tout déplacement hors société / dépannage / commercial')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Tout déplacement hors société / dépannage / commercial</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('circulation', 'Tout déplacement hors société / dépannage / commercial')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['circulation__Tout déplacement hors société / dépannage / commercial'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['circulation__Tout déplacement hors société / dépannage / commercial'] || ''}
                                  onChange={(e) => updateEditingNote('circulation', 'Tout déplacement hors société / dépannage / commercial', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('circulation', 'Tout déplacement hors société / dépannage / commercial')}
                                  disabled={savingNotes['circulation__Tout déplacement hors société / dépannage / commercial']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['circulation__Tout déplacement hors société / dépannage / commercial'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.circulation.includes('Entreprise intervenant sur site')}
                                  onChange={() => toggleCategory('circulation', 'Entreprise intervenant sur site')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Entreprise intervenant sur site</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('circulation', 'Entreprise intervenant sur site')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['circulation__Entreprise intervenant sur site'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['circulation__Entreprise intervenant sur site'] || ''}
                                  onChange={(e) => updateEditingNote('circulation', 'Entreprise intervenant sur site', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('circulation', 'Entreprise intervenant sur site')}
                                  disabled={savingNotes['circulation__Entreprise intervenant sur site']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['circulation__Entreprise intervenant sur site'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.circulation.includes('Circulation et stationnement des véhicules')}
                                  onChange={() => toggleCategory('circulation', 'Circulation et stationnement des véhicules')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Circulation et stationnement des véhicules</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('circulation', 'Circulation et stationnement des véhicules')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['circulation__Circulation et stationnement des véhicules'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['circulation__Circulation et stationnement des véhicules'] || ''}
                                  onChange={(e) => updateEditingNote('circulation', 'Circulation et stationnement des véhicules', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('circulation', 'Circulation et stationnement des véhicules')}
                                  disabled={savingNotes['circulation__Circulation et stationnement des véhicules']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['circulation__Circulation et stationnement des véhicules'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.circulation.includes('Chargement / Déchargement')}
                                  onChange={() => toggleCategory('circulation', 'Chargement / Déchargement')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Chargement / Déchargement</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('circulation', 'Chargement / Déchargement')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['circulation__Chargement / Déchargement'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['circulation__Chargement / Déchargement'] || ''}
                                  onChange={(e) => updateEditingNote('circulation', 'Chargement / Déchargement', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('circulation', 'Chargement / Déchargement')}
                                  disabled={savingNotes['circulation__Chargement / Déchargement']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['circulation__Chargement / Déchargement'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3 last:pb-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.circulation.includes('Transport de personnes')}
                                  onChange={() => toggleCategory('circulation', 'Transport de personnes')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Transport de personnes</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('circulation', 'Transport de personnes')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['circulation__Transport de personnes'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['circulation__Transport de personnes'] || ''}
                                  onChange={(e) => updateEditingNote('circulation', 'Transport de personnes', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('circulation', 'Transport de personnes')}
                                  disabled={savingNotes['circulation__Transport de personnes']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['circulation__Transport de personnes'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">8. Catégorie: Stockage</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('stockage', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['stockage__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['stockage__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['stockage__'] || ''}
                              onChange={(e) => updateEditingNote('stockage', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Stockage..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('stockage', '')}
                              disabled={savingNotes['stockage__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['stockage__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.stockage.includes('Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)')}
                                  onChange={() => toggleCategory('stockage', 'Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Stockage des produits d'entretien (Substances dangereuses / Produits inflammables)</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('stockage', 'Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['stockage__Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['stockage__Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)'] || ''}
                                  onChange={(e) => updateEditingNote('stockage', 'Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('stockage', 'Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)')}
                                  disabled={savingNotes['stockage__Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['stockage__Stockage des produits d\'entretien (Substances dangereuses / Produits inflammables)'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.stockage.includes('Stockage de déchets dangereux')}
                                  onChange={() => toggleCategory('stockage', 'Stockage de déchets dangereux')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Stockage de déchets dangereux</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('stockage', 'Stockage de déchets dangereux')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['stockage__Stockage de déchets dangereux'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['stockage__Stockage de déchets dangereux'] || ''}
                                  onChange={(e) => updateEditingNote('stockage', 'Stockage de déchets dangereux', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('stockage', 'Stockage de déchets dangereux')}
                                  disabled={savingNotes['stockage__Stockage de déchets dangereux']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['stockage__Stockage de déchets dangereux'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.stockage.includes('Stockage de déchets banals')}
                                  onChange={() => toggleCategory('stockage', 'Stockage de déchets banals')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Stockage de déchets banals</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('stockage', 'Stockage de déchets banals')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['stockage__Stockage de déchets banals'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['stockage__Stockage de déchets banals'] || ''}
                                  onChange={(e) => updateEditingNote('stockage', 'Stockage de déchets banals', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('stockage', 'Stockage de déchets banals')}
                                  disabled={savingNotes['stockage__Stockage de déchets banals']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['stockage__Stockage de déchets banals'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3 last:pb-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.stockage.includes('Gaz (stockage / manutention et distribution)')}
                                  onChange={() => toggleCategory('stockage', 'Gaz (stockage / manutention et distribution)')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Gaz (stockage / manutention et distribution)</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('stockage', 'Gaz (stockage / manutention et distribution)')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['stockage__Gaz (stockage / manutention et distribution)'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['stockage__Gaz (stockage / manutention et distribution)'] || ''}
                                  onChange={(e) => updateEditingNote('stockage', 'Gaz (stockage / manutention et distribution)', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('stockage', 'Gaz (stockage / manutention et distribution)')}
                                  disabled={savingNotes['stockage__Gaz (stockage / manutention et distribution)']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['stockage__Gaz (stockage / manutention et distribution)'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">9. Catégorie: Engins mécaniques</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('enginsMecaniques', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['enginsMecaniques__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['enginsMecaniques__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['enginsMecaniques__'] || ''}
                              onChange={(e) => updateEditingNote('enginsMecaniques', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Engins mécaniques..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('enginsMecaniques', '')}
                              disabled={savingNotes['enginsMecaniques__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['enginsMecaniques__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.enginsMecaniques.includes('Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)')}
                                  onChange={() => toggleCategory('enginsMecaniques', 'Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('enginsMecaniques', 'Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['enginsMecaniques__Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['enginsMecaniques__Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)'] || ''}
                                  onChange={(e) => updateEditingNote('enginsMecaniques', 'Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('enginsMecaniques', 'Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)')}
                                  disabled={savingNotes['enginsMecaniques__Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['enginsMecaniques__Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.enginsMecaniques.includes('Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette')}
                                  onChange={() => toggleCategory('enginsMecaniques', 'Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('enginsMecaniques', 'Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['enginsMecaniques__Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['enginsMecaniques__Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette'] || ''}
                                  onChange={(e) => updateEditingNote('enginsMecaniques', 'Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('enginsMecaniques', 'Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette')}
                                  disabled={savingNotes['enginsMecaniques__Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['enginsMecaniques__Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.enginsMecaniques.includes('Compresseurs d\'air / Centrifuges')}
                                  onChange={() => toggleCategory('enginsMecaniques', 'Compresseurs d\'air / Centrifuges')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Compresseurs d'air / Centrifuges</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('enginsMecaniques', 'Compresseurs d\'air / Centrifuges')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['enginsMecaniques__Compresseurs d\'air / Centrifuges'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['enginsMecaniques__Compresseurs d\'air / Centrifuges'] || ''}
                                  onChange={(e) => updateEditingNote('enginsMecaniques', 'Compresseurs d\'air / Centrifuges', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('enginsMecaniques', 'Compresseurs d\'air / Centrifuges')}
                                  disabled={savingNotes['enginsMecaniques__Compresseurs d\'air / Centrifuges']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['enginsMecaniques__Compresseurs d\'air / Centrifuges'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">10. Catégorie: Usine / Production</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('usineProduction', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['usineProduction__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['usineProduction__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['usineProduction__'] || ''}
                              onChange={(e) => updateEditingNote('usineProduction', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Usine / Production..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('usineProduction', '')}
                              disabled={savingNotes['usineProduction__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['usineProduction__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.usineProduction.includes('Fonderie')}
                                  onChange={() => toggleCategory('usineProduction', 'Fonderie')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Fonderie</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('usineProduction', 'Fonderie')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['usineProduction__Fonderie'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['usineProduction__Fonderie'] || ''}
                                  onChange={(e) => updateEditingNote('usineProduction', 'Fonderie', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('usineProduction', 'Fonderie')}
                                  disabled={savingNotes['usineProduction__Fonderie']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['usineProduction__Fonderie'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.usineProduction.includes('Fabrication / transformation de matières plastiques')}
                                  onChange={() => toggleCategory('usineProduction', 'Fabrication / transformation de matières plastiques')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Fabrication / transformation de matières plastiques</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('usineProduction', 'Fabrication / transformation de matières plastiques')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['usineProduction__Fabrication / transformation de matières plastiques'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['usineProduction__Fabrication / transformation de matières plastiques'] || ''}
                                  onChange={(e) => updateEditingNote('usineProduction', 'Fabrication / transformation de matières plastiques', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('usineProduction', 'Fabrication / transformation de matières plastiques')}
                                  disabled={savingNotes['usineProduction__Fabrication / transformation de matières plastiques']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['usineProduction__Fabrication / transformation de matières plastiques'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.usineProduction.includes('Production / transformation d\'electricité')}
                                  onChange={() => toggleCategory('usineProduction', 'Production / transformation d\'electricité')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Production / transformation d'electricité</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('usineProduction', 'Production / transformation d\'electricité')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['usineProduction__Production / transformation d\'electricité'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['usineProduction__Production / transformation d\'electricité'] || ''}
                                  onChange={(e) => updateEditingNote('usineProduction', 'Production / transformation d\'electricité', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('usineProduction', 'Production / transformation d\'electricité')}
                                  disabled={savingNotes['usineProduction__Production / transformation d\'electricité']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['usineProduction__Production / transformation d\'electricité'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.usineProduction.includes('Dépôt d\'encres / vernis / peintures')}
                                  onChange={() => toggleCategory('usineProduction', 'Dépôt d\'encres / vernis / peintures')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Dépôt d'encres / vernis / peintures</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('usineProduction', 'Dépôt d\'encres / vernis / peintures')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['usineProduction__Dépôt d\'encres / vernis / peintures'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['usineProduction__Dépôt d\'encres / vernis / peintures'] || ''}
                                  onChange={(e) => updateEditingNote('usineProduction', 'Dépôt d\'encres / vernis / peintures', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('usineProduction', 'Dépôt d\'encres / vernis / peintures')}
                                  disabled={savingNotes['usineProduction__Dépôt d\'encres / vernis / peintures']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['usineProduction__Dépôt d\'encres / vernis / peintures'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.usineProduction.includes('Traitement du bois')}
                                  onChange={() => toggleCategory('usineProduction', 'Traitement du bois')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Traitement du bois</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('usineProduction', 'Traitement du bois')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['usineProduction__Traitement du bois'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['usineProduction__Traitement du bois'] || ''}
                                  onChange={(e) => updateEditingNote('usineProduction', 'Traitement du bois', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('usineProduction', 'Traitement du bois')}
                                  disabled={savingNotes['usineProduction__Traitement du bois']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['usineProduction__Traitement du bois'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.usineProduction.includes('Traitement de déchets')}
                                  onChange={() => toggleCategory('usineProduction', 'Traitement de déchets')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Traitement de déchets</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('usineProduction', 'Traitement de déchets')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['usineProduction__Traitement de déchets'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['usineProduction__Traitement de déchets'] || ''}
                                  onChange={(e) => updateEditingNote('usineProduction', 'Traitement de déchets', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('usineProduction', 'Traitement de déchets')}
                                  disabled={savingNotes['usineProduction__Traitement de déchets']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['usineProduction__Traitement de déchets'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.usineProduction.includes('Stations d\'épuration')}
                                  onChange={() => toggleCategory('usineProduction', 'Stations d\'épuration')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Stations d'épuration</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('usineProduction', 'Stations d\'épuration')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['usineProduction__Stations d\'épuration'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['usineProduction__Stations d\'épuration'] || ''}
                                  onChange={(e) => updateEditingNote('usineProduction', 'Stations d\'épuration', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('usineProduction', 'Stations d\'épuration')}
                                  disabled={savingNotes['usineProduction__Stations d\'épuration']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['usineProduction__Stations d\'épuration'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">11. Catégorie: Thermique</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('thermique', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['thermique__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['thermique__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['thermique__'] || ''}
                              onChange={(e) => updateEditingNote('thermique', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Thermique..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('thermique', '')}
                              disabled={savingNotes['thermique__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['thermique__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.thermique.includes('Frigidaire réfrigérateur / Chambre froide')}
                                  onChange={() => toggleCategory('thermique', 'Frigidaire réfrigérateur / Chambre froide')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Frigidaire réfrigérateur / Chambre froide</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('thermique', 'Frigidaire réfrigérateur / Chambre froide')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['thermique__Frigidaire réfrigérateur / Chambre froide'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['thermique__Frigidaire réfrigérateur / Chambre froide'] || ''}
                                  onChange={(e) => updateEditingNote('thermique', 'Frigidaire réfrigérateur / Chambre froide', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('thermique', 'Frigidaire réfrigérateur / Chambre froide')}
                                  disabled={savingNotes['thermique__Frigidaire réfrigérateur / Chambre froide']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['thermique__Frigidaire réfrigérateur / Chambre froide'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.thermique.includes('Chaufferies chauffage et process')}
                                  onChange={() => toggleCategory('thermique', 'Chaufferies chauffage et process')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Chaufferies chauffage et process</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('thermique', 'Chaufferies chauffage et process')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['thermique__Chaufferies chauffage et process'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['thermique__Chaufferies chauffage et process'] || ''}
                                  onChange={(e) => updateEditingNote('thermique', 'Chaufferies chauffage et process', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('thermique', 'Chaufferies chauffage et process')}
                                  disabled={savingNotes['thermique__Chaufferies chauffage et process']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['thermique__Chaufferies chauffage et process'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.thermique.includes('Climatisation')}
                                  onChange={() => toggleCategory('thermique', 'Climatisation')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Climatisation</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('thermique', 'Climatisation')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['thermique__Climatisation'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['thermique__Climatisation'] || ''}
                                  onChange={(e) => updateEditingNote('thermique', 'Climatisation', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('thermique', 'Climatisation')}
                                  disabled={savingNotes['thermique__Climatisation']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['thermique__Climatisation'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">12. Catégorie: Machine pour usine</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('machineUsine', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['machineUsine__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['machineUsine__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['machineUsine__'] || ''}
                              onChange={(e) => updateEditingNote('machineUsine', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Machine pour usine..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('machineUsine', '')}
                              disabled={savingNotes['machineUsine__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['machineUsine__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.machineUsine.includes('Emballages /conditionnement')}
                                  onChange={() => toggleCategory('machineUsine', 'Emballages /conditionnement')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Emballages /conditionnement</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('machineUsine', 'Emballages /conditionnement')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['machineUsine__Emballages /conditionnement'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['machineUsine__Emballages /conditionnement'] || ''}
                                  onChange={(e) => updateEditingNote('machineUsine', 'Emballages /conditionnement', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('machineUsine', 'Emballages /conditionnement')}
                                  disabled={savingNotes['machineUsine__Emballages /conditionnement']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['machineUsine__Emballages /conditionnement'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.machineUsine.includes('Montage /assemblage')}
                                  onChange={() => toggleCategory('machineUsine', 'Montage /assemblage')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Montage /assemblage</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('machineUsine', 'Montage /assemblage')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['machineUsine__Montage /assemblage'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['machineUsine__Montage /assemblage'] || ''}
                                  onChange={(e) => updateEditingNote('machineUsine', 'Montage /assemblage', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('machineUsine', 'Montage /assemblage')}
                                  disabled={savingNotes['machineUsine__Montage /assemblage']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['machineUsine__Montage /assemblage'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.machineUsine.includes('Maintenance des équipements')}
                                  onChange={() => toggleCategory('machineUsine', 'Maintenance des équipements')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Maintenance des équipements</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('machineUsine', 'Maintenance des équipements')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['machineUsine__Maintenance des équipements'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['machineUsine__Maintenance des équipements'] || ''}
                                  onChange={(e) => updateEditingNote('machineUsine', 'Maintenance des équipements', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('machineUsine', 'Maintenance des équipements')}
                                  disabled={savingNotes['machineUsine__Maintenance des équipements']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['machineUsine__Maintenance des équipements'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.machineUsine.includes('Entretien des infrastructures')}
                                  onChange={() => toggleCategory('machineUsine', 'Entretien des infrastructures')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Entretien des infrastructures</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('machineUsine', 'Entretien des infrastructures')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['machineUsine__Entretien des infrastructures'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['machineUsine__Entretien des infrastructures'] || ''}
                                  onChange={(e) => updateEditingNote('machineUsine', 'Entretien des infrastructures', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('machineUsine', 'Entretien des infrastructures')}
                                  disabled={savingNotes['machineUsine__Entretien des infrastructures']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['machineUsine__Entretien des infrastructures'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">13. Catégorie: Autre</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('autre', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['autre__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['autre__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['autre__'] || ''}
                              onChange={(e) => updateEditingNote('autre', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Autre..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('autre', '')}
                              disabled={savingNotes['autre__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['autre__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.autre.includes('Animaux vivants')}
                                  onChange={() => toggleCategory('autre', 'Animaux vivants')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Animaux vivants</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('autre', 'Animaux vivants')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['autre__Animaux vivants'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['autre__Animaux vivants'] || ''}
                                  onChange={(e) => updateEditingNote('autre', 'Animaux vivants', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('autre', 'Animaux vivants')}
                                  disabled={savingNotes['autre__Animaux vivants']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['autre__Animaux vivants'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">14. Catégorie: Manutention Circulation</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('manutentionCirculation', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['manutentionCirculation__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['manutentionCirculation__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['manutentionCirculation__'] || ''}
                              onChange={(e) => updateEditingNote('manutentionCirculation', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Manutention Circulation..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('manutentionCirculation', '')}
                              disabled={savingNotes['manutentionCirculation__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['manutentionCirculation__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.manutentionCirculation.includes('Risque de chute de personnes')}
                                  onChange={() => toggleCategory('manutentionCirculation', 'Risque de chute de personnes')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque de chute de personnes</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('manutentionCirculation', 'Risque de chute de personnes')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['manutentionCirculation__Risque de chute de personnes'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['manutentionCirculation__Risque de chute de personnes'] || ''}
                                  onChange={(e) => updateEditingNote('manutentionCirculation', 'Risque de chute de personnes', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('manutentionCirculation', 'Risque de chute de personnes')}
                                  disabled={savingNotes['manutentionCirculation__Risque de chute de personnes']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['manutentionCirculation__Risque de chute de personnes'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.manutentionCirculation.includes('Risque lié à la manutention manuelle')}
                                  onChange={() => toggleCategory('manutentionCirculation', 'Risque lié à la manutention manuelle')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié à la manutention manuelle</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('manutentionCirculation', 'Risque lié à la manutention manuelle')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['manutentionCirculation__Risque lié à la manutention manuelle'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['manutentionCirculation__Risque lié à la manutention manuelle'] || ''}
                                  onChange={(e) => updateEditingNote('manutentionCirculation', 'Risque lié à la manutention manuelle', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('manutentionCirculation', 'Risque lié à la manutention manuelle')}
                                  disabled={savingNotes['manutentionCirculation__Risque lié à la manutention manuelle']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['manutentionCirculation__Risque lié à la manutention manuelle'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.manutentionCirculation.includes('Risque lié à la manutention mécanisée')}
                                  onChange={() => toggleCategory('manutentionCirculation', 'Risque lié à la manutention mécanisée')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié à la manutention mécanisée</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('manutentionCirculation', 'Risque lié à la manutention mécanisée')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['manutentionCirculation__Risque lié à la manutention mécanisée'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['manutentionCirculation__Risque lié à la manutention mécanisée'] || ''}
                                  onChange={(e) => updateEditingNote('manutentionCirculation', 'Risque lié à la manutention mécanisée', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('manutentionCirculation', 'Risque lié à la manutention mécanisée')}
                                  disabled={savingNotes['manutentionCirculation__Risque lié à la manutention mécanisée']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['manutentionCirculation__Risque lié à la manutention mécanisée'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.manutentionCirculation.includes('Risque lié aux circulations et aux déplacements dans l\'entreprise')}
                                  onChange={() => toggleCategory('manutentionCirculation', 'Risque lié aux circulations et aux déplacements dans l\'entreprise')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié aux circulations et aux déplacements dans l'entreprise</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('manutentionCirculation', 'Risque lié aux circulations et aux déplacements dans l\'entreprise')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['manutentionCirculation__Risque lié aux circulations et aux déplacements dans l\'entreprise'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['manutentionCirculation__Risque lié aux circulations et aux déplacements dans l\'entreprise'] || ''}
                                  onChange={(e) => updateEditingNote('manutentionCirculation', 'Risque lié aux circulations et aux déplacements dans l\'entreprise', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('manutentionCirculation', 'Risque lié aux circulations et aux déplacements dans l\'entreprise')}
                                  disabled={savingNotes['manutentionCirculation__Risque lié aux circulations et aux déplacements dans l\'entreprise']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['manutentionCirculation__Risque lié aux circulations et aux déplacements dans l\'entreprise'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.manutentionCirculation.includes('Risque lié aux effondrements et aux chutes d\'objets')}
                                  onChange={() => toggleCategory('manutentionCirculation', 'Risque lié aux effondrements et aux chutes d\'objets')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié aux effondrements et aux chutes d'objets</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('manutentionCirculation', 'Risque lié aux effondrements et aux chutes d\'objets')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['manutentionCirculation__Risque lié aux effondrements et aux chutes d\'objets'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['manutentionCirculation__Risque lié aux effondrements et aux chutes d\'objets'] || ''}
                                  onChange={(e) => updateEditingNote('manutentionCirculation', 'Risque lié aux effondrements et aux chutes d\'objets', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('manutentionCirculation', 'Risque lié aux effondrements et aux chutes d\'objets')}
                                  disabled={savingNotes['manutentionCirculation__Risque lié aux effondrements et aux chutes d\'objets']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['manutentionCirculation__Risque lié aux effondrements et aux chutes d\'objets'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.manutentionCirculation.includes('Risque lié à la circulation de véhicule')}
                                  onChange={() => toggleCategory('manutentionCirculation', 'Risque lié à la circulation de véhicule')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié à la circulation de véhicule</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('manutentionCirculation', 'Risque lié à la circulation de véhicule')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['manutentionCirculation__Risque lié à la circulation de véhicule'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['manutentionCirculation__Risque lié à la circulation de véhicule'] || ''}
                                  onChange={(e) => updateEditingNote('manutentionCirculation', 'Risque lié à la circulation de véhicule', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('manutentionCirculation', 'Risque lié à la circulation de véhicule')}
                                  disabled={savingNotes['manutentionCirculation__Risque lié à la circulation de véhicule']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['manutentionCirculation__Risque lié à la circulation de véhicule'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">15. Catégorie: Ambiance</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('ambiance', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['ambiance__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['ambiance__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['ambiance__'] || ''}
                              onChange={(e) => updateEditingNote('ambiance', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Ambiance..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('ambiance', '')}
                              disabled={savingNotes['ambiance__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['ambiance__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.ambiance.includes('Risque lié au bruit')}
                                  onChange={() => toggleCategory('ambiance', 'Risque lié au bruit')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié au bruit</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('ambiance', 'Risque lié au bruit')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['ambiance__Risque lié au bruit'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['ambiance__Risque lié au bruit'] || ''}
                                  onChange={(e) => updateEditingNote('ambiance', 'Risque lié au bruit', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('ambiance', 'Risque lié au bruit')}
                                  disabled={savingNotes['ambiance__Risque lié au bruit']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['ambiance__Risque lié au bruit'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.ambiance.includes('Risque lié aux vibrations')}
                                  onChange={() => toggleCategory('ambiance', 'Risque lié aux vibrations')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié aux vibrations</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('ambiance', 'Risque lié aux vibrations')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['ambiance__Risque lié aux vibrations'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['ambiance__Risque lié aux vibrations'] || ''}
                                  onChange={(e) => updateEditingNote('ambiance', 'Risque lié aux vibrations', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('ambiance', 'Risque lié aux vibrations')}
                                  disabled={savingNotes['ambiance__Risque lié aux vibrations']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['ambiance__Risque lié aux vibrations'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.ambiance.includes('Risque lié aux ambiances thermiques')}
                                  onChange={() => toggleCategory('ambiance', 'Risque lié aux ambiances thermiques')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié aux ambiances thermiques</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('ambiance', 'Risque lié aux ambiances thermiques')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['ambiance__Risque lié aux ambiances thermiques'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['ambiance__Risque lié aux ambiances thermiques'] || ''}
                                  onChange={(e) => updateEditingNote('ambiance', 'Risque lié aux ambiances thermiques', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('ambiance', 'Risque lié aux ambiances thermiques')}
                                  disabled={savingNotes['ambiance__Risque lié aux ambiances thermiques']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['ambiance__Risque lié aux ambiances thermiques'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.ambiance.includes('Risque lié aux rayonnements')}
                                  onChange={() => toggleCategory('ambiance', 'Risque lié aux rayonnements')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié aux rayonnements</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('ambiance', 'Risque lié aux rayonnements')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['ambiance__Risque lié aux rayonnements'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['ambiance__Risque lié aux rayonnements'] || ''}
                                  onChange={(e) => updateEditingNote('ambiance', 'Risque lié aux rayonnements', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('ambiance', 'Risque lié aux rayonnements')}
                                  disabled={savingNotes['ambiance__Risque lié aux rayonnements']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['ambiance__Risque lié aux rayonnements'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.ambiance.includes('Risque écran')}
                                  onChange={() => toggleCategory('ambiance', 'Risque écran')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque écran</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('ambiance', 'Risque écran')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['ambiance__Risque écran'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['ambiance__Risque écran'] || ''}
                                  onChange={(e) => updateEditingNote('ambiance', 'Risque écran', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('ambiance', 'Risque écran')}
                                  disabled={savingNotes['ambiance__Risque écran']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['ambiance__Risque écran'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">16. Catégorie: Equipement & Organisation</h4>
                          {isAdminViewing && (
                            <button
                              onClick={() => toggleAdminNote('equipementOrganisation', '')}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              {openNotes['equipementOrganisation__'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              Notes admin
                            </button>
                          )}
                        </div>
                        {isAdminViewing && openNotes['equipementOrganisation__'] && (
                          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <textarea
                              value={editingNotes['equipementOrganisation__'] || ''}
                              onChange={(e) => updateEditingNote('equipementOrganisation', '', e.target.value)}
                              placeholder="Notes générales pour la catégorie Equipement & Organisation..."
                              className="w-full min-h-[100px] p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
                            />
                            <button
                              onClick={() => saveAdminNote('equipementOrganisation', '')}
                              disabled={savingNotes['equipementOrganisation__']}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {savingNotes['equipementOrganisation__'] ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        )}
                        <div className="divide-y divide-gray-200">
                          <div className="py-3 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.equipementOrganisation.includes('Risque lié aux outils')}
                                  onChange={() => toggleCategory('equipementOrganisation', 'Risque lié aux outils')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié aux outils</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('equipementOrganisation', 'Risque lié aux outils')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['equipementOrganisation__Risque lié aux outils'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['equipementOrganisation__Risque lié aux outils'] || ''}
                                  onChange={(e) => updateEditingNote('equipementOrganisation', 'Risque lié aux outils', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('equipementOrganisation', 'Risque lié aux outils')}
                                  disabled={savingNotes['equipementOrganisation__Risque lié aux outils']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['equipementOrganisation__Risque lié aux outils'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.equipementOrganisation.includes('Risque lié à l\'intervention d\'une entreprise extérieure')}
                                  onChange={() => toggleCategory('equipementOrganisation', 'Risque lié à l\'intervention d\'une entreprise extérieure')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié à l'intervention d'une entreprise extérieure</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('equipementOrganisation', 'Risque lié à l\'intervention d\'une entreprise extérieure')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['equipementOrganisation__Risque lié à l\'intervention d\'une entreprise extérieure'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['equipementOrganisation__Risque lié à l\'intervention d\'une entreprise extérieure'] || ''}
                                  onChange={(e) => updateEditingNote('equipementOrganisation', 'Risque lié à l\'intervention d\'une entreprise extérieure', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('equipementOrganisation', 'Risque lié à l\'intervention d\'une entreprise extérieure')}
                                  disabled={savingNotes['equipementOrganisation__Risque lié à l\'intervention d\'une entreprise extérieure']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['equipementOrganisation__Risque lié à l\'intervention d\'une entreprise extérieure'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.equipementOrganisation.includes('Risque lié à l\'organisation du travail')}
                                  onChange={() => toggleCategory('equipementOrganisation', 'Risque lié à l\'organisation du travail')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié à l'organisation du travail</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('equipementOrganisation', 'Risque lié à l\'organisation du travail')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['equipementOrganisation__Risque lié à l\'organisation du travail'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['equipementOrganisation__Risque lié à l\'organisation du travail'] || ''}
                                  onChange={(e) => updateEditingNote('equipementOrganisation', 'Risque lié à l\'organisation du travail', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('equipementOrganisation', 'Risque lié à l\'organisation du travail')}
                                  disabled={savingNotes['equipementOrganisation__Risque lié à l\'organisation du travail']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['equipementOrganisation__Risque lié à l\'organisation du travail'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.equipementOrganisation.includes('Risque lié aux déplacement routiers')}
                                  onChange={() => toggleCategory('equipementOrganisation', 'Risque lié aux déplacement routiers')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque lié aux déplacement routiers</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('equipementOrganisation', 'Risque lié aux déplacement routiers')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['equipementOrganisation__Risque lié aux déplacement routiers'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['equipementOrganisation__Risque lié aux déplacement routiers'] || ''}
                                  onChange={(e) => updateEditingNote('equipementOrganisation', 'Risque lié aux déplacement routiers', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('equipementOrganisation', 'Risque lié aux déplacement routiers')}
                                  disabled={savingNotes['equipementOrganisation__Risque lié aux déplacement routiers']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['equipementOrganisation__Risque lié aux déplacement routiers'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="py-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.equipementOrganisation.includes('Risque Psycho-Sociaux')}
                                  onChange={() => toggleCategory('equipementOrganisation', 'Risque Psycho-Sociaux')}
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">Risque Psycho-Sociaux</span>
                              </label>
                              {isAdminViewing && (
                                <button
                                  onClick={() => toggleAdminNote('equipementOrganisation', 'Risque Psycho-Sociaux')}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                  title="Ajouter une note admin"
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              )}
                            </div>
                            {isAdminViewing && openNotes['equipementOrganisation__Risque Psycho-Sociaux'] && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <textarea
                                  value={editingNotes['equipementOrganisation__Risque Psycho-Sociaux'] || ''}
                                  onChange={(e) => updateEditingNote('equipementOrganisation', 'Risque Psycho-Sociaux', e.target.value)}
                                  placeholder="Notes réservées à l'admin..."
                                  className="w-full min-h-[80px] p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-sm"
                                />
                                <button
                                  onClick={() => saveAdminNote('equipementOrganisation', 'Risque Psycho-Sociaux')}
                                  disabled={savingNotes['equipementOrganisation__Risque Psycho-Sociaux']}
                                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {savingNotes['equipementOrganisation__Risque Psycho-Sociaux'] ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border-2 border-gray-200 shadow-sm">
                        <label className="flex items-start gap-2 md:gap-3 cursor-pointer mb-4 md:mb-6">
                          <input
                            type="checkbox"
                            checked={accepteTermes}
                            onChange={(e) => setAccepteTermes(e.target.checked)}
                            className="mt-1 w-4 h-4 md:w-5 md:h-5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm md:text-base font-medium text-gray-900">J'accepte les termes et conditions de prise en charge *</span>
                        </label>

                        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                          <p className="text-xs md:text-sm text-gray-700">* Rapport de diagnostic conforme</p>
                          <p className="text-xs md:text-sm text-gray-700">* Élaboration du Document Unique</p>
                          <p className="text-xs md:text-sm text-gray-700">* Accès à votre portail numérique</p>
                          <p className="text-xs md:text-sm text-gray-700">* Attestation de conformité DUERP</p>
                          <p className="text-xs md:text-sm text-gray-700">* Suivi juridique en cas de contrôle</p>
                        </div>

                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          Nous vous remercions de bien vouloir procéder au règlement de la prise en charge afin de recevoir votre attestation de conformité, à présenter lors des contrôles. En attendant, le rapport conforme DUERP sera disponible sur votre portail numérique dans un délai de 14 jours ouvrés.
                        </p>
                      </div>

                      <div className="pt-3 md:pt-4">
                        <button
                          onClick={handleSubmit}
                          disabled={isGeneratingPDF}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                        >
                          {isGeneratingPDF ? 'Génération du PDF en cours...' : 'Valider'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'duerp-conforme' && (
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
              <div
                className="relative bg-cover bg-center py-12 md:py-20"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260")'
                }}
              >
                <h1 className="text-3xl md:text-5xl font-bold text-white text-center px-4">Tarifications DUERP</h1>
              </div>

              <div className="py-8 md:py-16 px-4 md:px-8">
                <div className="text-center mb-8 md:mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-4 md:mb-6">Votre DUERP conforme</h2>
                  <p className="text-sm md:text-base text-gray-900 leading-relaxed max-w-3xl mx-auto">
                    Le cabinet FPE ayant pour but d'accompagner les entreprises dans leurs obligations légales et droit administratifs notamment sur la prévention des risques des salariés et la mise en conformité du DUERP (Document unique d'évaluation des risques professionnels),{' '}
                    <span className="text-blue-600 font-normal">selon l'article L4121-1 du Code du travail.</span>
                  </p>
                </div>

                <div className="flex justify-center mb-10 md:mb-16">
                  <div className="bg-[#4A7BA7] rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-10 max-w-md w-full">
                    <div className="flex justify-center mb-4 md:mb-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3">
                        <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white text-center mb-6 md:mb-8 tracking-wide">DUERP CONFORME</h3>

                    <div className="space-y-4 md:space-y-5 text-white">
                      <div className="flex items-center gap-3 md:gap-4">
                        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                        <p className="text-xs md:text-sm font-normal">Recensement et évaluation des risques</p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                        <p className="text-xs md:text-sm font-normal">Elaboration du document unique</p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <FileCheck2 className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                        <p className="text-xs md:text-sm font-normal">Attestation de prise en charge</p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                        <p className="text-xs md:text-sm font-normal">Rapport DUERP conforme</p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <UserCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                        <p className="text-xs md:text-sm font-normal">Accès à votre portail numérique</p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <UserCog className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                        <p className="text-xs md:text-sm font-normal">Service expertise en cas de contrôle</p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <Phone className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                        <p className="text-xs md:text-sm font-normal">Suivie de vos demandes avec un conseiller</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6 md:mb-8 max-w-3xl mx-auto">
                  <p className="text-sm md:text-base text-gray-900 leading-relaxed mb-2">
                    Vous souhaitez répondre à votre obligation réglementaire mais vous ne savez pas comment vous y prendre ?
                  </p>
                  <p className="text-sm md:text-base text-gray-900 leading-relaxed mb-4 md:mb-6">
                    Le cabinet FPE vous propose des solutions sur-mesure pour répondre à votre obligation réglementaire
                  </p>
                  <button className="bg-[#4A7BA7] hover:bg-[#3d6a91] text-white font-medium py-2.5 md:py-3 px-6 md:px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm md:text-base">
                    Besoin d'aide ! contactez-nous
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opco' && (
            <div className="max-w-4xl mx-auto py-4 md:py-8">
              <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                <div className="bg-gradient-to-r from-blue-50 to-sky-100 px-4 md:px-8 py-4 md:py-6 border-b border-blue-200">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                      <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{client.siret || 'JLJC 85342031300019'}</h2>
                      <p className="text-xs md:text-sm text-gray-700 font-semibold">OPCO opérateur de compétences</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 md:px-8 py-6 md:py-10">
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-3 md:mb-4">OPCO opérateur de compétences</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 space-y-2 md:space-y-3">
                      <p className="text-sm md:text-base text-gray-700 font-medium">
                        Organisme agréé par l'État chargé d'accompagner la formation professionnelle.
                      </p>
                      <p className="text-xs md:text-sm text-gray-700">
                        Ces opérateurs de compétences ont pour missions de financer l'apprentissage, d'aider les branches à construire les certifications professionnelles et d'accompagner les PME pour définir leurs besoins.
                      </p>
                    </div>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Avez vous déjà un compte OPCO ?
                        <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer">
                        <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                        <option value="oui">Oui</option>
                        <option value="non">Non</option>
                      </select>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        De quelle OPCO dépend la société ?
                        <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer">
                        <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                        <option value="afdas">OPCO AFDAS</option>
                        <option value="akto">OPCO AKTO</option>
                        <option value="atlas">OPCO ATLAS</option>
                        <option value="constructys">OPCO CONSTRUCTYS</option>
                        <option value="opco21">OPCO OPCO 21</option>
                        <option value="ocapiat">OPCO OCAPIAT</option>
                        <option value="cohesion">OPCO Cohésion Social</option>
                        <option value="ep">OPCO EP</option>
                        <option value="mobilite">OPCO Mobilité</option>
                        <option value="sante">OPCO Santé</option>
                        <option value="opcommerce">OPCO OPCOMMERCE</option>
                      </select>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Nom de la société <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nomSociete}
                        onChange={(e) => setNomSociete(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="Nom de la société"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Siret / Siren <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={siretSiren}
                        onChange={(e) => setSiretSiren(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="Siret / Siren"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="Adresse"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="Ville"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={codePostal}
                        onChange={(e) => setCodePostal(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="Code postal"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Nom & prénom du gérant <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nomPrenomGerant}
                        onChange={(e) => setNomPrenomGerant(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="Nom & prénom du gérant"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="Téléphone"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                        placeholder="E-mail"
                      />
                    </div>

                    <div className="border-t border-blue-200 pt-4 md:pt-6">
                      <p className="text-xs md:text-sm font-semibold text-blue-900 mb-3 md:mb-4">
                        Merci de fournir les informations concernant le(s) salarié(s)
                      </p>
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm md:text-base">
                        <span className="text-lg md:text-xl">+</span> AJOUTER
                      </button>
                    </div>

                    <div className="pt-3 md:pt-4">
                      <button
                        onClick={handleSubmit}
                        disabled={isGeneratingPDF}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base">
                        {isGeneratingPDF ? 'Génération du PDF en cours...' : 'Valider'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reglement' && (
            <div className="max-w-4xl mx-auto py-4 md:py-8">
              <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                <div className="bg-gradient-to-r from-blue-50 to-sky-100 px-4 md:px-8 py-4 md:py-6 border-b border-blue-200">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                      <FileCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{client.siret || 'JLJC 85342031300019'}</h2>
                      <p className="text-xs md:text-sm text-gray-700 font-semibold">Dossier de prise en charge</p>
                    </div>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-700 h-32 md:h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full mb-2 md:mb-4">
                        <Building2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Procédure de règlement</h3>
                      <p className="text-blue-50 text-sm md:text-lg font-medium max-w-2xl">
                        Veuillez compléter les informations ci-dessous pour finaliser votre prise en charge
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-36 h-36 md:w-48 md:h-48 bg-white/5 rounded-full -ml-18 md:-ml-24 -mb-18 md:-mb-24"></div>
                </div>

                <div className="px-4 md:px-8 py-6 md:py-10">
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                      <h3 className="text-blue-700 font-bold text-sm md:text-lg tracking-wide uppercase">
                        Procédure de prise en charge
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                    </div>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                        Nombre de salariés
                        <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-xs md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer">
                        <option value="" className="text-gray-500">Sélectionnez le nombre de salariés</option>
                        <option value="5">Jusqu'à 5 salariés (Rapport DUERP + Attestation de conformité) 830 € HT</option>
                        <option value="10">Jusqu'à 10 salariés (Rapport DUERP + Attestation de conformité) 1000 € HT</option>
                        <option value="15">Jusqu'à 15 salariés (Rapport DUERP + Attestation de conformité) 1230 € HT</option>
                        <option value="25">Jusqu'à 25 salariés (Rapport DUERP + Attestation de conformité) 1625 € HT</option>
                        <option value="50">Jusqu'à 50 salariés (Rapport DUERP + Attestation de conformité) 2150 € HT</option>
                        <option value="update">Mise à jour Attestation de conformité 2026 (adhérents existants) 290 € HT</option>
                      </select>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-6 rounded-lg md:rounded-xl border border-blue-200 shadow-sm">
                      <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900 mb-2 md:mb-3">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Méthode de règlement
                        <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border-2 border-blue-200 rounded-lg bg-white text-gray-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer">
                        <option value="" className="text-gray-500">Choisissez votre mode de paiement</option>
                        <option value="cb-1fois">Règlement CB en 1 fois</option>
                        <option value="cb-3fois">Règlement CB en 3 fois sans frais</option>
                      </select>
                    </div>

                    <div className="pt-3 md:pt-4">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
                        <FileCheck className="w-4 h-4 md:w-5 md:h-5" />
                        Valider le règlement de prise en charge
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-gray-200">
                    <div className="max-w-2xl mx-auto bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6 rounded-r-lg">
                      <div className="flex gap-3 md:gap-4">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-blue-900 font-bold mb-1 md:mb-2 text-sm md:text-base">Informations importantes</h4>
                          <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                            Une fois le règlement de la prise en charge effectué, vous recevrez <strong>l'attestation</strong> à présenter lors d'un contrôle, ainsi qu'un <strong>rendez-vous téléphonique</strong> avec le service expertise pour remplir le rapport conforme, suivi du <strong>formulaire de remboursement</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-blue-100">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-blue-100">
                <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                  <Lock className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Changer votre mot de passe</h2>
                  <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">Bienvenue, {client.full_name}</p>
                </div>
              </div>
              <div className="max-w-md space-y-4 md:space-y-5">
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-blue-200 rounded-lg bg-white text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-blue-200 rounded-lg bg-white text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 md:p-5 rounded-lg md:rounded-xl border border-blue-200">
                  <label className="block text-xs md:text-sm font-semibold text-blue-900 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-blue-200 rounded-lg bg-white text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 md:py-4 px-5 md:px-6 rounded-lg md:rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-sm md:text-base"
                >
                  Modifier le mot de passe
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg md:rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Mes informations</h3>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">{client.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">{client.email}</p>
                    </div>
                  </div>

                  {client.phone && (
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium text-gray-500">Téléphone</p>
                        <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  {client.company_name && (
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                      <FileText className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium text-gray-500">Entreprise</p>
                        <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">{client.company_name}</p>
                      </div>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium text-gray-500">Adresse</p>
                        <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">{client.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500">Client depuis le</p>
                      <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">{formatDate(client.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {client.project_description && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
                  <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Description du projet</h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">{client.project_description}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 md:space-y-6">
              {client.assigned_agent_name && (
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 text-white">
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Votre agent</h3>
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-blue-100">Agent assigné</p>
                      <p className="text-base md:text-lg lg:text-xl font-bold">{client.assigned_agent_name}</p>
                    </div>
                  </div>
                  <p className="text-blue-100 text-xs md:text-sm">
                    Votre agent personnel vous accompagne dans votre projet de rénovation énergétique.
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 text-white">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Statut du compte</h3>
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-300 rounded-full animate-pulse" />
                  <span className="text-base md:text-lg font-semibold capitalize">{client.status}</span>
                </div>
                <p className="text-emerald-100 text-xs md:text-sm">
                  Votre compte est actif. Vous pouvez nous contacter à tout moment pour toute question.
                </p>
              </div>

              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Besoin d'aide ?</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                  Notre équipe est là pour vous accompagner dans votre projet de rénovation énergétique.
                </p>
                <a
                  href="mailto:contact@sjrenovpro.fr"
                  className="block w-full text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 text-sm md:text-base"
                >
                  Nous contacter
                </a>
              </div>
            </div>
            </div>
          )}

          {activeTab === 'mail' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 border border-blue-100">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-blue-100">
                  <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                    <Mail className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Envoi d'emails
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">
                      Recevez vos documents et informations par email
                    </p>
                  </div>
                </div>

                {emailMessage && (
                  <div className={`mb-6 p-4 rounded-lg text-sm md:text-base ${
                    emailMessage.includes('✅')
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {emailMessage}
                  </div>
                )}

                <div className="space-y-4 md:space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 md:p-6 border border-blue-200">
                    <div className="flex items-start gap-3 md:gap-4 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-blue-900 mb-2">
                          Identifiants : portail numérique
                        </h3>
                        <p className="text-xs md:text-sm text-gray-700 mb-4">
                          Recevez vos identifiants de connexion au portail client par email
                        </p>
                        <button
                          onClick={() => handleSendEmail('identifiants', false)}
                          disabled={sendingEmail === 'identifiants'}
                          className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          {sendingEmail === 'identifiants' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Envoyer mes identifiants</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 border border-amber-200">
                    <div className="flex items-start gap-3 md:gap-4 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-amber-900 mb-2">
                          Mail de relance
                        </h3>
                        <p className="text-xs md:text-sm text-gray-700 mb-4">
                          Recevez un rappel concernant votre dossier en attente
                        </p>
                        <button
                          onClick={() => handleSendEmail('relance', false)}
                          disabled={sendingEmail === 'relance'}
                          className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          {sendingEmail === 'relance' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Envoyer une relance</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-200">
                    <div className="flex items-start gap-3 md:gap-4 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md flex-shrink-0">
                        <FileCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-green-900 mb-2">
                          Procédure de prise en charge
                        </h3>
                        <p className="text-xs md:text-sm text-gray-700 mb-3">
                          Recevez votre facture et l'attestation de prise en charge DUERP en pièces jointes
                        </p>
                        <div className="bg-white/70 rounded-lg p-3 mb-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-2 font-semibold">
                            📎 Pièces jointes incluses :
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 ml-4">
                            <li>• Facture_{client.company_name || client.full_name}_{client.id}.pdf</li>
                            <li>• Attestation_DUERP_{client.company_name || client.full_name}_{client.id}.pdf</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => handleSendEmail('procedure_prise_en_charge', true)}
                          disabled={sendingEmail === 'procedure_prise_en_charge'}
                          className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          {sendingEmail === 'procedure_prise_en_charge' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Envoyer avec PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs md:text-sm text-blue-900 font-medium">
                          <strong>Information :</strong> Les emails seront envoyés à l'adresse : <span className="font-bold">{client.email}</span>
                        </p>
                        <p className="text-xs text-blue-700 mt-2">
                          Tous les envois sont enregistrés dans l'historique et peuvent être consultés par votre conseiller.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-5xl mx-auto">
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 border border-blue-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 pb-4 md:pb-6 border-b border-blue-100 gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg">
                        <MessageSquare className="w-5 h-5 md:w-7 md:h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Chat Client - Vendeur</h2>
                        <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">
                          {client.vendeur && client.vendeur !== 'Super Admin'
                            ? `Communiquez avec ${client.vendeur}`
                            : 'Communiquez avec votre conseiller'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-green-200 flex items-center gap-2 self-start md:self-auto">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs md:text-sm font-semibold text-green-700">En ligne</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg md:rounded-xl p-4 md:p-6 mb-4 md:mb-6 border border-blue-200">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-lg flex-shrink-0">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-semibold text-blue-900 mb-1">
                          {client.vendeur && client.vendeur !== 'Super Admin'
                            ? 'Votre vendeur attitré'
                            : 'Votre conseiller'}
                        </p>
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-800 mb-2">
                          {client.vendeur && client.vendeur !== 'Super Admin'
                            ? client.vendeur
                            : 'Cabinet FPE'}
                        </p>
                        <p className="text-xs md:text-sm text-blue-700">
                          {client.vendeur && client.vendeur !== 'Super Admin'
                            ? 'Votre vendeur est à votre disposition pour répondre à toutes vos questions en temps réel.'
                            : 'Notre équipe est à votre disposition pour répondre à toutes vos questions en temps réel.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg md:rounded-xl p-4 md:p-6 mb-4 md:mb-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="w-6 h-6" />
                      <h3 className="text-xl font-bold">
                        {client.vendeur && client.vendeur !== 'Super Admin'
                          ? `Écrire à ${client.vendeur}`
                          : 'Écrire à votre conseiller'}
                      </h3>
                    </div>
                    <p className="text-emerald-50 text-sm">
                      Posez vos questions, partagez vos préoccupations, ou demandez des conseils.
                      {client.vendeur && client.vendeur !== 'Super Admin'
                        ? ' Votre vendeur vous répondra rapidement.'
                        : ' Notre équipe vous répondra rapidement.'}
                    </p>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                  <ChatWindow
                    clientId={client.id}
                    currentUserId={client.id}
                    currentUserType="client"
                    senderName={client.full_name}
                    recipientName={client.vendeur && client.vendeur !== 'Super Admin' ? client.vendeur : 'Cabinet FPE'}
                    supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                    supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
