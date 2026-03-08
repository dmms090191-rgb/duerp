import React, { useState, useEffect } from 'react';
import { Users, Shield, ShoppingBag, User, Mail, Phone, Calendar, Search, Filter } from 'lucide-react';

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
}

const AllAccountsList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'seller' | 'client'>('all');

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
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'client':
        return <User className="w-5 h-5 text-green-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      seller: 'bg-blue-100 text-blue-700',
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tous les comptes</h2>
        <p className="text-gray-600">Liste complète de tous les utilisateurs du système</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nom complet</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Téléphone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun compte trouvé
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(account.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(account.type)}`}>
                          {account.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{account.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{account.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {account.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{account.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          {new Date(account.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
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
