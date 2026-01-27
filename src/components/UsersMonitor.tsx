import React, { useEffect, useState } from 'react';
import { Users, Circle, UserCircle } from 'lucide-react';
import { Seller } from '../types/Seller';
import { Lead } from '../types/Lead';
import { supabase } from '../lib/supabase';

interface UsersMonitorProps {
  sellers: Seller[];
  clients: Lead[];
}

const UsersMonitor: React.FC<UsersMonitorProps> = ({ sellers, clients }) => {
  const [, setRefreshTrigger] = useState(0);

  const isReallyOnline = (isOnline: boolean, lastConnection: string | null | undefined): boolean => {
    if (!isOnline || !lastConnection) {
      return false;
    }

    const lastConnectionTime = new Date(lastConnection).getTime();
    const now = new Date().getTime();
    const twoMinutes = 2 * 60 * 1000;

    return (now - lastConnectionTime) < twoMinutes;
  };

  useEffect(() => {
    const cleanupStaleConnections = async () => {
      try {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

        await Promise.all([
          supabase
            .from('clients')
            .update({ is_online: false })
            .eq('is_online', true)
            .lt('last_connection', twoMinutesAgo),

          supabase
            .from('sellers')
            .update({ is_online: false })
            .eq('is_online', true)
            .lt('last_connection', twoMinutesAgo),

          supabase
            .from('admins')
            .update({ is_online: false })
            .eq('is_online', true)
            .lt('last_connection', twoMinutesAgo)
        ]);
      } catch (error) {
        console.error('Erreur nettoyage connexions:', error);
      }
    };

    cleanupStaleConnections();

    const interval = setInterval(() => {
      cleanupStaleConnections();
      setRefreshTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const onlineClients = clients.filter(c => isReallyOnline(c.isOnline, c.lastConnection)).sort((a, b) => {
    if (a.lastConnection && b.lastConnection) {
      return new Date(b.lastConnection).getTime() - new Date(a.lastConnection).getTime();
    }
    return 0;
  });

  const onlineSellers = sellers.filter(s => isReallyOnline(s.isOnline, s.lastConnection)).sort((a, b) => {
    if (a.lastConnection && b.lastConnection) {
      return new Date(b.lastConnection).getTime() - new Date(a.lastConnection).getTime();
    }
    return 0;
  });

  const onlineClientsCount = onlineClients.length;
  const onlineSellersCount = onlineSellers.length;
  const onlineCount = onlineClientsCount + onlineSellersCount;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Utilisateurs Connectés</h2>
            <p className="text-blue-100">Surveillance en temps réel</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl font-bold">{onlineCount}</div>
            <div className="text-sm text-blue-100">En ligne</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Clients ({onlineClients.length})</h3>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {onlineClients.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Aucun client en ligne</p>
            ) : (
              onlineClients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {client.prenom?.[0] || 'C'}{client.nom?.[0] || 'L'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-green-500 animate-pulse shadow-lg">
                        <Circle className="w-3 h-3 fill-white text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-green-800 text-lg">{client.prenom} {client.nom}</div>
                      <div className="text-sm text-green-600 font-medium">{client.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                      <Circle className="w-2.5 h-2.5 fill-current animate-pulse" />
                      En ligne
                    </div>
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
            <h3 className="text-lg font-semibold text-gray-900">Vendeurs ({onlineSellers.length})</h3>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {onlineSellers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Aucun vendeur en ligne</p>
            ) : (
              onlineSellers.map(seller => (
                <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-medium">
                        {seller.prenom[0]}{seller.nom[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{seller.prenom} {seller.nom}</div>
                      <div className="text-sm text-gray-500">{seller.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <Circle className="w-2 h-2 fill-current" />
                      En ligne
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersMonitor;
