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
import { useOnlineStatus } from '../hooks/useOnlineStatus';
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
  useOnlineStatus(user?.id || null, user?.type === 'admin' ? 'admin' : null);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-100 backdrop-blur-sm bg-white/95 sticky top-0 z-30">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl transition-all duration-200 hover:scale-105"
              >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationSystem
                adminEmail={user?.email || ''}
                onNotificationClick={handleNotificationClick}
              />
              <button className="p-2.5 text-gray-400 hover:text-[#3d5a9e] hover:bg-blue-50 rounded-xl transition-all duration-200 hidden sm:block">
                <Settings className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-9 h-9 bg-gradient-to-br from-[#3d5a9e] to-[#4d6bb8] rounded-full flex items-center justify-center shadow-md">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <LogOut className="w-4 h-4 relative z-10 transition-transform group-hover:-translate-x-0.5" />
                <span className="relative z-10 hidden sm:inline text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-2 sm:px-4 lg:px-6 py-6 w-full box-border overflow-x-hidden">
        {/* Welcome Section */}
        <div className="mb-6 bg-gradient-to-r from-[#3d5a9e] via-[#4d6bb8] to-[#5d7bc8] rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-200/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">Panneau Administrateur</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email.split('@')[0]}
              </h1>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl p-5 transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3d5a9e] group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="relative">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 group-hover:text-[#3d5a9e] transition-colors duration-300">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
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
            w-56 flex-shrink-0 bg-white rounded-2xl shadow-lg border border-gray-100
            lg:static lg:block
            fixed top-0 left-0 h-full z-50
            transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 h-full overflow-y-auto">
              <div className="lg:hidden flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-bold bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] bg-clip-text text-transparent">Menu</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1.5">
                <button
                  onClick={() => handleTabChange('bulk-import')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'bulk-import'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Upload className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'bulk-import' ? '' : 'group-hover:scale-110'}`} />
                  <span>Import de masse</span>
                </button>
                <button
                  onClick={() => handleTabChange('leads-tab')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'leads-tab'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Users className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'leads-tab' ? '' : 'group-hover:scale-110'}`} />
                  <span>Clients</span>
                </button>
                <button
                  onClick={() => handleTabChange('leads')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'leads'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Users className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'leads' ? '' : 'group-hover:scale-110'}`} />
                  <span>Gestionnaire de leads</span>
                </button>
                <button
                  onClick={() => handleTabChange('sellers')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'sellers'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <ShoppingBag className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'sellers' ? '' : 'group-hover:scale-110'}`} />
                  <span>Gestionnaire vendeur</span>
                </button>
                <button
                  onClick={() => handleTabChange('admins')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'admins'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Shield className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'admins' ? '' : 'group-hover:scale-110'}`} />
                  <span>Info Admin</span>
                </button>
                <button
                  onClick={() => handleTabChange('users-monitor')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'users-monitor'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Monitor className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'users-monitor' ? '' : 'group-hover:scale-110'}`} />
                  <span>Suivi connexions</span>
                </button>
                <button
                  onClick={() => handleTabChange('all-accounts')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'all-accounts'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Users className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'all-accounts' ? '' : 'group-hover:scale-110'}`} />
                  <span>Tous les comptes</span>
                </button>
                <button
                  onClick={() => handleTabChange('chat')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'chat'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'chat' ? '' : 'group-hover:scale-110'}`} />
                  <span>Chat Client</span>
                </button>
                <button
                  onClick={() => handleTabChange('chat-vendeur')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'chat-vendeur'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <ShoppingBag className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'chat-vendeur' ? '' : 'group-hover:scale-110'}`} />
                  <span>Chat Vendeur</span>
                </button>
                <button
                  onClick={() => handleTabChange('statuses')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'statuses'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Tag className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'statuses' ? '' : 'group-hover:scale-110'}`} />
                  <span>Statuts</span>
                </button>
                <button
                  onClick={() => handleTabChange('argumentaire')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'argumentaire'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <FileText className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'argumentaire' ? '' : 'group-hover:scale-110'}`} />
                  <span>Argumentaire</span>
                </button>
                <button
                  onClick={() => handleTabChange('email-config')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'email-config'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <Settings className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'email-config' ? '' : 'group-hover:scale-110'}`} />
                  <span>Config Emails</span>
                </button>
                <button
                  onClick={() => handleTabChange('signature')}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'signature'
                      ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-[#3d5a9e]'
                  }`}
                >
                  <FileSignature className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'signature' ? '' : 'group-hover:scale-110'}`} />
                  <span>Signature Email</span>
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