import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, CheckCheck, X, Trash2, Paperclip, FileText, Download, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  client_id: string;
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

interface ChatWindowProps {
  clientId: string;
  currentUserId: string;
  currentUserType: 'client' | 'seller';
  senderName: string;
  recipientName: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  clientId,
  currentUserId,
  currentUserType,
  senderName,
  recipientName,
  supabaseUrl,
  supabaseKey,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const previousMessagesLength = useRef(messages.length);
  const isFirstLoadRef = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
  }, []);

  useEffect(() => {
    const hasNewMessages = messages.length > previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    const shouldScroll = isFirstLoadRef.current || (!isUserScrolling && hasNewMessages);

    if (shouldScroll && messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
        isFirstLoadRef.current = false;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages, isUserScrolling]);

  useEffect(() => {
    isFirstLoadRef.current = true;
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [clientId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      if (data) {
        setMessages(data);
        markMessagesAsRead(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (msgs: Message[]) => {
    if (currentUserType !== 'admin') {
      return;
    }

    const unreadMessages = msgs.filter(
      (msg) => !msg.read && msg.sender_type === 'client'
    );

    for (const msg of unreadMessages) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('id', msg.id);

        if (error) {
          console.error('Error marking message as read:', error);
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `${clientId}/${fileName}`;

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

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || loading) return;

    setLoading(true);
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
        client_id: parseInt(clientId),
        sender_id: currentUserId,
        sender_type: currentUserType,
        sender_name: senderName,
        message: newMessage.trim() || '📎 Fichier joint',
        read: false,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
      };

      console.log('📤 Envoi du message:', messageData);

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('❌ Erreur lors de l\'envoi du message:', error);
        alert('Erreur lors de l\'envoi du message');
      } else {
        console.log('✅ Message envoyé avec succès');
        setNewMessage('');
        setSelectedFile(null);
        setIsUserScrolling(false);
        await loadMessages();

        // Remettre le focus sur l'input pour garder le clavier ouvert sur mobile
        setTimeout(() => {
          messageInputRef.current?.focus();
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
      setUploading(false);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteAllMessages = async () => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('client_id', clientId);

      if (error) {
        console.error('Erreur lors de la suppression des messages:', error);
        alert('Erreur lors de la suppression des messages');
      } else {
        setMessages([]);
        setShowDeleteConfirm(false);
        alert('Tous les messages ont été supprimés');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des messages:', error);
      alert('Erreur lors de la suppression des messages');
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Erreur lors de la suppression du message:', error);
        alert('Erreur lors de la suppression du message');
      } else {
        await loadMessages();
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

  let lastDate = '';

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] relative rounded-none lg:rounded-2xl shadow-2xl overflow-hidden">
      <div className="relative p-3 sm:p-4 border-b border-cyan-500/30 bg-gradient-to-r from-[#0f1729] via-[#1a2847] to-[#0f1729] flex-shrink-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3lhbiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        <div className="relative flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden flex items-center justify-center w-9 h-9 bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-sm rounded-full transition-all duration-200 active:scale-95 border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
              title="Retour à la liste"
            >
              <ArrowLeft className="w-5 h-5 text-cyan-400" />
            </button>
          )}
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-500 to-blue-500 backdrop-blur-sm rounded-full shadow-lg shadow-cyan-500/50">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 blur-md opacity-50 animate-pulse"></div>
            <span className="relative text-base sm:text-lg lg:text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {recipientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 truncate drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {recipientName}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
              <div className="relative w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse">
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm animate-ping"></div>
              </div>
              <p className="text-cyan-300 text-[10px] sm:text-xs lg:text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">
                {currentUserType === 'client' ? 'Votre conseiller' : 'Client'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 border border-red-400/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            title="Supprimer la conversation"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-gradient-to-br from-[#1a2847] to-[#0f1729] rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-5 lg:p-6 transform transition-all mx-3 border border-cyan-400/30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3lhbiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 rounded-2xl"></div>

            <div className="relative flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-full flex-shrink-0 border border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">Supprimer la conversation</h3>
            </div>
            <p className="relative text-xs sm:text-sm lg:text-base text-cyan-200/90 mb-4 sm:mb-6">
              Êtes-vous sûr de vouloir supprimer tous les messages de cette conversation ? Cette action est irréversible.
            </p>
            <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 hover:bg-slate-700/70 text-cyan-300 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base border border-cyan-400/30 backdrop-blur-sm"
              >
                Annuler
              </button>
              <button
                onClick={deleteAllMessages}
                className="relative flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] text-sm sm:text-base border border-red-400/50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-[#0a0e27]/50 to-[#1a1f3a]/50">
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

            const isOwnMessage = msg.sender_id === currentUserId;
            const isAdminMessage = msg.sender_type === 'admin';

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
                  className={`relative flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="relative group inline-block max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-md">
                    <div
                      className={`${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                          : isAdminMessage
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl border border-slate-600/50 shadow-[0_0_10px_rgba(148,163,184,0.2)]'
                      } px-3 sm:px-4 py-2 sm:py-3 hover:shadow-lg transition-all duration-200 backdrop-blur-sm`}
                    >
                      {!isOwnMessage && (
                        <p className={`text-[10px] sm:text-xs font-bold mb-1 sm:mb-1.5 ${isAdminMessage ? 'text-blue-100' : 'text-blue-600'}`}>
                          {msg.sender_name || (isAdminMessage ? 'Admin' : recipientName)}
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
                              isOwnMessage || isAdminMessage
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
                            isOwnMessage || isAdminMessage ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                        {isOwnMessage && (
                          <span className={msg.read ? 'text-blue-200' : 'text-white/70'}>
                            {msg.read ? (
                              <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMessage(msg.id)}
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

        <div className="relative flex gap-1.5 sm:gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || uploading}
            className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            title="Joindre un fichier"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Votre message..."
              disabled={loading}
              rows={1}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-cyan-400/30 rounded-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 outline-none disabled:bg-slate-800/50 disabled:cursor-not-allowed resize-none text-[13px] sm:text-sm lg:text-base bg-slate-800/50 text-white placeholder-cyan-300/50 hover:bg-slate-800/70 transition-all duration-200 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]"
              style={{ minHeight: '38px', maxHeight: '100px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || loading}
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
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
