import React from 'react';
import { ShoppingBag, LogOut, User, Bell, Settings, Users, MessageSquare, ArrowLeft, Plus, Mail, Phone, Lock, UserPlus } from 'lucide-react';
import { Seller } from '../types/Seller';
import { Lead } from '../types/Lead';
import SellerChatList from './SellerChatList';

interface SellerDashboardProps {
  sellerData: Seller & { isAdminViewing?: boolean };
  onLogout: () => void;
  onReturnToAdmin?: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerData, onLogout, onReturnToAdmin }) => {
  const [activeTab, setActiveTab] = React.useState<'leads' | 'chat'>('leads');
  const [myLeads, setMyLeads] = React.useState<Lead[]>([]);
  const [formData, setFormData] = React.useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: ''
  });

  React.useEffect(() => {
    const savedLeads = localStorage.getItem(`seller_leads_${sellerData.id}`);
    if (savedLeads) {
      setMyLeads(JSON.parse(savedLeads));
    }
  }, [sellerData.id]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLead: Lead = {
      id: generateId(),
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      motDePasse: formData.motDePasse,
      telephone: formData.telephone,
      dateCreation: new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      sellerId: sellerData.id,
      sellerName: `${sellerData.prenom} ${sellerData.nom}`
    };

    const updatedLeads = [...myLeads, newLead];
    setMyLeads(updatedLeads);
    localStorage.setItem(`seller_leads_${sellerData.id}`, JSON.stringify(updatedLeads));

    setFormData({
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      telephone: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {sellerData.isAdminViewing && onReturnToAdmin && (
                <button
                  onClick={onReturnToAdmin}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md"
                  title="Retour au panel admin"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Retour Admin</span>
                </button>
              )}
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Seller</h1>
                <p className="text-xs text-gray-500">
                  {sellerData.isAdminViewing ? 'Mode visualisation admin' : 'Espace vendeur'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{sellerData.prenom} {sellerData.nom}</p>
                  <p className="text-xs text-gray-500">Seller</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {sellerData.prenom} {sellerData.nom}
              </h2>
              <p className="text-sm text-gray-500">
                Espace vendeur
              </p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('leads')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'leads'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                Leads
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Chat
              </button>
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t border-gray-200 bg-white">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Informations</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="text-gray-900">#{sellerData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créé le:</span>
                  <span className="text-gray-900">{sellerData.dateCreation}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            {activeTab === 'leads' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Gestion des Leads
                  </h1>
                  <p className="text-gray-600">
                    Créez et gérez vos leads
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Créer un Lead</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-1" />
                            Nom
                          </label>
                          <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-1" />
                            Prénom
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Lock className="w-4 h-4 inline mr-1" />
                          Mot de passe
                        </label>
                        <input
                          type="password"
                          name="motDePasse"
                          value={formData.motDePasse}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                      >
                        <UserPlus className="w-5 h-5" />
                        Créer le Lead
                      </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Mes Leads ({myLeads.length})</h2>
                    </div>

                    {myLeads.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun lead créé pour le moment</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {myLeads.map(lead => (
                          <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {lead.prenom} {lead.nom}
                                </h3>
                                <p className="text-sm text-gray-500">ID: #{lead.id}</p>
                              </div>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                Actif
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                {lead.email}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                {lead.telephone}
                              </div>
                              <div className="text-xs text-gray-400 mt-2">
                                Créé le: {lead.dateCreation}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Les leads créés sont enregistrés localement dans votre navigateur pour le moment
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Messagerie
                  </h1>
                  <p className="text-gray-600">
                    Communiquez avec vos clients
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
