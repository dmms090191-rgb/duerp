import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, ShoppingBag, X, Trash2, Paperclip, FileText, Download, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Seller {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Message {
  id: string;
  seller_id: string;
  sender_id: string;
  sender_type: 'admin' | 'seller';
  sender_name?: string;
  message: string;
  read: boolean;
  created_at: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
}

interface SellerChatViewerProps {
  supabaseUrl: string;
  supabaseKey: string;
  preselectedSellerId?: string | null;
  adminEmail: string;
  sellers: Seller[];
}

const SellerChatViewer: React.FC<SellerChatViewerProps> = ({
  supabaseUrl,
  supabaseKey,
  preselectedSellerId,
  adminEmail,
  sellers,
}) => {
  const [sellersWithMessages, setSellersWithMessages] = useState<Set<string>>(new Set());
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    loadSellersWithDiscussions();
  }, []);

  useEffect(() => {
    if (selectedSeller) {
      isFirstLoadRef.current = true;
      loadMessages(selectedSeller.id);
      const interval = setInterval(() => {
        loadMessages(selectedSeller.id);
        loadSellersWithDiscussions();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSeller]);

  useEffect(() => {
    if (preselectedSellerId && sellers.length > 0) {
      const seller = sellers.find(s => s.id === preselectedSellerId);
      if (seller) {
        setSelectedSeller(seller);
      }
    }
  }, [preselectedSellerId, sellers]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      isUserScrollingRef.current = !isAtBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedSeller]);

  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCountRef.current;
    const shouldScroll = isFirstLoadRef.current || (!isUserScrollingRef.current && isNewMessage);

    if (shouldScroll && messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
        isFirstLoadRef.current = false;
      }, 100);
      lastMessageCountRef.current = messages.length;
      return () => clearTimeout(timer);
    }

    lastMessageCountRef.current = messages.length;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSellersWithDiscussions = async () => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?select=seller_id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sellerIds = new Set(data.map((msg: any) => msg.seller_id));
        setSellersWithMessages(sellerIds);
      }
    } catch (error) {
      console.error('Error loading sellers with discussions:', error);
    }
  };

  const loadMessages = async (sellerId: string) => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?seller_id=eq.${sellerId}&order=created_at.asc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `seller-admin-${selectedSeller?.id}/${fileName}`;

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

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedSeller || sending) return;

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

      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            seller_id: selectedSeller.id,
            sender_id: adminEmail,
            sender_type: 'admin',
            sender_name: 'Admin',
            message: newMessage.trim() || 'Fichier joint',
            read: false,
            attachment_url: attachmentUrl,
            attachment_name: attachmentName,
            attachment_type: attachmentType,
          }),
        }
      );

      if (response.ok) {
        setNewMessage('');
        setSelectedFile(null);
        isUserScrollingRef.current = false;
        loadMessages(selectedSeller.id);

        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteAllMessages = async () => {
    if (!selectedSeller) return;

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?seller_id=eq.${selectedSeller.id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        setMessages([]);
        setShowDeleteConfirm(false);
        await loadSellersWithDiscussions();
        alert('Tous les messages ont ete supprimes');
      } else {
        alert('Erreur lors de la suppression des messages');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des messages:', error);
      alert('Erreur lors de la suppression des messages');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selectedSeller) return;

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?id=eq.${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        await loadMessages(selectedSeller.id);
        await loadSellersWithDiscussions();
      } else {
        alert('Erreur lors de la suppression du message');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      alert('Erreur lors de la suppression du message');
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

  const sellersWithDiscussions = sellers
    .filter(seller => sellersWithMessages.has(seller.id))
    .filter(seller => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const fullName = `${seller.prenom} ${seller.nom}`.toLowerCase();
      const nameParts = fullName.split(' ');
      return fullName.includes(query) || nameParts.some(part => part.startsWith(query));
    });

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

  const SellerCard = ({ seller }: { seller: Seller }) => {
    const fullName = `${seller.prenom} ${seller.nom}`;
    return (
      <button
        key={seller.id}
        onClick={() => setSelectedSeller(seller)}
        className={`w-full text-left p-3 rounded-xl border transition-all duration-300 group/card ${
          selectedSeller?.id === seller.id
            ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 shadow-lg shadow-cyan-500/10'
            : 'border-slate-700/50 hover:border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-slate-800/80 hover:to-slate-900/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity ${selectedSeller?.id === seller.id ? 'bg-cyan-500/30 opacity-100' : 'bg-cyan-500/20 opacity-0 group-hover/card:opacity-100'}`}></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/30">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {highlightText(fullName, searchQuery)}
            </p>
            <p className="text-xs text-cyan-300/50 truncate">{seller.email}</p>
          </div>
        </div>
      </button>
    );
  };

  let lastDate = '';

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
      <div className={`lg:col-span-1 space-y-4 h-full ${selectedSeller ? 'hidden lg:block' : 'block'}`}>
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
              Conversations ({sellersWithDiscussions.length})
            </h3>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un vendeur..."
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

          <div className="relative space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent hover:scrollbar-thumb-cyan-400/60">
            {sellersWithDiscussions.length === 0 ? (
              <p className="text-sm text-cyan-300/50 text-center py-4 font-medium">
                {searchQuery ? 'Aucun resultat' : 'Aucune discussion'}
              </p>
            ) : (
              sellersWithDiscussions.map((seller) => <SellerCard key={seller.id} seller={seller} />)
            )}
          </div>
        </div>
      </div>

      <div className={`lg:col-span-3 flex flex-col h-full ${selectedSeller ? 'fixed inset-0 z-50 lg:static lg:z-auto' : 'hidden lg:flex'}`}>
        {selectedSeller ? (
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
                    onClick={() => setSelectedSeller(null)}
                    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 active:scale-95 shadow-lg shadow-cyan-500/10"
                  >
                    <ArrowLeft className="w-5 h-5 text-cyan-400" />
                  </button>
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                      <span className="text-lg sm:text-xl font-black text-white">
                        {selectedSeller.prenom.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text truncate">
                      {selectedSeller.prenom} {selectedSeller.nom}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="relative w-2 h-2 bg-cyan-400 rounded-full animate-pulse">
                        <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm animate-ping"></div>
                      </div>
                      <p className="text-cyan-300/70 text-xs sm:text-sm font-medium truncate">{selectedSeller.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="relative group/btn flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105 active:scale-95"
                    title="Supprimer la conversation"
                  >
                    <Trash2 className="relative w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </button>
                </div>
              </div>

              {showDeleteConfirm && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl max-w-md w-full overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50"></div>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-red-500/30 rounded-xl blur-lg"></div>
                          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center border border-red-400/50 shadow-lg shadow-red-500/50">
                            <Trash2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-lg font-black text-transparent bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text">
                          Supprimer la conversation
                        </h3>
                      </div>
                      <p className="text-sm text-cyan-200/80 mb-6 leading-relaxed">
                        Etes-vous sur de vouloir supprimer tous les messages de cette conversation ? Cette action est irreversible.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-300 rounded-xl font-bold transition-all duration-300 text-sm"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={deleteAllMessages}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 text-sm border border-red-400/50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3">
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
                    const isAdminMessage = msg.sender_type === 'admin';

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
                        <div className={`relative flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className="relative group inline-block max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-md">
                            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                              isAdminMessage
                                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                                : 'bg-gradient-to-r from-slate-500/10 to-slate-400/10'
                            }`}></div>

                            <div
                              className={`relative backdrop-blur-xl px-4 py-3 transition-all duration-300 hover:scale-[1.01] ${
                                isAdminMessage
                                  ? 'bg-gradient-to-br from-blue-600/90 to-cyan-700/90 text-white rounded-2xl rounded-br-md border border-blue-400/40 shadow-lg shadow-blue-500/20'
                                  : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-white rounded-2xl rounded-bl-md border border-slate-600/40 shadow-lg'
                              }`}
                            >
                              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-40 ${
                                isAdminMessage ? 'via-blue-400' : 'via-slate-500'
                              }`}></div>

                              {!isAdminMessage && (
                                <p className="text-[10px] sm:text-xs font-black tracking-wider mb-1.5 text-cyan-400">
                                  {msg.sender_name || 'Vendeur'}
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
                                  isAdminMessage ? 'text-white/50' : 'text-slate-400'
                                }`}>
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteMessage(msg.id)}
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

                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 items-end">
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
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Votre message..."
                      disabled={sending}
                      rows={1}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 outline-none disabled:opacity-40 disabled:cursor-not-allowed resize-none text-sm sm:text-base text-white placeholder-cyan-300/40 hover:border-cyan-400/40 transition-all duration-300 shadow-inner"
                      style={{ minHeight: '42px', maxHeight: '100px' }}
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
              <h3 className="text-xl font-black text-white mb-3">Chat Vendeur</h3>
              <p className="text-cyan-300/70 font-medium">
                Selectionnez un vendeur dans la liste pour demarrer ou continuer une conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChatViewer;
