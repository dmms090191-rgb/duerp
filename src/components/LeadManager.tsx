import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, List, User, Mail, Phone, Lock, Calendar, Hash, Trash2, CheckSquare, Square, UserCheck, ArrowRight, LogIn, Eye, X, Building2, FileText, Smartphone, Briefcase, Building, Tag, Shield } from 'lucide-react';
import { Lead } from '../types/Lead';
import { leadService } from '../services/leadService';
import { statusService } from '../services/statusService';
import { sellerService } from '../services/sellerService';
import { adminService } from '../services/adminService';
import { Status } from '../types/Status';
import ClientEmailSender from './ClientEmailSender';

interface Seller {
  id: string;
  full_name: string;
  email: string;
}

interface LeadManagerProps {
  leads: Lead[];
  onLeadCreated: (lead: Lead) => void;
  onLeadsDeleted: (leadIds: number[]) => void;
  onLeadsTransferred?: (leadIds: number[]) => void;
  currentUserEmail?: string;
  onClientLogin?: (lead: Lead) => void;
}

const LeadManager: React.FC<LeadManagerProps> = ({ leads, onLeadCreated, onLeadsDeleted, onLeadsTransferred, currentUserEmail, onClientLogin }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showAssignSellerModal, setShowAssignSellerModal] = useState(false);
  const [selectedSellerForAssignment, setSelectedSellerForAssignment] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [superAdmin, setSuperAdmin] = useState<any>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const passwordInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    portable: '',
    societe: '',
    siret: '',
    activite: '',
    rendezVous: '',
    statusId: '',
    vendeur: ''
  });

  useEffect(() => {
    loadStatuses();
    loadSellers();
    loadSuperAdmin();
  }, []);

  const loadStatuses = async () => {
    try {
      const fetchedStatuses = await statusService.getAllStatuses();
      setStatuses(fetchedStatuses);
    } catch (error) {
      console.error('Erreur lors du chargement des statuts:', error);
    }
  };

  const loadSellers = async () => {
    try {
      const data = await sellerService.getAllSellers();
      const formattedSellers = data.map((seller: any) => ({
        id: seller.id,
        full_name: seller.full_name,
        email: seller.email
      }));
      setSellers(formattedSellers);
    } catch (error) {
      console.error('Erreur lors du chargement des sellers:', error);
    }
  };

  const loadSuperAdmin = async () => {
    try {
      const admin = await adminService.getSuperAdmin();
      setSuperAdmin(admin);
      console.log('✅ Super admin chargé (LeadManager):', admin);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du super admin:', error);
    }
  };

  const generateId = (): string => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const generatePassword = (): string => {
    return (Math.floor(Math.random() * 900000) + 100000).toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
      alert('❌ Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, Téléphone)');
      return;
    }

    const newPassword = generatePassword();
    setGeneratedPassword(newPassword);
    setShowGeneratedPassword(true);

    console.log('🔵 [LeadManager v2.1] Début de la soumission du formulaire');
    console.log('🔵 [LeadManager v2.1] Données du formulaire:', formData);
    console.log('🔵 [LeadManager v2.1] Mot de passe généré:', newPassword);

    try {
      const leadData = {
        email: formData.email,
        full_name: `${formData.prenom} ${formData.nom}`,
        nom: formData.nom,
        prenom: formData.prenom,
        phone: formData.telephone,
        portable: formData.portable || null,
        company_name: formData.societe || null,
        siret: formData.siret || null,
        activite: formData.activite || null,
        rendez_vous: formData.rendezVous ? new Date(formData.rendezVous).toISOString() : null,
        status_id: formData.statusId || null,
        conseiller: formData.vendeur || null,
        client_password: newPassword,
        status: 'new',
        source: 'CRM',
        notes: `Créé par ${currentUserEmail || 'Admin'}`
      };

      console.log('🔵 [LeadManager v2.1] Appel de leadService.createLead avec:', leadData);

      const createdLead = await leadService.createLead(leadData);

      console.log('🔵 [LeadManager v2.1] Lead créé dans Supabase:', createdLead);

      const newLead: Lead = {
        id: createdLead.id,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: newPassword,
        telephone: formData.telephone,
        portable: formData.portable || '',
        societe: formData.societe || '',
        siret: formData.siret || '',
        activite: formData.activite || '',
        rendez_vous: formData.rendezVous || '',
        conseiller: formData.vendeur || '',
        status_id: formData.statusId || undefined,
        dateCreation: new Date(createdLead.created_at).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        creePar: currentUserEmail || 'Admin',
        client_password: newPassword
      };

      console.log('🔵 [LeadManager v2.1] Appel de onLeadCreated avec:', newLead);
      onLeadCreated(newLead);

      console.log('✅ [LeadManager v2.1] SUCCESS COMPLET!');

      alert(`✅ Lead créé avec succès!\n\nMot de passe généré: ${newPassword}\n\nLe lead ${formData.prenom} ${formData.nom} a été créé et apparaît maintenant dans la liste.`);

      setTimeout(() => {
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          portable: '',
          societe: '',
          siret: '',
          activite: '',
          rendezVous: '',
          statusId: '',
          vendeur: ''
        });
        setShowGeneratedPassword(false);
        setGeneratedPassword('');

        console.log('🔵 [LeadManager v2.1] Changement vers onglet list');
        setActiveTab('list');
      }, 3000);

    } catch (error: any) {
      console.error('❌ [LeadManager v2.1] ERREUR CAPTURÉE:', error);
      console.error('❌ [LeadManager v2.1] Type erreur:', typeof error);
      console.error('❌ [LeadManager v2.1] Message:', error.message);
      console.error('❌ [LeadManager v2.1] Stack:', error.stack);
      alert(`❌ ERREUR lors de la création du lead:\n\n${error.message}\n\nVeuillez vérifier la console pour plus de détails.`);
    }
  };

  const handleSelectLead = (leadId: number) => {
    console.log('🔵 SELECTION - Lead ID cliqué:', leadId, 'Type:', typeof leadId);
    setSelectedLeads(prev => {
      const newSelection = prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId];
      console.log('🔵 SELECTION - Ancienne sélection:', prev);
      console.log('🔵 SELECTION - Nouvelle sélection:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const handleDeleteSelected = async () => {
    console.log('🔴 DELETE CLICKED - selectedLeads:', selectedLeads);
    console.log('🔴 DELETE CLICKED - selectedLeads.length:', selectedLeads.length);

    if (selectedLeads.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins un lead à supprimer en cliquant sur les cases à cocher.');
      return;
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedLeads.length} lead(s) ?\n\nCette action est irréversible.`
    );

    console.log('🔴 DELETE - Confirmation:', confirmDelete);

    if (!confirmDelete) {
      return;
    }

    try {
      console.log('🗑️ DEBUT SUPPRESSION - IDs:', selectedLeads);
      const result = await leadService.deleteMultipleLeads(selectedLeads);
      console.log('✅ SUPPRESSION DB OK - Résultat:', result);

      await onLeadsDeleted(selectedLeads);
      console.log('✅ CALLBACK OK - État mis à jour');

      setSelectedLeads([]);
      console.log('✅ SELECTION CLEARED');

      alert(`✅ ${selectedLeads.length} lead(s) supprimé(s) avec succès !`);
    } catch (error: any) {
      console.error('❌ ERREUR SUPPRESSION:', error);
      console.error('❌ ERREUR STACK:', error.stack);
      alert(`❌ Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleTransferSelected = async () => {
    if (selectedLeads.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins un lead à transférer.');
      return;
    }

    if (!onLeadsTransferred) {
      alert('⚠️ Fonction de transfert non disponible.');
      return;
    }

    const confirmTransfer = window.confirm(
      `Êtes-vous sûr de vouloir transférer ${selectedLeads.length} lead(s) vers Clients ?\n\nCes leads seront déplacés et deviendront des clients.`
    );

    if (!confirmTransfer) {
      return;
    }

    try {
      console.log('🔄 DÉBUT TRANSFERT - IDs:', selectedLeads);
      await onLeadsTransferred(selectedLeads);
      console.log('✅ TRANSFERT OK');
      setSelectedLeads([]);
      alert(`✅ ${selectedLeads.length} lead(s) transféré(s) avec succès vers Clients !`);
    } catch (error: any) {
      console.error('❌ ERREUR TRANSFERT:', error);
      alert(`❌ Erreur lors du transfert: ${error.message}`);
    }
  };

  const handleOpenAssignSellerModal = () => {
    if (selectedLeads.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins un lead.');
      return;
    }
    setSelectedSellerForAssignment('');
    setShowAssignSellerModal(true);
  };

  const handleAssignSeller = async () => {
    if (!selectedSellerForAssignment) {
      alert('⚠️ Veuillez sélectionner un vendeur.');
      return;
    }

    if (selectedLeads.length === 0) {
      return;
    }

    setAssigning(true);
    try {
      // Vérifier si c'est le super admin ou un seller
      const isSuperAdmin = superAdmin && selectedSellerForAssignment === superAdmin.id;
      const selectedSeller = isSuperAdmin ? null : sellers.find(s => s.id === selectedSellerForAssignment);

      if (!isSuperAdmin && !selectedSeller) {
        alert('⚠️ Vendeur introuvable.');
        return;
      }

      const assigneeName = isSuperAdmin ? superAdmin.full_name : selectedSeller!.full_name;
      console.log(`🔄 Attribution de ${selectedLeads.length} lead(s) à ${assigneeName}`);

      // Préparer les données à mettre à jour
      const updateData: any = {};

      // Assigner le conseiller (seller ou super admin)
      if (isSuperAdmin) {
        updateData.conseiller = superAdmin.full_name;
        updateData.assigned_agent = superAdmin.id;
        console.log('✅ Attribution au super admin:', superAdmin.full_name);
      } else if (selectedSeller) {
        updateData.conseiller = selectedSeller.full_name;
        // Si le super admin existe, l'assigner aussi automatiquement
        if (superAdmin) {
          updateData.assigned_agent = superAdmin.id;
          console.log('✅ Conseiller:', selectedSeller.full_name, '+ Super admin:', superAdmin.full_name);
        }
      }

      // Mettre à jour tous les leads sélectionnés avec le nouveau conseiller et le super admin
      for (const leadId of selectedLeads) {
        await leadService.updateLead(leadId, updateData);
      }

      console.log('✅ Attribution OK');
      setShowAssignSellerModal(false);
      setSelectedSellerForAssignment('');
      setSelectedLeads([]);
      alert(`✅ ${selectedLeads.length} lead(s) attribué(s) à ${assigneeName} avec succès !`);
    } catch (error: any) {
      console.error('❌ ERREUR ATTRIBUTION:', error);
      alert(`❌ Erreur lors de l'attribution: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gradient-to-br from-[#1a2847] via-[#2d4578] to-[#1e3a5f]">
      {/* Left Navigation Sidebar */}
      <div className="w-full md:w-80 bg-gradient-to-b from-[#1e3a5f] to-[#2d4578] border-r border-white/10 p-4 md:p-6">
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Navigation</h3>
            <p className="text-sm text-white/70">Gestionnaire de leads</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'add'
                  ? 'bg-white/20 text-white border-2 border-white/30'
                  : 'text-white/70 hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              <Plus className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Ajouter un lead</div>
                <div className="text-xs text-white/60">Créer un nouveau prospect</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'list'
                  ? 'bg-white/20 text-white border-2 border-white/30'
                  : 'text-white/70 hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              <List className="w-4 h-4" />
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center justify-between">
                  Leads créés
                  {leads.length > 0 && (
                    <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full border border-white/30">
                      {leads.length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/60">Voir tous les prospects</div>
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 p-4 bg-white/10 rounded-lg border-2 border-white/20 backdrop-blur-xl">
            <h4 className="font-medium text-white mb-3">Statistiques</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Total leads</span>
                <span className="font-medium text-white">{leads.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Ajoutés aujourd'hui</span>
                <span className="font-medium text-white">
                  {leads.filter(lead =>
                    lead.dateCreation.includes(new Date().toLocaleDateString('fr-FR'))
                  ).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto">
        <div className="w-full">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg">
                <span className="md:hidden">Gestion Lead</span>
                <span className="hidden md:inline">Gestionnaire de leads</span>
              </h1>
              <span className="px-2 py-1 md:px-3 md:py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">v2.1</span>
            </div>
            <p className="text-sm md:text-base text-blue-200 font-medium">Gérez vos prospects et suivez vos opportunités commerciales</p>
          </div>

          {activeTab === 'add' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 backdrop-blur-2xl">
              <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative flex items-center gap-2 sm:gap-3 md:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight">
                      Ajouter un lead
                    </h2>
                    <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium">Créez un nouveau prospect</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xs font-semibold text-blue-300 mb-4 uppercase tracking-wide">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="prenom" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                        placeholder="Prénom"
                        required
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="nom" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Nom *
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                        placeholder="Nom de famille"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xs font-semibold text-blue-300 mb-4 uppercase tracking-wide">Contact</h3>
                  <div className="space-y-4">
                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="email" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                        placeholder="email@exemple.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                        <label htmlFor="telephone" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          id="telephone"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                          placeholder="+33 1 23 45 67 89"
                          required
                        />
                      </div>

                      <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                        <label htmlFor="portable" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                          Portable
                        </label>
                        <input
                          type="tel"
                          id="portable"
                          name="portable"
                          value={formData.portable}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xs font-semibold text-blue-300 mb-4 uppercase tracking-wide">Entreprise</h3>
                  <div className="space-y-4">
                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="societe" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Société
                      </label>
                      <input
                        type="text"
                        id="societe"
                        name="societe"
                        value={formData.societe}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                        placeholder="Nom de la société"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                        <label htmlFor="siret" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                          SIRET
                        </label>
                        <input
                          type="text"
                          id="siret"
                          name="siret"
                          value={formData.siret}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                          placeholder="123 456 789 00012"
                        />
                      </div>

                      <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                        <label htmlFor="activite" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                          Activité
                        </label>
                        <input
                          type="text"
                          id="activite"
                          name="activite"
                          value={formData.activite}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                          placeholder="Secteur d'activité"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xs font-semibold text-blue-300 mb-4 uppercase tracking-wide">Gestion du lead</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="rendezVous" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Rendez-vous
                      </label>
                      <input
                        type="datetime-local"
                        id="rendezVous"
                        name="rendezVous"
                        value={formData.rendezVous}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="statusId" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Statut du client
                      </label>
                      <select
                        id="statusId"
                        name="statusId"
                        value={formData.statusId}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
                      >
                        <option value="">Sélectionner un statut</option>
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xs font-semibold text-blue-300 mb-4 uppercase tracking-wide">Vendeur assigné</h3>
                  <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                    <select
                      id="vendeur"
                      name="vendeur"
                      value={formData.vendeur}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50"
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
                </div>

                {showGeneratedPassword && generatedPassword && (
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl p-4 sm:p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center ring-2 ring-green-400/30 shadow-lg">
                        <Lock className="w-6 h-6 text-green-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-green-200 uppercase tracking-wide">Mot de passe généré</h4>
                        <p className="text-xs text-green-300">Code à 6 chiffres</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="w-12 h-14 sm:w-14 sm:h-16 bg-white/90 rounded-lg flex items-center justify-center shadow-lg border-2 border-green-400/50">
                          <span className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">{generatedPassword[index] || '0'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20"
                  >
                    <Plus className="w-5 h-5" />
                    Créer le lead
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leads List */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Information:</strong> Les leads créés peuvent se connecter sur la page <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">/client-login</span> avec leur email et mot de passe pour accéder au panel client.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                  <List className="w-6 h-6 text-slate-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">Leads créés</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {leads.length}
                  </span>
                  </div>
                  
                  {selectedLeads.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedLeads.length} sélectionné{selectedLeads.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lead créé</h3>
                  <p className="text-gray-500 mb-6">Commencez par ajouter votre premier lead</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un lead
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
                            title={selectedLeads.length === leads.length ? "Désélectionner tout" : "Sélectionner tout"}
                          >
                            {selectedLeads.length === leads.length ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Rendez-vous
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Statut du client
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Prénom
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nom
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Téléphone
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            Portable
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            E-mail
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Activité
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Société
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            SIRET
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Vendeur
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Créé le
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSelectLead(lead.id)}
                              className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-slate-600 transition-colors"
                            >
                              {selectedLeads.includes(lead.id) ? (
                                <CheckSquare className="w-5 h-5 text-slate-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="datetime-local"
                              value={lead.rendez_vous ? new Date(lead.rendez_vous).toISOString().slice(0, 16) : ''}
                              onChange={async (e) => {
                                if (e.target.value) {
                                  try {
                                    await leadService.updateLead(lead.id, {
                                      rendez_vous: new Date(e.target.value).toISOString()
                                    });
                                    alert('✅ Rendez-vous mis à jour !');
                                  } catch (error) {
                                    alert('❌ Erreur lors de la mise à jour');
                                  }
                                }
                              }}
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lead.status?.name || 'Aucun'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.prenom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.nom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.telephone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.portable || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.activite || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.societe || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.siret || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={lead.conseiller || '-'}>
                            {lead.conseiller || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.dateCreation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <h3 className="text-xl font-bold">Détails du Lead</h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedLead(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* ID et Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">ID:</span>
                  <span className="text-lg font-bold text-gray-900">#{selectedLead.id}</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedLead.creePar || 'Admin'}
                </span>
              </div>

              {/* Informations personnelles */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">Informations personnelles</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Nom</p>
                      <p className="font-medium text-gray-900">{selectedLead.nom}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Prénom</p>
                      <p className="font-medium text-gray-900">{selectedLead.prenom}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{selectedLead.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                      <p className="font-medium text-gray-900">{selectedLead.telephone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Identifiants */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">Identifiants de connexion</h4>

                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mot de passe</p>
                    <p className="font-mono font-medium text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">{selectedLead.motDePasse}</p>
                  </div>
                </div>
              </div>

              {/* Date de création */}
              <div className="flex items-center gap-3 text-sm text-gray-600 border-t pt-4">
                <Calendar className="w-4 h-4" />
                <span>Créé le {selectedLead.dateCreation}</span>
              </div>

              {/* Envoi d'emails */}
              <div className="border-t pt-6">
                <ClientEmailSender
                  clientId={selectedLead.id}
                  clientName={`${selectedLead.prenom} ${selectedLead.nom}`}
                  clientEmail={selectedLead.email}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                {onClientLogin && (
                  <button
                    onClick={() => {
                      onClientLogin(selectedLead);
                      setShowModal(false);
                      setSelectedLead(null);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Se connecter en tant que ce client
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'attribution à un vendeur */}
      {showAssignSellerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Attribuer à un vendeur
                </h3>
                <button
                  onClick={() => setShowAssignSellerModal(false)}
                  disabled={assigning}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Vous allez attribuer <span className="font-semibold text-gray-900">{selectedLeads.length} lead(s)</span> à un vendeur.
                </p>

                <label htmlFor="seller-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionnez un vendeur
                </label>
                <select
                  id="seller-select"
                  value={selectedSellerForAssignment}
                  onChange={(e) => setSelectedSellerForAssignment(e.target.value)}
                  disabled={assigning}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Sélectionner un vendeur --</option>
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

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAssignSellerModal(false)}
                  disabled={assigning}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignSeller}
                  disabled={!selectedSellerForAssignment || assigning}
                  className="flex-1 px-4 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Attribution...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Attribuer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      {selectedLeads.length > 0 && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <button
            onClick={handleOpenAssignSellerModal}
            className="w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
            title="Attribuer à un vendeur"
          >
            <UserCheck className="w-6 h-6" />
            <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Attribuer
            </span>
          </button>
          {onLeadsTransferred && (
            <button
              onClick={handleTransferSelected}
              className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
              title="Transférer"
            >
              <ArrowRight className="w-6 h-6" />
              <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Transférer
              </span>
            </button>
          )}
          <button
            onClick={handleDeleteSelected}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
            title="Supprimer"
          >
            <Trash2 className="w-6 h-6" />
            <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Supprimer
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
export default LeadManager;