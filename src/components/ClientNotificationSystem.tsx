import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  messageId?: string;
  senderType?: string;
  senderName?: string;
}

interface ClientNotificationSystemProps {
  clientId: number | string;
  onNotificationClick?: () => void;
}

const ClientNotificationSystem: React.FC<ClientNotificationSystemProps> = ({
  clientId,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const notifiedMessageIds = useRef<Set<string>>(new Set());
  const isCheckingRef = useRef(false);

  useEffect(() => {
    checkForNewMessages();
    const interval = setInterval(checkForNewMessages, 5000);

    const subscription = supabase
      .channel(`client-messages-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('🔔 Nouveau message reçu en temps réel:', payload.new);
          checkForNewMessages();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [clientId]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OalTgwOVKzn77FgGgU7k9n0yoInBSt+zPLaizsIHGzA7+yqVhQMVK/o8rJjGgU7lNn0y4EnBSuBzvLaizsIG2e+7u2oUhQMU7Dn8rJkGgU7lNn0yoInBSt+zPLaizsIG2vA7+upUxQMVK/o8rFiGgU8k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMU6/n8rJjGgY7lNn0yoInBSuBzvLZizsIG2e+7u2qUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQNU6/n8rJiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSt/zPLaizsIGme97u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIGme97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGme97e2pUxQMVLDo8bJiGgU7lNn0yYInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSuBzvLZizsIG2a97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2pUhQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGma+7e2pUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIGma+7u2oUxQMVK/n8rJjGgU6k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/o8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rFiGgU7lNn0yoInBSt/zPLbizsIGme97u2pUxQMVK/n8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/n8rFiGgU7');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const checkForNewMessages = async () => {
    if (isCheckingRef.current) return;

    try {
      isCheckingRef.current = true;

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('id, message, created_at, sender_type, sender_name, read')
        .eq('client_id', clientId)
        .in('sender_type', ['admin', 'seller'])
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des messages:', error);
        return;
      }

      if (!messages || messages.length === 0) {
        if (!isFirstLoad) {
          console.log('✅ Aucun nouveau message');
        }
        setIsFirstLoad(false);
        return;
      }

      const newNotifications: Notification[] = [];

      messages.forEach((msg) => {
        if (!notifiedMessageIds.current.has(msg.id)) {
          const notification: Notification = {
            id: `notif-${msg.id}`,
            message: msg.message.substring(0, 100),
            timestamp: new Date(msg.created_at).toLocaleString('fr-FR'),
            read: false,
            messageId: msg.id,
            senderType: msg.sender_type,
            senderName: msg.sender_name
          };
          newNotifications.push(notification);
          notifiedMessageIds.current.add(msg.id);

          if (!isFirstLoad) {
            playNotificationSound();
          }
        }
      });

      if (newNotifications.length > 0) {
        console.log(`✅ ${newNotifications.length} nouveau(x) message(s)`);
        setNotifications(prev => [...newNotifications, ...prev]);
      }

      setIsFirstLoad(false);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des messages:', error);
    } finally {
      isCheckingRef.current = false;
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const clearNotification = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    if (notification && notification.messageId) {
      try {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('id', notification.messageId);

        console.log('✅ Message supprimé et marqué comme lu:', notification.messageId);
      } catch (error) {
        console.error('❌ Erreur lors du marquage du message comme lu:', error);
      }
    }
  };

  const clearAllNotifications = async () => {
    const messageIds = notifications
      .filter(n => n.messageId)
      .map(n => n.messageId);

    setNotifications([]);

    if (messageIds.length > 0) {
      try {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', messageIds);

        console.log('✅ [CLIENT] Tous les messages marqués comme lus:', messageIds.length);
      } catch (error) {
        console.error('❌ [CLIENT] Erreur lors du marquage des messages:', error);
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setNotifications(prev => prev.filter(n => n.id !== notification.id));

    if (notification.messageId) {
      try {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('id', notification.messageId);

        console.log('✅ Message marqué comme lu:', notification.messageId);
      } catch (error) {
        console.error('❌ Erreur lors du marquage du message comme lu:', error);
      }
    }

    if (onNotificationClick) {
      onNotificationClick();
    }
    setShowPanel(false);
  };

  const handleBellClick = async () => {
    if (!showPanel && notifications.length > 0) {
      const messageIds = notifications
        .filter(n => n.messageId)
        .map(n => n.messageId);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      console.log('🔔 [CLIENT] Badge disparaît, notifications conservées');

      if (messageIds.length > 0) {
        try {
          await supabase
            .from('chat_messages')
            .update({ read: true })
            .in('id', messageIds);

          console.log('✅ [CLIENT] Messages marqués comme lus dans la DB:', messageIds.length);
        } catch (error) {
          console.error('❌ [CLIENT] Erreur lors du marquage des messages:', error);
        }
      }
    }
    setShowPanel(!showPanel);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log('🔢 [CLIENT] Nombre de notifications:', notifications.length, '| Badge:', unreadCount);

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative flex items-center justify-center w-9 h-9 md:w-11 md:h-11 bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
        title="Notifications"
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-[70] overflow-hidden">
            <div className="bg-gradient-to-r from-[#2d4578] to-[#1a2847] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h3 className="text-white font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={clearAllNotifications}
                className="text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                title="Tout effacer"
              >
                <X className="w-4 h-4" />
                <span>Effacer tout</span>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-[#2d4578] to-[#1a2847]">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.senderType === 'admin'
                                ? 'Message de l\'administration'
                                : `Message de ${notification.senderName || 'votre vendeur'}`}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {notification.timestamp}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientNotificationSystem;
