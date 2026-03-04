import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, Send, Trash2, X, Search, Paperclip, FileText, Download, ArrowLeft } from 'lucide-react';
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
    if (selectedClient) {
      const currentClient = clients.find(c => c.id === selectedClient.id);
      if (currentClient && currentClient.vendeur &&
          currentClient.vendeur !== 'Super Admin' &&
          currentClient.vendeur !== adminFullName &&
          currentClient.vendeur !== '') {
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
        setMessages(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
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
        message: newMessage.trim() || 'Fichier joint',
        read: false,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        alert('Erreur lors de l\'envoi du message');
      } else {
        setNewMessage('');
        setSelectedFile(null);
        await loadMessages(selectedClient.id);
        await loadClientsWithDiscussions();
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
      `Etes-vous sur de vouloir supprimer toute la conversation avec ${selectedClient.full_name} ? Cette action est irreversible.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('client_id', selectedClient.id);

      if (error) {
        alert('Erreur lors de la suppression de la conversation');
      } else {
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
        alert('Erreur lors de la suppression du message');
      } else {
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
          <h3 className="text-2xl font-black text-white mb-4">Aucune conversation</h3>
          <p className="text-cyan-300/70">Les conversations entre clients et sellers apparaitront ici</p>
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
              <mark key={index} className="bg-cyan-400/30 px-1 rounded">{part}</mark>
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
        className={`w-full text-left p-3 lg:p-4 rounded-xl border transition-all duration-300 group/card ${
          selectedClient?.id === client.id
            ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 shadow-lg shadow-cyan-500/10'
            : 'border-slate-700/50 hover:border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-slate-800/80 hover:to-slate-900/80'
        }`}
      >
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity ${selectedClient?.id === client.id ? 'bg-cyan-500/30 opacity-100' : 'bg-cyan-500/20 opacity-0 group-hover/card:opacity-100'}`}></div>
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/30">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm lg:text-base font-bold text-white truncate">
              {client.full_name && client.full_name.trim()
                ? highlightText(client.full_name, searchQuery)
                : highlightText(client.email, searchQuery)}
            </p>
            <p className="text-xs text-cyan-300/50 truncate">
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
              Conversations ({clientsWithDiscussions.length})
            </h3>
          </div>

          <div className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/30 text-white placeholder-cyan-300/40 rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 text-sm transition-all duration-300 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400/50 hover:text-cyan-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="relative space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent hover:scrollbar-thumb-cyan-400/60">
            {clientsWithDiscussions.length === 0 ? (
              <p className="text-sm text-cyan-300/50 text-center py-4 font-medium">
                {searchQuery ? 'Aucun resultat' : 'Aucune discussion'}
              </p>
            ) : (
              clientsWithDiscussions.map((client) => <ClientCard key={client.id} client={client} />)
            )}
          </div>
        </div>
      </div>

      <div className={`lg:col-span-3 flex flex-col h-full ${showMobileChat ? 'block' : 'hidden lg:block'} ${showMobileChat ? 'fixed inset-0 z-50 lg:relative lg:z-auto' : ''}`}>
        {selectedClient ? (
          <div className="relative flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-none lg:rounded-2xl shadow-2xl overflow-hidden w-full border-0 lg:border border-cyan-500/30">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
            <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-cyan-500/30 flex-shrink-0">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 active:scale-95 shadow-lg shadow-cyan-500/10 flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5 text-cyan-400" />
                  </button>
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                      <span className="text-lg sm:text-xl font-black text-white">
                        {selectedClient.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text truncate">
                      {selectedClient.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="relative w-2 h-2 bg-cyan-400 rounded-full animate-pulse">
                        <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm animate-ping"></div>
                      </div>
                      <p className="text-cyan-300/70 text-xs sm:text-sm font-medium truncate">
                        {selectedClient.vendeur ? `Vendeur: ${selectedClient.vendeur}` : 'Sans vendeur assigne'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteConversation}
                    className="relative group/btn flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
                    title="Supprimer la conversation"
                  >
                    <Trash2 className="relative w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </button>
                </div>
              </div>

              <div
                ref={chatContainerRef}
                className="relative flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3"
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8 text-center shadow-2xl">
                        <div className="relative mx-auto mb-4" style={{ width: 56, height: 56 }}>
                          <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50 mx-auto">
                            <MessageSquare className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <p className="text-base font-bold text-white mb-2">Aucun message pour le moment</p>
                        <p className="text-sm text-cyan-300/70">Commencez la conversation !</p>
                      </div>
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
                          <div className="flex items-center justify-center my-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md"></div>
                              <div className="relative bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-cyan-500/30 text-cyan-300/80 text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">
                                {messageDate}
                              </div>
                            </div>
                          </div>
                        )}
                        <div
                          className={`flex ${
                            msg.sender_type === 'seller' || msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className="relative group inline-block max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-md">
                            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                              msg.sender_type === 'admin'
                                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                                : msg.sender_type === 'seller'
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
                                : 'bg-gradient-to-r from-slate-500/10 to-slate-400/10'
                            }`}></div>

                            <div
                              className={`relative backdrop-blur-xl px-4 py-3 transition-all duration-300 hover:scale-[1.01] ${
                                msg.sender_type === 'seller'
                                  ? 'bg-gradient-to-br from-cyan-600/90 to-blue-600/90 text-white rounded-2xl rounded-br-md border border-cyan-400/40 shadow-lg shadow-cyan-500/20'
                                  : msg.sender_type === 'admin'
                                  ? 'bg-gradient-to-br from-blue-600/90 to-cyan-700/90 text-white rounded-2xl rounded-br-md border border-blue-400/40 shadow-lg shadow-blue-500/20'
                                  : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-white rounded-2xl rounded-bl-md border border-slate-600/40 shadow-lg'
                              }`}
                            >
                              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-40 ${
                                msg.sender_type === 'admin' ? 'via-blue-400' : msg.sender_type === 'seller' ? 'via-cyan-400' : 'via-slate-500'
                              }`}></div>

                              {msg.sender_type === 'client' && (
                                <p className="text-[10px] sm:text-xs font-black tracking-wider mb-1.5 text-cyan-400">
                                  {msg.sender_name || selectedClient.full_name}
                                </p>
                              )}
                              <p className="text-[13px] sm:text-sm lg:text-base break-words leading-relaxed">{msg.message}</p>

                              {msg.attachment_url && (
                                <div className="mt-2.5 pt-2.5 border-t border-white/15">
                                  <a
                                    href={msg.attachment_url}
                                    download={msg.attachment_name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-300 group/file"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border border-cyan-400/30 flex-shrink-0">
                                      <FileText className="w-4 h-4 text-cyan-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold truncate text-white/90">
                                        {msg.attachment_name || 'Fichier'}
                                      </p>
                                    </div>
                                    <Download className="w-4 h-4 text-cyan-300/70 group-hover/file:text-cyan-300 transition-colors flex-shrink-0" />
                                  </a>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 justify-end mt-2">
                                <span className={`text-[10px] sm:text-xs font-medium ${
                                  msg.sender_type === 'seller' || msg.sender_type === 'admin' ? 'text-white/50' : 'text-slate-400'
                                }`}>
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-red-500/40 border border-red-400/50 hover:scale-110"
                              title="Supprimer ce message"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="relative px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-cyan-500/30 flex-shrink-0">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

                {selectedFile && (
                  <div className="mb-3 relative">
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-xl blur-md"></div>
                    <div className="relative flex items-center gap-3 p-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-lg">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border border-cyan-400/30 flex-shrink-0">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-cyan-300/60 font-medium">{(selectedFile.size / 1024).toFixed(1)} Ko</p>
                      </div>
                      <button
                        onClick={removeSelectedFile}
                        className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 hover:border-red-400/50 text-red-400 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                    className="relative flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/30 hover:border-cyan-400/50 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group/attach"
                    title="Joindre un fichier"
                  >
                    <Paperclip className="relative w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </button>
                  <div className="flex-1">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Votre message..."
                      disabled={sending}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 outline-none disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base text-white placeholder-cyan-300/40 hover:border-cyan-400/40 transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || sending}
                    className="relative flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 active:scale-95 border border-cyan-400/50 group/send"
                    title="Envoyer le message"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-400 blur-md opacity-40 group-hover/send:opacity-60 transition-opacity"></div>
                    {uploading ? (
                      <div className="relative w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="relative w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
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
              <p className="text-cyan-300/70 font-medium">Selectionnez une conversation pour la visualiser</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatViewer;
