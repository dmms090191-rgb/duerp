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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        w-72 flex-shrink-0 bg-gradient-to-b from-[#1e3a5f] via-[#2c4a6f] to-[#1e3a5f]
        lg:static lg:block
        fixed top-0 left-0 h-screen z-50
        transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo Section */}
          <div className="mb-8 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="text-center">
                <span className="text-[#2c4a6f] text-3xl font-bold tracking-wider">FPE</span>
              </div>
            </div>
          </div>

          {/* Top Icons */}
          <div className="flex items-center justify-end gap-3 mb-6">
            <button className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Navigation */}
          <nav className="space-y-2 flex-1 overflow-y-auto">
            <button
              onClick={() => handleTabChange('bulk-import')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'bulk-import'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="text-left">Import de masse</span>
            </button>
            <button
              onClick={() => handleTabChange('leads-tab')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'leads-tab'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-left">Clients</span>
            </button>
            <button
              onClick={() => handleTabChange('leads')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'leads'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-left">Gestionnaire de leads</span>
            </button>
            <button
              onClick={() => handleTabChange('sellers')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'sellers'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-left">Gestionnaire vendeur</span>
            </button>
            <button
              onClick={() => handleTabChange('admins')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'admins'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-left">Info Admin</span>
            </button>
            <button
              onClick={() => handleTabChange('users-monitor')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'users-monitor'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="text-left">Suivi connexions</span>
            </button>
            <button
              onClick={() => handleTabChange('all-accounts')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'all-accounts'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-left">Tous les comptes</span>
            </button>
            <button
              onClick={() => handleTabChange('chat')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-left">Messagerie</span>
            </button>
            <button
              onClick={() => handleTabChange('chat-vendeur')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'chat-vendeur'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-left">Chat Vendeur</span>
            </button>
            <button
              onClick={() => handleTabChange('statuses')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'statuses'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Tag className="w-5 h-5" />
              <span className="text-left">Statuts</span>
            </button>
            <button
              onClick={() => handleTabChange('argumentaire')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'argumentaire'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-left">Argumentaire</span>
            </button>
            <button
              onClick={() => handleTabChange('email-config')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'email-config'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-left">Config Emails</span>
            </button>
            <button
              onClick={() => handleTabChange('signature')}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'signature'
                  ? 'bg-white text-[#2c4a6f] shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileSignature className="w-5 h-5" />
              <span className="text-left">Signature Email</span>
            </button>
          </nav>

          {/* Logout Button at Bottom */}
          <div className="mt-auto pt-6 space-y-3">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100/50">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Panneau Administrateur
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationSystem
              adminEmail={user?.email || ''}
              onNotificationClick={handleNotificationClick}
            />
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2c4a6f] to-[#3d5a9e] rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-800">
                {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.email.split('@')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
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
              <div className="flex flex-col h-[calc(100vh-200px)]">
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
    </div>
  );
};

export default Dashboard;