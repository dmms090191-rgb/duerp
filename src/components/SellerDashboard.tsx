import React from 'react';
import { ShoppingBag, LogOut, User, Bell, Settings, MessageSquare, ArrowLeft, UserCheck, Edit, Calendar, Phone, Mail, Briefcase, Building2, Hash, FileText, Shield, Menu, X, RefreshCw, Eye, LogIn, Copy, Check, Search } from 'lucide-react';
import { Seller } from '../types/Seller';
import SellerChatList from './SellerChatList';
import SellerWorkChat from './SellerWorkChat';
import Argumentaire from './Argumentaire';
import { supabase } from '../lib/supabase';
import { statusService } from '../services/statusService';
import { clientService } from '../services/clientService';
import { Status } from '../types/Status';
import SellerClientModal from './SellerClientModal';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-blue-50/30">
      <header className="bg-white shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 sm:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                {isMobileSidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
              {sellerData.isAdminViewing && onReturnToAdmin && (
                <button
                  onClick={onReturnToAdmin}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  title="Retour au panel admin"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold hidden sm:inline">Retour Admin</span>
                  <span className="font-semibold sm:hidden">Retour</span>
                </button>
              )}
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <img
                src="/kk copy.png"
                alt="Logo Cabinet FPE"
                className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
              />
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                {sellerData.isAdminViewing ? 'Mode Admin' : 'Espace Vendeur'}
              </p>
            </div>

          </div>
        </div>
      </header>

      <div className="flex h-screen relative w-full box-border overflow-hidden lg:overflow-visible">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <aside className={`
          w-64 sm:w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl
          lg:static lg:block
          fixed top-0 left-0 h-full z-50
          transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 sm:p-6 h-full overflow-y-auto pb-24">
            <div className="lg:hidden flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {sellerData.prenom} {sellerData.nom}
                  </h2>
                  <p className="text-xs text-blue-600 font-medium">
                    Espace vendeur
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-1.5 sm:space-y-2">
              <button
                onClick={() => handleTabChange('clients')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  activeTab === 'clients'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Clients</span>
              </button>
              <button
                onClick={() => handleTabChange('chat')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Chat Client</span>
              </button>
              <button
                onClick={() => handleTabChange('chat-travail')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  activeTab === 'chat-travail'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Chat Travail</span>
              </button>
              <button
                onClick={() => handleTabChange('argumentaire')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  activeTab === 'argumentaire'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Argumentaire</span>
              </button>
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 w-64 sm:w-72 p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg">Déconnexion</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent min-w-0 w-full lg:w-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'clients' && (
              <div>
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                      Mes Clients
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">
                      Gérez tous vos clients en un seul endroit
                    </p>
                  </div>
                  <button
                    onClick={fetchClients}
                    disabled={loadingClients}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loadingClients ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Rafraîchir</span>
                  </button>
                </div>

                {loadingClients ? (
                  <div className="flex flex-col items-center justify-center h-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement des clients...</p>
                  </div>
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-3 sm:p-4 lg:p-6">
                    <div className="mb-4 sm:mb-6 px-2 sm:px-3 bg-gradient-to-r from-gray-50 to-blue-50/50 p-3 sm:p-5 rounded-xl border border-gray-200/50 shadow-inner">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterPrenom}
                            onChange={(e) => setFilterPrenom(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterNom}
                            onChange={(e) => setFilterNom(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterEmail}
                            onChange={(e) => setFilterEmail(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterTelephone}
                            onChange={(e) => setFilterTelephone(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">SIRET</label>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filterSiret}
                            onChange={(e) => setFilterSiret(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                          <select
                            value={filterStatut}
                            onChange={(e) => setFilterStatut(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="">Tous les statuts</option>
                            {statuses.map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Tableau avec défilement horizontal */}
                    <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                      <table className="w-full table-auto min-w-max">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Rendez-vous
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                Statut du client
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Prénom
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Nom
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                Téléphone
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                Portable
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                E-mail
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                Activité
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                Société
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Hash className="w-4 h-4" />
                                SIRET
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Vendeur
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Créé le
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">
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
                                  <td colSpan={13} className="text-center py-8 text-gray-500">
                                    {hasActiveFilters ? 'Aucun client ne correspond à vos critères de recherche' : 'Aucun client trouvé'}
                                  </td>
                                </tr>
                              );
                            }

                            return filteredClients.map((client) => (
                              <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap min-w-[200px]">
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
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.prenom || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.nom || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.phone || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.portable || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.email}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.activite || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.company_name || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {client.siret || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate" title={client.vendeur}>
                                  {client.vendeur || '-'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                                  {new Date(client.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenClientModal(client)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                    >
                                      <Edit className="w-3 h-3" />
                                      Modifier
                                    </button>
                                    <button className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                                      <MessageSquare className="w-3 h-3" />
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
                          <UserCheck className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-bold text-gray-900">
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
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                    Chat Client
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
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
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                    Chat Travail
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
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
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                    Argumentaire
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
                    Consultez tous vos arguments de vente
                  </p>
                </div>
                <Argumentaire />
              </div>
            )}
          </div>
        </main>
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
