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
import SellerChatViewer from './SellerChatViewer';
import StatusManager from './StatusManager';
import Argumentaire from './Argumentaire';
import SimpleEmailConfigurator from './SimpleEmailConfigurator';
import EmailSignatureEditor from './EmailSignatureEditor';
import EmailManagerV2 from './EmailManagerV2';
import NotificationSystem from './NotificationSystem';
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
  Tag,
  FileText,
  Menu,
  X,
  FileSignature
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
  leads: Lead[];
  onLeadCreated: (lead: Lead) => void;
  onLeadsDeleted: (leadIds: number[]) => void;
  onLeadsTransferred: (leadIds: number[]) => void;
  transferredLeads: Lead[];
  onTransferredLeadsDeleted?: (clientIds: string[]) => void;
  bulkLeads: Lead[];
  onBulkLeadCreated: (lead: Lead) => void;
  onBulkLeadsDeleted: (leadIds: number[]) => void;
  onBulkLeadsTransferred: (leadIds: number[]) => void;
  homepageImage: string | null;
  onHomepageImageUpdate: (imageUrl: string | null) => void;
  registrations: Registration[];
  onApproveRegistration: (id: string) => void;
  onRejectRegistration: (id: string) => void;
  onRestoreLeads?: (leads: Lead[]) => void;
  onRestoreRegistrations?: (registrations: Registration[]) => void;
  sellers: Seller[];
  onSellerCreated: (seller: Seller) => void;
  onSellerUpdated: (seller: Seller) => void;
  onSellersDeleted: (sellerIds: string[]) => void;
  admins: Admin[];
  onAdminCreated: (admin: Admin) => void;
  onAdminsDeleted: (adminIds: string[]) => void;
  onRefreshAdmins?: () => Promise<void>;
  onClientLogin?: (lead: Lead) => void;
  onSellerLogin?: (seller: Seller) => void;
  onStatusChanged?: (leadId: string, statusId: string | null) => void;
  onLeadUpdated?: () => void;
  onAdminCredentialsUpdated?: (oldEmail: string, newEmail: string, newPassword: string) => void;
  superAdminPassword?: string;
  superAdminEmail?: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  user, onLogout, leads, onLeadCreated, onLeadsDeleted, onLeadsTransferred, transferredLeads, onTransferredLeadsDeleted,
  bulkLeads, onBulkLeadCreated, onBulkLeadsDeleted, onBulkLeadsTransferred,
  homepageImage, onHomepageImageUpdate,
  registrations, onApproveRegistration, onRejectRegistration, onRestoreLeads, onRestoreRegistrations,
  sellers, onSellerCreated, onSellerUpdated, onSellersDeleted, admins, onAdminCreated, onAdminsDeleted, onRefreshAdmins, onClientLogin, onSellerLogin, onStatusChanged, onLeadUpdated, onAdminCredentialsUpdated, superAdminPassword, superAdminEmail
}) => {
  const [activeTab, setActiveTab] = React.useState<'bulk-import' | 'leads-tab' | 'leads' | 'registrations' | 'sellers' | 'admins' | 'users-monitor' | 'chat' | 'chat-vendeur' | 'all-accounts' | 'statuses' | 'argumentaire' | 'email-config' | 'signature'>('bulk-import');
  const [selectedClientForChat, setSelectedClientForChat] = React.useState<string | number | null>(null);
  const [selectedSellerForChat, setSelectedSellerForChat] = React.useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const pendingRegistrations = registrations.filter(reg => reg.statut === 'en_attente');

  const handleOpenChatWithClient = (clientId: string | number) => {
    setSelectedClientForChat(clientId);
    setActiveTab('chat');
  };

  const handleOpenChatWithSeller = (sellerId: string) => {
    setSelectedSellerForChat(sellerId);
    setActiveTab('chat-vendeur');
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const handleNotificationClick = (chatType: 'client' | 'seller', entityId: number | string) => {
    if (chatType === 'client') {
      handleOpenChatWithClient(entityId);
    } else {
      handleOpenChatWithSeller(String(entityId));
    }
  };

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
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <NotificationSystem
                adminEmail={user?.email || ''}
                onNotificationClick={handleNotificationClick}
              />
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="group relative flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LogOut className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-12" />
                <span className="relative z-10">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-2 sm:px-4 lg:px-6 py-6 w-full box-border overflow-x-hidden">
        {/* Welcome Section */}
        <div className="mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-red-700 rounded-2xl shadow-2xl p-8 border border-red-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-100 uppercase tracking-wider mb-1">Administrateur</p>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email.split('@')[0]}
              </h1>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
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
        <div className="flex gap-4 relative w-full box-border overflow-hidden lg:overflow-visible">
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <aside className={`
            w-52 flex-shrink-0 bg-white rounded-xl shadow-sm
            lg:static lg:block
            fixed top-0 left-0 h-full z-50
            transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-3 h-full overflow-y-auto">
              <div className="lg:hidden flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleTabChange('bulk-import')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'bulk-import'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Import de masse
                </button>
                <button
                  onClick={() => handleTabChange('leads-tab')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'leads-tab'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Clients
                </button>
                <button
                  onClick={() => handleTabChange('leads')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'leads'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Gestionnaire de leads
                </button>
                <button
                  onClick={() => handleTabChange('sellers')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'sellers'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Gestionnaire vendeur
                </button>
                <button
                  onClick={() => handleTabChange('admins')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'admins'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Info Admin
                </button>
                <button
                  onClick={() => handleTabChange('users-monitor')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'users-monitor'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Suivi des connexions
                </button>
                <button
                  onClick={() => handleTabChange('all-accounts')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'all-accounts'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Tous les comptes
                </button>
                <button
                  onClick={() => handleTabChange('chat')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Client
                </button>
                <button
                  onClick={() => handleTabChange('chat-vendeur')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'chat-vendeur'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Chat Vendeur
                </button>
                <button
                  onClick={() => handleTabChange('statuses')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'statuses'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  Liste des Statuts
                </button>
                <button
                  onClick={() => handleTabChange('argumentaire')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'argumentaire'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Argumentaire
                </button>
                <button
                  onClick={() => handleTabChange('email-config')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'email-config'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Config Emails & PDFs
                </button>
                <button
                  onClick={() => handleTabChange('signature')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'signature'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileSignature className="w-4 h-4" />
                  Signature Email
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full lg:w-auto overflow-x-hidden">
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
                onLeadUpdated={onLeadUpdated}
                onOpenChat={handleOpenChatWithClient}
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

            {activeTab === 'sellers' && (
              <SellerManager
                sellers={sellers}
                onSellerCreated={onSellerCreated}
                onSellerUpdated={onSellerUpdated}
                onSellersDeleted={onSellersDeleted}
                onSellerLogin={onSellerLogin}
                onOpenChat={handleOpenChatWithSeller}
              />
            )}

            {activeTab === 'admins' && (
              <AdminManager
                admins={admins}
                onAdminCreated={onAdminCreated}
                onAdminsDeleted={onAdminsDeleted}
                currentAdminEmail={user?.email}
                onCredentialsUpdated={onAdminCredentialsUpdated}
                onRefreshAdmins={onRefreshAdmins}
                superAdminPassword={superAdminPassword}
                superAdminEmail={superAdminEmail}
              />
            )}

            {activeTab === 'users-monitor' && (
              <UsersMonitor
                sellers={sellers}
                clients={transferredLeads}
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
                      <h2 className="text-2xl font-bold mb-2">Chat Client</h2>
                      <p className="text-blue-100">Consultez toutes les conversations entre clients et vendeurs</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <MessageSquare className="w-12 h-12" />
                    </div>
                  </div>
                </div>

                <AdminChatViewer
                  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                  supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                  preselectedClientId={selectedClientForChat}
                  adminEmail={user?.email || 'admin@system'}
                />
              </div>
            )}

            {activeTab === 'chat-vendeur' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Chat Vendeur</h2>
                      <p className="text-emerald-100">Espace de communication interne avec les vendeurs</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  </div>
                </div>

                <SellerChatViewer
                  supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                  supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                  preselectedSellerId={selectedSellerForChat}
                  adminEmail={user?.email || 'admin@system'}
                  sellers={sellers}
                />
              </div>
            )}

            {activeTab === 'statuses' && (
              <StatusManager />
            )}

            {activeTab === 'argumentaire' && (
              <Argumentaire />
            )}

            {activeTab === 'email-config' && (
              <EmailManagerV2 />
            )}

            {activeTab === 'signature' && (
              <EmailSignatureEditor />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;