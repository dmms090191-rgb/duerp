import React, { useRef, useState } from 'react';
import { X, RefreshCw, MessageSquare, LogIn, Copy, Check, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Status } from '../types/Status';
import ClientEmailSender from './ClientEmailSender';

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
  source?: string;
  client_password?: string;
  client_account_created?: boolean;
}

interface SellerClientModalProps {
  client: Client;
  editedClient: Client;
  statuses: Status[];
  modalTab: 'information' | 'liste-commentaire' | 'mail' | 'panel-client';
  saving: boolean;
  comments: any[];
  newComment: string;
  loadingComments: boolean;
  addingComment: boolean;
  deletingCommentId: string | null;
  copiedEmail: boolean;
  copiedPassword: boolean;
  sellerFullName: string;
  onClose: () => void;
  onTabChange: (tab: 'information' | 'liste-commentaire' | 'mail' | 'panel-client') => void;
  onFieldChange: (field: keyof Client, value: any) => void;
  onSave: () => void;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onCopyToClipboard: (text: string, type: 'email' | 'password') => void;
  onClientLogin?: (client: Client) => void;
}

const SellerClientModal: React.FC<SellerClientModalProps> = ({
  client,
  editedClient,
  statuses,
  modalTab,
  saving,
  comments,
  newComment,
  loadingComments,
  addingComment,
  deletingCommentId,
  copiedEmail,
  copiedPassword,
  sellerFullName,
  onClose,
  onTabChange,
  onFieldChange,
  onSave,
  onCommentChange,
  onAddComment,
  onDeleteComment,
  onCopyToClipboard,
  onClientLogin,
}) => {
  const passwordInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);

  const handlePasswordDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const currentPassword = editedClient?.client_password || '000000';
    const passwordArray = currentPassword.padEnd(6, '0').split('').slice(0, 6);

    if (value === '') {
      passwordArray[index] = '0';
    } else {
      const newDigit = value.slice(-1);
      passwordArray[index] = newDigit;

      setTimeout(() => {
        if (index < 5) {
          passwordInputRefs.current[index + 1]?.focus();
          passwordInputRefs.current[index + 1]?.select();
        }
      }, 0);
    }

    const newPassword = passwordArray.join('');
    onFieldChange('client_password', newPassword);
  };

  const handlePasswordKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentPassword = editedClient?.client_password || '000000';
      const passwordArray = currentPassword.padEnd(6, '0').split('').slice(0, 6);

      if (passwordArray[index] === '0' && index > 0) {
        e.preventDefault();
        passwordInputRefs.current[index - 1]?.focus();
        passwordInputRefs.current[index - 1]?.select();
      } else {
        passwordArray[index] = '0';
        const newPassword = passwordArray.join('');
        onFieldChange('client_password', newPassword);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      passwordInputRefs.current[index - 1]?.focus();
      passwordInputRefs.current[index - 1]?.select();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      passwordInputRefs.current[index + 1]?.focus();
      passwordInputRefs.current[index + 1]?.select();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a2847]/95 via-[#2d4578]/95 to-[#1a2847]/95 backdrop-blur-xl flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-3 sm:px-8 py-4 sm:py-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-base sm:text-3xl font-extrabold text-white uppercase tracking-tight drop-shadow-lg">
              CLIENT - {client.prenom} {client.nom}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-xl rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 ring-2 ring-white/20"
            >
              <X className="w-5 h-5 text-white drop-shadow" />
            </button>
          </div>
        </div>

        <div className="border-b-2 border-white/10 overflow-x-auto bg-gradient-to-r from-[#1e3a5f]/80 via-[#2d4578]/80 to-[#1e3a5f]/80 backdrop-blur-sm">
          <div className="flex gap-1 sm:gap-2 px-3 sm:px-6 min-w-max">
            <button
              onClick={() => onTabChange('information')}
              className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap relative ${
                modalTab === 'information'
                  ? 'text-white bg-gradient-to-r from-[#2d4578] to-[#1a2847] shadow-lg rounded-t-xl -mb-0.5 border-t-4 border-blue-400/50 transform scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t-lg'
              }`}
            >
              Information
            </button>
            <button
              onClick={() => onTabChange('liste-commentaire')}
              className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap relative ${
                modalTab === 'liste-commentaire'
                  ? 'text-white bg-gradient-to-r from-[#2d4578] to-[#1a2847] shadow-lg rounded-t-xl -mb-0.5 border-t-4 border-blue-400/50 transform scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t-lg'
              }`}
            >
              Liste commentaire
            </button>
            <button
              onClick={() => onTabChange('mail')}
              className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap relative ${
                modalTab === 'mail'
                  ? 'text-white bg-gradient-to-r from-[#2d4578] to-[#1a2847] shadow-lg rounded-t-xl -mb-0.5 border-t-4 border-blue-400/50 transform scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t-lg'
              }`}
            >
              Mail
            </button>
            <button
              onClick={() => onTabChange('panel-client')}
              className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap relative ${
                modalTab === 'panel-client'
                  ? 'text-white bg-gradient-to-r from-[#2d4578] to-[#1a2847] shadow-lg rounded-t-xl -mb-0.5 border-t-4 border-blue-400/50 transform scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t-lg'
              }`}
            >
              Panel client
            </button>
          </div>
          <div className="px-3 sm:px-6 py-2 bg-[#1a2847]/60">
            <p className="text-xs text-blue-200 font-medium">{client.prenom} {client.nom}</p>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto h-[calc(95vh-180px)] sm:h-[calc(90vh-180px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
          {/* Onglet Information */}
          {modalTab === 'information' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 bg-gradient-to-br from-[#2d4578]/30 to-[#1e3a5f]/30 p-4 sm:p-6 rounded-2xl border-2 border-white/10 shadow-xl">
                {/* Colonne Gauche */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Prénom :</label>
                    <input
                      type="text"
                      value={editedClient?.prenom || ''}
                      onChange={(e) => onFieldChange('prenom', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Téléphone :</label>
                    <input
                      type="text"
                      value={editedClient?.phone || ''}
                      onChange={(e) => onFieldChange('phone', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Pays :</label>
                    <input
                      type="text"
                      value={editedClient?.pays || 'France'}
                      onChange={(e) => onFieldChange('pays', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Adresse :</label>
                    <input
                      type="text"
                      value={editedClient?.address || ''}
                      onChange={(e) => onFieldChange('address', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Date de création :</label>
                    <input
                      type="text"
                      value={new Date(editedClient?.created_at).toLocaleString('fr-FR')}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/70 text-white/70 rounded-xl font-semibold shadow-sm"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">E-mail :</label>
                    <input
                      type="email"
                      value={editedClient?.email || ''}
                      onChange={(e) => onFieldChange('email', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Statut du client :</label>
                    <select
                      value={editedClient?.status_id || ''}
                      onChange={(e) => onFieldChange('status_id', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-bold shadow-sm hover:border-white/30"
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
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Activité :</label>
                    <input
                      type="text"
                      value={editedClient?.activite || ''}
                      onChange={(e) => onFieldChange('activite', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Rendez-vous :</label>
                    <input
                      type="datetime-local"
                      value={editedClient?.rendez_vous ? new Date(editedClient.rendez_vous).toISOString().slice(0, 16) : ''}
                      onChange={(e) => onFieldChange('rendez_vous', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>
                </div>

                {/* Colonne Droite */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Nom :</label>
                    <input
                      type="text"
                      value={editedClient?.nom || ''}
                      onChange={(e) => onFieldChange('nom', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-bold uppercase shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Portable :</label>
                    <input
                      type="text"
                      value={editedClient?.portable || ''}
                      onChange={(e) => onFieldChange('portable', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Ville :</label>
                    <input
                      type="text"
                      value={editedClient?.ville || ''}
                      onChange={(e) => onFieldChange('ville', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Code postal :</label>
                    <input
                      type="text"
                      value={editedClient?.code_postal || ''}
                      onChange={(e) => onFieldChange('code_postal', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Date de naissance :</label>
                    <input
                      type="text"
                      value={editedClient?.anniversaire || ''}
                      onChange={(e) => onFieldChange('anniversaire', e.target.value)}
                      placeholder="jj/mm/aaaa"
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Autre Courriel :</label>
                    <input
                      type="email"
                      value={editedClient?.autre_courriel || ''}
                      onChange={(e) => onFieldChange('autre_courriel', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">SIRET :</label>
                    <input
                      type="text"
                      value={editedClient?.siret || ''}
                      onChange={(e) => onFieldChange('siret', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Société :</label>
                    <input
                      type="text"
                      value={editedClient?.company_name || ''}
                      onChange={(e) => onFieldChange('company_name', e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Source :</label>
                    <input
                      type="text"
                      value={editedClient?.source || ''}
                      onChange={(e) => onFieldChange('source', e.target.value)}
                      placeholder="Source"
                      className="w-full px-4 py-3 text-sm border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300 font-semibold shadow-sm hover:border-white/30"
                    />
                  </div>
                </div>
              </div>

              {/* Boutons Enregistrer */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-4 text-sm bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white rounded-xl hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold transform hover:scale-105 active:scale-95 border border-blue-400/30"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-4 text-sm bg-white/10 text-white border-2 border-white/20 rounded-xl hover:bg-white/20 hover:border-blue-400/50 transition-all duration-300 font-bold shadow-md hover:shadow-lg"
                >
                  Annuler
                </button>
              </div>
            </>
          )}

          {/* Onglet Liste commentaire */}
          {modalTab === 'liste-commentaire' && (
            <div className="bg-gradient-to-br from-[#2d4578]/30 to-[#1e3a5f]/30 p-4 sm:p-6 rounded-2xl border-2 border-white/10 shadow-xl">
              <h3 className="text-base sm:text-2xl font-extrabold text-white mb-6">Liste des commentaires</h3>

              {/* Formulaire d'ajout de commentaire */}
              <div className="mb-6 bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 p-5 rounded-2xl border-2 border-white/10 shadow-lg">
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">
                  Ajouter un commentaire
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="Écrivez votre commentaire ici..."
                  className="w-full px-4 py-3 border-2 border-white/20 bg-[#1a2847]/50 text-white rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 resize-none transition-all duration-300 font-semibold shadow-sm placeholder:text-white/50"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={onAddComment}
                    disabled={!newComment.trim() || addingComment}
                    className="px-6 py-3 bg-gradient-to-r from-[#2d4578] to-[#1e3a5f] text-white rounded-xl hover:from-[#3a5488] hover:to-[#2d4578] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30"
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-sm text-blue-200 mt-2">Chargement des commentaires...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-blue-200">Aucun commentaire pour le moment</p>
                    <p className="text-xs text-blue-300/70 mt-1">Ajoutez le premier commentaire ci-dessus</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 sm:gap-4 pb-4 border-b-2 border-white/10 last:border-b-0 group hover:bg-gradient-to-r hover:from-[#2d4578]/30 hover:to-[#1e3a5f]/30 transition-all duration-300 rounded-xl p-4 shadow-sm hover:shadow-md">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2d4578] to-[#1e3a5f] rounded-xl flex items-center justify-center shadow-lg ring-4 ring-blue-400/20">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-white">{comment.author_name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-200">
                              {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="p-1 hover:bg-red-500/20 rounded-full transition-colors group-hover:opacity-100 opacity-0 disabled:opacity-50"
                              title="Supprimer le commentaire"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-blue-100 whitespace-pre-wrap">{comment.comment_text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Onglet Mail */}
          {modalTab === 'mail' && (
            <div className="bg-gradient-to-br from-[#2d4578]/30 to-[#1e3a5f]/30 p-4 sm:p-6 rounded-2xl border-2 border-white/10 shadow-xl">
              <h3 className="text-base sm:text-2xl font-extrabold text-white mb-6">Envoi d'emails au client</h3>
              <ClientEmailSender client={client} />
            </div>
          )}

          {/* Onglet Panel client */}
          {modalTab === 'panel-client' && (
            <div className="bg-gradient-to-br from-[#2d4578]/30 to-[#1e3a5f]/30 p-4 sm:p-6 rounded-2xl border-2 border-white/10 shadow-xl">
              <h3 className="text-base sm:text-2xl font-extrabold text-white mb-6 sm:mb-8">Gestion du compte client</h3>

              <div className="space-y-4 sm:space-y-6">
                {/* Identifiants de connexion */}
                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-3 border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-extrabold text-white text-base sm:text-xl flex items-center gap-3">
                      <LogIn className="w-6 h-6" />
                      Identifiants de connexion
                    </h4>
                    <button
                      onClick={() => {
                        setIsEditingCredentials(!isEditingCredentials);
                        if (!isEditingCredentials) {
                          setTimeout(() => {
                            passwordInputRefs.current[0]?.focus();
                            passwordInputRefs.current[0]?.select();
                          }, 100);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#2d4578] to-[#1e3a5f] text-white rounded-lg hover:from-[#3a5488] hover:to-[#2d4578] transition-all duration-300 text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 border border-blue-400/30"
                    >
                      <Edit2 className="w-3 h-3" />
                      {isEditingCredentials ? 'Terminer' : 'Modifier'}
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="bg-[#1a2847]/50 rounded-2xl p-4 sm:p-5 border-2 border-white/20 shadow-md hover:shadow-lg transition-all duration-300">
                      <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">
                        Email
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="email"
                          value={editedClient?.email || ''}
                          readOnly={!isEditingCredentials}
                          onChange={(e) => onFieldChange('email', e.target.value)}
                          className={`flex-1 px-4 py-3 text-sm bg-[#1a2847]/70 border-2 text-white rounded-xl font-mono font-bold shadow-sm transition-all duration-300 ${
                            isEditingCredentials
                              ? 'border-white/20 hover:border-blue-400/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/30 cursor-text'
                              : 'border-white/10 cursor-not-allowed opacity-70'
                          }`}
                        />
                        <button
                          onClick={() => onCopyToClipboard(editedClient?.email || '', 'email')}
                          className="px-6 py-3 bg-gradient-to-r from-[#2d4578] to-[#1e3a5f] text-white rounded-xl hover:from-[#3a5488] hover:to-[#2d4578] transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30"
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-2xl p-4 sm:p-5 border-2 border-white/20 shadow-md hover:shadow-lg transition-all duration-300">
                      <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">
                        Mot de passe
                      </label>
                      <div className="flex flex-col items-stretch gap-3">
                        <div className="flex items-center justify-center gap-2">
                          {Array.from({ length: 6 }).map((_, index) => {
                            const password = editedClient?.client_password || '000000';
                            const digit = password.padEnd(6, '0')[index] || '0';
                            return (
                              <input
                                key={index}
                                ref={(el) => (passwordInputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                disabled={!isEditingCredentials}
                                onChange={(e) => handlePasswordDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handlePasswordKeyDown(index, e)}
                                onFocus={(e) => e.target.select()}
                                className={`w-12 h-14 sm:w-14 sm:h-16 bg-[#1a2847]/70 border-2 rounded-xl text-xl sm:text-2xl font-bold text-white font-mono text-center shadow-lg transition-all duration-300 outline-none ${
                                  isEditingCredentials
                                    ? 'border-white/20 hover:border-blue-400/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/30 cursor-text'
                                    : 'border-white/10 cursor-not-allowed opacity-70'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <button
                          onClick={() => onCopyToClipboard(editedClient?.client_password || '', 'password')}
                          className="px-6 py-3 bg-gradient-to-r from-[#2d4578] to-[#1e3a5f] text-white rounded-xl hover:from-[#3a5488] hover:to-[#2d4578] transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30"
                        >
                          {copiedPassword ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton de connexion au panel client */}
                {onClientLogin && (
                  <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-3 border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl">
                    <h4 className="font-extrabold mb-3 text-white flex items-center gap-2 text-lg">
                      <LogIn className="w-6 h-6" />
                      Accès au panel client
                    </h4>
                    <p className="text-sm mb-6 text-blue-200 font-semibold">
                      Utilisez ce bouton pour vous connecter directement au panel client avec les identifiants de ce client.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onClientLogin(editedClient);
                      }}
                      disabled={!editedClient?.siret || !editedClient?.client_password}
                      className={`w-full px-8 py-4 rounded-xl transition-all duration-300 font-extrabold flex items-center justify-center gap-3 shadow-xl transform ${
                        editedClient?.siret && editedClient?.client_password
                          ? 'bg-orange-700/60 text-white hover:bg-orange-800/70 hover:shadow-2xl hover:scale-105 border border-orange-600/40 backdrop-blur-sm'
                          : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      <LogIn className="w-6 h-6" />
                      Se connecter au panel client
                    </button>
                    {(!editedClient?.siret || !editedClient?.client_password) && (
                      <p className="text-xs text-red-400 mt-3 font-bold">
                        Le SIRET et le mot de passe doivent être définis pour se connecter.
                      </p>
                    )}
                  </div>
                )}

                {/* Informations */}
                <div className="bg-gradient-to-r from-[#2d4578]/30 to-[#1e3a5f]/30 border-2 border-white/10 rounded-xl p-5 shadow-md">
                  <p className="text-sm text-blue-200 font-semibold">
                    <strong className="font-extrabold text-white">Note :</strong> Ces identifiants permettent au client de se connecter à son espace personnel.
                  </p>
                </div>

                {/* Bouton Enregistrer */}
                <div className="flex justify-end">
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="px-8 py-4 text-sm bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white rounded-xl hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold transform hover:scale-105 active:scale-95 border border-blue-400/30"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerClientModal;
