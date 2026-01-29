import React from 'react';
import { Users, Search, Mail, Phone, Calendar, Trash2, LogIn, Eye, X, UserPlus, ArrowDown, ArrowUp, Tag, Copy, MessageSquare, Check, RefreshCw } from 'lucide-react';
import { Lead } from '../types/Lead';
import { sellerService } from '../services/sellerService';
import { statusService } from '../services/statusService';
import { clientService } from '../services/clientService';
import { adminService } from '../services/adminService';
import { Status } from '../types/Status';
import { supabase } from '../lib/supabase';
import ClientEmailSender from './ClientEmailSender';

interface Seller {
  id: string;
  full_name: string;
  email: string;
}

interface LeadsTabProps {
  leads: Lead[];
  onLeadsDeleted: (leadIds: number[]) => void;
  onClientLogin?: (lead: Lead) => void;
  onStatusChanged?: (leadId: number, statusId: string | null) => void;
  onLeadUpdated?: () => void;
  onOpenChat?: (clientId: number) => void;
}

const LeadsTab: React.FC<LeadsTabProps> = ({ leads, onLeadsDeleted, onClientLogin, onStatusChanged, onLeadUpdated, onOpenChat }) => {
  console.log('🟢 LeadsTab rendered with leads:', leads.length, 'first lead:', leads[0]);
  const [searchId, setSearchId] = React.useState('');
  const [searchEmail, setSearchEmail] = React.useState('');
  const [searchPhone, setSearchPhone] = React.useState('');
  const [searchNom, setSearchNom] = React.useState('');
  const [searchPrenom, setSearchPrenom] = React.useState('');
  const [searchSiret, setSearchSiret] = React.useState('');
  const [selectedLeads, setSelectedLeads] = React.useState<number[]>([]);
  const [selectedLeadDetails, setSelectedLeadDetails] = React.useState<Lead | null>(null);
  const [editedLead, setEditedLead] = React.useState<Lead | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'information' | 'mail' | 'liste-commentaire' | 'panel-client'>('information');
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [leadToTransfer, setLeadToTransfer] = React.useState<Lead | null>(null);
  const [sellers, setSellers] = React.useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = React.useState('');
  const [transferring, setTransferring] = React.useState(false);
  const [superAdmin, setSuperAdmin] = React.useState<any>(null);
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
  const [statuses, setStatuses] = React.useState<Status[]>([]);
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [refreshing, setRefreshing] = React.useState(false);
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [addingComment, setAddingComment] = React.useState(false);
  const [deletingCommentId, setDeletingCommentId] = React.useState<string | null>(null);
  const [editingRendezVous, setEditingRendezVous] = React.useState<{leadId: number, value: string} | null>(null);
  const [savingRendezVous, setSavingRendezVous] = React.useState<number | null>(null);

  const parseDate = (dateStr: string): Date => {
    const parts = dateStr.split(/[\s,:\/]+/);
    if (parts.length >= 5) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      const hour = parseInt(parts[3]);
      const minute = parseInt(parts[4]);
      return new Date(year, month, day, hour, minute);
    }
    return new Date(dateStr);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesId = searchId === '' || lead.id.toString().includes(searchId);
    const matchesEmail = searchEmail === '' || lead.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesPhone = searchPhone === '' || lead.telephone.includes(searchPhone);
    const matchesNom = searchNom === '' || lead.nom.toLowerCase().includes(searchNom.toLowerCase());
    const matchesPrenom = searchPrenom === '' || lead.prenom.toLowerCase().includes(searchPrenom.toLowerCase());
    const matchesSiret = searchSiret === '' || (lead.siret && lead.siret.includes(searchSiret));
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'none' && !lead.status_id) ||
                         (lead.status_id === filterStatus);

    return matchesId && matchesEmail && matchesPhone && matchesNom && matchesPrenom && matchesSiret && matchesStatus;
  }).sort((a, b) => {
    const dateA = parseDate(a.dateCreation).getTime();
    const dateB = parseDate(b.dateCreation).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) {
      return;
    }

    try {
      console.log('🔴 DEBUT SUPPRESSION');
      console.log('🔴 selectedLeads:', selectedLeads);
      console.log('🔴 selectedLeads type:', selectedLeads.map(id => typeof id));

      console.log('🔴 Appel Supabase DELETE...');
      const { data, error } = await supabase
        .from('clients')
        .delete()
        .in('id', selectedLeads)
        .select();

      console.log('🔴 Réponse Supabase - data:', data);
      console.log('🔴 Réponse Supabase - error:', error);

      if (error) {
        console.error('❌ ERREUR SUPABASE:', error);
        alert(`❌ Erreur: ${error.message}`);
        return;
      }

      console.log('✅ SUPPRESSION OK - Mise à jour UI');
      onLeadsDeleted(selectedLeads);
      setSelectedLeads([]);

    } catch (error: any) {
      console.error('❌ EXCEPTION:', error);
      console.error('❌ STACK:', error.stack);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  const handleSaveRendezVous = async (leadId: number, rendezVousValue: string) => {
    if (!rendezVousValue) {
      alert('⚠️ Veuillez sélectionner une date et une heure');
      return;
    }

    setSavingRendezVous(leadId);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ rendez_vous: new Date(rendezVousValue).toISOString() })
        .eq('id', leadId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du rendez-vous:', error);
        alert('❌ Erreur lors de la mise à jour');
        return;
      }

      alert('✅ Rendez-vous enregistré avec succès !');
      setEditingRendezVous(null);

      if (onLeadUpdated) {
        onLeadUpdated();
      }
    } catch (error) {
      console.error('❌ Exception lors de la mise à jour du rendez-vous:', error);
      alert('❌ Erreur lors de la mise à jour');
    } finally {
      setSavingRendezVous(null);
    }
  };

  React.useEffect(() => {
    loadSellers();
    loadStatuses();
    loadSuperAdmin();
    generateMissingPasswords();
  }, []);

  const generateMissingPasswords = async () => {
    try {
      const { data: leadsWithoutPassword } = await supabase
        .from('clients')
        .select('id, email, client_password')
        .is('client_password', null);

      if (leadsWithoutPassword && leadsWithoutPassword.length > 0) {
        for (const lead of leadsWithoutPassword) {
          const generatedPassword = (Math.floor(Math.random() * 900000) + 100000).toString();
          await supabase
            .from('clients')
            .update({ client_password: generatedPassword })
            .eq('id', lead.id);
        }
        console.log(`✅ Mots de passe générés pour ${leadsWithoutPassword.length} clients`);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des mots de passe:', error);
    }
  };

  const loadSellers = async () => {
    try {
      console.log('🔄 Début du chargement des sellers...');
      const data = await sellerService.getAllSellers();
      console.log('📦 Données reçues:', data);
      const formattedSellers = data.map((seller: any) => ({
        id: seller.id,
        full_name: seller.full_name,
        email: seller.email
      }));
      console.log('✅ Sellers formatés:', formattedSellers);
      setSellers(formattedSellers);
      console.log('✅ Sellers chargés dans le state:', formattedSellers.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sellers:', error);
    }
  };

  const loadSuperAdmin = async () => {
    try {
      console.log('🔄 Chargement du super admin...');
      const admin = await adminService.getSuperAdmin();
      setSuperAdmin(admin);
      console.log('✅ Super admin chargé:', admin);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du super admin:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await statusService.getAllStatuses();
      setStatuses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statuses:', error);
    }
  };

  const handleStatusChange = async (leadId: string, statusId: string) => {
    console.log('🔵 handleStatusChange called with:', { leadId, statusId, leadIdType: typeof leadId });
    setUpdatingStatus(leadId);
    try {
      await clientService.updateClientStatus(leadId, statusId || null);
      if (onStatusChanged) {
        onStatusChanged(leadId, statusId || null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      console.error('Failed leadId:', leadId, 'type:', typeof leadId);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleTransferLead = (lead: Lead) => {
    console.log('🎯 Ouverture modal transfert, sellers disponibles:', sellers);
    setLeadToTransfer(lead);
    setSelectedSellerId('');
    setShowTransferModal(true);
  };

  const handleTransferSelected = () => {
    setLeadToTransfer(null);
    setSelectedSellerId('');
    setShowTransferModal(true);
  };

  const confirmTransfer = async () => {
    if (!selectedSellerId) return;
    if (!leadToTransfer && selectedLeads.length === 0) return;

    setTransferring(true);
    try {
      // Vérifier si c'est le super admin ou un seller
      const isSuperAdmin = superAdmin && selectedSellerId === superAdmin.id;
      const selectedSeller = isSuperAdmin ? null : sellers.find(s => s.id === selectedSellerId);

      if (!isSuperAdmin && !selectedSeller) return;

      const leadsToTransfer = leadToTransfer ? [leadToTransfer.id] : selectedLeads;

      // Préparer les données à mettre à jour
      const updateData: any = {};

      // Assigner le vendeur (seller ou super admin)
      if (isSuperAdmin) {
        updateData.vendeur = superAdmin.full_name;
        updateData.assigned_agent = superAdmin.id;
        console.log('✅ [ATTRIBUTION] Au super admin:', superAdmin.full_name);
      } else if (selectedSeller) {
        updateData.vendeur = selectedSeller.full_name;
        console.log('✅ [ATTRIBUTION] Vendeur:', selectedSeller.full_name);
        console.log('✅ [ATTRIBUTION] Champ vendeur mis à jour avec:', selectedSeller.full_name);
        console.log('✅ [ATTRIBUTION] Leads à attribuer:', leadsToTransfer);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/clients?id=in.(${leadsToTransfer.join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        setShowTransferModal(false);
        setLeadToTransfer(null);
        setSelectedLeads([]);
        if (onLeadUpdated) {
          await onLeadUpdated();
        }
      }
    } catch (error) {
      console.error('Error transferring lead:', error);
    } finally {
      setTransferring(false);
    }
  };

  const handleOpenEditModal = async (lead: Lead) => {
    const { data: freshLead } = await supabase
      .from('clients')
      .select(`
        *,
        status:statuses(id, name, color)
      `)
      .eq('id', lead.id)
      .maybeSingle();

    let leadToEdit: Lead;

    if (freshLead) {
      leadToEdit = {
        id: freshLead.id,
        nom: freshLead.nom || freshLead.full_name?.split(' ').pop() || '',
        prenom: freshLead.prenom || freshLead.full_name?.split(' ')[0] || '',
        email: freshLead.email,
        motDePasse: freshLead.client_password || '',
        telephone: freshLead.phone || '',
        portable: freshLead.portable || '',
        dateCreation: new Date(freshLead.created_at).toLocaleString('fr-FR'),
        rendez_vous: freshLead.rendez_vous || '',
        activite: freshLead.activite || '',
        societe: freshLead.company_name || '',
        siret: freshLead.siret || '',
        vendeur: freshLead.vendeur || '',
        address: freshLead.address || '',
        ville: freshLead.ville || '',
        code_postal: freshLead.code_postal || '',
        pays: freshLead.pays || 'France',
        anniversaire: freshLead.anniversaire || '',
        autre_courriel: freshLead.autre_courriel || '',
        date_affectation: freshLead.date_affectation || '',
        representant: freshLead.representant || '',
        prevente: freshLead.prevente || '',
        retention: freshLead.retention || '',
        sous_affilie: freshLead.sous_affilie || '',
        langue: freshLead.langue || 'Français',
        conseiller: freshLead.conseiller || '',
        source: freshLead.source || '',
        qualifiee: freshLead.qualifiee || false,
        status_id: freshLead.status_id,
        status: freshLead.status,
        creePar: freshLead.notes?.includes('par') ? freshLead.notes.split('par ')[1] : 'Admin',
        client_password: freshLead.client_password || '',
        client_account_created: freshLead.client_account_created || false
      };
    } else {
      leadToEdit = lead;
    }

    if (!leadToEdit.client_password) {
      const generatedPassword = (Math.floor(Math.random() * 900000) + 100000).toString();

      const { error } = await supabase
        .from('clients')
        .update({ client_password: generatedPassword })
        .eq('id', lead.id);

      if (!error) {
        leadToEdit = { ...leadToEdit, client_password: generatedPassword, motDePasse: generatedPassword };
      }
    }

    console.log('📋 [LeadsTab] Lead chargé pour édition:', leadToEdit);
    console.log('📋 [LeadsTab] SIRET du lead:', leadToEdit.siret);

    setSelectedLeadDetails(leadToEdit);
    setEditedLead({ ...leadToEdit });
    setActiveTab('information');

    await loadComments(lead.id);
  };

  const handleFieldChange = (field: keyof Lead, value: any) => {
    if (editedLead) {
      setEditedLead({ ...editedLead, [field]: value });
    }
  };

  const loadComments = async (leadId: number) => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement commentaires:', error);
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !editedLead) return;

    setAddingComment(true);
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .insert([{
          lead_id: editedLead.id,
          comment_text: newComment.trim(),
          author_name: 'Admin'
        }])
        .select();

      if (error) {
        console.error('Erreur ajout commentaire:', error);
        alert('Erreur lors de l\'ajout du commentaire');
      } else {
        setNewComment('');
        await loadComments(editedLead.id);
        alert('Commentaire ajouté avec succès!');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setAddingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!editedLead) return;

    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    setDeletingCommentId(commentId);
    try {
      const { error } = await supabase
        .from('lead_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Erreur suppression commentaire:', error);
        alert('Erreur lors de la suppression du commentaire');
      } else {
        await loadComments(editedLead.id);
        alert('Commentaire supprimé avec succès!');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression du commentaire');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleSaveLead = async () => {
    if (!editedLead) return;

    setSaving(true);
    try {
      console.log('🔵 Saving lead:', editedLead.id);

      const rendezVousValue = editedLead.rendez_vous && editedLead.rendez_vous.trim() !== ''
        ? new Date(editedLead.rendez_vous).toISOString()
        : null;

      const dateAffectationValue = editedLead.date_affectation && editedLead.date_affectation.trim() !== ''
        ? new Date(editedLead.date_affectation).toISOString()
        : null;

      const dataToSave = {
        nom: editedLead.nom,
        prenom: editedLead.prenom,
        full_name: `${editedLead.prenom} ${editedLead.nom}`,
        email: editedLead.email,
        phone: editedLead.telephone,
        portable: editedLead.portable,
        rendez_vous: rendezVousValue,
        activite: editedLead.activite,
        company_name: editedLead.societe,
        siret: editedLead.siret,
        vendeur: editedLead.vendeur,
        address: editedLead.address,
        ville: editedLead.ville,
        code_postal: editedLead.code_postal,
        pays: editedLead.pays,
        anniversaire: editedLead.anniversaire || null,
        autre_courriel: editedLead.autre_courriel,
        date_affectation: dateAffectationValue,
        representant: editedLead.representant,
        prevente: editedLead.prevente,
        retention: editedLead.retention,
        sous_affilie: editedLead.sous_affilie,
        langue: editedLead.langue,
        conseiller: editedLead.conseiller,
        source: editedLead.source,
        qualifiee: editedLead.qualifiee,
        status_id: editedLead.status_id || null,
        client_password: editedLead.client_password,
        client_account_created: editedLead.client_account_created || false,
      };

      console.log('🔵 Data to save:', dataToSave);

      const { data, error } = await supabase
        .from('clients')
        .update(dataToSave)
        .eq('id', editedLead.id);

      if (error) {
        console.error('❌ Error updating lead:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        alert(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
      } else {
        console.log('✅ Lead saved successfully:', data);
        alert('Modifications sauvegardées avec succès!');
        setSelectedLeadDetails(null);
        setEditedLead(null);
        if (onStatusChanged && editedLead.status_id) {
          onStatusChanged(editedLead.id, editedLead.status_id);
        }
        if (onLeadUpdated) {
          onLeadUpdated();
        }
      }
    } catch (error) {
      console.error('❌ Exception while saving lead:', error);
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChat = async (lead: Lead) => {
    if (!onOpenChat) return;

    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('id')
        .eq('email', lead.email)
        .maybeSingle();

      if (error) {
        console.error('Error finding client:', error);
        alert('Erreur lors de la recherche du client');
        return;
      }

      if (!client) {
        alert('Aucun compte client trouvé pour ce lead. Veuillez d\'abord créer un accès client.');
        return;
      }

      onOpenChat(client.id);
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Erreur lors de l\'ouverture du chat');
    }
  };

  const handleRefreshLead = async () => {
    if (!selectedLeadDetails) return;

    setRefreshing(true);
    console.log('🔄 [LeadsTab] Rafraîchissement des données du client ID:', selectedLeadDetails.id);

    try {
      const { data: freshLead, error } = await supabase
        .from('clients')
        .select(`
          *,
          status:statuses(id, name, color)
        `)
        .eq('id', selectedLeadDetails.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [LeadsTab] Erreur lors du rafraîchissement:', error);
        alert('Erreur lors du rafraîchissement des données');
        return;
      }

      if (!freshLead) {
        alert('Client introuvable');
        return;
      }

      const updatedLead: Lead = {
        id: freshLead.id,
        nom: freshLead.nom || freshLead.full_name?.split(' ').pop() || '',
        prenom: freshLead.prenom || freshLead.full_name?.split(' ')[0] || '',
        email: freshLead.email,
        motDePasse: freshLead.client_password || '',
        telephone: freshLead.phone || '',
        portable: freshLead.portable || '',
        dateCreation: new Date(freshLead.created_at).toLocaleString('fr-FR'),
        rendez_vous: freshLead.rendez_vous || '',
        activite: freshLead.activite || '',
        societe: freshLead.company_name || '',
        siret: freshLead.siret || '',
        vendeur: freshLead.vendeur || '',
        address: freshLead.address || '',
        ville: freshLead.ville || '',
        code_postal: freshLead.code_postal || '',
        pays: freshLead.pays || 'France',
        anniversaire: freshLead.anniversaire || '',
        autre_courriel: freshLead.autre_courriel || '',
        date_affectation: freshLead.date_affectation || '',
        representant: freshLead.representant || '',
        prevente: freshLead.prevente || '',
        retention: freshLead.retention || '',
        sous_affilie: freshLead.sous_affilie || '',
        langue: freshLead.langue || 'Français',
        conseiller: freshLead.conseiller || '',
        source: freshLead.source || '',
        qualifiee: freshLead.qualifiee || false,
        status_id: freshLead.status_id,
        status: freshLead.status,
        creePar: freshLead.notes?.includes('par') ? freshLead.notes.split('par ')[1] : 'Admin',
        client_password: freshLead.client_password || '',
        client_account_created: freshLead.client_account_created || false
      };

      console.log('✅ [LeadsTab] Données rafraîchies:', updatedLead);

      setSelectedLeadDetails(updatedLead);
      setEditedLead({ ...updatedLead });

      if (onLeadUpdated) {
        onLeadUpdated();
      }

    } catch (error) {
      console.error('❌ [LeadsTab] Exception lors du rafraîchissement:', error);
      alert('Erreur lors du rafraîchissement');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow border border-gray-300 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Clients</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (onLeadUpdated) {
                  await onLeadUpdated();
                }
              }}
              className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Actualiser
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              title={sortOrder === 'newest' ? 'Du plus récent au moins récent' : 'Du moins récent au plus récent'}
            >
              {sortOrder === 'newest' ? '↓ Plus récent' : '↑ Plus ancien'}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-slate-300 rounded p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchPrenom}
                onChange={(e) => setSearchPrenom(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchNom}
                onChange={(e) => setSearchNom(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SIRET</label>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchSiret}
                onChange={(e) => setSearchSiret(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500 bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="none">Sans statut</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedLeads.length > 0 && (
          <>
            <div className="mb-4 bg-blue-50 border border-slate-300 rounded-lg p-3 md:p-4">
              <span className="text-sm font-medium text-slate-900">
                {selectedLeads.length} lead(s) sélectionné(s)
              </span>
            </div>
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
              <button
                onClick={handleTransferSelected}
                className="w-12 h-12 md:w-14 md:h-14 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center group relative"
                title="Transférer"
              >
                <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Transférer
                </span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="w-12 h-12 md:w-14 md:h-14 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center group relative"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Supprimer
                </span>
              </button>
            </div>
          </>
        )}

        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">Aucun lead trouvé</p>
            <p className="text-gray-400 text-sm">
              {(searchId || searchEmail || searchPhone || searchNom || searchPrenom || searchSiret) ? 'Essayez de modifier vos critères de recherche' : 'Aucun lead disponible'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-300 rounded w-full max-w-full">
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-blue-50 border-b border-gray-300">
                  <th className="py-2 px-3 border-r border-gray-300 w-12">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                    />
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300 min-w-[140px]">Rendez-vous</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300 min-w-[180px]">Statut du client</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Prénom</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Nom</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Téléphone</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Portable</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">E-mail</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Activité</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Société</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">SIRET</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Vendeur</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900 border-r border-gray-300">Créé le</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredLeads.map(lead => {
                  const leadDate = new Date(lead.dateCreation);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  const isRecent = leadDate >= weekAgo;

                  return (
                    <tr key={lead.id} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                      <td className="py-2 px-3 border-r border-gray-200 text-center">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                        />
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={
                              editingRendezVous?.leadId === lead.id
                                ? editingRendezVous.value
                                : lead.rendez_vous
                                ? new Date(lead.rendez_vous).toISOString().slice(0, 16)
                                : ''
                            }
                            onChange={(e) => {
                              setEditingRendezVous({
                                leadId: lead.id,
                                value: e.target.value
                              });
                            }}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500"
                          />
                          {editingRendezVous?.leadId === lead.id && (
                            <button
                              onClick={() => handleSaveRendezVous(lead.id, editingRendezVous.value)}
                              disabled={savingRendezVous === lead.id}
                              className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center"
                              title="Enregistrer le rendez-vous"
                            >
                              {savingRendezVous === lead.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200 min-w-[180px]">
                        <select
                          value={lead.status_id || ''}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          disabled={updatingStatus === lead.id.toString()}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                          style={lead.status ? { color: lead.status.color } : {}}
                        >
                          <option value="">TOUS</option>
                          {statuses.map((status) => (
                            <option
                              key={status.id}
                              value={status.id}
                              style={{ color: status.color }}
                            >
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-900 font-semibold">
                          {lead.prenom}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-900 font-semibold">
                          {lead.nom}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-700">{lead.telephone || '-'}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-700">{lead.portable || '-'}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-700">{lead.email}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-700">{lead.activite || '-'}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-700">{lead.societe || '-'}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-700" title={lead.siret ? `SIRET: ${lead.siret}` : 'Pas de SIRET'}>
                          {lead.siret || '-'}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        {lead.vendeur ? (
                          <div className="flex items-center justify-between gap-1 group">
                            <span className="text-xs font-medium text-slate-900 bg-blue-50 px-2 py-1 rounded border border-slate-300 flex-1">
                              {lead.vendeur}
                            </span>
                            <select
                              value={lead.vendeur}
                              onChange={async (e) => {
                                const newVendeur = e.target.value;
                                try {
                                  console.log('🔄 [ATTRIBUTION] Attribution du lead', lead.id, 'au vendeur:', newVendeur);
                                  const selectedSeller = sellers.find(s => s.full_name === newVendeur);
                                  console.log('🔍 [ATTRIBUTION] Vendeur trouvé:', selectedSeller);

                                  const { data: clientData, error: clientError } = await supabase
                                    .from('clients')
                                    .update({
                                      vendeur: newVendeur || null,
                                      date_affectation: newVendeur ? new Date().toISOString() : null
                                    })
                                    .eq('id', lead.id)
                                    .select();

                                  if (clientError) {
                                    console.error('❌ [ATTRIBUTION] Erreur clients:', clientError);
                                    alert('❌ Erreur lors de la mise à jour');
                                    return;
                                  }

                                  console.log('✅ [ATTRIBUTION] Client mis à jour:', clientData);

                                  const { data: leadsData, error: leadsError } = await supabase
                                    .from('leads')
                                    .update({
                                      assigned_to: selectedSeller?.id || null,
                                      conseiller: newVendeur || null
                                    })
                                    .eq('id', lead.id)
                                    .select();

                                  if (leadsError) {
                                    console.error('❌ [ATTRIBUTION] Erreur leads:', leadsError);
                                  } else {
                                    console.log('✅ [ATTRIBUTION] Lead mis à jour:', leadsData);
                                  }

                                  console.log('✅ [ATTRIBUTION] Attribution terminée avec succès');

                                  if (onLeadUpdated) {
                                    await onLeadUpdated();
                                  }
                                } catch (error) {
                                  console.error('❌ [ATTRIBUTION] Erreur lors de la mise à jour du vendeur:', error);
                                  alert('❌ Erreur lors de la mise à jour');
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500 bg-white cursor-pointer transition-opacity"
                              title="Cliquez pour changer de vendeur"
                            >
                              <option value="">-- Désassigner --</option>
                              <option value="Super Admin">Super Admin</option>
                              {sellers.map((seller) => (
                                <option key={seller.id} value={seller.full_name}>
                                  {seller.full_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <select
                            value=""
                            onChange={async (e) => {
                              const newVendeur = e.target.value;
                              try {
                                console.log('🔄 [ATTRIBUTION] Attribution du lead', lead.id, 'au vendeur:', newVendeur);
                                const selectedSeller = sellers.find(s => s.full_name === newVendeur);
                                console.log('🔍 [ATTRIBUTION] Vendeur trouvé:', selectedSeller);

                                const { data: clientData, error: clientError } = await supabase
                                  .from('clients')
                                  .update({
                                    vendeur: newVendeur || null,
                                    date_affectation: newVendeur ? new Date().toISOString() : null
                                  })
                                  .eq('id', lead.id)
                                  .select();

                                if (clientError) {
                                  console.error('❌ [ATTRIBUTION] Erreur clients:', clientError);
                                  alert('❌ Erreur lors de la mise à jour');
                                  return;
                                }

                                console.log('✅ [ATTRIBUTION] Client mis à jour:', clientData);

                                const { data: leadsData, error: leadsError } = await supabase
                                  .from('leads')
                                  .update({
                                    assigned_to: selectedSeller?.id || null,
                                    conseiller: newVendeur || null
                                  })
                                  .eq('id', lead.id)
                                  .select();

                                if (leadsError) {
                                  console.error('❌ [ATTRIBUTION] Erreur leads:', leadsError);
                                } else {
                                  console.log('✅ [ATTRIBUTION] Lead mis à jour:', leadsData);
                                }

                                console.log('✅ [ATTRIBUTION] Attribution terminée avec succès');

                                if (onLeadUpdated) {
                                  await onLeadUpdated();
                                }
                              } catch (error) {
                                console.error('❌ [ATTRIBUTION] Erreur lors de la mise à jour du vendeur:', error);
                                alert('❌ Erreur lors de la mise à jour');
                              }
                            }}
                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">-- Sélectionner --</option>
                            <option value="Super Admin">Super Admin</option>
                            {sellers.map((seller) => (
                              <option key={seller.id} value={seller.full_name}>
                                {seller.full_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-700">{lead.dateCreation}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white text-xs font-bold rounded-lg hover:from-slate-900 hover:via-slate-800 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Voir les détails"
                          >
                            <Eye className="w-3 h-3" />
                            Modifier
                          </button>
                          {onOpenChat && (
                            <button
                              onClick={() => handleOpenChat(lead)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 text-white text-xs font-bold rounded-lg hover:from-emerald-700 hover:via-green-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                              title="Ouvrir le chat"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Chat
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Total: {filteredLeads.length} clients</span>
          </div>
        </div>
      </div>

      {selectedLeadDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border-2 border-slate-300">
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between shadow-xl">
              <h2 className="text-lg sm:text-2xl font-extrabold text-white uppercase tracking-wide">
                {selectedLeadDetails.status?.name || 'CONDUIT'}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleRefreshLead}
                  disabled={refreshing}
                  className="text-white hover:text-blue-100 transition-all duration-300 p-1.5 sm:p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 rounded-lg"
                  title="Actualiser les données"
                >
                  <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setSelectedLeadDetails(null);
                    setEditedLead(null);
                    setActiveTab('information');
                  }}
                  className="text-white hover:text-blue-100 transition-all duration-300 hover:bg-white/10 rounded-lg p-1.5 sm:p-2"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="border-b-2 border-slate-300 overflow-x-auto bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex gap-1 px-3 sm:px-6 min-w-max">
                <button
                  onClick={() => setActiveTab('information')}
                  className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-extrabold transition-all duration-300 whitespace-nowrap rounded-t-xl ${
                    activeTab === 'information'
                      ? 'text-blue-700 bg-white shadow-lg border-t-4 border-blue-600 transform scale-105'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50/50'
                  }`}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveTab('mail')}
                  className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-extrabold transition-all duration-300 whitespace-nowrap rounded-t-xl ${
                    activeTab === 'mail'
                      ? 'text-blue-700 bg-white shadow-lg border-t-4 border-blue-600 transform scale-105'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50/50'
                  }`}
                >
                  Mail
                </button>
                <button
                  onClick={() => setActiveTab('liste-commentaire')}
                  className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-extrabold transition-all duration-300 whitespace-nowrap rounded-t-xl ${
                    activeTab === 'liste-commentaire'
                      ? 'text-blue-700 bg-white shadow-lg border-t-4 border-blue-600 transform scale-105'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50/50'
                  }`}
                >
                  Liste commentaire
                </button>
                <button
                  onClick={() => setActiveTab('panel-client')}
                  className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-extrabold transition-all duration-300 whitespace-nowrap rounded-t-xl ${
                    activeTab === 'panel-client'
                      ? 'text-blue-700 bg-white shadow-lg border-t-4 border-blue-600 transform scale-105'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50/50'
                  }`}
                >
                  Panel client
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-180px)] bg-gradient-to-br from-slate-50/30 via-white to-slate-100/20">
              {/* Onglet Information */}
              {activeTab === 'information' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-xl">

                {/* Colonne Gauche */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Prénom :</label>
                    <input
                      type="text"
                      value={editedLead?.prenom || ''}
                      onChange={(e) => handleFieldChange('prenom', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Téléphone :</label>
                    <div className="flex gap-2">
                      <input type="text" value="+" className="w-10 px-2 py-3 text-sm border-2 border-slate-300 rounded-xl bg-blue-50/50 font-semibold" readOnly />
                      <input type="text" className="w-20 px-2 py-3 text-sm border-2 border-slate-300 rounded-xl bg-blue-50/50 font-semibold" readOnly />
                      <input
                        type="text"
                        value={editedLead?.telephone || ''}
                        onChange={(e) => handleFieldChange('telephone', e.target.value)}
                        className="flex-1 px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Pays :</label>
                    <input
                      type="text"
                      value={editedLead?.pays || 'France'}
                      onChange={(e) => handleFieldChange('pays', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Adresse :</label>
                    <input
                      type="text"
                      value={editedLead?.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Date :</label>
                    <input
                      type="text"
                      value={editedLead?.dateCreation || ''}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl bg-blue-50/50 font-semibold shadow-sm cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">E-mail :</label>
                    <input
                      type="email"
                      value={editedLead?.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Statut du client :</label>
                    <select
                      value={editedLead?.status_id || ''}
                      onChange={(e) => handleFieldChange('status_id', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl bg-white font-bold focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 shadow-sm hover:border-blue-300"
                    >
                      <option value="">Aucun statut</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id} style={{ color: status.color }}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Activité :</label>
                    <input
                      type="text"
                      value={editedLead?.activite || 'GARAGE'}
                      onChange={(e) => handleFieldChange('activite', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Rendez-vous :</label>
                    <input
                      type="datetime-local"
                      value={editedLead?.rendez_vous ? new Date(editedLead.rendez_vous).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleFieldChange('rendez_vous', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Colonne Droite */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Nom :</label>
                    <input
                      type="text"
                      value={editedLead?.nom || ''}
                      onChange={(e) => handleFieldChange('nom', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl font-bold uppercase focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Portable :</label>
                    <div className="flex gap-2">
                      <input type="text" value="+" className="w-10 px-2 py-3 text-sm border-2 border-slate-300 rounded-xl bg-blue-50/50 font-semibold" readOnly />
                      <input type="text" className="w-20 px-2 py-3 text-sm border-2 border-slate-300 rounded-xl bg-blue-50/50 font-semibold" readOnly />
                      <input
                        type="text"
                        value={editedLead?.portable || ''}
                        onChange={(e) => handleFieldChange('portable', e.target.value)}
                        className="flex-1 px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Ville :</label>
                    <input
                      type="text"
                      value={editedLead?.ville || ''}
                      onChange={(e) => handleFieldChange('ville', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Code postal :</label>
                    <input
                      type="text"
                      value={editedLead?.code_postal || ''}
                      onChange={(e) => handleFieldChange('code_postal', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Date de naissance :</label>
                    <input
                      type="text"
                      value={editedLead?.anniversaire || ''}
                      onChange={(e) => handleFieldChange('anniversaire', e.target.value)}
                      placeholder="jj/mm/aaaa"
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Autre Courriel :</label>
                    <input
                      type="email"
                      value={editedLead?.autre_courriel || ''}
                      onChange={(e) => handleFieldChange('autre_courriel', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">SIRET :</label>
                    <input
                      type="text"
                      value={editedLead?.siret || ''}
                      onChange={(e) => handleFieldChange('siret', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Société :</label>
                    <input
                      type="text"
                      value={editedLead?.societe || ''}
                      onChange={(e) => handleFieldChange('societe', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Source :</label>
                    <input
                      type="text"
                      value={editedLead?.source || ''}
                      onChange={(e) => handleFieldChange('source', e.target.value)}
                      placeholder="Source"
                      className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-semibold shadow-sm hover:border-blue-300"
                    />
                  </div>
                </div>

              </div>

              {/* Zone vendeur */}
              <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 p-6 rounded-2xl border-2 border-slate-300 shadow-xl">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Vendeur assigné :</label>
                <select
                  value={editedLead?.vendeur || ''}
                  onChange={(e) => handleFieldChange('vendeur', e.target.value)}
                  className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white transition-all duration-300 font-bold shadow-sm hover:border-blue-300"
                >
                  <option value="">-- Sélectionner un vendeur --</option>
                  <option value="Super Admin">Super Admin</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.full_name}>
                      {seller.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton Enregistrer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  onClick={handleSaveLead}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <button
                  onClick={() => {
                    setSelectedLeadDetails(null);
                    setEditedLead(null);
                    setActiveTab('information');
                  }}
                  className="w-full sm:w-auto px-8 py-3 text-sm bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-300 hover:text-slate-600 transition-all duration-300 font-extrabold shadow-md hover:shadow-lg"
                >
                  Annuler
                </button>
              </div>
                </>
              )}

              {/* Onglet Mail */}
              {activeTab === 'mail' && editedLead && (
                <div className="bg-white p-4 sm:p-6 rounded border border-gray-300">
                  <ClientEmailSender
                    clientId={editedLead.id}
                    clientName={`${editedLead.prenom} ${editedLead.nom}`}
                    clientEmail={editedLead.email}
                  />
                </div>
              )}

              {/* Onglet Liste commentaire */}
              {activeTab === 'liste-commentaire' && (
                <div className="bg-white p-4 sm:p-6 rounded border border-gray-300">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Liste des commentaires</h3>

                  {/* Formulaire d'ajout de commentaire */}
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ajouter un commentaire
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Écrivez votre commentaire ici..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-blue-500 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={addComment}
                        disabled={!newComment.trim() || addingComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {addingComment ? 'Ajout...' : 'Ajouter le commentaire'}
                      </button>
                    </div>
                  </div>

                  {/* Liste des commentaires */}
                  <div className="space-y-4">
                    {loadingComments ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Chargement des commentaires...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucun commentaire pour le moment</p>
                        <p className="text-xs text-gray-400 mt-1">Ajoutez le premier commentaire ci-dessus</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 sm:gap-4 pb-4 border-b border-gray-200 last:border-b-0 group hover:bg-gray-50 transition-colors rounded-lg p-2">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-slate-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-800">{comment.author_name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  disabled={deletingCommentId === comment.id}
                                  className="p-1 hover:bg-red-100 rounded-full transition-colors group-hover:opacity-100 opacity-0 disabled:opacity-50"
                                  title="Supprimer le commentaire"
                                >
                                  <X className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.comment_text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Onglet Panel client */}
              {activeTab === 'panel-client' && (
                <div className="bg-white p-4 sm:p-6 rounded border border-gray-300">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">Gestion du compte client</h3>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Identifiants de connexion */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 sm:p-6">
                      <h4 className="font-bold text-slate-900 mb-4 text-base sm:text-lg flex items-center gap-2">
                        <LogIn className="w-5 h-5" />
                        Identifiants de connexion
                      </h4>

                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-300">
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Email
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            <input
                              type="email"
                              value={editedLead?.email || ''}
                              onChange={(e) => handleFieldChange('email', e.target.value)}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-blue-500"
                              placeholder="email@exemple.com"
                            />
                            <button
                              onClick={() => {
                                if (editedLead?.email) {
                                  navigator.clipboard.writeText(editedLead.email);
                                  alert('Email copié!');
                                }
                              }}
                              disabled={!editedLead?.email}
                              className="px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              title="Copier l'email"
                            >
                              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="sm:hidden">Copier</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-300">
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Identifiant (SIRET)
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            <input
                              type="text"
                              value={editedLead?.siret || ''}
                              onChange={(e) => handleFieldChange('siret', e.target.value)}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-blue-500"
                              placeholder="Numéro SIRET"
                            />
                            <button
                              onClick={() => {
                                if (editedLead?.siret) {
                                  navigator.clipboard.writeText(editedLead.siret);
                                  alert('SIRET copié!');
                                }
                              }}
                              disabled={!editedLead?.siret}
                              className="px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              title="Copier le SIRET"
                            >
                              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="sm:hidden">Copier</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-300">
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Mot de passe (Code à 6 chiffres)
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={editedLead?.client_password || ''}
                              onChange={(e) => handleFieldChange('client_password', e.target.value)}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded-lg tracking-wider focus:ring-2 focus:ring-slate-500 focus:border-blue-500"
                              placeholder="Code 6 chiffres"
                              maxLength={6}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (editedLead?.client_password) {
                                    navigator.clipboard.writeText(editedLead.client_password);
                                    alert('Mot de passe copié!');
                                  }
                                }}
                                disabled={!editedLead?.client_password}
                                className="flex-1 sm:flex-none px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                title="Copier le mot de passe"
                              >
                                <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="sm:hidden">Copier</span>
                              </button>
                              <button
                                onClick={() => {
                                  const newPassword = (Math.floor(Math.random() * 900000) + 100000).toString();
                                  handleFieldChange('client_password', newPassword);
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                title="Générer un nouveau mot de passe"
                              >
                                🔄
                                <span className="sm:hidden">Générer</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bouton Enregistrer */}
                      <div className="mt-6 pt-4 border-t border-slate-300">
                        <button
                          onClick={async () => {
                            if (!editedLead) return;

                            try {
                              const { error } = await supabase
                                .from('clients')
                                .update({
                                  email: editedLead.email,
                                  siret: editedLead.siret,
                                  client_password: editedLead.client_password
                                })
                                .eq('id', editedLead.id);

                              if (error) {
                                console.error('Erreur:', error);
                                alert('❌ Erreur lors de la sauvegarde des identifiants');
                              } else {
                                alert('✅ Identifiants sauvegardés avec succès!');
                                if (onLeadUpdated) {
                                  onLeadUpdated();
                                }
                              }
                            } catch (error) {
                              console.error('Erreur:', error);
                              alert('❌ Erreur lors de la sauvegarde');
                            }
                          }}
                          disabled={!editedLead?.email || !editedLead?.siret || !editedLead?.client_password}
                          className={`w-full px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                            editedLead?.email && editedLead?.siret && editedLead?.client_password
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                          Enregistrer les identifiants
                        </button>
                      </div>
                    </div>

                    {/* Bouton de connexion au panel client */}
                    {onClientLogin && (
                      <div className="border rounded-lg p-4 bg-blue-50 border-slate-300">
                        <h4 className="font-semibold mb-2 text-slate-900">
                          Accès au panel client
                        </h4>
                        <p className="text-sm mb-4 text-blue-700">
                          Utilisez ce bouton pour vous connecter directement au panel client avec les identifiants de ce lead.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedLeadDetails(null);
                            setEditedLead(null);
                            setActiveTab('information');
                            onClientLogin(editedLead);
                          }}
                          disabled={!editedLead?.siret || !editedLead?.client_password}
                          className={`w-full px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                            editedLead?.siret && editedLead?.client_password
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <LogIn className="w-5 h-5" />
                          Se connecter au panel client
                        </button>
                      </div>
                    )}

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Informations</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Le client se connecte avec son numéro SIRET</p>
                        <p>• Un code à 6 chiffres sera généré automatiquement</p>
                        <p>• Le client recevra ses identifiants de connexion par email</p>
                        <p>• Il pourra accéder à son espace client via la page de connexion</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center ring-2 ring-white/20">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Transférer le Lead</h2>
                    <p className="text-slate-200 text-sm">Assigner à un seller</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTransferModal(false)}
                  disabled={transferring}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-200 hover:rotate-90 disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-slate-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {leadToTransfer ? 'Lead à transférer' : `${selectedLeads.length} lead(s) à transférer`}
                </p>
                {leadToTransfer ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {leadToTransfer.prenom} {leadToTransfer.nom}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{leadToTransfer.email}</p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedLeads.length} lead(s) sélectionné(s)
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Sélectionner un Seller
                </label>
                <select
                  value={selectedSellerId}
                  onChange={(e) => setSelectedSellerId(e.target.value)}
                  disabled={transferring}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Choisir un seller --</option>
                  {superAdmin && (
                    <option key={superAdmin.id} value={superAdmin.id}>
                      {superAdmin.full_name} ({superAdmin.email}) - Super Admin
                    </option>
                  )}
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.full_name} ({seller.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-end gap-4">
              <button
                onClick={confirmTransfer}
                disabled={!selectedSellerId || transferring}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {transferring ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Transfert en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Confirmer le transfert
                  </>
                )}
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                disabled={transferring}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;
