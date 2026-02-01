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
    <div className="flex flex-col h-full w-full bg-white relative rounded-none lg:rounded-2xl shadow-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-slate-700 to-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden flex items-center justify-center w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 active:scale-95"
              title="Retour à la liste"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
            <span className="text-base sm:text-lg lg:text-2xl font-bold text-white">
              {recipientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
              {recipientName}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-300 rounded-full animate-pulse"></div>
              <p className="text-blue-100 text-[10px] sm:text-xs lg:text-sm">
                {currentUserType === 'client' ? 'Votre conseiller' : 'Client'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            title="Supprimer la conversation"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-5 lg:p-6 transform transition-all mx-3">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex-shrink-0">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Supprimer la conversation</h3>
            </div>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 sm:mb-6">
              Êtes-vous sûr de vouloir supprimer tous les messages de cette conversation ? Cette action est irréversible.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={deleteAllMessages}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-blue-50/30 to-sky-50/30">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8 sm:py-12">
            <p className="text-sm sm:text-base">Aucun message pour le moment</p>
            <p className="text-xs sm:text-sm mt-2">Commencez la conversation !</p>
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
                  <div className="flex items-center justify-center my-2 sm:my-3">
                    <div className="bg-gray-200 text-gray-600 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
                      {messageDate}
                    </div>
                  </div>
                )}
                <div
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="relative group inline-block max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-md">
                    <div
                      className={`${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md'
                          : isAdminMessage
                          ? 'bg-gradient-to-r from-[#2d4578] to-[#3d5a9e] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl'
                          : 'bg-white text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl border-2 border-gray-100'
                      } px-3 sm:px-4 py-2 sm:py-3 shadow-md hover:shadow-lg transition-shadow duration-200`}
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

      <div className="p-2 sm:p-3 lg:p-4 border-t border-gray-200 bg-white">
        {selectedFile && (
          <div className="mb-2 sm:mb-3 flex items-center gap-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] sm:text-xs text-blue-600">
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

        <div className="flex gap-1.5 sm:gap-2 items-end">
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
            className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-[#3d5a9e]/30 focus:border-[#3d5a9e] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-[13px] sm:text-sm lg:text-base bg-gray-50 hover:bg-white transition-colors duration-200"
              style={{ minHeight: '38px', maxHeight: '100px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || loading}
            className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white rounded-full font-bold hover:from-[#4d6bb8] hover:to-[#5d7bc8] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
            title="Envoyer le message"
          >
            {uploading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
