import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  message: string;
  clientName: string;
  clientSiret?: string;
  timestamp: string;
  read: boolean;
  chatType: 'client' | 'seller';
  entityId: number | string;
}

interface NotificationSystemProps {
  adminEmail: string;
  onNotificationClick?: (chatType: 'client' | 'seller', entityId: number | string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ adminEmail, onNotificationClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [audioEnabled] = useState(true);

  useEffect(() => {
    checkForNewMessages();
    const interval = setInterval(checkForNewMessages, 5000);
    return () => clearInterval(interval);
  }, [lastCheckTime]);

  const playNotificationSound = () => {
    if (audioEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OalTgwOVKzn77FgGgU7k9n0yoInBSt+zPLaizsIHGzA7+yqVhQMVK/o8rJjGgU7lNn0y4EnBSuBzvLaizsIG2e+7u2oUhQMU7Dn8rJkGgU7lNn0yoInBSt+zPLaizsIG2vA7+upUxQMVK/o8rFiGgU8k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMU6/n8rJjGgY7lNn0yoInBSuBzvLZizsIG2e+7u2qUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQNU6/n8rJiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSt/zPLaizsIGme97u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIGme97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGme97e2pUxQMVLDo8bJiGgU7lNn0yYInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSuBzvLZizsIG2a97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2pUhQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGma+7e2pUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIGma+7u2oUxQMVK/n8rJjGgU6k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/o8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rFiGgU7lNn0yoInBSt/zPLbizsIGme97u2pUxQMVK/n8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/n8rFiGgU7');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  const checkForNewMessages = async () => {
    try {
      const currentTime = new Date();

      const { data: clientMessages, error: clientError } = await supabase
        .from('chat_messages')
        .select('*, clients!inner(id, full_name, siret)')
        .eq('sender_type', 'client')
        .eq('read', false)
        .gte('created_at', lastCheckTime.toISOString())
        .order('created_at', { ascending: false });

      if (clientError) {
        console.error('Erreur lors de la vérification des messages clients:', clientError);
      }

      const { data: sellerMessages, error: sellerError } = await supabase
        .from('admin_seller_messages')
        .select('*, sellers!inner(id, full_name, email, siret)')
        .eq('sender_type', 'seller')
        .eq('read', false)
        .gte('created_at', lastCheckTime.toISOString())
        .order('created_at', { ascending: false });

      if (sellerError) {
        console.error('Erreur lors de la vérification des messages vendeurs:', sellerError);
      }

      const newNotifications: Notification[] = [];

      if (clientMessages && clientMessages.length > 0) {
        clientMessages.forEach((msg: any) => {
          const client = msg.clients;
          const notificationText = `Le client ${client.full_name}${client.siret ? ` (SIRET: ${client.siret})` : ''} vous a envoyé un nouveau message`;

          newNotifications.push({
            id: `client-${msg.id}`,
            message: notificationText,
            clientName: client.full_name,
            clientSiret: client.siret,
            timestamp: msg.created_at,
            read: false,
            chatType: 'client',
            entityId: client.id
          });
        });
      }

      if (sellerMessages && sellerMessages.length > 0) {
        sellerMessages.forEach((msg: any) => {
          const seller = msg.sellers;
          const sellerName = seller.full_name;
          const notificationText = `Le vendeur ${sellerName}${seller.siret ? ` (SIRET: ${seller.siret})` : ''} vous a envoyé un nouveau message`;

          newNotifications.push({
            id: `seller-${msg.id}`,
            message: notificationText,
            clientName: sellerName,
            clientSiret: seller.siret,
            timestamp: msg.created_at,
            read: false,
            chatType: 'seller',
            entityId: seller.id
          });
        });
      }

      if (newNotifications.length > 0) {
        playNotificationSound();
        setNotifications(prev => [...newNotifications, ...prev]);

        if ('Notification' in window && Notification.permission === 'granted') {
          newNotifications.forEach(notif => {
            new Notification('Nouveau message', {
              body: notif.message,
              icon: '/kk copy.png',
              badge: '/kk copy.png'
            });
          });
        }
      }

      setLastCheckTime(currentTime);
    } catch (error) {
      console.error('Erreur lors de la vérification des messages:', error);
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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification.chatType, notification.entityId);
    }
    setShowPanel(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
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
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                title="Tout effacer"
              >
                <X className="w-5 h-5" />
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.chatType === 'client'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        }`}>
                          {notification.chatType === 'client' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {!notification.read && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                      )}
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

export default NotificationSystem;
