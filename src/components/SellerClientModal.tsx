import React from 'react';
import { X, RefreshCw, MessageSquare, LogIn, Copy, Check } from 'lucide-react';
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
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded shadow-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 sm:px-6 py-3 flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-bold text-white uppercase">
            CLIENT - {client.prenom} {client.nom}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-gray-300 overflow-x-auto">
          <div className="flex gap-1 sm:gap-2 px-3 sm:px-6 min-w-max">
            <button
              onClick={() => onTabChange('information')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                modalTab === 'information'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-blue-700 bg-gray-50'
              }`}
            >
              Information
            </button>
            <button
              onClick={() => onTabChange('liste-commentaire')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                modalTab === 'liste-commentaire'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-blue-700 bg-gray-50'
              }`}
            >
              Liste commentaire
            </button>
            <button
              onClick={() => onTabChange('mail')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                modalTab === 'mail'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-blue-700 bg-gray-50'
              }`}
            >
              Mail
            </button>
            <button
              onClick={() => onTabChange('panel-client')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                modalTab === 'panel-client'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-blue-700 bg-gray-50'
              }`}
            >
              Panel client
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-180px)] bg-gray-50">
          {/* Onglet Information */}
          {modalTab === 'information' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 bg-white p-4 sm:p-6 rounded border border-gray-300">
                {/* Colonne Gauche */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom :</label>
                    <input
                      type="text"
                      value={editedClient?.prenom || ''}
                      onChange={(e) => onFieldChange('prenom', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone :</label>
                    <input
                      type="text"
                      value={editedClient?.phone || ''}
                      onChange={(e) => onFieldChange('phone', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pays :</label>
                    <input
                      type="text"
                      value={editedClient?.pays || 'France'}
                      onChange={(e) => onFieldChange('pays', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse :</label>
                    <input
                      type="text"
                      value={editedClient?.address || ''}
                      onChange={(e) => onFieldChange('address', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date de création :</label>
                    <input
                      type="text"
                      value={new Date(editedClient?.created_at).toLocaleString('fr-FR')}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-100"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail :</label>
                    <input
                      type="email"
                      value={editedClient?.email || ''}
                      onChange={(e) => onFieldChange('email', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Statut du client :</label>
                    <select
                      value={editedClient?.status_id || ''}
                      onChange={(e) => onFieldChange('status_id', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white font-semibold"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Activité :</label>
                    <input
                      type="text"
                      value={editedClient?.activite || ''}
                      onChange={(e) => onFieldChange('activite', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rendez-vous :</label>
                    <input
                      type="datetime-local"
                      value={editedClient?.rendez_vous ? new Date(editedClient.rendez_vous).toISOString().slice(0, 16) : ''}
                      onChange={(e) => onFieldChange('rendez_vous', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>

                {/* Colonne Droite */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom :</label>
                    <input
                      type="text"
                      value={editedClient?.nom || ''}
                      onChange={(e) => onFieldChange('nom', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded font-semibold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Portable :</label>
                    <input
                      type="text"
                      value={editedClient?.portable || ''}
                      onChange={(e) => onFieldChange('portable', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ville :</label>
                    <input
                      type="text"
                      value={editedClient?.ville || ''}
                      onChange={(e) => onFieldChange('ville', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Code postal :</label>
                    <input
                      type="text"
                      value={editedClient?.code_postal || ''}
                      onChange={(e) => onFieldChange('code_postal', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date de naissance :</label>
                    <input
                      type="text"
                      value={editedClient?.anniversaire || ''}
                      onChange={(e) => onFieldChange('anniversaire', e.target.value)}
                      placeholder="jj/mm/aaaa"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Autre Courriel :</label>
                    <input
                      type="email"
                      value={editedClient?.autre_courriel || ''}
                      onChange={(e) => onFieldChange('autre_courriel', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SIRET :</label>
                    <input
                      type="text"
                      value={editedClient?.siret || ''}
                      onChange={(e) => onFieldChange('siret', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Société :</label>
                    <input
                      type="text"
                      value={editedClient?.company_name || ''}
                      onChange={(e) => onFieldChange('company_name', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Source :</label>
                    <input
                      type="text"
                      value={editedClient?.source || ''}
                      onChange={(e) => onFieldChange('source', e.target.value)}
                      placeholder="Source"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton Enregistrer */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm bg-blue-600 text-white border border-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors font-semibold"
                >
                  Annuler
                </button>
              </div>
            </>
          )}

          {/* Onglet Liste commentaire */}
          {modalTab === 'liste-commentaire' && (
            <div className="bg-white p-4 sm:p-6 rounded border border-gray-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Liste des commentaires</h3>

              {/* Formulaire d'ajout de commentaire */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ajouter un commentaire
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="Écrivez votre commentaire ici..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={onAddComment}
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
                          <MessageSquare className="w-5 h-5 text-blue-600" />
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
                              onClick={() => onDeleteComment(comment.id)}
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

          {/* Onglet Mail */}
          {modalTab === 'mail' && (
            <div className="bg-white p-4 sm:p-6 rounded border border-gray-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Envoi d'emails au client</h3>
              <ClientEmailSender client={client} />
            </div>
          )}

          {/* Onglet Panel client */}
          {modalTab === 'panel-client' && (
            <div className="bg-white p-4 sm:p-6 rounded border border-gray-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">Gestion du compte client</h3>

              <div className="space-y-4 sm:space-y-6">
                {/* Identifiants de connexion */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 sm:p-6">
                  <h4 className="font-bold text-blue-900 mb-4 text-base sm:text-lg flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Identifiants de connexion
                  </h4>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Email
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={editedClient?.email || ''}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded font-mono"
                        />
                        <button
                          onClick={() => onCopyToClipboard(editedClient?.email || '', 'email')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
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

                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Mot de passe
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={editedClient?.client_password || ''}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded font-mono"
                        />
                        <button
                          onClick={() => onCopyToClipboard(editedClient?.client_password || '', 'password')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
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
                  <div className="border rounded-lg p-4 sm:p-6 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Accès au panel client
                    </h4>
                    <p className="text-sm mb-4 text-blue-700">
                      Utilisez ce bouton pour vous connecter directement au panel client avec les identifiants de ce client.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onClientLogin(editedClient);
                      }}
                      disabled={!editedClient?.siret || !editedClient?.client_password}
                      className={`w-full px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                        editedClient?.siret && editedClient?.client_password
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <LogIn className="w-5 h-5" />
                      Se connecter au panel client
                    </button>
                    {(!editedClient?.siret || !editedClient?.client_password) && (
                      <p className="text-xs text-red-600 mt-2">
                        Le SIRET et le mot de passe doivent être définis pour se connecter.
                      </p>
                    )}
                  </div>
                )}

                {/* Informations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Ces identifiants permettent au client de se connecter à son espace personnel.
                  </p>
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
