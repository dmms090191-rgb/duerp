import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, Eye, Send, Trash2, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Client {
  id: number;
  full_name: string;
  email: string;
  vendeur: string;
}

interface Message {
  id: string;
  client_id: number;
  sender_id: string;
  sender_type: 'client' | 'seller' | 'admin';
  sender_name?: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface AdminChatViewerProps {
  supabaseUrl: string;
  supabaseKey: string;
  preselectedClientId?: string | number | null;
  adminEmail: string;
}

const AdminChatViewer: React.FC<AdminChatViewerProps> = ({
  supabaseUrl,
  supabaseKey,
  preselectedClientId,
  adminEmail,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsWithMessages, setClientsWithMessages] = useState<Set<number>>(new Set());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClientsWithDiscussions();
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadMessages(selectedClient.id);
      const interval = setInterval(() => {
        loadMessages(selectedClient.id);
        loadClientsWithDiscussions();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (preselectedClientId && clients.length > 0) {
      const clientId = typeof preselectedClientId === 'string' ? parseInt(preselectedClientId, 10) : preselectedClientId;
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [preselectedClientId, clients]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const allClients = clients.filter(client => clientsWithMessages.has(client.id));
    const filtered = allClients.filter(client => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const fullName = client.full_name.toLowerCase();
      const nameParts = fullName.split(' ');
      return fullName.includes(query) ||
             nameParts.some(part => part.startsWith(query));
    });

    if (searchQuery.trim() && filtered.length === 1) {
      setSelectedClient(filtered[0]);
    }
  }, [searchQuery, clients, clientsWithMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadClientsWithDiscussions = async () => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/chat_messages?select=client_id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const uniqueClientIds = new Set(data.map((msg: { client_id: number }) => msg.client_id));
        console.log('💬 Clients avec discussions:', Array.from(uniqueClientIds));
        setClientsWithMessages(uniqueClientIds);
      }
    } catch (error) {
      console.error('Error loading clients with discussions:', error);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/clients?select=id,full_name,email,vendeur&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('👥 Tous les clients:', data);
        setClients(data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (clientId: number) => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/chat_messages?client_id=eq.${clientId}&order=created_at.asc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📨 Messages chargés pour le client', clientId, ':', data);
        setMessages(data);
      } else {
        console.error('❌ Erreur lors du chargement des messages:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient || sending) return;

    setSending(true);
    try {
      const messageData = {
        client_id: selectedClient.id,
        sender_id: `admin-${adminEmail}`,
        sender_type: 'admin',
        sender_name: 'Support',
        message: newMessage.trim(),
        read: false,
      };

      console.log('📤 Admin envoie un message:', messageData);

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('❌ Erreur lors de l\'envoi du message:', error);
        alert('Erreur lors de l\'envoi du message');
      } else {
        console.log('✅ Message admin envoyé avec succès');
        setNewMessage('');
        await loadMessages(selectedClient.id);
        await loadClientsWithDiscussions();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedClient) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer toute la conversation avec ${selectedClient.full_name} ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('client_id', selectedClient.id);

      if (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la conversation');
      } else {
        console.log('✅ Conversation supprimée avec succès');
        setMessages([]);
        setSelectedClient(null);
        await loadClientsWithDiscussions();
        await loadClients();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la suppression de la conversation');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erreur lors de la suppression du message:', error);
        alert('Erreur lors de la suppression du message');
      } else {
        console.log('✅ Message supprimé avec succès');
        await loadMessages(selectedClient.id);
        await loadClientsWithDiscussions();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la suppression du message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Aucune conversation
          </h3>
          <p className="text-gray-600">
            Les conversations entre clients et sellers apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  let lastDate = '';

  const clientsWithDiscussions = clients
    .filter(client => clientsWithMessages.has(client.id))
    .filter(client => !client.vendeur || client.vendeur.trim() === '')
    .filter(client => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const fullName = client.full_name.toLowerCase();
      const nameParts = fullName.split(' ');
      return fullName.includes(query) ||
             nameParts.some(part => part.startsWith(query));
    });
  const clientsWithoutDiscussions = clients
    .filter(client => !clientsWithMessages.has(client.id))
    .filter(client => !client.vendeur || client.vendeur.trim() === '');

  const ClientCard = ({ client }: { client: Client }) => {
    const highlightText = (text: string, query: string) => {
      if (!query.trim()) return <>{text}</>;
      const regex = new RegExp(`(${query})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, index) =>
            regex.test(part) ? (
              <mark key={index} className="bg-yellow-200 px-1 rounded">
                {part}
              </mark>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </>
      );
    };

    return (
      <button
        key={client.id}
        onClick={() => setSelectedClient(client)}
        className={`w-full text-left p-4 rounded-lg border transition-all ${
          selectedClient?.id === client.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {highlightText(client.full_name, searchQuery)}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {client.vendeur ? `Vendeur: ${client.vendeur}` : 'Sans vendeur'}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Avec discussions ({clientsWithDiscussions.length})
            </h3>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {clientsWithDiscussions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {searchQuery ? 'Aucun résultat' : 'Aucune discussion'}
              </p>
            ) : (
              clientsWithDiscussions.map((client) => <ClientCard key={client.id} client={client} />)
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Sans discussion ({clientsWithoutDiscussions.length})
            </h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {clientsWithoutDiscussions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tous les clients ont des discussions</p>
            ) : (
              clientsWithoutDiscussions.map((client) => <ClientCard key={client.id} client={client} />)
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {selectedClient ? (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedClient.full_name}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {selectedClient.vendeur ? `Vendeur: ${selectedClient.vendeur}` : 'Sans vendeur assigné'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Supprimer la conversation"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Aucun message dans cette conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const messageDate = formatDate(msg.created_at);
                  const showDateSeparator = messageDate !== lastDate;
                  lastDate = messageDate;

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {messageDate}
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          msg.sender_type === 'seller' || msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="flex flex-col gap-1 inline-block max-w-xs lg:max-w-md xl:max-w-lg">
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="self-start ml-2 p-0.5 hover:bg-gray-200 rounded transition-colors group"
                            title="Supprimer ce message"
                          >
                            <X className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
                          </button>
                          <div
                            className={`${
                              msg.sender_type === 'seller'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                : msg.sender_type === 'admin'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            } rounded-2xl px-4 py-3 shadow-sm`}
                          >
                            <p className="text-sm font-medium mb-1">
                              {msg.sender_name ||
                                (msg.sender_type === 'seller'
                                  ? (selectedClient.vendeur || 'Vendeur')
                                  : msg.sender_type === 'admin'
                                  ? 'Admin'
                                  : selectedClient.full_name)}
                            </p>
                            <p className="text-sm break-words">{msg.message}</p>
                            <div className="flex items-center gap-1 justify-end mt-2">
                              <span
                                className={`text-xs ${
                                  msg.sender_type === 'seller' || msg.sender_type === 'admin'
                                    ? 'text-white/80'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Sélectionnez une conversation pour la visualiser</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatViewer;
