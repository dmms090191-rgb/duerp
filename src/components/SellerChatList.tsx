import React, { useState, useEffect } from 'react';
import { MessageSquare, User } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { supabase } from '../lib/supabase';

interface Client {
  id: string;
  full_name: string;
  email: string;
  vendeur: string;
}

interface SellerChatListProps {
  sellerId: string;
  sellerFullName: string;
  supabaseUrl: string;
  supabaseKey: string;
  preselectedClientId?: string | null;
}

const SellerChatList: React.FC<SellerChatListProps> = ({
  sellerId,
  sellerFullName,
  supabaseUrl,
  supabaseKey,
  preselectedClientId,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();

    const interval = setInterval(() => {
      loadClients();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (preselectedClientId) {
      loadAndSelectClient(preselectedClientId);
    }
  }, [preselectedClientId]);

  const loadAndSelectClient = async (clientId: string) => {
    try {
      const { data: clientData, error } = await supabase
        .from('clients')
        .select('id, full_name, email, vendeur')
        .eq('id', clientId)
        .maybeSingle();

      if (error) {
        console.error('Error loading client:', error);
        return;
      }

      if (clientData) {
        const client = clientData as Client;

        setClients(prev => {
          if (prev.some(c => c.id === clientId)) {
            return prev;
          }
          return [client, ...prev];
        });

        setSelectedClient(client);
      }
    } catch (error) {
      console.error('Error loading client:', error);
    }
  };

  const loadClients = async () => {
    try {
      const { data: allClientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, full_name, email, vendeur')
        .ilike('vendeur', sellerFullName);

      if (clientsError) {
        console.error('Error loading clients:', clientsError);
        setLoading(false);
        return;
      }

      setClients(allClientsData || []);

      if (selectedClient && !allClientsData?.some((c: Client) => c.id === selectedClient.id)) {
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center h-64 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
        <div className="relative w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-cyan-500/50"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-cyan-500/30 p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="relative text-center">
          <div className="relative mx-auto mb-6" style={{ width: 96, height: 96 }}>
            <div className="absolute inset-0 bg-cyan-500/30 rounded-2xl blur-xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-4">Aucun client assigne</h3>
          <p className="text-cyan-300/70">Vous pourrez discuter avec vos clients une fois qu'ils vous seront assignes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6" style={{ height: 'calc(100vh - 16rem)' }}>
      <div className={`lg:col-span-1 space-y-4 h-full ${selectedClient ? 'hidden lg:block' : 'block'}`}>
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-cyan-500/30 p-4 lg:p-6 h-full flex flex-col overflow-hidden backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
          <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-base lg:text-lg font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text">
              Mes Clients ({clients.length})
            </h3>
          </div>

          <div className="relative space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent hover:scrollbar-thumb-cyan-400/60">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-3 lg:p-4 rounded-xl border transition-all duration-300 group/card ${
                  selectedClient?.id === client.id
                    ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-700/50 hover:border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-slate-800/80 hover:to-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity ${selectedClient?.id === client.id ? 'bg-cyan-500/30 opacity-100' : 'bg-cyan-500/20 opacity-0 group-hover/card:opacity-100'}`}></div>
                    <div className="relative w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/30">
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm lg:text-base font-bold text-white truncate">{client.full_name}</p>
                    <p className="text-xs text-cyan-300/50 truncate">{client.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`lg:col-span-3 flex flex-col h-full ${selectedClient ? 'fixed inset-0 z-50 lg:static lg:z-auto' : 'hidden lg:flex'}`}>
        {selectedClient ? (
          <div className="relative flex flex-col h-full rounded-none lg:rounded-2xl shadow-2xl overflow-hidden w-full border-0 lg:border border-cyan-500/30">
            <ChatWindow
              clientId={selectedClient.id}
              currentUserId={sellerId}
              currentUserType="seller"
              senderName={sellerFullName}
              recipientName={selectedClient.full_name}
              supabaseUrl={supabaseUrl}
              supabaseKey={supabaseKey}
              onBack={() => setSelectedClient(null)}
            />
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
            <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[120px]"></div>
            <div className="relative text-center p-12">
              <div className="relative mx-auto mb-6" style={{ width: 64, height: 64 }}>
                <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50 mx-auto">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-cyan-300/70 font-medium">Selectionnez un client pour demarrer la conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChatList;
