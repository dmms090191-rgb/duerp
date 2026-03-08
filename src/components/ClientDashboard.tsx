import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, FileText, Calendar, LogOut, MessageSquare, Home, ArrowLeft } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface ClientDashboardProps {
  clientData: {
    user: any;
    token: string;
    client: {
      id: string;
      email: string;
      full_name: string;
      company_name?: string;
      phone?: string;
      address?: string;
      project_description?: string;
      status: string;
      created_at: string;
      assigned_agent_name?: string;
    };
  };
  onLogout: () => void;
  isAdminViewing?: boolean;
  onReturnToAdmin?: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientData, onLogout, isAdminViewing, onReturnToAdmin }) => {
  const { client } = clientData;
  const [activeTab, setActiveTab] = useState('dashboard');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {isAdminViewing && onReturnToAdmin && (
                <button
                  onClick={onReturnToAdmin}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md"
                  title="Retour au panel admin"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Retour Admin</span>
                </button>
              )}
              <img
                src="/LOGO_OFFICIEL4096.png"
                alt="SJ Renov Pro"
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Espace Client</h1>
                <p className="text-sm text-gray-600">Bienvenue, {client.full_name}</p>
                {isAdminViewing && (
                  <p className="text-xs text-blue-600 font-medium">Mode visualisation admin</p>
                )}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-16 flex">
        <aside className="fixed left-0 top-24 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="ml-64 flex-1 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'dashboard' ? 'Mon tableau de bord' : 'Chat'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'dashboard'
                ? 'Consultez vos informations et suivez vos projets'
                : 'Discutez avec notre équipe'}
            </p>
          </div>

          {activeTab === 'dashboard' && (
            <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Mes informations</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="text-lg font-semibold text-gray-900">{client.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{client.email}</p>
                    </div>
                  </div>

                  {client.phone && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Téléphone</p>
                        <p className="text-lg font-semibold text-gray-900">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  {client.company_name && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Entreprise</p>
                        <p className="text-lg font-semibold text-gray-900">{client.company_name}</p>
                      </div>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Adresse</p>
                        <p className="text-lg font-semibold text-gray-900">{client.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Client depuis le</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(client.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {client.project_description && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Description du projet</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{client.project_description}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {client.assigned_agent_name && (
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Votre agent</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Agent assigné</p>
                      <p className="text-xl font-bold">{client.assigned_agent_name}</p>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Votre agent personnel vous accompagne dans votre projet de rénovation énergétique.
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Statut du compte</h3>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
                  <span className="text-lg font-semibold capitalize">{client.status}</span>
                </div>
                <p className="text-emerald-100 text-sm">
                  Votre compte est actif. Vous pouvez nous contacter à tout moment pour toute question.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Besoin d'aide ?</h3>
                <p className="text-gray-600 mb-6">
                  Notre équipe est là pour vous accompagner dans votre projet de rénovation énergétique.
                </p>
                <a
                  href="mailto:contact@sjrenovpro.fr"
                  className="block w-full text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                >
                  Nous contacter
                </a>
              </div>
            </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div>
              {client.assigned_agent_name ? (
                <ChatWindow
                  clientId={client.id}
                  currentUserId={client.id}
                  currentUserType="client"
                  senderName={client.full_name}
                  recipientName={client.assigned_agent_name}
                  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                  supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Messagerie</h3>
                  </div>
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun agent n'est encore assigné à votre compte</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
