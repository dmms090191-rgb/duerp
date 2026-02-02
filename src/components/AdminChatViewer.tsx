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
  clients: Client[];
}

const AdminChatViewer: React.FC<AdminChatViewerProps> = ({
  supabaseUrl,
  supabaseKey,
  preselectedClientId,
  adminEmail,
  clients,
}) => {
  console.log('🔄 AdminChatViewer rendu avec preselectedClientId:', preselectedClientId);
  const [clientsWithMessages, setClientsWithMessages] = useState<Set<number>>(new Set());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const previousMessagesLength = useRef(0);

  useEffect(() => {
    loadAdminInfo();
    loadClientsWithDiscussions();

    // Rafraîchir la liste toutes les 5 secondes pour détecter les nouveaux messages
    const interval = setInterval(() => {
      loadClientsWithDiscussions();
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

      console.log('🔍 Recherche client ID:', clientId, 'dans', clients.length, 'clients');
      console.log('✅ Client trouvé:', client);

      if (client) {
        setSelectedClient(client);
        setShowMobileChat(true);
      }
    }
  }, [preselectedClientId, clients]);

  const isScrolledToBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        setIsUserScrolling(!isScrolledToBottom());
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [selectedClient]);

  useEffect(() => {
    const hasNewMessages = messages.length > previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    if (!isUserScrolling || hasNewMessages) {
      const timer = setTimeout(() => {
        if (!isUserScrolling) {
          scrollToBottom();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages, isUserScrolling]);

  useEffect(() => {
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
  }, [clients, adminFullName, selectedClient]);

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


  if (clients.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Aucune conversation
          </h3>
          <p className="text-slate-300">
            Les conversations entre clients et sellers apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  let lastDate = '';

  const clientsWithDiscussions = clients
    .filter(client => {
      const hasMessages = clientsWithMessages.has(client.id);
      const isPreselected = preselectedClientId &&
        (typeof preselectedClientId === 'string' ? parseInt(preselectedClientId, 10) : preselectedClientId) === client.id;
      return hasMessages || isPreselected;
    })
    .filter(client => !client.vendeur || client.vendeur.trim() === '' || client.vendeur === 'Super Admin' || client.vendeur === adminFullName)
    .filter(client => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const fullName = client.full_name.toLowerCase();
      const nameParts = fullName.split(' ');
      return fullName.includes(query) ||
             nameParts.some(part => part.startsWith(query));
    });

  const ClientCard = ({ client }: { client: Client }) => {
    const highlightText = (text: string, query: string) => {
      if (!query.trim()) return <>{text}</>;
      const regex = new RegExp(`(${query})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, index) =>
            regex.test(part) ? (
              <mark key={index} className="bg-yellow-400/30 px-1 rounded">
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
            ? 'border-blue-500 bg-blue-600/20'
            : 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/50'
        }`}
      >
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm lg:text-base font-semibold text-white truncate">
              {client.full_name && client.full_name.trim()
                ? highlightText(client.full_name, searchQuery)
                : highlightText(client.email, searchQuery)}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {client.full_name && client.full_name.trim() ? client.email : 'Client'}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
      <div className={`lg:col-span-1 space-y-4 h-full ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-4 lg:p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
            <h3 className="text-base lg:text-lg font-bold text-white">
              Conversations ({clientsWithDiscussions.length})
            </h3>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600/40 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/50">
            {clientsWithDiscussions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                {searchQuery ? 'Aucun résultat' : 'Aucune discussion'}
              </p>
            ) : (
              clientsWithDiscussions.map((client) => <ClientCard key={client.id} client={client} />)
            )}
          </div>
        </div>
      </div>

      <div className={`lg:col-span-3 flex flex-col h-full ${showMobileChat ? 'block' : 'hidden lg:block'} ${showMobileChat ? 'fixed inset-0 z-50 lg:relative lg:z-auto' : ''}`}>
        {selectedClient ? (
          <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] relative rounded-none lg:rounded-2xl shadow-2xl overflow-hidden w-full">
            <div className="relative p-3 sm:p-4 border-b border-cyan-500/30 bg-gradient-to-r from-[#0f1729] via-[#1a2847] to-[#0f1729] flex-shrink-0">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3lhbiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

              <div className="relative flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleBackToList}
                  className="lg:hidden flex items-center justify-center w-9 h-9 bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-sm rounded-full transition-all duration-200 active:scale-95 border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)] flex-shrink-0"
                  title="Retour à la liste"
                >
                  <ArrowLeft className="w-5 h-5 text-cyan-400" />
                </button>
                <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-500 to-blue-500 backdrop-blur-sm rounded-full shadow-lg shadow-cyan-500/50 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 blur-md opacity-50 animate-pulse"></div>
                  <span className="relative text-base sm:text-lg lg:text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {selectedClient.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 truncate drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    {selectedClient.full_name}
                  </h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                    <div className="relative w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse">
                      <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm animate-ping"></div>
                    </div>
                    <p className="text-cyan-300 text-[10px] sm:text-xs lg:text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] truncate">
                      {selectedClient.vendeur ? `Vendeur: ${selectedClient.vendeur}` : 'Sans vendeur assigné'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 border border-red-400/40 shadow-[0_0_10px_rgba(239,68,68,0.3)] flex-shrink-0"
                  title="Supprimer la conversation"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </button>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="relative flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-[#0a0e27]/50 to-[#1a1f3a]/50"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3lhbiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              {messages.length === 0 ? (
                <div className="relative text-center py-8 sm:py-12">
                  <div className="inline-block bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl px-6 py-4 backdrop-blur-sm">
                    <p className="text-sm sm:text-base text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Aucun message pour le moment</p>
                    <p className="text-xs sm:text-sm mt-2 text-blue-300">Commencez la conversation !</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const messageDate = formatDate(msg.created_at);
                  const showDateSeparator = messageDate !== lastDate;
                  lastDate = messageDate;

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateSeparator && (
                        <div className="relative flex items-center justify-center my-2 sm:my-3">
                          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                            {messageDate}
                          </div>
                        </div>
                      )}
                      <div
                        className={`relative flex ${
                          msg.sender_type === 'seller' || msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="relative group inline-block max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-md">
                          <div
                            className={`${
                              msg.sender_type === 'seller'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                                : msg.sender_type === 'admin'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl border border-slate-600/50 shadow-[0_0_10px_rgba(148,163,184,0.2)]'
                            } px-3 sm:px-4 py-2 sm:py-3 hover:shadow-lg transition-all duration-200 backdrop-blur-sm`}
                          >
                            {msg.sender_type === 'client' && (
                              <p className={`text-[10px] sm:text-xs font-bold mb-1 sm:mb-1.5 text-blue-600`}>
                                {msg.sender_name || selectedClient.full_name}
                              </p>
                            )}
                            <p className="text-[13px] sm:text-sm lg:text-base break-words leading-relaxed">{msg.message}</p>

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
                                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs font-medium truncate">
                                      {msg.attachment_name || 'Fichier'}
                                    </p>
                                  </div>
                                  <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                </a>
                              </div>
                            )}

                            <div className="flex items-center gap-1 sm:gap-1.5 justify-end mt-1.5 sm:mt-2">
                              <span
                                className={`text-[10px] sm:text-xs font-medium ${
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
                            className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            title="Supprimer ce message"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="relative p-2 sm:p-3 lg:p-4 border-t border-cyan-500/30 bg-gradient-to-r from-[#0f1729] via-[#1a2847] to-[#0f1729]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

              {selectedFile && (
                <div className="mb-2 sm:mb-3 flex items-center gap-2 p-2 sm:p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-cyan-300 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-cyan-400/80">
                      {(selectedFile.size / 1024).toFixed(1)} Ko
                    </p>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full flex items-center justify-center transition-colors border border-red-400/40"
                    title="Retirer le fichier"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="relative flex gap-1.5 sm:gap-2 items-end">
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
                  className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-cyan-400/30 rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 outline-none disabled:bg-slate-800/50 disabled:cursor-not-allowed text-[13px] sm:text-sm lg:text-base bg-slate-800/50 text-white placeholder-cyan-300/50 hover:bg-slate-800/70 transition-all duration-200 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]"
                    style={{ minHeight: '38px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || sending}
                  className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-bold hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:scale-110 active:scale-95 border border-cyan-400/50"
                  title="Envoyer le message"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 blur-md opacity-50 animate-pulse"></div>
                  {uploading ? (
                    <div className="relative w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="relative w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-12">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300">Sélectionnez une conversation pour la visualiser</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatViewer;
