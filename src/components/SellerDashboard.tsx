import React from 'react';
import { ShoppingBag, LogOut, User, Bell, Settings, MessageSquare, ArrowLeft, UserCheck, Edit, Calendar, Phone, Mail, Briefcase, Building2, Hash, FileText, Shield, Menu, X, RefreshCw, Eye, LogIn, Copy, Check, Search } from 'lucide-react';
import { Seller } from '../types/Seller';
import SellerChatList from './SellerChatList';
import SellerWorkChat from './SellerWorkChat';
import SellerNotificationSystem from './SellerNotificationSystem';
import ArgumentaireViewer from './ArgumentaireViewer';
import { supabase } from '../lib/supabase';
import { statusService } from '../services/statusService';
import { clientService } from '../services/clientService';
import { Status } from '../types/Status';
import SellerClientModal from './SellerClientModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface SellerDashboardProps {
  sellerData: Seller & { isAdminViewing?: boolean };
  onLogout: () => void;
  onReturnToAdmin?: () => void;
  onClientLogin?: (client: Client) => void;
}

interface Client {
  id: string;
  email: string;
  full_name: string;
  prenom?: string;
  nom?: string;
  phone?: string;
  portable?: string;
  status: string;
  status_id?: string;
  created_at: string;
  company_name?: string;
  siret?: string;
  activite?: string;
  vendeur?: string;
  rendez_vous?: string;
  address?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  anniversaire?: string;
  autre_courriel?: string;
  date_affectation?: string;
  representant?: string;
  prevente?: string;
  retention?: string;
  sous_affilie?: string;
  langue?: string;
  conseiller?: string;
  source?: string;
  qualifiee?: boolean;
  client_password?: string;
  client_account_created?: boolean;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerData, onLogout, onReturnToAdmin, onClientLogin }) => {
  useOnlineStatus(sellerData.id, 'seller');

  const [activeTab, setActiveTab] = React.useState<'clients' | 'chat' | 'chat-travail' | 'argumentaire'>('clients');
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Status[]>([]);
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);
  const [selectedClientDetails, setSelectedClientDetails] = React.useState<Client | null>(null);
  const [editedClient, setEditedClient] = React.useState<Client | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [modalTab, setModalTab] = React.useState<'information' | 'liste-commentaire' | 'mail' | 'panel-client'>('information');
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [addingComment, setAddingComment] = React.useState(false);
  const [deletingCommentId, setDeletingCommentId] = React.useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const [editingRendezVous, setEditingRendezVous] = React.useState<{clientId: string, value: string} | null>(null);
  const [savingRendezVous, setSavingRendezVous] = React.useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = React.useState(false);
  const [filterPrenom, setFilterPrenom] = React.useState('');
  const [filterNom, setFilterNom] = React.useState('');
  const [filterEmail, setFilterEmail] = React.useState('');
  const [filterTelephone, setFilterTelephone] = React.useState('');
  const [filterSiret, setFilterSiret] = React.useState('');
  const [filterStatut, setFilterStatut] = React.useState('');

  React.useEffect(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('seller_leads_') || key.includes('leads')) {
        localStorage.removeItem(key);
      }
    });
    fetchClients();
    loadStatuses();

    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(() => {
      console.log('🔄 [SELLER PANEL] Rafraîchissement automatique...');
      fetchClients();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Rafraîchir quand on revient sur l'onglet clients
  React.useEffect(() => {
    if (activeTab === 'clients') {
      fetchClients();
    }
  }, [activeTab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const sellerFullName = sellerData.full_name || `${sellerData.prenom} ${sellerData.nom}`;
      console.log('🔍 [SELLER PANEL] Récupération des clients pour:', sellerFullName);

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('vendeur', sellerFullName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [SELLER PANEL] Erreur Supabase:', error);
        setClients([]);
      } else {
        console.log('✅ [SELLER PANEL] Clients récupérés:', data?.length || 0, data);
        setClients(data || []);
      }
    } catch (error) {
      console.error('❌ [SELLER PANEL] Erreur lors du chargement des clients:', error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await statusService.getAllStatuses();
      setStatuses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statuts:', error);
    }
  };

  const handleStatusChange = async (clientId: string, statusId: string) => {
    setUpdatingStatus(clientId);
    try {
      await clientService.updateClientStatus(clientId, statusId || null);
      await fetchClients();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSaveRendezVous = async (clientId: string, rendezVousValue: string) => {
    if (!rendezVousValue) {
      alert('⚠️ Veuillez sélectionner une date et une heure');
      return;
    }

    setSavingRendezVous(clientId);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ rendez_vous: new Date(rendezVousValue).toISOString() })
        .eq('id', clientId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du rendez-vous:', error);
        alert('❌ Erreur lors de la mise à jour');
        return;
      }

      alert('✅ Rendez-vous enregistré avec succès !');
      setEditingRendezVous(null);
      await fetchClients();
    } catch (error) {
      console.error('❌ Exception lors de la mise à jour du rendez-vous:', error);
      alert('❌ Erreur lors de la mise à jour');
    } finally {
      setSavingRendezVous(null);
    }
  };

  const handleOpenClientModal = async (client: Client) => {
    const { data: freshClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client.id)
      .maybeSingle();

    const clientToEdit = freshClient || client;

    if (!clientToEdit.client_password) {
      const generatedPassword = (Math.floor(Math.random() * 900000) + 100000).toString();
      await supabase
        .from('clients')
        .update({ client_password: generatedPassword })
        .eq('id', client.id);
      clientToEdit.client_password = generatedPassword;
    }

    setSelectedClientDetails(clientToEdit);
    setEditedClient({ ...clientToEdit });
    setModalTab('information');
    await loadComments(client.id);
  };

  const handleFieldChange = (field: keyof Client, value: any) => {
    if (editedClient) {
      setEditedClient({ ...editedClient, [field]: value });
    }
  };

  const handleSaveClient = async () => {
    if (!editedClient) return;

    setSaving(true);
    try {
      const updates = {
        prenom: editedClient.prenom,
        nom: editedClient.nom,
        email: editedClient.email,
        phone: editedClient.phone,
        portable: editedClient.portable,
        address: editedClient.address,
        ville: editedClient.ville,
        code_postal: editedClient.code_postal,
        pays: editedClient.pays,
        anniversaire: editedClient.anniversaire,
        autre_courriel: editedClient.autre_courriel,
        activite: editedClient.activite,
        rendez_vous: editedClient.rendez_vous,
        siret: editedClient.siret,
        company_name: editedClient.company_name,
        source: editedClient.source,
        status_id: editedClient.status_id,
        vendeur: editedClient.vendeur
      };

      await clientService.updateClient(editedClient.id.toString(), updates);
      await fetchClients();
      alert('Modifications enregistrées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    } finally {
      setSaving(false);
    }
  };

  const loadComments = async (clientId: string | number) => {
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('lead_comments')
        .select('*')
        .eq('lead_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!selectedClientDetails || !newComment.trim()) return;

    setAddingComment(true);
    try {
      const { error } = await supabase
        .from('lead_comments')
        .insert([{
          lead_id: selectedClientDetails.id,
          comment_text: newComment,
          author_name: sellerData.full_name
        }]);

      if (error) throw error;

      setNewComment('');
      await loadComments(selectedClientDetails.id);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setAddingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    setDeletingCommentId(commentId);
    try {
      const { error } = await supabase
        .from('lead_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      if (selectedClientDetails) {
        await loadComments(selectedClientDetails.id);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      alert('Erreur lors de la suppression du commentaire');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2847] via-[#2d4578] to-[#1a2847] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.08)_0%,transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
      <div className="relative z-0">
      <header className="fixed top-0 left-0 right-0 z-40 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2847]/98 via-[#2d4578]/98 to-[#1a2847]/98"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 backdrop-blur-2xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative flex items-center h-24 md:h-28 lg:h-32">
            <div className="flex-1 flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2.5 md:p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              {sellerData.isAdminViewing && onReturnToAdmin && (
                <button
                  onClick={onReturnToAdmin}
                  className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:gap-2 md:px-4 md:py-2.5 bg-white/20 md:bg-gradient-to-r md:from-blue-500/90 md:to-blue-600/90 backdrop-blur-xl border border-white/30 md:border-transparent text-white hover:bg-white/30 md:hover:from-blue-600 md:hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 md:hover:scale-105 md:font-semibold md:text-sm"
                  title="Retour au panel admin"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">Retour Admin</span>
                </button>
              )}
              <SellerNotificationSystem
                sellerUuid={sellerData.id}
                sellerFullName={sellerData.full_name}
                onNotificationClick={(type) => {
                  if (type === 'client') {
                    setActiveTab('chat');
                  } else {
                    setActiveTab('chat-travail');
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
      </header>

      <div className="pt-32 md:pt-40 lg:pt-48 pb-8 md:pb-16 flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed left-0 top-32 md:top-40 lg:top-48 bottom-0 w-64 md:w-72 flex flex-col
          transition-transform duration-300 z-50
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/95 via-[#2d4578]/95 to-[#1e3a5f]/95 backdrop-blur-2xl shadow-2xl border-r border-white/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.08)_0%,transparent_50%)]"></div>

          <div className="relative flex-1 overflow-y-auto px-4 md:px-5 py-6 md:py-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="lg:hidden flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-8 p-4 md:p-5 bg-gradient-to-br from-blue-500/20 via-blue-600/15 to-purple-500/20 rounded-2xl border border-white/20 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base md:text-lg font-bold text-white truncate">
                    {sellerData.prenom} {sellerData.nom}
                  </h2>
                  <p className="text-xs md:text-sm text-blue-200 font-medium">
                    Espace vendeur
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2 md:space-y-2.5">
              <button
                onClick={() => handleTabChange('clients')}
                className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'clients'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                    : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                }`}
              >
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span className="truncate">Clients</span>
              </button>
              <button
                onClick={() => handleTabChange('chat')}
                className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                    : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                }`}
              >
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span className="truncate">Chat Client</span>
              </button>
              <button
                onClick={() => handleTabChange('chat-travail')}
                className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'chat-travail'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                    : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                }`}
              >
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span className="truncate">Chat Travail</span>
              </button>
              <button
                onClick={() => handleTabChange('argumentaire')}
                className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'argumentaire'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                    : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                }`}
              >
                <FileText className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span className="truncate">Argumentaire</span>
              </button>
            </nav>
          </div>

          <div className="relative px-4 md:px-5 py-6 md:py-8 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 md:px-5 py-3.5 md:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 text-xs md:text-sm border border-red-400/50"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-64 xl:ml-72 min-h-screen">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-blue-500/5 to-white/5 backdrop-blur-sm"></div>
            <div className="relative p-6 md:p-8 lg:p-10">
            {activeTab === 'clients' && (
              <div>
                <div className="mb-8 md:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                      Mes Clients
                    </h1>
                    <p className="text-sm md:text-base text-blue-200 font-medium">
                      Gérez tous vos clients en un seul endroit
                    </p>
                  </div>
                  <button
                    onClick={fetchClients}
                    disabled={loadingClients}
                    className="flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base border border-blue-400/50"
                  >
                    <RefreshCw className={`w-5 h-5 ${loadingClients ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Rafraîchir</span>
                  </button>
                </div>

                {loadingClients ? (
                  <div className="flex flex-col items-center justify-center h-64 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300/30 border-t-blue-400 mb-4"></div>
                    <p className="text-white/80 font-medium">Chargement des clients...</p>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-4 md:p-6 lg:p-8">
                    <div className="mb-6 md:mb-8 px-3 md:px-4 bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs font-medium text-white/90 mb-2">Prénom</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterPrenom}
                            onChange={(e) => setFilterPrenom(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/90 mb-2">Nom</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterNom}
                            onChange={(e) => setFilterNom(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/90 mb-2">E-mail</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterEmail}
                            onChange={(e) => setFilterEmail(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/90 mb-2">Téléphone</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterTelephone}
                            onChange={(e) => setFilterTelephone(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/90 mb-2">SIRET</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterSiret}
                            onChange={(e) => setFilterSiret(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/90 mb-2">Statut</label>
                          <select
                            value={filterStatut}
                            onChange={(e) => setFilterStatut(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                          >
                            <option value="" className="bg-[#1a2847] text-white">Tous les statuts</option>
                            {statuses.map((status) => (
                              <option key={status.id} value={status.id} className="bg-[#1a2847] text-white">
                                {status.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-white/10">
                      <table className="w-full table-auto min-w-max">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Rendez-vous
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                Statut du client
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Prénom
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Nom
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                Téléphone
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                Portable
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                E-mail
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                Activité
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                Société
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Hash className="w-4 h-4" />
                                SIRET
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Vendeur
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Créé le
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-white/90">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredClients = clients.filter(client => {
                              const matchPrenom = !filterPrenom || (client.prenom && client.prenom.toLowerCase().includes(filterPrenom.toLowerCase()));
                              const matchNom = !filterNom || (client.nom && client.nom.toLowerCase().includes(filterNom.toLowerCase()));
                              const matchEmail = !filterEmail || (client.email && client.email.toLowerCase().includes(filterEmail.toLowerCase()));
                              const matchTelephone = !filterTelephone || (
                                (client.phone && client.phone.includes(filterTelephone)) ||
                                (client.portable && client.portable.includes(filterTelephone))
                              );
                              const matchSiret = !filterSiret || (client.siret && client.siret.includes(filterSiret));
                              const matchStatut = !filterStatut || (client.status_id === filterStatut);

                              return matchPrenom && matchNom && matchEmail && matchTelephone && matchSiret && matchStatut;
                            });

                            const hasActiveFilters = filterPrenom || filterNom || filterEmail || filterTelephone || filterSiret || filterStatut;

                            if (filteredClients.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={13} className="text-center py-8 text-white/60">
                                    {hasActiveFilters ? 'Aucun client ne correspond à vos critères de recherche' : 'Aucun client trouvé'}
                                  </td>
                                </tr>
                              );
                            }

                            return filteredClients.map((client) => (
                              <tr key={client.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-sm text-white/90 whitespace-nowrap min-w-[200px]">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="datetime-local"
                                      value={
                                        editingRendezVous?.clientId === client.id
                                          ? editingRendezVous.value
                                          : client.rendez_vous
                                          ? new Date(client.rendez_vous).toISOString().slice(0, 16)
                                          : ''
                                      }
                                      onChange={(e) => {
                                        setEditingRendezVous({
                                          clientId: client.id,
                                          value: e.target.value
                                        });
                                      }}
                                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {editingRendezVous?.clientId === client.id && (
                                      <button
                                        onClick={() => handleSaveRendezVous(client.id, editingRendezVous.value)}
                                        disabled={savingRendezVous === client.id}
                                        className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center"
                                        title="Enregistrer le rendez-vous"
                                      >
                                        {savingRendezVous === client.id ? (
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Check className="w-3 h-3" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <select
                                    value={client.status_id || ''}
                                    onChange={(e) => handleStatusChange(client.id.toString(), e.target.value)}
                                    disabled={updatingStatus === client.id.toString()}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                      color: client.status_id ? statuses.find(s => s.id === client.status_id)?.color : '#6B7280'
                                    }}
                                  >
                                    <option value="">Aucun statut</option>
                                    {statuses.map((status) => (
                                      <option key={status.id} value={status.id} style={{ color: status.color }}>
                                        {status.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.prenom || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.nom || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.phone || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.portable || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.email}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.activite || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.company_name || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90">
                                  {client.siret || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90 max-w-xs truncate" title={client.vendeur}>
                                  {client.vendeur || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-white/90 whitespace-nowrap">
                                  {new Date(client.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenClientModal(client)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white text-xs font-bold rounded-lg hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      Modifier
                                    </button>
                                    <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      Chat
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>


                    <div className="mt-4 sm:mt-6 px-3 sm:px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-blue-400" />
                          <span className="text-sm font-bold text-white">
                            {(() => {
                              const filteredCount = clients.filter(client => {
                                const matchPrenom = !filterPrenom || (client.prenom && client.prenom.toLowerCase().includes(filterPrenom.toLowerCase()));
                                const matchNom = !filterNom || (client.nom && client.nom.toLowerCase().includes(filterNom.toLowerCase()));
                                const matchEmail = !filterEmail || (client.email && client.email.toLowerCase().includes(filterEmail.toLowerCase()));
                                const matchTelephone = !filterTelephone || (
                                  (client.phone && client.phone.includes(filterTelephone)) ||
                                  (client.portable && client.portable.includes(filterTelephone))
                                );
                                const matchSiret = !filterSiret || (client.siret && client.siret.includes(filterSiret));
                                const matchStatut = !filterStatut || (client.status_id === filterStatut);

                                return matchPrenom && matchNom && matchEmail && matchTelephone && matchSiret && matchStatut;
                              }).length;

                              const hasActiveFilters = filterPrenom || filterNom || filterEmail || filterTelephone || filterSiret || filterStatut;

                              return hasActiveFilters
                                ? `${filteredCount} client${filteredCount > 1 ? 's' : ''} trouvé${filteredCount > 1 ? 's' : ''}`
                                : `${clients.length} client${clients.length > 1 ? 's' : ''} au total`;
                            })()}
                          </span>
                        </div>
                        {(() => {
                          const hasActiveFilters = filterPrenom || filterNom || filterEmail || filterTelephone || filterSiret || filterStatut;
                          return hasActiveFilters && (
                            <span className="text-xs text-blue-600 font-medium">
                              sur {clients.length} total
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div>
                <div className="mb-8 md:mb-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    Chat Client
                  </h1>
                  <p className="text-sm md:text-base text-blue-200 font-medium">
                    Communiquez avec vos clients en temps réel
                  </p>
                </div>

                <SellerChatList
                  sellerId={sellerData.id}
                  sellerFullName={sellerData.full_name}
                  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                  supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                />
              </div>
            )}

            {activeTab === 'chat-travail' && (
              <div>
                <div className="mb-8 md:mb-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    Chat Travail
                  </h1>
                  <p className="text-sm md:text-base text-blue-200 font-medium">
                    Communication interne avec l'équipe et les administrateurs
                  </p>
                </div>

                <SellerWorkChat
                  sellerId={sellerData.id}
                  sellerFullName={sellerData.full_name}
                  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                  supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                />
              </div>
            )}

            {activeTab === 'argumentaire' && (
              <div>
                <ArgumentaireViewer />
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
      </div>

      {selectedClientDetails && editedClient && (
        <SellerClientModal
          client={selectedClientDetails}
          editedClient={editedClient}
          statuses={statuses}
          modalTab={modalTab}
          saving={saving}
          comments={comments}
          newComment={newComment}
          loadingComments={loadingComments}
          addingComment={addingComment}
          deletingCommentId={deletingCommentId}
          copiedEmail={copiedEmail}
          copiedPassword={copiedPassword}
          sellerFullName={sellerData.full_name}
          onClose={() => {
            setSelectedClientDetails(null);
            setEditedClient(null);
            setModalTab('information');
          }}
          onTabChange={setModalTab}
          onFieldChange={handleFieldChange}
          onSave={handleSaveClient}
          onCommentChange={setNewComment}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          onCopyToClipboard={copyToClipboard}
          onClientLogin={onClientLogin}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
