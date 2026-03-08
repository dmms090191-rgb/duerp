import React from 'react';
import { Users, Circle, Clock } from 'lucide-react';
import { Seller } from '../types/Seller';
import { Admin } from '../types/Admin';

interface UsersMonitorProps {
  sellers: Seller[];
  admins: Admin[];
}

const UsersMonitor: React.FC<UsersMonitorProps> = ({ sellers, admins }) => {
  const formatLastConnection = (lastConnection?: string) => {
    if (!lastConnection) return 'Jamais connecté';

    const date = new Date(lastConnection);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const allUsers = [
    ...admins.map(admin => ({ ...admin, type: 'Admin' as const })),
    ...sellers.map(seller => ({ ...seller, type: 'Seller' as const }))
  ].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    if (a.lastConnection && b.lastConnection) {
      return new Date(b.lastConnection).getTime() - new Date(a.lastConnection).getTime();
    }
    return 0;
  });

  const onlineCount = allUsers.filter(u => u.isOnline).length;
  const totalCount = allUsers.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Utilisateurs Connectés</h2>
            <p className="text-blue-100">Surveillance en temps réel</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl font-bold">{onlineCount}/{totalCount}</div>
            <div className="text-sm text-blue-100">En ligne</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Administrateurs ({admins.length})</h3>
          </div>
          <div className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Aucun administrateur</p>
            ) : (
              admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {admin.prenom[0]}{admin.nom[0]}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${admin.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{admin.prenom} {admin.nom}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {admin.isOnline ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <Circle className="w-2 h-2 fill-current" />
                        En ligne
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-3 h-3" />
                        {formatLastConnection(admin.lastConnection)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Vendeurs ({sellers.length})</h3>
          </div>
          <div className="space-y-3">
            {sellers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Aucun vendeur</p>
            ) : (
              sellers.map(seller => (
                <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-medium">
                        {seller.prenom[0]}{seller.nom[0]}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${seller.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{seller.prenom} {seller.nom}</div>
                      <div className="text-sm text-gray-500">{seller.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {seller.isOnline ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <Circle className="w-2 h-2 fill-current" />
                        En ligne
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-3 h-3" />
                        {formatLastConnection(seller.lastConnection)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tous les utilisateurs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nom</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.type === 'Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.isOnline ? (
                      <span className="text-green-600 font-medium">En ligne</span>
                    ) : (
                      formatLastConnection(user.lastConnection)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersMonitor;
