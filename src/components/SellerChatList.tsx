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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Aucun client assigné
          </h3>
          <p className="text-slate-300">
            Vous pourrez discuter avec vos clients une fois qu'ils vous seront assignés
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6" style={{ height: 'calc(100vh - 16rem)' }}>
      <div className={`lg:col-span-1 space-y-4 h-full ${selectedClient ? 'hidden lg:block' : 'block'}`}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-4 lg:p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
            <h3 className="text-base lg:text-lg font-bold text-white">
              Mes Clients ({clients.length})
            </h3>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600/40 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/50">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-3 lg:p-4 rounded-lg border transition-all ${
                  selectedClient?.id === client.id
                    ? 'border-blue-500 bg-blue-600/20'
                    : 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm lg:text-base font-semibold text-white truncate">{client.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{client.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`lg:col-span-3 flex flex-col h-full ${selectedClient ? 'fixed inset-0 z-50 lg:static lg:z-auto' : 'hidden lg:flex'}`}>
        {selectedClient ? (
          <div className="flex flex-col h-full bg-white relative rounded-none lg:rounded-2xl shadow-xl overflow-hidden w-full">
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
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-12">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300">Sélectionnez un client pour démarrer la conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChatList;
