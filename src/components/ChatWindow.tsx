import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, CheckCheck, X, Trash2 } from 'lucide-react';
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
}

interface ChatWindowProps {
  clientId: string;
  currentUserId: string;
  currentUserType: 'client' | 'seller';
  senderName: string;
  recipientName: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  clientId,
  currentUserId,
  currentUserType,
  senderName,
  recipientName,
  supabaseUrl,
  supabaseKey,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const messageData = {
        client_id: parseInt(clientId),
        sender_id: currentUserId,
        sender_type: currentUserType,
        sender_name: senderName,
        message: newMessage.trim(),
        read: false,
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
        await loadMessages();
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
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
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
            <span className="text-2xl font-bold text-white">
              {recipientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">
              {recipientName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <p className="text-emerald-100 text-sm">
                {currentUserType === 'client' ? 'Votre conseiller' : 'Client'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            title="Supprimer la conversation"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Supprimer la conversation</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer tous les messages de cette conversation ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={deleteAllMessages}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/30 to-sky-50/30" style={{ maxHeight: '500px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>Aucun message pour le moment</p>
            <p className="text-sm mt-2">Commencez la conversation !</p>
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
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {messageDate}
                    </div>
                  </div>
                )}
                <div
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="relative group inline-block max-w-xs lg:max-w-md xl:max-w-lg">
                    <div
                      className={`${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md'
                          : isAdminMessage
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl'
                          : 'bg-white text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl border-2 border-gray-100'
                      } px-4 py-3 shadow-md hover:shadow-lg transition-shadow duration-200`}
                    >
                      {!isOwnMessage && (
                        <p className={`text-xs font-bold mb-1.5 ${isAdminMessage ? 'text-blue-100' : 'text-blue-600'}`}>
                          {msg.sender_name || (isAdminMessage ? 'Admin' : recipientName)}
                        </p>
                      )}
                      <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                      <div className="flex items-center gap-1.5 justify-end mt-2">
                        <span
                          className={`text-xs font-medium ${
                            isOwnMessage || isAdminMessage ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                        {isOwnMessage && (
                          <span className={msg.read ? 'text-blue-200' : 'text-white/70'}>
                            {msg.read ? (
                              <CheckCheck className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </span>
                        )}
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

      <div className="p-6 border-t border-gray-200 bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="💬 Écrivez votre message..."
              disabled={loading}
              rows={1}
              className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
            title="Envoyer le message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Les messages sont sécurisés et visibles uniquement par vous et votre conseiller
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
