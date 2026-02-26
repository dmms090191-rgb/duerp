import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, MapPin, FileText, Calendar, LogOut, MessageSquare, Home, ArrowLeft, Lock, Briefcase, Building2, ClipboardCheck, FileCheck, Download, X, ChevronDown, ChevronUp, Users, CheckCircle2, AlertTriangle, FileCheck2, UserCircle2, UserCog, Eye, EyeOff, Save, Menu, Send, Trash2, AlertCircle, TrendingUp, Shield } from 'lucide-react';
import ChatWindow from './ChatWindow';
import ClientNotificationSystem from './ClientNotificationSystem';
import PaymentSection from './PaymentSection';
import DiagnosticGarageForm from './DiagnosticGarageForm';
import SectorSelection from './SectorSelection';
import AvancementTab from './AvancementTab';
import { generateDUERPPDF, getClientDocuments, deleteDocument } from '../services/pdfService';
import { diagnosticNotesService } from '../services/diagnosticNotesService';
import { supabase } from '../lib/supabase';
import { sendEmail, EmailType } from '../services/emailSendService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { sectorUnlockService } from '../services/sectorUnlockService';
import { getCategoriesForSector } from '../data/sectorQuestions';

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
      diagnostic_final_actif?: boolean;
      type_diagnostic?: string;
    };
  };
  onLogout: () => void;
  isAdminViewing?: boolean;
  onReturnToAdmin?: () => void;
  isSellerViewing?: boolean;
  onReturnToSeller?: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientData, onLogout, isAdminViewing, onReturnToAdmin, isSellerViewing, onReturnToSeller }) => {
  const { client } = clientData;
  const [searchParams] = useSearchParams();

  useOnlineStatus(client.id, 'client');

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam || 'info-juridiques';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [secteurActivite, setSecteurActivite] = useState('');
  const [sellerOnlineStatus, setSellerOnlineStatus] = useState<{isOnline: boolean, lastConnection: string | null}>({ isOnline: false, lastConnection: null });
  const [showDiagnosticForm, setShowDiagnosticForm] = useState(false);
  const [selectedSectorType, setSelectedSectorType] = useState<string>('');
  const [unlockedSectorIds, setUnlockedSectorIds] = useState<string[]>([]);
  const [unlockedSectorNames, setUnlockedSectorNames] = useState<Record<string, string>>({});
  const [currentTypeDiagnostic, setCurrentTypeDiagnostic] = useState<string>(client.type_diagnostic || '');
  const sectorSectionRef = useRef<HTMLDivElement>(null);

  const [nomConseiller, setNomConseiller] = useState('');
  const [nomSociete, setNomSociete] = useState('');
  const [siretSiren, setSiretSiren] = useState('');

  useEffect(() => {
    const fetchSellerStatus = async () => {
      if (!client.vendeur || client.vendeur === 'Super Admin') return;

      try {
        const { data: seller } = await supabase
          .from('sellers')
          .select('is_online, last_connection')
          .ilike('full_name', client.vendeur)
          .maybeSingle();

        if (seller) {
          setSellerOnlineStatus({
            isOnline: seller.is_online || false,
            lastConnection: seller.last_connection
          });
        }
      } catch (error) {
        console.error('Erreur récupération statut vendeur:', error);
      }
    };

    fetchSellerStatus();

    const interval = setInterval(fetchSellerStatus, 5000);

    return () => clearInterval(interval);
  }, [client.vendeur]);

  useEffect(() => {
    const loadUnlockedSectors = async () => {
      try {
        const unlockedSectors = await sectorUnlockService.getUnlockedSectors(parseInt(client.id));
        setUnlockedSectorIds(unlockedSectors.map(s => s.sector_id));
        const namesMap: Record<string, string> = {};
        unlockedSectors.forEach(s => { namesMap[s.sector_id] = s.sector_name; });
        setUnlockedSectorNames(namesMap);
      } catch (error) {
        console.error('Erreur lors du chargement des secteurs débloqués:', error);
      }
    };

    loadUnlockedSectors();

    const unsubscribe = sectorUnlockService.subscribeToUnlockedSectors(parseInt(client.id), (sectors) => {
      setUnlockedSectorIds(sectors.map(s => s.sector_id));
      const namesMap: Record<string, string> = {};
      sectors.forEach(s => { namesMap[s.sector_id] = s.sector_name; });
      setUnlockedSectorNames(namesMap);
    });

    return () => { unsubscribe(); };
  }, [client.id]);

  useEffect(() => {
    if (activeTab !== 'diagnostic-final') {
      setShowDiagnosticForm(false);
    }
  }, [activeTab]);

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
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);

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
  const [currentVendeur, setCurrentVendeur] = useState(client.vendeur || '');

  const [currentPasswordDigits, setCurrentPasswordDigits] = useState(['', '', '', '', '', '']);
  const [newPasswordDigits, setNewPasswordDigits] = useState(['', '', '', '', '', '']);
  const [confirmPasswordDigits, setConfirmPasswordDigits] = useState(['', '', '', '', '', '']);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
  const [avancementPercentage, setAvancementPercentage] = useState(0);

  useEffect(() => {
    loadDocuments();
    if (isAdminViewing) {
      loadAdminNotes();
    }
    loadAvancementProgress();
  }, []);

  useEffect(() => {
    if (currentTypeDiagnostic || selectedSectorType) {
      loadAvancementProgress();

      const subscription = supabase
        .channel('duerp_responses_menu_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'duerp_evaluation_responses',
          filter: `client_id=eq.${client.id}`
        }, () => {
          loadAvancementProgress();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [client.id, currentTypeDiagnostic, selectedSectorType]);

  const loadAvancementProgress = async () => {
    const typeDiag = currentTypeDiagnostic || selectedSectorType;
    if (!typeDiag) {
      setAvancementPercentage(0);
      return;
    }

    try {
      const { data: responses, error } = await supabase
        .from('duerp_evaluation_responses')
        .select('question_id')
        .eq('client_id', client.id)
        .eq('type_diagnostic', typeDiag);

      if (error) throw error;

      const sectorCategories = getCategoriesForSector(typeDiag);
      const totalQuestions = sectorCategories.reduce((sum, cat) => sum + cat.questions.length, 0);
      const answeredQuestions = new Set(responses?.map(r => r.question_id) || []).size;
      const percentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

      setAvancementPercentage(percentage);
    } catch (error) {
      console.error('Erreur lors du calcul de l\'avancement:', error);
      setAvancementPercentage(0);
    }
  };

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
        setCurrentVendeur(freshData.vendeur || '');

        Object.assign(client, freshData);
      } catch (err) {
        console.error('❌ [ClientDashboard] Erreur:', err);
      }
    };

    const updateOnlineStatus = async () => {
      try {
        const clientId = parseInt(client.id);
        await supabase
          .from('clients')
          .update({
            is_online: true,
            last_connection: new Date().toISOString()
          })
          .eq('id', clientId);
        console.log('✅ [ClientDashboard] Statut en ligne mis à jour');
      } catch (err) {
        console.error('❌ [ClientDashboard] Erreur mise à jour statut:', err);
      }
    };

    loadClientData();
    updateOnlineStatus();

    // Rafraîchir les données du client toutes les 10 secondes pour détecter les changements d'attribution
    const refreshInterval = setInterval(() => {
      loadClientData();
      updateOnlineStatus();
    }, 10000);

    const statusInterval = setInterval(updateOnlineStatus, 30000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(statusInterval);
      const setOfflineStatus = async () => {
        try {
          const clientId = parseInt(client.id);
          await supabase
            .from('clients')
            .update({
              is_online: false,
              last_connection: new Date().toISOString()
            })
            .eq('id', clientId);
        } catch (err) {
          console.error('❌ [ClientDashboard] Erreur déconnexion:', err);
        }
      };
      setOfflineStatus();
    };
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

    const hasDUERPDocument = docs.some(doc =>
      doc.document_type?.toLowerCase().includes('duerp') ||
      doc.title?.toLowerCase().includes('duerp')
    );
    setDiagnosticCompleted(hasDUERPDocument);
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
      let senderEmail: string | undefined = undefined;

      if (isAdminViewing || isSellerViewing) {
        const storedAdminEmail = sessionStorage.getItem('adminEmail');
        const storedSellerEmail = sessionStorage.getItem('sellerEmail');
        senderEmail = storedAdminEmail || storedSellerEmail || undefined;
        console.log('📧 Email de l\'expéditeur (admin/seller):', senderEmail);
      }

      const result = await sendEmail({
        clientId: parseInt(client.id),
        emailType,
        generatePDFs,
        senderEmail
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
    { id: 'diagnostic-final', label: 'Diagnostic Final', icon: FileCheck2 },
    { id: 'avancement', label: 'Avancement', icon: TrendingUp },
    { id: 'opco', label: 'OPCO opérateur de compétences', icon: Building2 },
    { id: 'reglement', label: 'Règlement de prise en charge', icon: FileCheck },
    { id: 'chat', label: 'Messagerie', icon: MessageSquare },
    { id: 'password', label: 'Changer votre mot de passe', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2847] via-[#2d4578] to-[#1a2847] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.08)_0%,transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
      <div className="relative z-0">
      <header className="fixed top-0 left-0 right-0 z-40 overflow-visible border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2847]/98 via-[#2d4578]/98 to-[#1a2847]/98"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 backdrop-blur-2xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative flex items-center h-24 md:h-28 lg:h-32">
            <div className="flex-1 flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-11 h-11 bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute top-4 md:top-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <div className="bg-white rounded-lg md:rounded-xl shadow-2xl p-1.5 md:p-2 border-2 border-white/50 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <img
                  src="/kk copy.png"
                  alt="Cabinet FPE"
                  className="h-10 md:h-14 lg:h-16 w-auto"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-end md:items-center justify-end gap-2 md:gap-3">
              {isAdminViewing && onReturnToAdmin && (
                <button
                  onClick={onReturnToAdmin}
                  className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                  title="Retour au panel admin"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              {isSellerViewing && onReturnToSeller && (
                <button
                  onClick={onReturnToSeller}
                  className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                  title="Retour au panel vendeur"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              <ClientNotificationSystem
                clientId={client.id}
                onNotificationClick={() => setActiveTab('messagerie')}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
      </header>

      <div className={`pt-32 md:pt-40 lg:pt-48 flex ${activeTab === 'diagnostic-final' ? 'min-h-screen' : 'pb-8 md:pb-16'}`}>
        <aside className={`fixed left-0 top-32 md:top-40 lg:top-48 bottom-0 w-64 md:w-72 flex flex-col transition-transform duration-300 z-30 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/98 via-[#2d4578]/98 to-[#1a2847]/98 backdrop-blur-2xl border-r border-white/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.08),transparent_70%)]"></div>

          <nav className="relative p-4 md:p-5 space-y-2 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showProgress = item.id === 'avancement' && (client.type_diagnostic || selectedSectorType);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 rounded-xl font-semibold transition-all duration-300 text-xs md:text-sm group relative overflow-hidden ${
                    isActive
                      ? 'bg-white/95 text-[#1a2847] shadow-xl transform scale-[1.02]'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-[1.01]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 opacity-95"></div>
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-all duration-300"></div>
                  )}
                  <Icon className={`w-5 h-5 md:w-5 md:h-5 relative z-10 ${isActive ? 'text-blue-600' : 'text-white'} transition-all duration-300`} />
                  <span className="text-left relative z-10 flex-1">{item.label}</span>
                  {showProgress && (
                    <span className={`relative z-10 text-xs font-bold px-2 py-1 rounded-lg ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-cyan-500/30 text-cyan-300'
                    }`}>
                      {avancementPercentage}%
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-l-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="relative p-4 md:p-5 border-t border-white/20 space-y-2.5 bg-gradient-to-b from-transparent to-black/10">
            {isAdminViewing && onReturnToAdmin && (
              <button
                onClick={onReturnToAdmin}
                className="w-full flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 text-xs md:text-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour Admin</span>
              </button>
            )}
            {isSellerViewing && onReturnToSeller && (
              <button
                onClick={onReturnToSeller}
                className="w-full flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 text-xs md:text-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour Vendeur</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 md:px-5 py-3.5 md:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 text-xs md:text-sm border border-red-400/50"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className={`lg:ml-72 flex-1 ${activeTab === 'chat' || activeTab === 'diagnostic-final' ? 'flex flex-col h-full' : 'px-4 md:px-6 lg:px-8'}`}>
          {activeTab === 'info-juridiques' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">

              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                        Renseignements Juridiques
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Vos informations juridiques et personnelles</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
                {saveMessage && (
                  <div className={`p-3 md:p-4 rounded-xl text-sm md:text-base border-2 shadow-lg ${saveMessage.includes('succès') ? 'bg-green-500/20 text-green-100 border-green-400/50' : 'bg-red-500/20 text-red-100 border-red-400/50'}`}>
                    {saveMessage}
                  </div>
                )}

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Société
                  </label>
                  <input
                    type="text"
                    value={editableCompanyName}
                    onChange={(e) => setEditableCompanyName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={editableSiret}
                    onChange={(e) => setEditableSiret(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editableNom}
                    onChange={(e) => setEditableNom(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editablePrenom}
                    onChange={(e) => setEditablePrenom(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editablePassword}
                      onChange={(e) => setEditablePassword(e.target.value)}
                      placeholder="Laisser vide pour ne pas modifier"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  </div>
                  {editablePassword && editablePassword.length < 6 && (
                    <p className="text-xs md:text-sm text-red-300 mt-2">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={editableAddress}
                    onChange={(e) => setEditableAddress(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editableVille}
                    onChange={(e) => setEditableVille(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={editableCodePostal}
                    onChange={(e) => setEditableCodePostal(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Numéro de portable
                  </label>
                  <input
                    type="text"
                    value={editablePortable}
                    onChange={(e) => setEditablePortable(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                  />
                </div>

                <button
                  onClick={handleSaveJuridicalInfo}
                  disabled={savingInfo}
                  className="w-full flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 text-sm bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white rounded-xl hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105 border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none gap-2"
                >
                  {savingInfo ? (
                    <>
                      <div className="w-5 h-5 md:w-6 md:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 md:w-6 md:h-6" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">

              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
                      <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                        Mes Documents
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Gérez et téléchargez vos documents</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
              {documents.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-[#1a2847]/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/20">
                  <FileText className="w-16 h-16 md:w-20 md:h-20 text-blue-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-white font-medium px-4">Aucun document disponible pour le moment</p>
                  <p className="text-xs md:text-sm text-white/70 mt-2 px-4">Remplissez le formulaire DUERP pour générer votre premier document</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-[#1a2847]/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border-2 border-white/20 shadow-md hover:shadow-xl transition-all relative">
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                        className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all transform hover:scale-105 shadow-md"
                        title="Supprimer le document"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between pr-8 md:pr-10 gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-xl rounded-lg flex-shrink-0 ring-2 ring-white/30">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-bold text-white">{doc.title}</h3>
                            <p className="text-xs md:text-sm text-blue-300">Type: {doc.document_type}</p>
                            <p className="text-xs text-white/70">Créé le {formatDate(doc.created_at)}</p>
                          </div>
                        </div>
                        <a
                          href={doc.file_url}
                          download={`${doc.title}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] text-white font-extrabold py-2.5 md:py-3 px-4 md:px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-blue-400/30 text-sm md:text-base"
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
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">

              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
                      <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                        Diagnostic DUERP
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Article L4121-1 - Évaluation des risques professionnels</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">

                {errorMessage && (
                  <div className="bg-red-500/20 border-2 border-red-400/50 rounded-xl shadow-lg p-4">
                    <p className="text-sm text-red-100 font-bold">{errorMessage}</p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center ring-2 ring-white/30 shadow-lg">
                        <ClipboardCheck className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">
                          Informations importantes
                        </p>
                        <p className="text-xl font-extrabold text-white">
                          Le DUERP
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                        <p className="text-xs md:text-sm text-white/90 leading-relaxed font-medium">
                          <strong className="text-blue-300">Document unique d'évaluation des risques professionnels</strong>
                        </p>
                      </div>

                      <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                        <p className="text-xs md:text-sm text-white/90 leading-relaxed font-medium">
                          Une évaluation des risques professionnels (EVRP) doit être menée au sein de votre entreprise afin d'adapter les conditions de travail et d'assurer la protection de la santé de vos salariés, une mise à jour de votre DUERP est donc indispensable !
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Secteur d'activité <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={secteurActivite}
                        onChange={(e) => setSecteurActivite(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
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
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">A - Personnel de santé</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                checked={selectedActivities.includes('A01 - Pharmacie')}
                                onChange={() => toggleActivity('A01 - Pharmacie')}
                              />
                              <span className="text-sm text-white/90">A01 - Pharmacie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                checked={selectedActivities.includes('A02 - Laboratoire')}
                                onChange={() => toggleActivity('A02 - Laboratoire')}
                              />
                              <span className="text-sm text-white/90">A02 - Laboratoire</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                checked={selectedActivities.includes('A03 - Médecine générale')}
                                onChange={() => toggleActivity('A03 - Médecine générale')}
                              />
                              <span className="text-sm text-white/90">A03 - Médecine générale</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                checked={selectedActivities.includes('A04 - Médecin spécialistes')}
                                onChange={() => toggleActivity('A04 - Médecin spécialistes')}
                              />
                              <span className="text-sm text-white/90">A04 - Médecin spécialistes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                checked={selectedActivities.includes('A05 - Infirmières')}
                                onChange={() => toggleActivity('A05 - Infirmières')}
                              />
                              <span className="text-sm text-white/90">A05 - Infirmières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">A06 - Kinésithérapie, ostéopathe</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">A07 - Orthophoniste</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">A08 - Psychologue, psychanalyste, hypnose</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">A09 - Radiologue, échographe</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'commerce-grande-consommation' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">B - Commerce de produits de grande consommation</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B01 - Commerce alimentaire et non alimentaire généraliste (grande distribution)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B02 - Commerce alimentaire spécialisé (boulangerie, boucherie, poissonnerie, bio, caviste...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B03 - Commerce non alimentaire généraliste ou spécialisé (grands magasins, produits techniques, solderies, bazars...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B04 - Eventaires, marchés de plein air</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B05 - Commerce de tabac (débits de tabac), cigarette électronique</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B06 - Equipement de la personne (habillement, chaussures, accessoires...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B07 - Equipement de la maison (ameublement, appareils électro-ménagers, décoration, consommables....)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B08 - Horlogerie, bijouterie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">B09 - Biens d'occasion (antiquaires, dépôts-vente, brocantes...)</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'commerce-electronique' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">C - Commerce électronique, vente hors magasin</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">C01 - Vente en ligne, vente à distance</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">C02 - Foires et salons</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">C03 - Distribution automatique</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">C04 - Vente en réunion</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">C05 - Vente directe, démarchage</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'immobilier-logement' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">D - Immobilier, logement</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D01 - Promotion, construction</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D02 - Travaux d'architecte</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D03 - Ingénierie, expertises (géomètres-expert, expertise technique, diagnostics immobiliers...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D04 - Transactions immobilières, administration de biens immobiliers</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D05 - Gestion, vente de biens immobiliers (agences immobilières, mandataires immobiliers, viager...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D06 - Facilitation pour valoriser la vente d'un bien immobilier (conseil dans le domaine immobilier, mise en scène d'intérieur...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D07 - Syndics de copropriétés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D08 - Déménagement</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">D09 - Entreposage, stockage (garde-meuble...)</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'energie-eau-assainissement' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">E - Energie, eau, assainissement</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">E01 - Distribution d'électricité et/ou distribution de gaz</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">E02 - Distribution de fioul domestique, combustibles solides (bois, charbon), gaz de pétrole liquéfiés (GPL)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">E03 - Distribution d'eau chaude (chauffage urbain)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">E04 - Energies renouvelables</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">E05 - Services Publics de l'eau et de l'assainissement collectif et non collectif</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">E06 - Collecte, traitement des eaux</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'travaux-batiment' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">F - Travaux du bâtiment, travaux d'aménagement extérieur et intérieur</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F01 - Installation de cuisines et salles de bains</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F02 - Installation de piscines</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F03 - Installation et réparation d'équipements (chauffage, climatisation, efficacité énergétique...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F04 - Aménagement de l'habitat, travaux d'installation, de réparation, de rénovation et activités de décoration</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F05 - Aménagement extérieur (gros travaux)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F06 - Réparation de matériels (électroménager, télévision, vidéo...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F07 - Dépannages urgents à domicile</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">F08 - Location de matériels</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'transport-public' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">G - Transport public de voyageurs, transport de marchandises</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G01 - Transport ferroviaire de voyageurs</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G02 - Transports publics urbains et suburbains</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G03 - Autocars</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G04 - Taxis, véhicules de transport avec chauffeur (VTC)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G05 - Transport maritime, transport fluvial</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G06 - Transport aérien</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G07 - Services aéroportuaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G08 - Transport scolaire</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G09 - Remontées mécaniques et téléphériques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">G10 - Transport de marchandises, livraisons</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'automobile' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">H - Automobile</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H01 - Construction et/ou commerce de véhicules (automobile, motocycle, cycle, bateau, aéronef...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H02 - Location longue durée (LDD), location avec option d'achat (LOA) de véhicules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H03 - Location de courte durée de véhicules : contrats spécifiques, autopartage, véhicules en libre-service</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H04 - Accessoires pour véhicules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H05 - Entretien et réparation de véhicules (concessionnaires, agents, réparateurs indépendants, centres auto...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H06 - Engins motorisés non réceptionnés (mini-motos, quads, trottinettes électriques, gyropodes...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H07 - Contrôle technique de véhicules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H08 - Stationnement des véhicules (parcmètres, parcs de stationnement...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H09 - Autoroutes (péages)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H10 - Dépannage, remorquage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H11 - Enlèvement de véhicules, fourrières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H12 - Destruction des véhicules hors d'usage (VHU)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H13 - Distribution de carburants (stations-services)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H14 - Lavage des véhicules (haute pression...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">H15 - Formation des conducteurs (auto-ecole)</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'hotellerie-restauration' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">I - Hôtellerie, restauration</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">I01 - Hôtellerie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">I02 - Centrales de réservation hôtelière</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">I03 - Restauration</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">I04 - Organisation d'évènements</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">I05 - Livraison de repas à domicile</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">I06 - Débits de boissons (cafés, brasserie)</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'tourisme-voyage' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">J - Tourisme, voyage</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">J01 - Agences de voyage, voyagistes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">J02 - Villages, clubs de vacances</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">J03 - Biens immobiliers saisonniers et temporaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">J04 - Séjours en temps partagé</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">J05 - Hôtellerie de plein air (camping, caravaning...)</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'culture-loisirs-sport' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">K - Culture, loisirs, sport</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K01 - Biens culturels (livres, musique, peinture, photos...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K02 - Presse</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K03 - Articles de puériculture, jouets</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K04 - Articles de sport, articles de loisirs</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K05 - Location d'articles de loisirs et de sport</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K06 - Activités et manifestations sportives (leçons, locations d'installations sportives, billetterie...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K07 - Activités récréatives et de loisirs (parcs d'attraction, parcours acrobatiques...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K08 - Théâtres, spectacles, musées</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K09 - Cinéma</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K10 - Travaux photographiques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K11 - Coffret-cadeau (séjours, gastronomie, bien-être, sport-aventure, multi-activités...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">K12 - Jeux de hasard et d'argent</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'bricolage-jardinage-animaux' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">L - Bricolage, jardinage, animaux</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">L01 - Bricolage et équipements spécialisés (matériels agricoles, d'espaces verts...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">L02 - Fleurs, plantes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">L03 - Aménagement paysager (y compris élagage et abattage)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">L04 - Jardinerie, animalerie (animaux domestiques et leurs aliments, matériels d'élevage)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">L05 - Commercialisation d'animaux, services pour les animaux (toilettage, gardiennage...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">L06 - Soins vétérinaires et produits vétérinaires (médicaments, aliments et produits d'hygiène pour animaux)</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'produits-services-personne' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">M - Produits et services à la personne</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M01 - Parfumerie, produits de beauté</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M02 - Parapharmacie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M03 - Matériels et dispositifs médicaux (optique, audition,...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M04 - Coiffure, instituts de beauté (produits et services)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M05 - Services d'esthétique corporelle (bronzage, onglerie, épilation, tatouage .....)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M06 - Services de bien-être (thalassothérapie, spa..., hypnose,...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M07 - Services à domicile (garde d'enfants, ménage...)</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M08 - Crèches, assistantes maternelles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M09 - Maisons de retraite, établissements d'hébergement</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M10 - Cordonnerie, reproduction de clés,...</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M11 - Blanchisseries, teintureries, repassage, laveries en libre-service</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">M12 - Services funéraires</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'franchise' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">N - Franchise</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">N01 - Franchise</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'metallurgie' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">O - Métallurgie</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O01 - Sidérurgie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O02 - Fabrication de tubes, tuyaux, profilés creux et accessoires correspondants en acier</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O03 - étirage à froid de barres</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O04 - Laminage à froid de feuillards</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O05 - Profilage à froid par formage ou pliage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O06 - Tréfilage à froid</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O07 - Production de métaux précieux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O08 - Métallurgie de l'aluminium</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O09 - Métallurgie du plomb, du zinc ou de l'étain</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O10 - Métallurgie du cuivre</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O11 - Métallurgie des autres métaux non ferreux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O12 - élaboration et transformation de matières nucléaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O13 - Fonderie de fonte</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O14 - Fonderie d'acier</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O15 - Fonderie de métaux légers</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">O16 - Fonderie d'autres métaux non ferreux</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'fabrication-produits-metalliques' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">P - Fabrication de produits métalliques</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P01 - Fabrication de structures métalliques et de parties de structures</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P02 - Fabrication de portes et fenêtres en métal</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P03 - Fabrication de radiateurs et de chaudières pour le chauffage central</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P04 - Fabrication d'autres réservoirs, citernes et conteneurs métalliques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P05 - Fabrication de générateurs de vapeur, à l'exception des chaudières pour le chauffage central</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P06 - Fabrication d'armes et de munitions</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P07 - Forge, estampage, matriçage , métallurgie des poudres</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P08 - Découpage, emboutissage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P09 - Traitement et revêtement des métaux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P10 - Décolletage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P11 - Mécanique industrielle</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P12 - Fabrication de coutellerie</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P13 - Fabrication de serrures et de ferrures</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P14 - Fabrication de moules et modèles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P15 - Fabrication d'autres outillages</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P16 - Fabrication de fûts et emballages métalliques similaires</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P17 - Fabrication d'emballages métalliques légers</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">P18 - Fabrication d'articles en fils métalliques, de chaînes et de ressorts</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'tri-collecte-dechets' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">Q - Tri et collecte des déchets</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">Q01 - Collecte des déchets non dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">Q02 - Collecte des déchets dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">Q03 - Traitement et élimination des déchets non dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">Q04 - Traitement et élimination des déchets dangereux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">Q05 - Démantèlement d'épaves</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">Q06 - Récupération de déchets triés</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'culture-production-animale' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">R - Culture et production animale chasse et services annexes</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0111Z Culture de céréales (à l'exception du riz), de légumineuses et de graines oléagineuses</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0112Z Culture du riz</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0113Z Culture de légumes, de melons, de racines et de tubercules</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0114Z Culture de la canne à sucre</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0115Z Culture du tabac</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0116Z Culture de plantes à fibres</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0119Z Autres cultures non permanentes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0121Z Culture de la vigne</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0122Z Culture de fruits tropicaux et subtropicaux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0123Z Culture d'agrumes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0124Z Culture de fruits à pépins et à noyau</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0125Z Culture d'autres fruits d'arbres ou d'arbustes et de fruits à coque</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0126Z Culture de fruits oléagineux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0127Z Culture de plantes à boissons</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0128Z Culture de plantes à épices, aromatiques, médicinales et pharmaceutiques</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0129Z Autres cultures permanentes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0130Z Reproduction de plantes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0141Z Élevage de vaches laitières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0142Z Élevage d'autres bovins et de buffles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0143Z Élevage de chevaux et d'autres équidés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0144Z Élevage de chameaux et d'autres camélidés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0145Z Élevage d'ovins et de caprins</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0146Z Élevage de porcins</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0147Z Élevage de volailles</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0149Z Élevage d'autres animaux</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0150Z Culture et élevage associés</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0161Z Activités de soutien aux cultures</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0162Z Activités de soutien à la production animale</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0163Z Traitement primaire des récoltes</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0164Z Traitement des semences</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0170Z Chasse, piégeage et services annexes</span>
                            </label>
                          </div>
                        </div>
                      )}

                    {secteurActivite === 'sylviculture-exploitation-forestiere' && (
                        <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                          <h4 className="text-base font-bold text-white mb-4 pb-3 border-b border-blue-400/30">S - Sylviculture et exploitation forestière</h4>
                          <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0210Z Sylviculture et autres activités forestières</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0220Z Exploitation forestière</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0230Z Récolte de produits forestiers non ligneux poussant à l'état sauvage</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                              <span className="text-sm text-white/90">0240Z Services de soutien à l'exploitation forestière</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Nom de votre conseiller <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={nomConseiller}
                          onChange={(e) => setNomConseiller(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Nom du conseiller"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Nom de société <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={nomSociete}
                          onChange={(e) => setNomSociete(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Nom de la société"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Siret / Siren <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={siretSiren}
                          onChange={(e) => setSiretSiren(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Siret / Siren"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Adresse <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={adresse}
                          onChange={(e) => setAdresse(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Adresse"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Ville <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={ville}
                          onChange={(e) => setVille(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Ville"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Code postal <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={codePostal}
                          onChange={(e) => setCodePostal(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Code postal"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Nom & prénom du gérant <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={nomPrenomGerant}
                          onChange={(e) => setNomPrenomGerant(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Nom & prénom du gérant"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={telephone}
                          onChange={(e) => setTelephone(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="Téléphone"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-900 mb-3">
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                          placeholder="E-mail"
                        />
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <h4 className="text-base font-bold text-gray-900 mb-4">Salariés de l'entreprise</h4>
                        <select className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer">
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="1-3">1 à 3</option>
                          <option value="3-6">3 à 6</option>
                          <option value="6-9">6 à 9</option>
                          <option value="10-19">10 à 19</option>
                          <option value="20-49">20 à 49</option>
                          <option value="49+">+ 49</option>
                        </select>
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          1. Informations transmises aux travailleurs sur le Covid-19, les recommandations sanitaires, les gestes barrières ?
                        </label>
                        <select
                          value={covidInfo}
                          onChange={(e) => setCovidInfo(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          2. Affichage spécifique dans les locaux (et les véhicules, les installations de chantier etc.) ?
                        </label>
                        <select
                          value={affichageSpecifique}
                          onChange={(e) => setAffichageSpecifique(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          5. Mise à disposition de solution Hydroalcoolique ?
                        </label>
                        <select
                          value={solutionHydroalcoolique}
                          onChange={(e) => setSolutionHydroalcoolique(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          5. Définition et mise en œuvre de processus de nettoyage des équipements, engins et véhicules partagés ainsi que les locaux utilisés par plusieurs personnes (vestiaires, salle de pause, accueil, etc.) ?
                        </label>
                        <select
                          value={processusNettoyage}
                          onChange={(e) => setProcessusNettoyage(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          6. Définition et mise en œuvre de processus d'aération des locaux de travail ?
                        </label>
                        <select
                          value={processusAeration}
                          onChange={(e) => setProcessusAeration(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-200/60 rounded-xl bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 cursor-pointer"
                        >
                          <option value="" className="text-gray-500">Selectionnez votre reponse</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Intervention hors site</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Tout déplacement hors société / dépannage / commercial</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Entreprise intervenant sur site</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Circulation et stationnement des véhicules</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Chargement / Déchargement</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Transport de personnes</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Stockage des produits d'entretien (Substances dangereuses / Produits inflammables)</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Stockage de déchets dangereux</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Stockage de déchets banals</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Gaz (stockage / manutention et distribution)</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Engins mécaniques (Pont élévateur / Levage / Chariot élévateur)</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Accumulateurs / Chargeurs transpalette / Tire pal / Transpalette</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Compresseurs d'air / Centrifuges</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Fonderie</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Fabrication / transformation de matières plastiques</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Production / transformation d'electricité</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Dépôt d'encres / vernis / peintures</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Traitement du bois</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Traitement de déchets</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Stations d'épuration</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Frigidaire réfrigérateur / Chambre froide</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Chaufferies chauffage et process</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Climatisation</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Emballages /conditionnement</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Montage /assemblage</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Maintenance des équipements</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Entretien des infrastructures</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Animaux vivants</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque de chute de personnes</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié à la manutention manuelle</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié à la manutention mécanisée</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié aux circulations et aux déplacements dans l'entreprise</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié aux effondrements et aux chutes d'objets</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié à la circulation de véhicule</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié au bruit</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié aux vibrations</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié aux ambiances thermiques</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié aux rayonnements</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque écran</span>
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

                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié aux outils</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié à l'intervention d'une entreprise extérieure</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié à l'organisation du travail</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque lié aux déplacement routiers</span>
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
                                  className="mt-1 w-4 h-4 flex-shrink-0 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                                />
                                <span className="text-sm text-white/90">Risque Psycho-Sociaux</span>
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

                      <div className="bg-[#1a2847]/50 rounded-xl p-4 sm:p-6 border-2 border-white/20 shadow-md">
                        <label className="flex items-start gap-2 md:gap-3 cursor-pointer mb-4 md:mb-6">
                          <input
                            type="checkbox"
                            checked={accepteTermes}
                            onChange={(e) => setAccepteTermes(e.target.checked)}
                            className="mt-1 w-4 h-4 md:w-5 md:h-5 rounded border-2 border-white/30 text-blue-400 focus:ring-2 focus:ring-blue-400/50 bg-[#1a2847]/70"
                          />
                          <span className="text-sm md:text-base font-bold text-white">J'accepte les termes et conditions de prise en charge *</span>
                        </label>

                        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                          <p className="text-xs md:text-sm text-white/90">* Rapport de diagnostic conforme</p>
                          <p className="text-xs md:text-sm text-white/90">* Élaboration du Document Unique</p>
                          <p className="text-xs md:text-sm text-white/90">* Accès à votre portail numérique</p>
                          <p className="text-xs md:text-sm text-white/90">* Attestation de conformité DUERP</p>
                          <p className="text-xs md:text-sm text-white/90">* Suivi juridique en cas de contrôle</p>
                        </div>

                        <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                          Nous vous remercions de bien vouloir procéder au règlement de la prise en charge afin de recevoir votre attestation de conformité, à présenter lors des contrôles. En attendant, le rapport conforme DUERP sera disponible sur votre portail numérique dans un délai de 14 jours ouvrés.
                        </p>
                      </div>

                      <div className="pt-3 md:pt-4">
                        <button
                          onClick={handleSubmit}
                          disabled={isGeneratingPDF}
                          className="w-full flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 text-sm bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white rounded-xl hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105 border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isGeneratingPDF ? 'Génération du PDF en cours...' : 'Valider'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {activeTab === 'diagnostic-final' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] shadow-2xl w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)] overflow-hidden border-l border-white/10 backdrop-blur-2xl">

              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center ring-2 ring-white/30 shadow-lg flex-shrink-0">
                      <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-0 sm:mb-0.5 drop-shadow-lg tracking-tight truncate">
                        Diagnostic Final
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm font-medium truncate">Formulaire de diagnostic complet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-y-auto h-[calc(100%-65px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
                {!client.diagnostic_final_actif ? (
                  <div className="bg-[#1a2847]/50 rounded-xl p-6 sm:p-8 border-2 border-orange-400/30 shadow-md">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-orange-400" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        Formulaire non disponible
                      </h3>
                      <p className="text-sm sm:text-base text-white/80 max-w-md">
                        Vous ne pouvez pas remplir le formulaire pour le moment. Veuillez contacter votre conseiller pour plus d'informations.
                      </p>
                    </div>
                  </div>
                ) : !showDiagnosticForm ? (
                  <div className="space-y-6">
                    {(isAdminViewing || isSellerViewing) ? (
                      <div className="bg-amber-500/10 backdrop-blur-xl rounded-2xl p-6 border border-amber-400/30 text-center space-y-4">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                          <Shield className="w-12 h-12 text-amber-400" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          Attribuer un outil au client
                        </h3>
                        <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
                          Cliquez sur un outil pour l'attribuer au client. Le client ne verra que l'outil que vous lui attribuez. Pour changer d'outil, cliquez sur un autre.
                        </p>
                        {(unlockedSectorIds.length > 0 || currentTypeDiagnostic) && (
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              onClick={() => sectorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                              className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-lg px-4 py-2 hover:bg-emerald-500/30 transition-all duration-300 cursor-pointer"
                            >
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                              <span className="text-sm font-semibold text-emerald-300">
                                Outil actuellement attribue : {unlockedSectorNames[unlockedSectorIds[0]] || currentTypeDiagnostic.replace(/^\d+\s*/, '') || unlockedSectorIds[0]}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                const sectorType = currentTypeDiagnostic || client.type_diagnostic || unlockedSectorIds[0];
                                if (sectorType) {
                                  setSelectedSectorType(sectorType);
                                  setShowDiagnosticForm(true);
                                }
                              }}
                              className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-lg px-4 py-2 hover:bg-blue-500/30 transition-all duration-300 cursor-pointer"
                            >
                              <ClipboardCheck className="w-4 h-4 text-blue-300" />
                              <span className="text-sm font-semibold text-blue-300">
                                Remplir le formulaire
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center space-y-4">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                          <FileCheck2 className="w-12 h-12 text-blue-400" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          Votre outil de diagnostic
                        </h3>
                        <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
                          Cliquez sur votre outil pour commencer votre diagnostic
                        </p>
                      </div>
                    )}

                    <div ref={sectorSectionRef}>
                    <SectorSelection
                      currentType={currentTypeDiagnostic || selectedSectorType}
                      unlockedSectorIds={unlockedSectorIds}
                      canToggleLock={isAdminViewing || isSellerViewing}
                      clientId={parseInt(client.id)}
                      userType={isAdminViewing ? 'admin' : isSellerViewing ? 'seller' : 'client'}
                      hideFilters
                      onOpenForm={(sectorType: string) => {
                        setSelectedSectorType(sectorType);
                        setShowDiagnosticForm(true);
                      }}
                      onSelectSector={async (sectorType: string) => {
                        setSelectedSectorType(sectorType);
                        setCurrentTypeDiagnostic(sectorType);
                        setShowDiagnosticForm(true);

                        try {
                          const { error } = await supabase
                            .from('clients')
                            .update({ type_diagnostic: sectorType })
                            .eq('id', client.id);

                          if (error) throw error;
                        } catch (error) {
                          console.error('Erreur lors de la mise à jour du type de diagnostic:', error);
                        }
                      }}
                      onSectorAssigned={async (sectorId: string, sectorName: string) => {
                        const sectorType = `${sectorId} ${sectorName}`;
                        setSelectedSectorType(sectorType);
                        setCurrentTypeDiagnostic(sectorType);
                        setUnlockedSectorIds([sectorId]);
                        setUnlockedSectorNames(prev => ({ ...prev, [sectorId]: sectorName }));

                        try {
                          const { error } = await supabase
                            .from('clients')
                            .update({ type_diagnostic: sectorType })
                            .eq('id', client.id);

                          if (error) throw error;
                        } catch (error) {
                          console.error('Erreur lors de la mise à jour du type de diagnostic:', error);
                        }
                      }}
                      onSectorUnassigned={async () => {
                        setSelectedSectorType('');
                        setCurrentTypeDiagnostic('');
                        setUnlockedSectorIds([]);
                        setUnlockedSectorNames({});

                        try {
                          const { error } = await supabase
                            .from('clients')
                            .update({ type_diagnostic: '' })
                            .eq('id', client.id);

                          if (error) throw error;
                        } catch (error) {
                          console.error('Erreur lors de la suppression du type de diagnostic:', error);
                        }
                      }}
                    />
                    </div>

                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowDiagnosticForm(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 mb-4"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Retour à la sélection de secteur
                    </button>

                    <DiagnosticGarageForm
                      clientId={client.id}
                      typeDiagnostic={selectedSectorType || client.type_diagnostic || ''}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'avancement' && (
            <AvancementTab clientId={client.id} typeDiagnostic={currentTypeDiagnostic || selectedSectorType} />
          )}

          {activeTab === 'opco' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">

              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                        OPCO opérateur de compétences
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Organisme agréé par l'État</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md space-y-2 md:space-y-3">
                  <p className="text-sm md:text-base text-white font-medium">
                    Organisme agréé par l'État chargé d'accompagner la formation professionnelle.
                  </p>
                  <p className="text-xs md:text-sm text-white/80">
                    Ces opérateurs de compétences ont pour missions de financer l'apprentissage, d'aider les branches à construire les certifications professionnelles et d'accompagner les PME pour définir leurs besoins.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Avez vous déjà un compte OPCO ?
                        <span className="text-red-400">*</span>
                      </label>
                      <select className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50">
                        <option value="" className="bg-[#1a2847] text-gray-400">Selectionnez votre reponse</option>
                        <option value="oui" className="bg-[#1a2847] text-white">Oui</option>
                        <option value="non" className="bg-[#1a2847] text-white">Non</option>
                      </select>
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        De quelle OPCO dépend la société ?
                        <span className="text-red-400">*</span>
                      </label>
                      <select className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50">
                        <option value="" className="bg-[#1a2847] text-gray-400">Selectionnez votre reponse</option>
                        <option value="afdas" className="bg-[#1a2847] text-white">OPCO AFDAS</option>
                        <option value="akto" className="bg-[#1a2847] text-white">OPCO AKTO</option>
                        <option value="atlas" className="bg-[#1a2847] text-white">OPCO ATLAS</option>
                        <option value="constructys" className="bg-[#1a2847] text-white">OPCO CONSTRUCTYS</option>
                        <option value="opco21" className="bg-[#1a2847] text-white">OPCO OPCO 21</option>
                        <option value="ocapiat" className="bg-[#1a2847] text-white">OPCO OCAPIAT</option>
                        <option value="cohesion" className="bg-[#1a2847] text-white">OPCO Cohésion Social</option>
                        <option value="ep" className="bg-[#1a2847] text-white">OPCO EP</option>
                        <option value="mobilite" className="bg-[#1a2847] text-white">OPCO Mobilité</option>
                        <option value="sante" className="bg-[#1a2847] text-white">OPCO Santé</option>
                        <option value="opcommerce" className="bg-[#1a2847] text-white">OPCO OPCOMMERCE</option>
                      </select>
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Nom de la société <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={nomSociete}
                        onChange={(e) => setNomSociete(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="Nom de la société"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Siret / Siren <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={siretSiren}
                        onChange={(e) => setSiretSiren(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="Siret / Siren"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Adresse <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="Adresse"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Ville <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="Ville"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Code postal <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={codePostal}
                        onChange={(e) => setCodePostal(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="Code postal"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Nom & prénom du gérant <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={nomPrenomGerant}
                        onChange={(e) => setNomPrenomGerant(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="Nom & prénom du gérant"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Téléphone <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="Téléphone"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        E-mail <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                        placeholder="E-mail"
                      />
                    </div>

                    <div className="border-t border-white/20 pt-4 md:pt-6">
                      <p className="text-xs md:text-sm font-semibold text-white mb-3 md:mb-4">
                        Merci de fournir les informations concernant le(s) salarié(s)
                      </p>
                      <button className="bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] text-white font-extrabold py-2.5 md:py-3 px-4 md:px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border border-blue-400/30 text-sm md:text-base">
                        <span className="text-lg md:text-xl">+</span> AJOUTER
                      </button>
                    </div>

                    <div className="pt-3 md:pt-4">
                      <button
                        onClick={handleSubmit}
                        disabled={isGeneratingPDF}
                        className="w-full bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] text-white font-extrabold py-3 md:py-4 px-6 md:px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-400/30 text-sm md:text-base">
                        {isGeneratingPDF ? 'Génération du PDF en cours...' : 'Valider'}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'reglement' && (
            <PaymentSection client={client} diagnosticCompleted={diagnosticCompleted} />
          )}

          {activeTab === 'password' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">

              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
                      <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                        Modifier le mot de passe
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Changez votre mot de passe de connexion</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
                {passwordChangeMessage && (
                  <div className="p-3 md:p-4 rounded-xl text-sm md:text-base border-2 shadow-lg bg-green-500/20 text-green-100 border-green-400/50">
                    {passwordChangeMessage}
                  </div>
                )}
                {passwordChangeError && (
                  <div className="p-3 md:p-4 rounded-xl text-sm md:text-base border-2 shadow-lg bg-red-500/20 text-red-100 border-red-400/50">
                    {passwordChangeError}
                  </div>
                )}

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-3 uppercase tracking-wide text-center">
                    Mot de passe actuel
                  </label>
                  <div className="flex gap-2 justify-center">
                    {currentPasswordDigits.map((digit, index) => (
                      <input
                        key={`current-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 1) {
                            const newDigits = [...currentPasswordDigits];
                            newDigits[index] = value;
                            setCurrentPasswordDigits(newDigits);
                            if (value && index < 5) {
                              const nextInput = document.querySelector(`input[name="current-${index + 1}"]`) as HTMLInputElement;
                              nextInput?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && index > 0) {
                            const prevInput = document.querySelector(`input[name="current-${index - 1}"]`) as HTMLInputElement;
                            prevInput?.focus();
                          }
                        }}
                        name={`current-${index}`}
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-lg sm:text-xl md:text-2xl font-bold border-2 border-white/20 rounded-lg bg-[#1a2847]/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300"
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-3 uppercase tracking-wide text-center">
                    Nouveau mot de passe
                  </label>
                  <div className="flex gap-2 justify-center">
                    {newPasswordDigits.map((digit, index) => (
                      <input
                        key={`new-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 1) {
                            const newDigits = [...newPasswordDigits];
                            newDigits[index] = value;
                            setNewPasswordDigits(newDigits);
                            if (value && index < 5) {
                              const nextInput = document.querySelector(`input[name="new-${index + 1}"]`) as HTMLInputElement;
                              nextInput?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && index > 0) {
                            const prevInput = document.querySelector(`input[name="new-${index - 1}"]`) as HTMLInputElement;
                            prevInput?.focus();
                          }
                        }}
                        name={`new-${index}`}
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-lg sm:text-xl md:text-2xl font-bold border-2 border-white/20 rounded-lg bg-[#1a2847]/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300"
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-3 uppercase tracking-wide text-center">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="flex gap-2 justify-center">
                    {confirmPasswordDigits.map((digit, index) => (
                      <input
                        key={`confirm-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 1) {
                            const newDigits = [...confirmPasswordDigits];
                            newDigits[index] = value;
                            setConfirmPasswordDigits(newDigits);
                            if (value && index < 5) {
                              const nextInput = document.querySelector(`input[name="confirm-${index + 1}"]`) as HTMLInputElement;
                              nextInput?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && index > 0) {
                            const prevInput = document.querySelector(`input[name="confirm-${index - 1}"]`) as HTMLInputElement;
                            prevInput?.focus();
                          }
                        }}
                        name={`confirm-${index}`}
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-lg sm:text-xl md:text-2xl font-bold border-2 border-white/20 rounded-lg bg-[#1a2847]/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setPasswordChangeError('');
                    setPasswordChangeMessage('');

                    const currentPassword = currentPasswordDigits.join('');
                    const newPassword = newPasswordDigits.join('');
                    const confirmPassword = confirmPasswordDigits.join('');

                    if (currentPassword.length !== 6) {
                      setPasswordChangeError('Le mot de passe actuel doit contenir 6 chiffres');
                      return;
                    }

                    if (newPassword.length !== 6) {
                      setPasswordChangeError('Le nouveau mot de passe doit contenir 6 chiffres');
                      return;
                    }

                    if (newPassword !== confirmPassword) {
                      setPasswordChangeError('Les mots de passe ne correspondent pas');
                      return;
                    }

                    try {
                      const clientId = typeof client.id === 'string' ? parseInt(client.id, 10) : client.id;

                      const { data: clientData, error: fetchError } = await supabase
                        .from('clients')
                        .select('client_password')
                        .eq('id', clientId)
                        .maybeSingle();

                      if (fetchError) {
                        console.error('Erreur récupération client:', fetchError);
                        setPasswordChangeError('Erreur lors de la vérification du mot de passe');
                        return;
                      }

                      if (!clientData) {
                        setPasswordChangeError('Client introuvable');
                        return;
                      }

                      if (clientData.client_password !== currentPassword) {
                        setPasswordChangeError('Le mot de passe actuel est incorrect');
                        return;
                      }

                      const { error: updateError } = await supabase
                        .from('clients')
                        .update({ client_password: newPassword })
                        .eq('id', clientId);

                      if (updateError) {
                        console.error('Erreur mise à jour mot de passe:', updateError);
                        setPasswordChangeError('Erreur lors de la mise à jour du mot de passe');
                        return;
                      }

                      setPasswordChangeMessage('Mot de passe modifié avec succès');
                      setCurrentPasswordDigits(['', '', '', '', '', '']);
                      setNewPasswordDigits(['', '', '', '', '', '']);
                      setConfirmPasswordDigits(['', '', '', '', '', '']);

                      setTimeout(() => {
                        setPasswordChangeMessage('');
                      }, 3000);
                    } catch (error) {
                      console.error('Erreur changement mot de passe:', error);
                      setPasswordChangeError('Une erreur est survenue');
                    }
                  }}
                  className="w-full flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 text-sm md:text-base bg-green-900/60 hover:bg-green-800/70 border-2 border-green-500/50 text-white rounded-xl transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] gap-2 md:gap-3"
                >
                  <Lock className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Modifier le mot de passe</span>
                </button>

                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-red-400/30 shadow-md mt-6">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105 gap-2"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                    <span>Supprimer mon compte</span>
                  </button>
                  <p className="text-xs md:text-sm text-white/60 text-center mt-3">
                    Cette action est irréversible et supprimera toutes vos données
                  </p>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-in zoom-in duration-300">
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-4">
                  Supprimer votre compte ?
                </h3>

                <p className="text-sm md:text-base text-gray-600 text-center mb-6 leading-relaxed">
                  Cette action est <span className="font-bold text-red-600">définitive et irréversible</span>.
                  Toutes vos données seront supprimées de manière permanente.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      setDeletingAccount(true);
                      try {
                        const clientId = typeof client.id === 'string' ? parseInt(client.id, 10) : client.id;

                        const { error: deleteError } = await supabase
                          .from('clients')
                          .delete()
                          .eq('id', clientId);

                        if (deleteError) {
                          console.error('Erreur suppression compte:', deleteError);
                          alert('Erreur lors de la suppression du compte');
                          setDeletingAccount(false);
                          return;
                        }

                        alert('Votre compte a été supprimé avec succès');
                        onLogout();
                      } catch (error) {
                        console.error('Erreur suppression compte:', error);
                        alert('Une erreur est survenue');
                        setDeletingAccount(false);
                      }
                    }}
                    disabled={deletingAccount}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingAccount ? 'Suppression en cours...' : 'Oui, supprimer définitivement'}
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deletingAccount}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </div>
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

          {activeTab === 'chat' && (
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-0 lg:gap-6 overflow-hidden pt-4 lg:pt-6 px-4 md:px-6 lg:px-8 pb-4 lg:pb-6 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] lg:h-[calc(100vh-15rem)]">
              <div className="hidden lg:block lg:col-span-1 space-y-4 h-full">
                <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-cyan-500/30 p-4 lg:p-6 h-full flex flex-col overflow-hidden backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
                  <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>

                  <div className="relative flex items-center gap-3 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-base lg:text-lg font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text">
                      Conversation
                    </h3>
                  </div>

                  <div className="relative space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent hover:scrollbar-thumb-cyan-400/60">
                    <div className="relative group/card bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40"></div>
                      <div className="flex items-start gap-3 relative">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-cyan-400 tracking-wider mb-1">
                            {client.vendeur && client.vendeur !== 'Super Admin'
                              ? 'VOTRE VENDEUR'
                              : 'VOTRE CONSEILLER'}
                          </p>
                          <p className="text-base font-black text-white mb-2">
                            {client.vendeur && client.vendeur !== 'Super Admin'
                              ? client.vendeur
                              : 'Cabinet FPE'}
                          </p>
                          {(() => {
                            const isReallyOnline = sellerOnlineStatus.isOnline &&
                              sellerOnlineStatus.lastConnection &&
                              (Date.now() - new Date(sellerOnlineStatus.lastConnection).getTime()) < 2 * 60 * 1000;

                            return isReallyOnline ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg">
                                <div className="relative w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse">
                                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-sm animate-ping"></div>
                                </div>
                                <span className="text-xs font-bold text-emerald-400">En ligne</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 border border-slate-600/30 rounded-lg">
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                                <span className="text-xs font-bold text-slate-400">Hors ligne</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="relative group/card bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-xl"></div>
                      <div className="relative flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border border-cyan-400/30">
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                        </div>
                        <h4 className="text-sm font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                          Chat en temps reel
                        </h4>
                      </div>
                      <p className="relative text-xs text-cyan-200/70 leading-relaxed">
                        {client.vendeur && client.vendeur !== 'Super Admin'
                          ? 'Votre vendeur est a votre disposition pour repondre a toutes vos questions.'
                          : 'Notre equipe est a votre disposition pour repondre a toutes vos questions.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 lg:col-span-3 flex flex-col h-full">
                <div className="relative flex flex-col h-full rounded-none lg:rounded-2xl shadow-2xl overflow-hidden w-full border border-cyan-500/30">
                  <ChatWindow
                    clientId={client.id}
                    currentUserId={client.id}
                    currentUserType="client"
                    senderName={client.full_name}
                    recipientName={currentVendeur && currentVendeur !== 'Super Admin' ? currentVendeur : 'Cabinet FPE'}
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
    </div>
  );
};

export default ClientDashboard;
