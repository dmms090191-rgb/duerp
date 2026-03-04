import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Shield, Trash2, X, Paperclip, FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface SellerWorkChatProps {
  sellerId: string;
  sellerFullName: string;
  supabaseUrl: string;
  supabaseKey: string;
}

const SellerWorkChat: React.FC<SellerWorkChatProps> = ({
  sellerId,
  sellerFullName,
  supabaseUrl,
  supabaseKey,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (initialLoadRef.current && messages.length > 0) {
      initialLoadRef.current = false;
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }, 150);
    }
  }, [messages]);

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
  }, []);

  useEffect(() => {
    const messageCountChanged = messages.length !== lastMessageCountRef.current;
    const shouldScroll = !isUserScrollingRef.current && messageCountChanged;

    if (shouldScroll && messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      lastMessageCountRef.current = messages.length;
      return () => clearTimeout(timer);
    }

    lastMessageCountRef.current = messages.length;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
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
        markMessagesAsRead(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const markMessagesAsRead = async (msgs: Message[]) => {
    const unreadAdminMessages = msgs.filter(
      (msg) => msg.sender_type === 'admin' && !msg.read
    );

    for (const msg of unreadAdminMessages) {
      try {
        await fetch(
          `${supabaseUrl}/rest/v1/admin_seller_messages?id=eq.${msg.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ read: true }),
          }
        );
      } catch (error) {
        console.error('Erreur lors du marquage du message comme lu:', error);
      }
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `seller-${sellerId}/${fileName}`;

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
    if ((!newMessage.trim() && !selectedFile) || sending) return;

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
            seller_id: sellerId,
            sender_id: sellerId,
            sender_type: 'seller',
            sender_name: sellerFullName,
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
        await loadMessages();

        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message');
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
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?seller_id=eq.${sellerId}`,
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
        await loadMessages();
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

  let lastDate = '';

  return (
    <div className="relative flex flex-col h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-cyan-500/30 flex-shrink-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>

          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text truncate">
                Chat Admin
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="relative w-2 h-2 bg-cyan-400 rounded-full animate-pulse">
                  <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm animate-ping"></div>
                </div>
                <p className="text-cyan-300/70 text-xs sm:text-sm font-medium">Espace de communication avec les administrateurs</p>
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

              const isOwnMessage = msg.sender_type === 'seller';
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
                  <div className={`relative flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className="relative group inline-block max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-md">
                      <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
                          : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                      }`}></div>

                      <div
                        className={`relative backdrop-blur-xl px-4 py-3 transition-all duration-300 hover:scale-[1.01] ${
                          isOwnMessage
                            ? 'bg-gradient-to-br from-cyan-600/90 to-blue-600/90 text-white rounded-2xl rounded-br-md border border-cyan-400/40 shadow-lg shadow-cyan-500/20'
                            : 'bg-gradient-to-br from-blue-600/90 to-cyan-700/90 text-white rounded-2xl rounded-bl-md border border-blue-400/40 shadow-lg shadow-blue-500/20'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-40 ${
                          isOwnMessage ? 'via-cyan-400' : 'via-blue-400'
                        }`}></div>

                        {!isOwnMessage && (
                          <p className="text-[10px] sm:text-xs font-black tracking-wider mb-1.5 text-blue-200/90 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {msg.sender_name || 'Admin'}
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
                          <span className="text-[10px] sm:text-xs font-medium text-white/50">
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
  );
};

export default SellerWorkChat;
