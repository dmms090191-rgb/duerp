import React, { useState } from 'react';
import { Users, Plus, List, User, Mail, Phone, Lock, Calendar, Hash, Trash2, CheckSquare, Square, UserCheck, ArrowRight, LogIn, Eye, X } from 'lucide-react';
import { Lead } from '../types/Lead';
import { leadService } from '../services/leadService';

interface LeadManagerProps {
  leads: Lead[];
  onLeadCreated: (lead: Lead) => void;
  onLeadsDeleted: (leadIds: string[]) => void;
  onLeadsTransferred?: (leadIds: string[]) => void;
  currentUserEmail?: string;
  onClientLogin?: (lead: Lead) => void;
}

const LeadManager: React.FC<LeadManagerProps> = ({ leads, onLeadCreated, onLeadsDeleted, onLeadsTransferred, currentUserEmail, onClientLogin }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: ''
  });

  const generateId = (): string => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 [LeadManager v2.0] Début de la soumission du formulaire');
    console.log('🔵 [LeadManager v2.0] Données du formulaire:', formData);

    try {
      const leadData = {
        email: formData.email,
        full_name: `${formData.prenom} ${formData.nom}`,
        phone: formData.telephone,
        status: 'new',
        source: 'CRM',
        notes: `Créé par ${currentUserEmail || 'Admin'}`
      };

      console.log('🔵 [LeadManager v2.0] Appel de leadService.createLead avec:', leadData);

      const createdLead = await leadService.createLead(leadData);

      console.log('🔵 [LeadManager v2.0] Lead créé dans Supabase:', createdLead);

      const newLead: Lead = {
        id: createdLead.id,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        telephone: formData.telephone,
        dateCreation: new Date(createdLead.created_at).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        creePar: currentUserEmail || 'Admin'
      };

      console.log('🔵 [LeadManager v2.0] Appel de onLeadCreated avec:', newLead);
      onLeadCreated(newLead);

      console.log('✅ [LeadManager v2.0] SUCCESS COMPLET!');

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        telephone: ''
      });

      console.log('🔵 [LeadManager v2.0] Changement vers onglet list');
      setActiveTab('list');
    } catch (error: any) {
      console.error('❌ [LeadManager v2.0] ERREUR CAPTURÉE:', error);
      console.error('❌ [LeadManager v2.0] Type erreur:', typeof error);
      console.error('❌ [LeadManager v2.0] Message:', error.message);
      console.error('❌ [LeadManager v2.0] Stack:', error.stack);
    }
  };

  const handleSelectLead = (leadId: string) => {
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

  return (
    <div className="flex h-full">
      {/* Left Navigation Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation</h3>
            <p className="text-sm text-gray-600">Gestionnaire de leads</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'add'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <Plus className="w-5 h-5" />
              <div>
                <div className="font-medium">Ajouter un lead</div>
                <div className="text-xs text-gray-500">Créer un nouveau prospect</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'list'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <List className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-medium flex items-center justify-between">
                  Leads créés
                  {leads.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {leads.length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">Voir tous les prospects</div>
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Statistiques</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total leads</span>
                <span className="font-medium text-gray-900">{leads.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ajoutés aujourd'hui</span>
                <span className="font-medium text-gray-900">
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
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Gestionnaire de leads</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">v2.1</span>
            </div>
            <p className="text-gray-600">Gérez vos prospects et suivez vos opportunités commerciales</p>
          </div>

          {/* Bulk Import */}
          {/* Add Lead Form */}
          {activeTab === 'add' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Ajouter un lead</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nom de famille"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Prénom"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="motDePasse"
                      name="motDePasse"
                      value={formData.motDePasse}
                      onChange={handleInputChange}
                      autoComplete="off"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+33 1 23 45 67 89"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    Valider
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
                  <List className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">Leads créés</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {leads.length}
                  </span>
                  </div>
                  
                  {selectedLeads.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {selectedLeads.length} sélectionné{selectedLeads.length > 1 ? 's' : ''}
                      </span>
                      {onLeadsTransferred && (
                        <button
                          onClick={handleTransferSelected}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Transférer
                        </button>
                      )}
                      <button
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
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
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un lead
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                            <Hash className="w-4 h-4" />
                            ID
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
                            <User className="w-4 h-4" />
                            Prénom
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Mot de passe
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
                            <Calendar className="w-4 h-4" />
                            Date de création
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Créé par
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSelectLead(lead.id)}
                              className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              {selectedLeads.includes(lead.id) ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{lead.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.nom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.prenom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {lead.motDePasse}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.telephone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.dateCreation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lead.creePar || 'Admin'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Détail
                              </button>
                            </div>
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
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl flex items-center justify-between">
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
    </div>
  );
};
export default LeadManager;