import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Shield, Trash2, X, Paperclip, FileText, Download } from 'lucide-react';
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

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll uniquement si l'utilisateur n'est pas en train de taper
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 200);
    return () => clearTimeout(timer);
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
            message: newMessage.trim() || '📎 Fichier joint',
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
        await loadMessages();

        // Remettre le focus sur l'input pour garder le clavier ouvert sur mobile
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
        alert('Tous les messages ont été supprimés');
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
    <div className="flex flex-col h-full max-h-[600px] max-w-2xl mx-auto bg-white relative rounded-2xl shadow-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white">Chat Travail</h3>
            <p className="text-blue-100 text-xs sm:text-sm">Communication avec l'équipe admin</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            title="Supprimer la conversation"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 md:p-6 transform transition-all">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Supprimer la conversation</h3>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Êtes-vous sûr de vouloir supprimer tous les messages de cette conversation ? Cette action est irréversible.
            </p>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 text-sm md:text-base"
              >
                Annuler
              </button>
              <button
                onClick={deleteAllMessages}
                className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 bg-gradient-to-b from-blue-50/30 to-sky-50/30" style={{ maxHeight: '450px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8 sm:py-12">
            <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
            <p className="text-sm md:text-base">Aucun message pour le moment</p>
            <p className="text-xs sm:text-sm mt-2">Commencez la conversation !</p>
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
                    <div className="flex items-center justify-center my-2 sm:my-3">
                      <div className="bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                        {messageDate}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="relative group inline-block max-w-[75%] sm:max-w-[70%] md:max-w-md">
                      <div
                        className={`${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md'
                            : isAdminMessage
                            ? 'bg-gradient-to-r from-[#3d5a9e] to-[#4d6bb8] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl'
                            : 'bg-white text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl border-2 border-gray-100'
                        } px-3 py-2 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-shadow duration-200`}
                      >
                        {!isOwnMessage && (
                          <p className={`text-xs font-bold mb-1.5 ${isAdminMessage ? 'text-blue-100' : 'text-blue-600'}`}>
                            {msg.sender_name || 'Admin'}
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
                                isOwnMessage || isAdminMessage
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
                              isOwnMessage || isAdminMessage ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
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

      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
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
            className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
              disabled={sending}
              rows={1}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-[#3d5a9e]/30 focus:border-[#3d5a9e] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
              style={{ minHeight: '42px', maxHeight: '100px' }}
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
  );
};

export default SellerWorkChat;
