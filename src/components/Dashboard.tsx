import React from 'react';
import LeadManager from './LeadManager';
import RegistrationManager from './RegistrationManager';
import BulkImport from './BulkImport';
import SellerManager from './SellerManager';
import AdminManager from './AdminManager';
import UsersMonitor from './UsersMonitor';
import LeadsTab from './LeadsTab';
import AllAccountsList from './AllAccountsList';
import AdminChatViewer from './AdminChatViewer';
import StatusManager from './StatusManager';
import { User } from '../types/User';
import { Lead } from '../types/Lead';
import { Registration } from '../types/Registration';
import { Seller } from '../types/Seller';
import { Admin } from '../types/Admin';
import {
  User as UserIcon,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Users,
  TrendingUp,
  Shield,
  Calendar,
  Mail,
  ChevronRight,
  Activity,
  UserCheck,
  Upload,
  ShoppingBag,
  Monitor,
  MessageSquare,
  Tag
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
  leads: Lead[];
  onLeadCreated: (lead: Lead) => void;
  onLeadsDeleted: (leadIds: string[]) => void;
  onLeadsTransferred: (leadIds: string[]) => void;
  transferredLeads: Lead[];
  onTransferredLeadsDeleted?: (clientIds: string[]) => void;
  bulkLeads: Lead[];
  onBulkLeadCreated: (lead: Lead) => void;
  onBulkLeadsDeleted: (leadIds: string[]) => void;
  onBulkLeadsTransferred: (leadIds: string[]) => void;
  homepageImage: string | null;
  onHomepageImageUpdate: (imageUrl: string | null) => void;
  registrations: Registration[];
  onApproveRegistration: (id: string) => void;
  onRejectRegistration: (id: string) => void;
  onRestoreLeads?: (leads: Lead[]) => void;
  onRestoreRegistrations?: (registrations: Registration[]) => void;
  sellers: Seller[];
  onSellerCreated: (seller: Seller) => void;
  onSellersDeleted: (sellerIds: string[]) => void;
  admins: Admin[];
  onAdminCreated: (admin: Admin) => void;
  onAdminsDeleted: (adminIds: string[]) => void;
  onClientLogin?: (lead: Lead) => void;
  onSellerLogin?: (seller: Seller) => void;
  onStatusChanged?: (leadId: string, statusId: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user, onLogout, leads, onLeadCreated, onLeadsDeleted, onLeadsTransferred, transferredLeads, onTransferredLeadsDeleted,
  bulkLeads, onBulkLeadCreated, onBulkLeadsDeleted, onBulkLeadsTransferred,
  homepageImage, onHomepageImageUpdate,
  registrations, onApproveRegistration, onRejectRegistration, onRestoreLeads, onRestoreRegistrations,
  sellers, onSellerCreated, onSellersDeleted, admins, onAdminCreated, onAdminsDeleted, onClientLogin, onSellerLogin, onStatusChanged
}) => {
  const [activeTab, setActiveTab] = React.useState<'bulk-import' | 'leads-tab' | 'leads' | 'registrations' | 'sellers' | 'admins' | 'users-monitor' | 'chat' | 'all-accounts' | 'statuses'>('bulk-import');

  const pendingRegistrations = registrations.filter(reg => reg.statut === 'en_attente');

  const stats = [
    { label: 'Utilisateurs Actifs', value: '12,543', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Revenus', value: '€25,420', icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Performances', value: '94.2%', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
    { label: 'Sécurité', value: '100%', icon: Shield, color: 'from-red-500 to-red-600' }
  ];

  const activities = [
    { action: 'Nouvel utilisateur inscrit', time: 'Il y a 2 min', type: 'user' },
    { action: 'Rapport mensuel généré', time: 'Il y a 15 min', type: 'report' },
    { action: 'Maintenance système terminée', time: 'Il y a 1h', type: 'system' },
    { action: 'Mise à jour système', time: 'Il y a 2h', type: 'system' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/LOGO_OFFICIEL4096.png"
                alt="SJ Renov Pro"
                className="h-36 w-auto object-contain"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user?.email.split('@')[0]}
                </span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.email.split('@')[0]} !
          </h2>
          <p className="text-gray-600">
            Voici un aperçu de votre tableau de bord
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('bulk-import')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'bulk-import'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Import de masse
                </button>
                <button
                  onClick={() => setActiveTab('leads-tab')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'leads-tab'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Leads Principal
                </button>
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'leads'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Gestionnaire de leads
                </button>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'registrations'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5" />
                    Inscriptions
                  </div>
                  {pendingRegistrations.length > 0 && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {pendingRegistrations.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('sellers')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'sellers'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Gestionnaire de Sellers
                </button>
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'admins'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Gestionnaire d'Admins
                </button>
                <button
                  onClick={() => setActiveTab('users-monitor')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'users-monitor'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                  Suivi des connexions
                </button>
                <button
                  onClick={() => setActiveTab('all-accounts')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'all-accounts'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Tous les comptes
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('statuses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'statuses'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Tag className="w-5 h-5" />
                  Liste des Statuts
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'bulk-import' && (
              <BulkImport
                leads={bulkLeads}
                onLeadCreated={onBulkLeadCreated}
                onLeadsDeleted={onBulkLeadsDeleted}
                onLeadsTransferred={onBulkLeadsTransferred}
              />
            )}

            {activeTab === 'leads-tab' && (
              <LeadsTab
                leads={transferredLeads}
                onLeadsDeleted={onTransferredLeadsDeleted || (() => {})}
                onClientLogin={onClientLogin}
                onStatusChanged={onStatusChanged}
              />
            )}

            {activeTab === 'leads' && (
              <LeadManager
                leads={leads}
                onLeadCreated={onLeadCreated}
                onLeadsDeleted={onLeadsDeleted}
                onLeadsTransferred={onLeadsTransferred}
                currentUserEmail={user?.email}
                onClientLogin={onClientLogin}
              />
            )}


            {activeTab === 'registrations' && (
              <RegistrationManager
                registrations={registrations}
                onApproveRegistration={onApproveRegistration}
                onRejectRegistration={onRejectRegistration}
              />
            )}

            {activeTab === 'sellers' && (
              <SellerManager
                sellers={sellers}
                onSellerCreated={onSellerCreated}
                onSellersDeleted={onSellersDeleted}
                onSellerLogin={onSellerLogin}
              />
            )}

            {activeTab === 'admins' && (
              <AdminManager
                admins={admins}
                onAdminCreated={onAdminCreated}
                onAdminsDeleted={onAdminsDeleted}
              />
            )}

            {activeTab === 'users-monitor' && (
              <UsersMonitor
                sellers={sellers}
                admins={admins}
              />
            )}

            {activeTab === 'all-accounts' && (
              <AllAccountsList />
            )}


            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Visualisation des Conversations</h2>
                      <p className="text-blue-100">Consultez toutes les conversations entre sellers et clients</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <MessageSquare className="w-12 h-12" />
                    </div>
                  </div>
                </div>

                <AdminChatViewer
                  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                  supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                />
              </div>
            )}

            {activeTab === 'statuses' && (
              <StatusManager />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;