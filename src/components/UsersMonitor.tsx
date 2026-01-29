import React, { useEffect, useState } from 'react';
import { Users, Circle, UserCircle, Wifi, Clock } from 'lucide-react';
import { Seller } from '../types/Seller';
import { Lead } from '../types/Lead';
import { supabase } from '../lib/supabase';

interface UsersMonitorProps {
  sellers: Seller[];
  clients: Lead[];
}

const UsersMonitor: React.FC<UsersMonitorProps> = ({ sellers, clients }) => {
  const [liveSellers, setLiveSellers] = useState<Seller[]>(sellers);
  const [liveClients, setLiveClients] = useState<Lead[]>(clients);

  const isReallyOnline = (isOnline: boolean, lastConnection: string | null | undefined): boolean => {
    if (!isOnline || !lastConnection) {
      return false;
    }

    const lastConnectionTime = new Date(lastConnection).getTime();
    const now = new Date().getTime();
    const twoMinutes = 2 * 60 * 1000;

    return (now - lastConnectionTime) < twoMinutes;
  };

  const fetchLiveData = async () => {
    try {
      const [sellersData, clientsData] = await Promise.all([
        supabase.from('sellers').select('*'),
        supabase.from('clients').select('*')
      ]);

      if (sellersData.data) {
        const formattedSellers = sellersData.data.map((s: any) => ({
          id: s.id,
          nom: s.full_name?.split(' ').pop() || '',
          prenom: s.full_name?.split(' ')[0] || '',
          full_name: s.full_name,
          email: s.email,
          isOnline: s.is_online || false,
          lastConnection: s.last_connection || undefined
        }));
        setLiveSellers(formattedSellers);
      }

      if (clientsData.data) {
        const formattedClients = clientsData.data.map((c: any) => ({
          id: c.id,
          nom: c.nom || c.full_name?.split(' ').pop() || '',
          prenom: c.prenom || c.full_name?.split(' ')[0] || '',
          email: c.email,
          isOnline: c.is_online || false,
          lastConnection: c.last_connection || undefined
        }));
        setLiveClients(formattedClients);
      }
    } catch (error) {
      console.error('Erreur chargement données en direct:', error);
    }
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

        await fetchLiveData();
      } catch (error) {
        console.error('Erreur nettoyage connexions:', error);
      }
    };

    fetchLiveData();
    cleanupStaleConnections();

    const interval = setInterval(() => {
      cleanupStaleConnections();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLiveSellers(sellers);
    setLiveClients(clients);
  }, [sellers, clients]);

  const onlineClients = liveClients.filter(c => isReallyOnline(c.isOnline, c.lastConnection)).sort((a, b) => {
    if (a.lastConnection && b.lastConnection) {
      return new Date(b.lastConnection).getTime() - new Date(a.lastConnection).getTime();
    }
    return 0;
  });

  const onlineSellers = liveSellers.filter(s => isReallyOnline(s.isOnline, s.lastConnection)).sort((a, b) => {
    if (a.lastConnection && b.lastConnection) {
      return new Date(b.lastConnection).getTime() - new Date(a.lastConnection).getTime();
    }
    return 0;
  });

  const onlineClientsCount = onlineClients.length;
  const onlineSellersCount = onlineSellers.length;
  const onlineCount = onlineClientsCount + onlineSellersCount;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Wifi className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Suivi des Connexions</h2>
              <p className="text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Surveillance en temps réel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
              <div className="text-4xl font-bold text-white mb-1">{onlineCount}</div>
              <div className="text-sm text-slate-300 font-medium">Utilisateurs en ligne</div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <UserCircle className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{onlineClientsCount}</div>
                  <div className="text-xs text-slate-400">Clients</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{onlineSellersCount}</div>
                  <div className="text-xs text-slate-400">Vendeurs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-5 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Clients</h3>
                <p className="text-sm text-gray-600">{onlineClientsCount} connecté{onlineClientsCount > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {onlineClients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <UserCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucun client en ligne</p>
                  <p className="text-sm text-gray-400 mt-1">Les clients connectés apparaîtront ici</p>
                </div>
              ) : (
                onlineClients.map(client => (
                  <div key={client.id} className="group relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-105 transition-transform">
                          {client.prenom?.[0] || 'C'}{client.nom?.[0] || 'L'}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-emerald-500 shadow-lg">
                          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-lg truncate">
                          {client.prenom} {client.nom}
                        </div>
                        <div className="text-sm text-gray-600 truncate">{client.email}</div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          En ligne
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Vendeurs</h3>
                <p className="text-sm text-gray-600">{onlineSellersCount} connecté{onlineSellersCount > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {onlineSellers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucun vendeur en ligne</p>
                  <p className="text-sm text-gray-400 mt-1">Les vendeurs connectés apparaîtront ici</p>
                </div>
              ) : (
                onlineSellers.map(seller => (
                  <div key={seller.id} className="group relative bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-105 transition-transform">
                          {seller.prenom[0]}{seller.nom[0]}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-emerald-500 shadow-lg">
                          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-lg truncate">
                          {seller.prenom} {seller.nom}
                        </div>
                        <div className="text-sm text-gray-600 truncate">{seller.email}</div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          En ligne
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersMonitor;
