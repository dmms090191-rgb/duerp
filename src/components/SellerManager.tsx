import React, { useState, useRef } from 'react';
import { ShoppingBag, Plus, List, User, Mail, Lock, Calendar, Trash2, CheckSquare, Square, LogIn, Eye, EyeOff, X, Edit, Save, MessageSquare, Shield, ClipboardCheck } from 'lucide-react';
import { Seller } from '../types/Seller';
import { sellerService } from '../services/sellerService';
import { supabase } from '../lib/supabase';

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
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinCode, setPinCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isTogglingDiagnostic, setIsTogglingDiagnostic] = useState(false);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
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

    // Vérifier si l'email existe déjà dans la liste des vendeurs
    const emailExists = sellers.some(seller =>
      seller.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (emailExists) {
      alert(`❌ Un compte avec l'email "${formData.email}" existe déjà.\n\nVeuillez utiliser un autre email ou vérifier la liste des vendeurs existants.`);
      return;
    }

    try {
      // Nettoyer tout utilisateur auth orphelin avec cet email
      console.log('Nettoyage des utilisateurs auth orphelins...');
      const cleanupResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleanup-auth-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email })
        }
      );

      if (cleanupResponse.ok) {
        const cleanupData = await cleanupResponse.json();
        console.log('✅ Nettoyage terminé:', cleanupData);
      } else {
        console.warn('⚠️ Nettoyage non effectué:', await cleanupResponse.text());
      }

      // Créer le vendeur
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
          full_name: seller.full_name,
          email: seller.email,
          motDePasse: seller.password || '',
          dateCreation: new Date(seller.created_at).toLocaleString('fr-FR'),
          isOnline: seller.is_online || false,
          lastConnection: seller.last_connection || undefined,
          pin_code: seller.pin_code || undefined,
          can_fill_diagnostic: seller.can_fill_diagnostic ?? false
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

        // Traduire les erreurs courantes en français
        let errorMessage = errorData.error || 'Erreur inconnue';

        if (errorMessage.includes('already been registered') || errorMessage.includes('User already registered')) {
          errorMessage = `Un problème a été détecté avec l'email "${formData.email}".\n\nUn compte d'authentification existe mais n'a pas pu être nettoyé automatiquement.\n\nVeuillez réessayer dans quelques secondes ou utiliser un autre email.`;
        } else if (errorMessage.includes('Invalid email')) {
          errorMessage = 'L\'adresse email saisie n\'est pas valide.';
        }

        alert(`❌ Erreur lors de la création du vendeur:\n\n${errorMessage}`);
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
      setEditedPassword(selectedSellerDetails.motDePasse || '');
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

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pinCode];
    newPin[index] = value.slice(-1);
    setPinCode(newPin);

    if (value && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinCode[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handleEditPin = () => {
    const currentPin = (selectedSellerDetails as any)?.pin_code || '';
    const pinArray = currentPin.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setPinCode(pinArray);
    setIsEditingPin(true);
    setTimeout(() => pinInputRefs.current[0]?.focus(), 100);
  };

  const handleSavePin = async () => {
    if (!selectedSellerDetails) return;

    const pinValue = pinCode.join('');
    if (pinValue.length !== 6) {
      alert('Le code PIN doit contenir 6 chiffres');
      return;
    }

    try {
      await sellerService.updateSeller(selectedSellerDetails.id, {
        pin_code: pinValue
      });

      const updatedSeller = { ...selectedSellerDetails, pin_code: pinValue } as any;
      setSelectedSellerDetails(updatedSeller);
      onSellerUpdated(updatedSeller);
      setIsEditingPin(false);
      alert('Code PIN mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du PIN:', error);
      alert('Erreur lors de la mise à jour du code PIN');
    }
  };

  const handleCancelPinEdit = () => {
    setIsEditingPin(false);
    setPinCode(['', '', '', '', '', '']);
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a2847] via-[#2d4578] to-[#1e3a5f]">
      <div className="w-full md:w-64 bg-gradient-to-b from-[#1e3a5f] to-[#2d4578] border-r border-white/10 p-4 md:p-6">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('add')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
              activeTab === 'add'
                ? 'bg-white/20 text-white font-medium border-2 border-white/30'
                : 'text-white/70 hover:bg-white/10 border-2 border-transparent'
            }`}
          >
            <Plus className="w-4 h-4" />
            Ajouter un vendeur
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
              activeTab === 'list'
                ? 'bg-white/20 text-white font-medium border-2 border-white/30'
                : 'text-white/70 hover:bg-white/10 border-2 border-transparent'
            }`}
          >
            <List className="w-4 h-4" />
            Liste Vendeurs
          </button>
        </div>

        <div className="mt-4 md:mt-8 p-4 bg-white/10 rounded-lg border-2 border-white/20 backdrop-blur-xl">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Total sellers</span>
            <span className="font-medium text-white">{sellers.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto">
        <div className="w-full">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center border-2 border-white/30">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg">
                Gestion vendeur
              </h1>
            </div>
            <p className="text-sm md:text-base text-white/80 font-medium">Gérez vos vendeurs et leurs accès</p>
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
                      Ajouter un vendeur
                    </h2>
                    <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium">Créez un nouveau compte vendeur</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xs font-semibold text-blue-300 mb-4 uppercase tracking-wide">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="Dupont"
                        required
                      />
                    </div>

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
                        placeholder="Jean"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xs font-semibold text-blue-300 mb-4 uppercase tracking-wide">Informations de connexion</h3>
                  <div className="space-y-4">
                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="email" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                        placeholder="jean.dupont@example.com"
                        required
                      />
                    </div>

                    <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                      <label htmlFor="motDePasse" className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="motDePasse"
                          name="motDePasse"
                          value={formData.motDePasse}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20"
                  >
                    <Plus className="w-5 h-5" />
                    Créer le vendeur
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-xl shadow-2xl border-2 border-white/10">
              <div className="p-6 border-b-2 border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <List className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-semibold text-white">
                      Liste des Vendeurs ({sellers.length})
                    </h2>
                  </div>
                  {selectedSellers.length > 0 && (
                    <span className="text-sm text-white/70">
                      {selectedSellers.length} sélectionné(s)
                    </span>
                  )}
                </div>
              </div>

              {sellers.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Aucun vendeur créé</h3>
                  <p className="text-white/70 mb-6">Commencez par ajouter votre premier vendeur</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors border-2 border-white/30"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un vendeur
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-[#1a2847]/50 border-b-2 border-white/10">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center justify-center w-5 h-5 text-white/70 hover:text-white transition-colors"
                            title={selectedSellers.length === sellers.length ? "Désélectionner tout" : "Sélectionner tout"}
                          >
                            {selectedSellers.length === sellers.length ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nom
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Prénom
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date de création
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1e3a5f]/30 divide-y divide-white/10">
                      {sellers.map((seller) => (
                        <tr key={seller.id} className="hover:bg-white/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSelectSeller(seller.id)}
                              className="flex items-center justify-center w-5 h-5 text-white/70 hover:text-white transition-colors"
                            >
                              {selectedSellers.includes(seller.id) ? (
                                <CheckSquare className="w-5 h-5 text-white" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                            {seller.nom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                            {seller.prenom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                            {seller.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {seller.dateCreation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setSelectedSellerDetails(seller)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white text-xs font-bold rounded-lg hover:from-slate-900 hover:via-slate-800 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                                title="Voir les détails"
                              >
                                <Eye className="w-3 h-3" />
                                Détails
                              </button>
                              {onOpenChat && (
                                <button
                                  onClick={() => onOpenChat(seller.id)}
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
        <div className="fixed inset-0 bg-gradient-to-br from-[#1a2847]/95 via-[#2d4578]/95 to-[#1a2847]/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">Détails du Vendeur</h2>
                    <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Informations complètes du vendeur</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedSellerDetails(null);
                    setIsEditingPassword(false);
                    setEditedPassword('');
                    setIsEditingPin(false);
                    setPinCode(['', '', '', '', '', '']);
                  }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/25 backdrop-blur-xl rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 ring-2 ring-white/20 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
              <div className="relative bg-gradient-to-br from-[#2d4578]/30 to-[#1e3a5f]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#2d4578] to-[#1e3a5f] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ring-2 sm:ring-4 ring-white/20 flex-shrink-0">
                    <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white drop-shadow" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight break-words">
                      {selectedSellerDetails.prenom} {selectedSellerDetails.nom}
                    </h3>
                    <p className="text-sm sm:text-base font-semibold text-blue-200 mt-0.5 sm:mt-1">Vendeur</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="group">
                  <label className="text-[10px] sm:text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    Adresse Email
                  </label>
                  <div className="relative bg-[#1a2847]/50 border-2 border-white/20 group-hover:border-white/30 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md group-hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2d4578]/30 to-[#1e3a5f]/30 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <p className="relative text-sm sm:text-base font-semibold text-white break-all">{selectedSellerDetails.email}</p>
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] sm:text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    Date de Création
                  </label>
                  <div className="relative bg-[#1a2847]/50 border-2 border-white/20 group-hover:border-white/30 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md group-hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2d4578]/30 to-[#1e3a5f]/30 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <p className="relative text-sm sm:text-base font-semibold text-white">{selectedSellerDetails.dateCreation}</p>
                  </div>
                </div>

                <div className="group md:col-span-2">
                  <label className="text-[10px] sm:text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    Mot de Passe
                  </label>
                  {isEditingPassword ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={editedPassword}
                          onChange={(e) => setEditedPassword(e.target.value)}
                          className="w-full bg-[#1a2847]/50 border-3 border-blue-400/50 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base font-mono font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all duration-300"
                          placeholder="Nouveau mot de passe"
                        />
                      </div>
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={handleSavePassword}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#2d4578] to-[#1e3a5f] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-[#3a5488] hover:to-[#2d4578] transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base border border-blue-400/30"
                        >
                          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Enregistrer</span>
                          <span className="xs:hidden">OK</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1.5 sm:gap-2 bg-white/10 text-white border-2 border-white/20 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-[#1a2847]/50 border-3 border-white/20 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 rounded-xl sm:rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {selectedSellerDetails.motDePasse ? (
                        <p className="relative text-sm sm:text-base font-mono font-bold text-white break-all">{selectedSellerDetails.motDePasse}</p>
                      ) : (
                        <p className="relative text-xs sm:text-sm italic text-white/70">
                          Mot de passe non enregistré - Cliquez sur Modifier pour définir un nouveau mot de passe
                        </p>
                      )}
                      <button
                        onClick={handleEditPassword}
                        className="relative flex items-center gap-1.5 sm:gap-2 bg-white/10 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/20 shadow-md hover:shadow-lg font-bold text-sm sm:text-base flex-shrink-0"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Modifier
                      </button>
                    </div>
                  )}
                </div>

                <div className="group md:col-span-2">
                  <label className="text-[10px] sm:text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    Code PIN (6 chiffres)
                  </label>
                  {isEditingPin ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex gap-2 sm:gap-3 justify-center">
                        {pinCode.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (pinInputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value)}
                            onKeyDown={(e) => handlePinKeyDown(index, e)}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white border-3 border-blue-400/50 rounded-xl sm:rounded-2xl shadow-lg text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-500 transition-all duration-200"
                          />
                        ))}
                      </div>
                      <div className="flex gap-2 sm:gap-3 justify-center">
                        <button
                          onClick={handleSavePin}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base border border-white/20"
                        >
                          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Enregistrer
                        </button>
                        <button
                          onClick={handleCancelPinEdit}
                          className="flex items-center gap-1.5 sm:gap-2 bg-white/10 text-white border-2 border-white/20 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-[#1a2847]/50 border-3 border-white/20 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 rounded-xl sm:rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {(selectedSellerDetails as any)?.pin_code ? (
                        <div className="relative flex gap-2">
                          {(selectedSellerDetails as any).pin_code.split('').map((digit: string, idx: number) => (
                            <div key={idx} className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 border-2 border-blue-400/30 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-xl sm:text-2xl font-bold text-gray-900">{digit}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="relative text-xs sm:text-sm italic text-white/70">
                          Code PIN non défini - Cliquez sur Modifier pour définir un code PIN
                        </p>
                      )}
                      <button
                        onClick={handleEditPin}
                        className="relative flex items-center gap-1.5 sm:gap-2 bg-white/10 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/20 shadow-md hover:shadow-lg font-bold text-sm sm:text-base flex-shrink-0"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#2d4578]/30 to-[#1e3a5f]/30 p-4 sm:p-6 rounded-2xl border-2 border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Diagnostic Final :</label>
                      <p className="text-xs text-white/60">Autoriser ce vendeur a faire remplir un diagnostic final a ses clients</p>
                    </div>
                  </div>
                  <button
                    disabled={isTogglingDiagnostic}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isTogglingDiagnostic) return;
                      setIsTogglingDiagnostic(true);

                      const currentValue = selectedSellerDetails.can_fill_diagnostic ?? false;
                      const newValue = !currentValue;

                      try {
                        const { error } = await supabase
                          .from('sellers')
                          .update({ can_fill_diagnostic: newValue })
                          .eq('id', selectedSellerDetails.id);

                        if (error) throw error;

                        const updatedSeller = { ...selectedSellerDetails, can_fill_diagnostic: newValue };
                        setSelectedSellerDetails(updatedSeller);
                        onSellerUpdated(updatedSeller);
                      } catch (error) {
                        console.error('Erreur lors de la sauvegarde:', error);
                        alert('Erreur lors de la sauvegarde. Veuillez reessayer.');
                      } finally {
                        setIsTogglingDiagnostic(false);
                      }
                    }}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedSellerDetails.can_fill_diagnostic ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        selectedSellerDetails.can_fill_diagnostic ? 'translate-x-11' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className={`text-sm font-bold ${selectedSellerDetails.can_fill_diagnostic ? 'text-green-400' : 'text-gray-400'}`}>
                  {selectedSellerDetails.can_fill_diagnostic ? 'Active - Le vendeur peut faire remplir le diagnostic final' : 'Desactive - Le vendeur ne peut pas faire remplir le diagnostic final'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1e3a5f]/80 via-[#2d4578]/80 to-[#1e3a5f]/80 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 border-t-2 border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 md:gap-4">
              {onSellerLogin && (
                <button
                  onClick={() => {
                    onSellerLogin(selectedSellerDetails);
                    setSelectedSellerDetails(null);
                  }}
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white px-4 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 rounded-lg sm:rounded-xl font-bold hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 text-sm sm:text-base border border-blue-400/30"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Se connecter en tant que ce vendeur</span>
                  <span className="sm:hidden">Se connecter en tant que vendeur</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedSellerDetails(null);
                  setIsEditingPassword(false);
                  setEditedPassword('');
                  setIsEditingPin(false);
                  setPinCode(['', '', '', '', '', '']);
                }}
                className="px-4 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 bg-white/10 border-2 border-white/20 text-white rounded-lg sm:rounded-xl font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Delete Button */}
      {selectedSellers.length > 0 && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
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

export default SellerManager;
