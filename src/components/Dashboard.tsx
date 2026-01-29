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
    <div className="min-h-screen bg-gradient-to-br from-[#1a2847] via-[#2d4578] to-[#1a2847] relative overflow-hidden flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.08)_0%,transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-64 md:w-72 flex flex-col
        transition-transform duration-300 z-50
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/95 via-[#2d4578]/95 to-[#1e3a5f]/95 backdrop-blur-2xl shadow-2xl border-r border-white/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.08)_0%,transparent_50%)]"></div>

        <div className="relative flex-1 overflow-y-auto px-4 md:px-5 py-6 md:py-8 scrollbar-thin scrollbar-thumb-slate-600/40 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/50">
          <div className="lg:hidden flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Menu</h2>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Logo Section Desktop */}
          <div className="hidden lg:flex mb-6 items-center justify-center">
            <div className="bg-white rounded-xl p-2 shadow-lg">
              <img
                src="/kk copy.png"
                alt="Cabinet FPE"
                className="h-14 w-auto"
              />
            </div>
          </div>

          {/* Logo Section Mobile */}
          <div className="mb-6 flex items-center justify-center lg:hidden">
            <div className="bg-white rounded-xl p-2 shadow-lg">
              <img
                src="/kk copy.png"
                alt="Cabinet FPE"
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Profile Section */}
          <div className="mb-8 p-4 md:p-5 bg-gradient-to-br from-blue-500/20 via-blue-600/15 to-purple-500/20 rounded-2xl border border-white/20 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#3a5488] to-[#2d4578] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-bold text-white truncate">
                  {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email.split('@')[0]}
                </h2>
                <p className="text-xs md:text-sm text-blue-200 font-medium">
                  Espace administrateur
                </p>
              </div>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="space-y-2 md:space-y-2.5">
            <button
              onClick={() => handleTabChange('bulk-import')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'bulk-import'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Upload className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Import de masse</span>
            </button>
            <button
              onClick={() => handleTabChange('leads-tab')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'leads-tab'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Users className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Clients</span>
            </button>
            <button
              onClick={() => handleTabChange('leads')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'leads'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Users className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate md:hidden">Gestion Lead</span>
              <span className="truncate hidden md:inline">Gestionnaire de leads</span>
            </button>
            <button
              onClick={() => handleTabChange('sellers')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'sellers'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate md:hidden">Gestion vendeur</span>
              <span className="truncate hidden md:inline">Gestionnaire vendeur</span>
            </button>
            <button
              onClick={() => handleTabChange('admins')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'admins'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Shield className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Info Admin</span>
            </button>
            <button
              onClick={() => handleTabChange('users-monitor')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'users-monitor'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Monitor className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Suivi connexions</span>
            </button>
            <button
              onClick={() => handleTabChange('all-accounts')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'all-accounts'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Users className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Tous les comptes</span>
            </button>
            <button
              onClick={() => handleTabChange('chat')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Chat Client</span>
            </button>
            <button
              onClick={() => handleTabChange('chat-vendeur')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'chat-vendeur'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Chat Vendeur</span>
            </button>
            <button
              onClick={() => handleTabChange('statuses')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'statuses'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Tag className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Statuts</span>
            </button>
            <button
              onClick={() => handleTabChange('argumentaire')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'argumentaire'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <FileText className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Argumentaire</span>
            </button>
            <button
              onClick={() => handleTabChange('email-config')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'email-config'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Settings className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Config Emails</span>
            </button>
            <button
              onClick={() => handleTabChange('signature')}
              className={`w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'signature'
                  ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white shadow-xl shadow-blue-500/30 border border-blue-400/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <FileSignature className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <span className="truncate">Signature Email</span>
            </button>
          </nav>
        </div>

        {/* Logout Button at Bottom */}
        <div className="relative px-4 md:px-5 py-6 md:py-8 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 md:px-5 py-3.5 md:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 text-xs md:text-sm border border-red-400/50"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 xl:ml-72 min-h-screen relative">
        {/* Top Header */}
        <header className="fixed top-0 left-0 lg:left-64 xl:left-72 right-0 z-30 overflow-visible border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2847]/98 via-[#2d4578]/98 to-[#1a2847]/98"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 backdrop-blur-2xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="relative flex items-center h-20 md:h-24">
              <div className="flex-1 flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="lg:hidden p-2.5 md:p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              <div className="absolute top-3 md:top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center lg:hidden">
                <div className="bg-white rounded-lg md:rounded-xl shadow-2xl p-1.5 md:p-2 border-2 border-white/50 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                  <img
                    src="/kk copy.png"
                    alt="Cabinet FPE"
                    className="h-10 md:h-12 w-auto"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row items-end md:items-center justify-end gap-2 md:gap-3">
                <NotificationSystem
                  adminEmail={user?.email || ''}
                  onNotificationClick={handleNotificationClick}
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
        </header>

        {/* Content */}
        <div className="pt-24 md:pt-28 pb-8 md:pb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-blue-500/5 to-white/5 backdrop-blur-sm"></div>
            <div className="relative p-6 md:p-8 lg:p-10">
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
              <div>
                <div className="mb-6 md:mb-8">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    Chat Client
                  </h1>
                  <p className="text-sm md:text-base text-blue-200 font-medium">
                    Communiquez avec vos clients en temps réel
                  </p>
                </div>
                <div className="flex flex-col h-[calc(100vh-300px)]">
                  <AdminChatViewer
                    supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
                    supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
                    preselectedClientId={selectedClientForChat}
                    adminEmail={user?.email || 'admin@system'}
                  />
                </div>
              </div>
            )}

            {activeTab === 'chat-vendeur' && (
              <div>
                <div className="mb-6 md:mb-8">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    Chat Vendeur
                  </h1>
                  <p className="text-sm md:text-base text-blue-200 font-medium">
                    Espace de communication avec les vendeurs
                  </p>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;