import React from 'react';
import { ShoppingBag, LogOut, User, Bell, Settings, MessageSquare, ArrowLeft, UserCheck, Edit, Calendar, Phone, Mail, Briefcase, Building2, Hash, FileText, Shield } from 'lucide-react';
import { Seller } from '../types/Seller';
import SellerChatList from './SellerChatList';
import SellerWorkChat from './SellerWorkChat';
import Argumentaire from './Argumentaire';

interface SellerDashboardProps {
  sellerData: Seller & { isAdminViewing?: boolean };
  onLogout: () => void;
  onReturnToAdmin?: () => void;
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
  created_at: string;
  company_name?: string;
  siret?: string;
  activite?: string;
  vendeur?: string;
  rendez_vous?: string;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerData, onLogout, onReturnToAdmin }) => {
  const [activeTab, setActiveTab] = React.useState<'clients' | 'chat' | 'chat-travail' | 'argumentaire'>('clients');
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);

  React.useEffect(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('seller_leads_') || key.includes('leads')) {
        localStorage.removeItem(key);
      }
    });
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const url = `${supabaseUrl}/rest/v1/clients?select=*&vendeur=eq.${encodeURIComponent(sellerData.full_name)}`;

      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoadingClients(false);
    }
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
                onClick={() => setActiveTab('clients')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'clients'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                Clients
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
                Chat Client - Vendeur
              </button>
              <button
                onClick={() => setActiveTab('chat-travail')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'chat-travail'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                Chat Travail
              </button>
              <button
                onClick={() => setActiveTab('argumentaire')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'argumentaire'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                Argumentaire
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
            {activeTab === 'clients' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Clients
                  </h1>
                  <p className="text-gray-600">
                    Liste complète de tous les clients
                  </p>
                </div>

                {loadingClients ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
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
                          {clients.length === 0 ? (
                            <tr>
                              <td colSpan={13} className="text-center py-8 text-gray-500">
                                Aucun client trouvé
                              </td>
                            </tr>
                          ) : (
                            clients.map((client) => (
                              <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                                  {client.rendez_vous
                                    ? new Date(client.rendez_vous).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : '-'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                    client.status === 'active'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {client.status}
                                  </span>
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
                                    <button className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                                      <Edit className="w-3 h-3" />
                                      Modifier
                                    </button>
                                    <button className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors">
                                      <MessageSquare className="w-3 h-3" />
                                      Chat
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      {clients.length} client{clients.length > 1 ? 's' : ''} trouvé{clients.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Chat Client - Vendeur
                  </h1>
                  <p className="text-gray-600">
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
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Chat Travail
                  </h1>
                  <p className="text-gray-600">
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
              <Argumentaire />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
