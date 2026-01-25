import React, { useState } from 'react';
import { ShoppingBag, Plus, List, User, Mail, Lock, Calendar, Trash2, CheckSquare, Square, LogIn, Eye, EyeOff, X, Edit, Save, MessageSquare } from 'lucide-react';
import { Seller } from '../types/Seller';
import { sellerService } from '../services/sellerService';

interface SellerManagerProps {
  sellers: Seller[];
  onSellerCreated: (seller: Seller) => void;
  onSellerUpdated: (seller: Seller) => void;
  onSellersDeleted: (sellerIds: string[]) => void;
  onSellerLogin?: (seller: Seller) => void;
  onOpenChat?: (sellerId: string) => void;
}

const SellerManager: React.FC<SellerManagerProps> = ({ sellers, onSellerCreated, onSellerUpdated, onSellersDeleted, onSellerLogin, onOpenChat }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [selectedSellerDetails, setSelectedSellerDetails] = useState<Seller | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editedPassword, setEditedPassword] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: ''
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

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-seller`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.motDePasse,
            fullName: `${formData.prenom} ${formData.nom}`,
            phone: '',
            commissionRate: 0
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vendeur créé avec succès:', data);

        const refreshedSellers = await sellerService.getAllSellers();
        const formattedSellers = refreshedSellers.map((seller: any) => ({
          id: seller.id,
          nom: seller.full_name?.split(' ').pop() || '',
          prenom: seller.full_name?.split(' ')[0] || '',
          email: seller.email,
          motDePasse: '',
          dateCreation: new Date(seller.created_at).toLocaleString('fr-FR'),
          isOnline: seller.is_online || false,
          lastConnection: seller.last_connection || undefined
        }));

        formattedSellers.forEach(seller => {
          if (seller.email === formData.email) {
            onSellerCreated(seller);
          }
        });

        alert(`✅ Vendeur créé avec succès!\n\nEmail: ${formData.email}\nNom: ${formData.prenom} ${formData.nom}`);

        setFormData({
          nom: '',
          prenom: '',
          email: '',
          motDePasse: ''
        });
        setShowPassword(false);

        setActiveTab('list');
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur création vendeur:', errorData);
        alert(`❌ Erreur lors de la création du vendeur:\n\n${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur réseau:', error);
      alert(`❌ Erreur de connexion:\n\n${error.message || 'Impossible de contacter le serveur'}`);
    }
  };

  const handleSelectSeller = (sellerId: string) => {
    setSelectedSellers(prev =>
      prev.includes(sellerId)
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSellers.length === sellers.length) {
      setSelectedSellers([]);
    } else {
      setSelectedSellers(sellers.map(s => s.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSellers.length === 0) return;

    try {
      await sellerService.deleteMultipleSellers(selectedSellers);
      onSellersDeleted(selectedSellers);
      setSelectedSellers([]);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleEditPassword = () => {
    if (selectedSellerDetails) {
      setEditedPassword(selectedSellerDetails.motDePasse);
      setIsEditingPassword(true);
    }
  };

  const handleSavePassword = async () => {
    if (!selectedSellerDetails || !editedPassword.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-seller-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sellerId: selectedSellerDetails.id,
            newPassword: editedPassword
          })
        }
      );

      if (response.ok) {
        const updatedSeller = { ...selectedSellerDetails, motDePasse: editedPassword };
        setSelectedSellerDetails(updatedSeller);
        onSellerUpdated(updatedSeller);
        setIsEditingPassword(false);
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la mise à jour du mot de passe:', errorData);
        alert('Erreur lors de la mise à jour du mot de passe');
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du mot de passe');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPassword(false);
    setEditedPassword('');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 md:p-6">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('add')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
              activeTab === 'add'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            Ajouter un vendeur
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
              activeTab === 'list'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            Liste Vendeurs
          </button>
        </div>

        <div className="mt-4 md:mt-8 p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg border border-blue-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total sellers</span>
            <span className="font-medium text-gray-900">{sellers.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto">
        <div className="w-full">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">Gestionnaire de Vendeurs</h1>
            </div>
            <p className="text-sm md:text-base text-gray-600">Gérez vos vendeurs et leurs accès</p>
          </div>

          {activeTab === 'add' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Ajouter un vendeur</h2>
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="Dupont"
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="Jean"
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="jean.dupont@example.com"
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
                      type={showPassword ? "text" : "password"}
                      id="motDePasse"
                      name="motDePasse"
                      value={formData.motDePasse}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-8 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    Valider
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <List className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Liste des Vendeurs ({sellers.length})
                    </h2>
                  </div>
                  {selectedSellers.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {selectedSellers.length} sélectionné(s)
                      </span>
                      <button
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {sellers.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun vendeur créé</h3>
                  <p className="text-gray-500 mb-6">Commencez par ajouter votre premier vendeur</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un vendeur
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
                            title={selectedSellers.length === sellers.length ? "Désélectionner tout" : "Sélectionner tout"}
                          >
                            {selectedSellers.length === sellers.length ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
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
                            <Calendar className="w-4 h-4" />
                            Date de création
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sellers.map((seller) => (
                        <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSelectSeller(seller.id)}
                              className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-green-600 transition-colors"
                            >
                              {selectedSellers.includes(seller.id) ? (
                                <CheckSquare className="w-5 h-5 text-green-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {seller.nom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {seller.prenom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {seller.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {seller.dateCreation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedSellerDetails(seller)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                                Détails
                              </button>
                              {onOpenChat && (
                                <button
                                  onClick={() => onOpenChat(seller.id)}
                                  className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                                  title="Ouvrir le chat"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Chat
                                </button>
                              )}
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

      {selectedSellerDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center ring-2 ring-white/50">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Détails du Vendeur</h2>
                    <p className="text-emerald-50 text-sm">Informations complètes du vendeur</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedSellerDetails(null);
                    setIsEditingPassword(false);
                    setEditedPassword('');
                  }}
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
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedSellerDetails.prenom} {selectedSellerDetails.nom}
                    </h3>
                    <p className="text-sm text-gray-600">Vendeur</p>
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
                    <p className="text-base font-medium text-gray-900 break-all">{selectedSellerDetails.email}</p>
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Date de Création
                  </label>
                  <div className="bg-white border-2 border-gray-200 group-hover:border-emerald-400 px-5 py-4 rounded-xl transition-all duration-200 shadow-sm">
                    <p className="text-base font-medium text-gray-900">{selectedSellerDetails.dateCreation}</p>
                  </div>
                </div>

                <div className="group md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Mot de Passe
                  </label>
                  {isEditingPassword ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editedPassword}
                        onChange={(e) => setEditedPassword(e.target.value)}
                        className="w-full bg-white border-2 border-emerald-400 px-5 py-4 rounded-xl shadow-sm text-base font-mono font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Nouveau mot de passe"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSavePassword}
                          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Enregistrer
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 px-5 py-4 rounded-xl shadow-sm flex items-center justify-between">
                      <p className="text-base font-mono font-semibold text-gray-900">{selectedSellerDetails.motDePasse}</p>
                      <button
                        onClick={handleEditPassword}
                        className="flex items-center gap-2 bg-white text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-200"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-end gap-4">
              {onSellerLogin && (
                <button
                  onClick={() => {
                    onSellerLogin(selectedSellerDetails);
                    setSelectedSellerDetails(null);
                  }}
                  className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogIn className="w-5 h-5" />
                  Se connecter en tant que ce vendeur
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedSellerDetails(null);
                  setIsEditingPassword(false);
                  setEditedPassword('');
                }}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerManager;
