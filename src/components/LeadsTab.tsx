import React from 'react';
import { Users, Search, Mail, Phone, Calendar, Trash2, LogIn, Eye, X, UserPlus, ArrowDown, ArrowUp, Tag } from 'lucide-react';
import { Lead } from '../types/Lead';
import { sellerService } from '../services/sellerService';
import { statusService } from '../services/statusService';
import { clientService } from '../services/clientService';
import { Status } from '../types/Status';
import { supabase } from '../lib/supabase';

interface Seller {
  id: string;
  full_name: string;
  email: string;
}

interface LeadsTabProps {
  leads: Lead[];
  onLeadsDeleted: (leadIds: string[]) => void;
  onClientLogin?: (lead: Lead) => void;
  onStatusChanged?: (leadId: string, statusId: string | null) => void;
}

const LeadsTab: React.FC<LeadsTabProps> = ({ leads, onLeadsDeleted, onClientLogin, onStatusChanged }) => {
  console.log('🟢 LeadsTab rendered with leads:', leads.length, 'first lead:', leads[0]);
  const [searchId, setSearchId] = React.useState('');
  const [searchEmail, setSearchEmail] = React.useState('');
  const [searchPhone, setSearchPhone] = React.useState('');
  const [searchNom, setSearchNom] = React.useState('');
  const [searchPrenom, setSearchPrenom] = React.useState('');
  const [selectedLeads, setSelectedLeads] = React.useState<string[]>([]);
  const [selectedLeadDetails, setSelectedLeadDetails] = React.useState<Lead | null>(null);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [leadToTransfer, setLeadToTransfer] = React.useState<Lead | null>(null);
  const [sellers, setSellers] = React.useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = React.useState('');
  const [transferring, setTransferring] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
  const [statuses, setStatuses] = React.useState<Status[]>([]);
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

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
    const matchesId = searchId === '' || lead.id.toLowerCase().includes(searchId.toLowerCase());
    const matchesEmail = searchEmail === '' || lead.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesPhone = searchPhone === '' || lead.telephone.includes(searchPhone);
    const matchesNom = searchNom === '' || lead.nom.toLowerCase().includes(searchNom.toLowerCase());
    const matchesPrenom = searchPrenom === '' || lead.prenom.toLowerCase().includes(searchPrenom.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'none' && !lead.status_id) ||
                         (lead.status_id === filterStatus);

    return matchesId && matchesEmail && matchesPhone && matchesNom && matchesPrenom && matchesStatus;
  }).sort((a, b) => {
    const dateA = parseDate(a.dateCreation).getTime();
    const dateB = parseDate(b.dateCreation).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleSelectLead = (leadId: string) => {
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

      const numericIds = selectedLeads.map(id => parseInt(id));
      console.log('🔴 numericIds:', numericIds);

      console.log('🔴 Appel Supabase DELETE...');
      const { data, error } = await supabase
        .from('leads')
        .delete()
        .in('id', numericIds)
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

  React.useEffect(() => {
    loadSellers();
    loadStatuses();
  }, []);

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
      const selectedSeller = sellers.find(s => s.id === selectedSellerId);
      if (!selectedSeller) return;

      const leadsToTransfer = leadToTransfer ? [leadToTransfer.id] : selectedLeads;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/clients?id=in.(${leadsToTransfer.join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assigned_agent_name: selectedSeller.full_name,
          }),
        }
      );

      if (response.ok) {
        setShowTransferModal(false);
        setLeadToTransfer(null);
        setSelectedLeads([]);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error transferring lead:', error);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Leads</h2>
            <p className="text-green-100">Vue d'ensemble de tous vos leads</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl font-bold">{leads.length}</div>
            <div className="text-sm text-green-100">Total</div>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchNom}
                onChange={(e) => setSearchNom(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par prénom..."
                value={searchPrenom}
                onChange={(e) => setSearchPrenom(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
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
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={sortOrder === 'newest' ? 'Du plus récent au moins récent' : 'Du moins récent au plus récent'}
            >
              {sortOrder === 'newest' ? (
                <>
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Plus récent</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Plus ancien</span>
                </>
              )}
            </button>
          </div>
        </div>

        {selectedLeads.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedLeads.length} lead(s) sélectionné(s)
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTransferSelected}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Transférer
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        )}

        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">Aucun lead trouvé</p>
            <p className="text-gray-400 text-sm">
              {(searchId || searchEmail || searchPhone || searchNom || searchPrenom) ? 'Essayez de modifier vos critères de recherche' : 'Aucun lead disponible'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Téléphone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date de création</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const leadDate = new Date(lead.dateCreation);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  const isRecent = leadDate >= weekAgo;

                  return (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                            {lead.prenom[0]}{lead.nom[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lead.prenom} {lead.nom}</p>
                            <p className="text-sm text-gray-500">ID: {lead.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {lead.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {lead.telephone}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {lead.dateCreation}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={lead.status_id || ''}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          disabled={updatingStatus === lead.id.toString()}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          style={lead.status ? { color: lead.status.color, fontWeight: '600' } : {}}
                        >
                          <option value="">Aucun statut</option>
                          {statuses.map((status) => (
                            <option
                              key={status.id}
                              value={status.id}
                              style={{ color: status.color, fontWeight: '600' }}
                            >
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setSelectedLeadDetails(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLeadDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center ring-2 ring-white/50">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Détails du Lead</h2>
                    <p className="text-emerald-50 text-sm">Informations complètes du prospect</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLeadDetails(null)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedLeadDetails.prenom} {selectedLeadDetails.nom}
                    </h3>
                    <p className="text-sm text-gray-600">Prospect principal</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Adresse Email
                  </label>
                  <div className="bg-white border-2 border-gray-200 group-hover:border-emerald-400 px-5 py-4 rounded-xl transition-all duration-200 shadow-sm">
                    <p className="text-base font-medium text-gray-900 break-all">{selectedLeadDetails.email}</p>
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Numéro de Téléphone
                  </label>
                  <div className="bg-white border-2 border-gray-200 group-hover:border-emerald-400 px-5 py-4 rounded-xl transition-all duration-200 shadow-sm">
                    <p className="text-base font-medium text-gray-900">{selectedLeadDetails.telephone}</p>
                  </div>
                </div>

                {selectedLeadDetails.motDePasse && (
                  <div className="group md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Mot de Passe
                    </label>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 px-5 py-4 rounded-xl shadow-sm">
                      <p className="text-base font-mono font-semibold text-gray-900">{selectedLeadDetails.motDePasse}</p>
                    </div>
                  </div>
                )}

                <div className="group md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Date de Création
                  </label>
                  <div className="bg-white border-2 border-gray-200 group-hover:border-emerald-400 px-5 py-4 rounded-xl transition-all duration-200 shadow-sm">
                    <p className="text-base font-medium text-gray-900">{selectedLeadDetails.dateCreation}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-end gap-4">
              {onClientLogin && (
                <button
                  onClick={() => {
                    onClientLogin(selectedLeadDetails);
                    setSelectedLeadDetails(null);
                  }}
                  className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogIn className="w-5 h-5" />
                  Se connecter en tant que ce client
                </button>
              )}
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center ring-2 ring-white/50">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Transférer le Lead</h2>
                    <p className="text-emerald-50 text-sm">Assigner à un seller</p>
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
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
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
                  <Users className="w-4 h-4 text-emerald-600" />
                  Sélectionner un Seller
                </label>
                <select
                  value={selectedSellerId}
                  onChange={(e) => setSelectedSellerId(e.target.value)}
                  disabled={transferring}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Choisir un seller --</option>
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
                className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
