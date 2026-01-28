import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, Eye, Send, Trash2, X, Search, Paperclip, FileText, Download, ArrowLeft } from 'lucide-react';
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
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
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
  const [adminFullName, setAdminFullName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAdminInfo();
    loadClientsWithDiscussions();
    loadClients();

    // Rafraîchir la liste toutes les 5 secondes pour détecter les changements d'attribution
    const interval = setInterval(() => {
      loadClientsWithDiscussions();
      loadClients();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadAdminInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('full_name')
        .eq('email', adminEmail)
        .maybeSingle();

      if (data && !error) {
        setAdminFullName(data.full_name || '');
        console.log('👤 Nom complet de l\'admin:', data.full_name);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des infos admin:', error);
    }
  };

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
    // Scroll uniquement si l'utilisateur n'est pas en train de taper
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 200);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    // Ne montrer que les clients qui ont des messages ET qui n'ont pas de vendeur ou sont assignés à cet admin
    const allClients = clients.filter(client =>
      clientsWithMessages.has(client.id) &&
      (!client.vendeur || client.vendeur === '' || client.vendeur === 'Super Admin' || client.vendeur === adminFullName)
    );

    console.log('🔍 Filtrage des clients - Nom admin:', adminFullName);
    console.log('🔍 Clients avec messages:', Array.from(clientsWithMessages));
    console.log('🔍 Clients filtrés pour admin:', allClients.map(c => ({ id: c.id, nom: c.full_name, vendeur: c.vendeur })));

    const filtered = allClients.filter(client => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const fullName = client.full_name.toLowerCase();
      const nameParts = fullName.split(' ');
      return fullName.includes(query) ||
             nameParts.some(part => part.startsWith(query));
    });

    // Si le client sélectionné a maintenant un vendeur assigné (n'est plus pour l'admin), le désélectionner
    if (selectedClient) {
      const currentClient = clients.find(c => c.id === selectedClient.id);
      if (currentClient && currentClient.vendeur &&
          currentClient.vendeur !== 'Super Admin' &&
          currentClient.vendeur !== adminFullName &&
          currentClient.vendeur !== '') {
        console.log(`🔄 Client ${currentClient.full_name} a été assigné au vendeur ${currentClient.vendeur}`);
        setSelectedClient(null);
      }
    }

    if (searchQuery.trim() && filtered.length === 1) {
      setSelectedClient(filtered[0]);
    }
  }, [searchQuery, clients, clientsWithMessages, adminFullName]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedClient(null);
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

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `admin-${selectedClient?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erreur upload fichier:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      return null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 10 Mo)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedClient || sending) return;

    setSending(true);
    setUploading(true);

    try {
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      if (selectedFile) {
        attachmentUrl = await uploadFile(selectedFile);
        if (!attachmentUrl) {
          alert('Erreur lors de l\'upload du fichier');
          return;
        }
        attachmentName = selectedFile.name;
        attachmentType = selectedFile.type;
      }

      const messageData = {
        client_id: selectedClient.id,
        sender_id: `admin-${adminEmail}`,
        sender_type: 'admin',
        sender_name: 'Support',
        message: newMessage.trim() || '📎 Fichier joint',
        read: false,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
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
        setSelectedFile(null);
        await loadMessages(selectedClient.id);
        await loadClientsWithDiscussions();

        // Remettre le focus sur l'input pour garder le clavier ouvert sur mobile
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
      setUploading(false);
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
    .filter(client => !client.vendeur || client.vendeur.trim() === '' || client.vendeur === 'Super Admin' || client.vendeur === adminFullName)
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
    .filter(client => !client.vendeur || client.vendeur.trim() === '' || client.vendeur === 'Super Admin' || client.vendeur === adminFullName);

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
        onClick={() => handleClientSelect(client)}
        className={`w-full text-left p-3 lg:p-4 rounded-lg border transition-all ${
          selectedClient?.id === client.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm lg:text-base font-semibold text-gray-900 truncate">
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
    <div className="h-full flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
      <div className={`lg:col-span-1 space-y-4 h-full ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            <h3 className="text-base lg:text-lg font-bold text-gray-900">
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

          <div className="space-y-3 flex-1 overflow-y-auto mb-4">
            {clientsWithDiscussions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {searchQuery ? 'Aucun résultat' : 'Aucune discussion'}
              </p>
            ) : (
              clientsWithDiscussions.map((client) => <ClientCard key={client.id} client={client} />)
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              <h3 className="text-base lg:text-lg font-bold text-gray-900">
                Sans discussion ({clientsWithoutDiscussions.length})
              </h3>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {clientsWithoutDiscussions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Tous les clients ont des discussions</p>
              ) : (
                clientsWithoutDiscussions.map((client) => <ClientCard key={client.id} client={client} />)
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`lg:col-span-3 flex flex-col h-full ${showMobileChat ? 'block' : 'hidden lg:block'} ${showMobileChat ? 'fixed inset-0 z-50 lg:relative lg:z-auto' : ''}`}>
        {selectedClient ? (
          <div className="flex flex-col h-full bg-white relative rounded-2xl shadow-xl overflow-hidden w-full">
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleBackToList}
                  className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                  title="Retour à la liste"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full shadow-lg flex-shrink-0">
                  <span className="text-lg sm:text-2xl font-bold text-white">
                    {selectedClient.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {selectedClient.full_name}
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm truncate">
                    {selectedClient.vendeur ? `Vendeur: ${selectedClient.vendeur}` : 'Sans vendeur assigné'}
                  </p>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                  title="Supprimer la conversation"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="p-3 sm:p-4 md:p-5 space-y-3 overflow-y-auto flex-1 bg-gradient-to-b from-blue-50/30 to-sky-50/30"
            >
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
                        <div className="flex items-center justify-center my-2 sm:my-3">
                          <div className="bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                            {messageDate}
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          msg.sender_type === 'seller' || msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="relative group inline-block max-w-[75%] sm:max-w-[70%] md:max-w-md">
                          <div
                            className={`${
                              msg.sender_type === 'seller'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md'
                                : msg.sender_type === 'admin'
                                ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md'
                                : 'bg-white text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl border-2 border-gray-100'
                            } px-3 py-2 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-shadow duration-200`}
                          >
                            {msg.sender_type === 'client' && (
                              <p className="text-xs font-bold mb-1.5 text-blue-600">
                                {msg.sender_name || selectedClient.full_name}
                              </p>
                            )}
                            <p className="text-sm break-words leading-relaxed">{msg.message}</p>

                            {msg.attachment_url && (
                              <div className="mt-2 pt-2 border-t border-white/20">
                                <a
                                  href={msg.attachment_url}
                                  download={msg.attachment_name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-lg ${
                                    msg.sender_type === 'seller' || msg.sender_type === 'admin'
                                      ? 'bg-white/10 hover:bg-white/20'
                                      : 'bg-gray-100 hover:bg-gray-200'
                                  } transition-colors`}
                                >
                                  <FileText className="w-5 h-5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      {msg.attachment_name || 'Fichier'}
                                    </p>
                                  </div>
                                  <Download className="w-4 h-4 flex-shrink-0" />
                                </a>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 justify-end mt-2">
                              <span
                                className={`text-xs font-medium ${
                                  msg.sender_type === 'seller' || msg.sender_type === 'admin'
                                    ? 'text-white/70'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            title="Supprimer ce message"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 p-2 sm:p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      {(selectedFile.size / 1024).toFixed(1)} Ko
                    </p>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                    title="Retirer le fichier"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || uploading}
                  className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Joindre un fichier"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex-1">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Votre message..."
                    disabled={sending}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-[#3d5a9e]/30 focus:border-[#3d5a9e] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                    style={{ minHeight: '42px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || sending}
                  className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white rounded-full font-bold hover:from-[#4d6bb8] hover:to-[#5d7bc8] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
                  title="Envoyer le message"
                >
                  {uploading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
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
