import React, { useState, useEffect } from 'react';
import { Users, Shield, ShoppingBag, User, Mail, Phone, Calendar, Search, Filter, Edit, MessageSquare, Briefcase, Building2, Hash, FileText } from 'lucide-react';

interface Account {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  status: string;
  created_at: string;
  type: 'admin' | 'seller' | 'client';
  role?: string;
  commission_rate?: number;
  company_name?: string;
  prenom?: string;
  nom?: string;
  portable?: string;
  siret?: string;
  activite?: string;
  vendeur?: string;
  rendez_vous?: string;
}

const AllAccountsList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'seller' | 'client'>('client');

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const fetchAllAccounts = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const [adminsRes, sellersRes, clientsRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/admins?select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        }),
        fetch(`${supabaseUrl}/rest/v1/sellers?select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        }),
        fetch(`${supabaseUrl}/rest/v1/clients?select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        }),
      ]);

      const admins = await adminsRes.json();
      const sellers = await sellersRes.json();
      const clients = await clientsRes.json();

      const allAccounts: Account[] = [
        ...admins.map((a: any) => ({ ...a, type: 'admin' as const })),
        ...sellers.map((s: any) => ({ ...s, type: 'seller' as const })),
        ...clients.map((c: any) => ({ ...c, type: 'client' as const })),
      ];

      setAccounts(allAccounts);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.phone && account.phone.includes(searchTerm));

    const matchesFilter = filterType === 'all' || account.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'seller':
        return <ShoppingBag className="w-5 h-5 text-slate-600" />;
      case 'client':
        return <User className="w-5 h-5 text-green-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      seller: 'bg-slate-100 text-slate-700',
      client: 'bg-green-100 text-green-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const stats = [
    {
      label: 'Admins',
      count: accounts.filter(a => a.type === 'admin').length,
      icon: Shield,
      color: 'bg-red-500',
    },
    {
      label: 'Sellers',
      count: accounts.filter(a => a.type === 'seller').length,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      label: 'Clients',
      count: accounts.filter(a => a.type === 'client').length,
      icon: User,
      color: 'bg-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
          {filterType === 'client' ? 'Clients' : 'Tous les comptes'}
        </h2>
        <p className="text-blue-200 font-medium">
          {filterType === 'client'
            ? 'Liste complète de tous les clients'
            : 'Liste complète de tous les utilisateurs du système'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.count}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="admin">Admins</option>
              <option value="seller">Sellers</option>
              <option value="client">Clients</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                {filterType === 'client' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 w-32">Type</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 w-48">Nom complet</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 w-64">Société</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 w-56">Email</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 w-36">Téléphone</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 w-28">Statut</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 w-36">Créé le</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={filterType === 'client' ? 13 : 7} className="text-center py-8 text-gray-500">
                    Aucun compte trouvé
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {filterType === 'client' ? (
                      <>
                        <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                          {account.rendez_vous
                            ? new Date(account.rendez_vous).toLocaleString('fr-FR', {
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
                            account.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {account.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.prenom || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.nom || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.portable || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.activite || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.company_name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {account.siret || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate" title={account.vendeur}>
                          {account.vendeur || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                          {new Date(account.created_at).toLocaleDateString('fr-FR')}
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
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(account.type)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(account.type)}`}>
                              {account.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{account.full_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {account.company_name ? (
                            <span className="text-gray-700 font-medium">{account.company_name}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{account.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {account.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{account.phone}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            account.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {account.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 text-sm whitespace-nowrap">
                              {new Date(account.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredAccounts.length} compte{filteredAccounts.length > 1 ? 's' : ''} trouvé{filteredAccounts.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default AllAccountsList;
