import React, { useState, useEffect, useRef } from 'react';
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
  messageId?: string;
}

interface NotificationSystemProps {
  adminEmail: string;
  onNotificationClick?: (chatType: 'client' | 'seller', entityId: number | string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ adminEmail, onNotificationClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [audioEnabled] = useState(true);
  const notifiedMessageIds = useRef<Set<string>>(new Set());
  const isCheckingRef = useRef(false);
  const markingAsReadRef = useRef(false);

  useEffect(() => {
    checkForNewMessages();
    const interval = setInterval(checkForNewMessages, 5000);

    const clientSubscription = supabase
      .channel('client-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'sender_type=eq.client'
        },
        (payload) => {
          console.log('🔔 Nouveau message client détecté en temps réel, ID:', payload.new.id);
          checkForNewMessages();
        }
      )
      .subscribe();

    const sellerSubscription = supabase
      .channel('seller-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_seller_messages',
          filter: 'sender_type=eq.seller'
        },
        (payload) => {
          console.log('🔔 Nouveau message vendeur détecté en temps réel, ID:', payload.new.id);
          checkForNewMessages();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      clientSubscription.unsubscribe();
      sellerSubscription.unsubscribe();
    };
  }, []);

  const playNotificationSound = () => {
    if (audioEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OalTgwOVKzn77FgGgU7k9n0yoInBSt+zPLaizsIHGzA7+yqVhQMVK/o8rJjGgU7lNn0y4EnBSuBzvLaizsIG2e+7u2oUhQMU7Dn8rJkGgU7lNn0yoInBSt+zPLaizsIG2vA7+upUxQMVK/o8rFiGgU8k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMU6/n8rJjGgY7lNn0yoInBSuBzvLZizsIG2e+7u2qUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQNU6/n8rJiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSt/zPLaizsIGme97u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIGme97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGme97e2pUxQMVLDo8bJiGgU7lNn0yYInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSuBzvLZizsIG2a97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2pUhQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGma+7e2pUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIGma+7u2oUxQMVK/n8rJjGgU6k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/o8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rFiGgU7lNn0yoInBSt/zPLbizsIGme97u2pUxQMVK/n8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/n8rFiGgU7');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  const checkForNewMessages = async () => {
    if (isCheckingRef.current) {
      console.log('⏭️ Vérification déjà en cours, passage...');
      return;
    }

    if (markingAsReadRef.current) {
      console.log('⏭️ Marquage en cours, passage...');
      return;
    }

    try {
      isCheckingRef.current = true;
      const currentTime = new Date();

      console.log('🔔 Vérification des nouveaux messages (Premier chargement:', isFirstLoad, ')');

      let clientMessagesQuery = supabase
        .from('chat_messages')
        .select('id, message, created_at, sender_type, client_id, read')
        .eq('sender_type', 'client')
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (isFirstLoad) {
        console.log('🔍 Recherche de tous les messages clients non lus...');
      } else {
        clientMessagesQuery = clientMessagesQuery.gte('created_at', lastCheckTime.toISOString());
        console.log('🔍 Recherche des nouveaux messages depuis:', lastCheckTime.toISOString());
      }

      const { data: clientMessages, error: clientError } = await clientMessagesQuery;

      if (clientError) {
        console.error('❌ Erreur lors de la vérification des messages clients:', clientError);
      } else {
        console.log('📨 Messages clients trouvés:', clientMessages?.length || 0);
      }

      let sellerMessagesQuery = supabase
        .from('admin_seller_messages')
        .select('id, message, created_at, sender_type, sender_id, read')
        .eq('sender_type', 'seller')
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (isFirstLoad) {
        console.log('🔍 Recherche de tous les messages vendeurs non lus...');
      } else {
        sellerMessagesQuery = sellerMessagesQuery.gte('created_at', lastCheckTime.toISOString());
      }

      const { data: sellerMessages, error: sellerError } = await sellerMessagesQuery;

      if (sellerError) {
        console.error('❌ Erreur lors de la vérification des messages vendeurs:', sellerError);
      } else {
        console.log('📨 Messages vendeurs trouvés:', sellerMessages?.length || 0);
      }

      const newNotifications: Notification[] = [];

      if (clientMessages && clientMessages.length > 0) {
        const messagesByClient = new Map<number, typeof clientMessages[0]>();

        clientMessages.forEach(msg => {
          const clientNotifId = `client-${msg.client_id}`;

          if (notifiedMessageIds.current.has(clientNotifId)) {
            console.log('⏭️ Message client déjà notifié (cache):', clientNotifId);
            return;
          }

          if (!messagesByClient.has(msg.client_id)) {
            messagesByClient.set(msg.client_id, msg);
          }
        });

        for (const [clientId, msg] of messagesByClient) {
          const clientNotifId = `client-${clientId}`;

          const { data: clientData, error: clientDataError } = await supabase
            .from('clients')
            .select('id, full_name, siret')
            .eq('id', clientId)
            .maybeSingle();

          if (clientDataError) {
            console.error('❌ Erreur lors de la récupération du client:', clientDataError);
            continue;
          }

          if (clientData) {
            const notificationText = `${clientData.full_name}${clientData.siret ? ` (SIRET: ${clientData.siret})` : ''} vous a envoyé un message`;

            console.log('✅ Nouvelle notification client:', notificationText);

            newNotifications.push({
              id: clientNotifId,
              message: notificationText,
              clientName: clientData.full_name,
              clientSiret: clientData.siret,
              timestamp: msg.created_at,
              read: false,
              chatType: 'client',
              entityId: clientData.id,
              messageId: msg.id
            });

            notifiedMessageIds.current.add(clientNotifId);
            console.log('✅ Client ajouté au cache:', clientNotifId, '(Total cache:', notifiedMessageIds.current.size, ')');
          }
        }
      }

      if (sellerMessages && sellerMessages.length > 0) {
        const messagesBySeller = new Map<string, typeof sellerMessages[0]>();

        sellerMessages.forEach(msg => {
          const sellerId = msg.sender_id.replace('seller-', '');
          const sellerNotifId = `seller-${sellerId}`;

          if (notifiedMessageIds.current.has(sellerNotifId)) {
            console.log('⏭️ Message vendeur déjà notifié (cache):', sellerNotifId);
            return;
          }

          if (!messagesBySeller.has(sellerId)) {
            messagesBySeller.set(sellerId, msg);
          }
        });

        for (const [sellerId, msg] of messagesBySeller) {
          const sellerNotifId = `seller-${sellerId}`;

          const { data: sellerData, error: sellerDataError } = await supabase
            .from('sellers')
            .select('id, full_name, siret')
            .eq('id', sellerId)
            .maybeSingle();

          if (sellerDataError) {
            console.error('❌ Erreur lors de la récupération du vendeur:', sellerDataError);
            continue;
          }

          if (sellerData) {
            const notificationText = `${sellerData.full_name}${sellerData.siret ? ` (SIRET: ${sellerData.siret})` : ''} vous a envoyé un message`;

            console.log('✅ Nouvelle notification vendeur:', notificationText);

            newNotifications.push({
              id: sellerNotifId,
              message: notificationText,
              clientName: sellerData.full_name,
              clientSiret: sellerData.siret,
              timestamp: msg.created_at,
              read: false,
              chatType: 'seller',
              entityId: sellerData.id,
              messageId: msg.id
            });

            notifiedMessageIds.current.add(sellerNotifId);
            console.log('✅ Vendeur ajouté au cache:', sellerNotifId, '(Total cache:', notifiedMessageIds.current.size, ')');
          }
        }
      }

      if (newNotifications.length > 0) {
        console.log('🔔 Création de', newNotifications.length, 'nouvelles notifications');
        console.log('📝 Cache actuel contient', notifiedMessageIds.current.size, 'messages');

        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNewNotifs = newNotifications.filter(n => !existingIds.has(n.id));
          return [...uniqueNewNotifs, ...prev];
        });

        if (notifiedMessageIds.current.size > 500) {
          const idsArray = Array.from(notifiedMessageIds.current);
          notifiedMessageIds.current = new Set(idsArray.slice(-500));
          console.log('🧹 Cache nettoyé, conserve les 500 derniers messages');
        }

        if (!isFirstLoad) {
          console.log('🔊 Lecture du son de notification');
          playNotificationSound();

          if ('Notification' in window && Notification.permission === 'granted') {
            console.log('🔔 Envoi de', newNotifications.length, 'notifications de bureau');
            newNotifications.forEach(notif => {
              new Notification('Nouveau message', {
                body: notif.message,
                icon: '/kk copy.png',
                badge: '/kk copy.png',
                tag: notif.id
              });
            });
          }
        } else {
          console.log('⏭️ Premier chargement, pas de son ni de notification de bureau');
        }
      }

      if (isFirstLoad) {
        setIsFirstLoad(false);
        console.log('✅ Premier chargement terminé');
      }

      setLastCheckTime(currentTime);
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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearNotification = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    if (notification) {
      notifiedMessageIds.current.add(notificationId);
      console.log('🔒 ID verrouillé dans le cache:', notificationId);

      markingAsReadRef.current = true;
      try {
        if (notification.chatType === 'client') {
          const clientId = parseInt(notification.id.replace('client-', ''));
          await supabase
            .from('chat_messages')
            .update({ read: true })
            .eq('client_id', clientId)
            .eq('sender_type', 'client')
            .eq('read', false);
          console.log('✅ Tous les messages du client', clientId, 'marqués comme lus');
        } else if (notification.chatType === 'seller') {
          const sellerId = notification.id.replace('seller-', '');
          await supabase
            .from('admin_seller_messages')
            .update({ read: true })
            .eq('sender_id', `seller-${sellerId}`)
            .eq('sender_type', 'seller')
            .eq('read', false);
          console.log('✅ Tous les messages du vendeur', sellerId, 'marqués comme lus');
        }

        setTimeout(() => {
          markingAsReadRef.current = false;
          console.log('✅ Effacement de la notification terminé');
        }, 1000);
      } catch (error) {
        console.error('❌ Erreur lors du marquage du message comme lu:', error);
        markingAsReadRef.current = false;
      }
    }
  };

  const clearAllNotifications = async () => {
    notifications.forEach(notif => {
      notifiedMessageIds.current.add(notif.id);
    });
    console.log('🔒 Tous les IDs verrouillés dans le cache:', notifications.map(n => n.id).join(', '));

    markingAsReadRef.current = true;
    setNotifications([]);

    try {
      const { error: clientError } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('sender_type', 'client')
        .eq('read', false);

      if (clientError) {
        console.error('❌ Erreur lors du marquage des messages clients:', clientError);
      }

      const { error: sellerError } = await supabase
        .from('admin_seller_messages')
        .update({ read: true })
        .eq('sender_type', 'seller')
        .eq('read', false);

      if (sellerError) {
        console.error('❌ Erreur lors du marquage des messages vendeurs:', sellerError);
      }

      console.log('✅ Tous les messages marqués comme lus');

      setTimeout(() => {
        markingAsReadRef.current = false;
        console.log('✅ Effacement terminé, vérifications réactivées');
      }, 2000);
    } catch (error) {
      console.error('❌ Erreur lors de l\'effacement des notifications:', error);
      markingAsReadRef.current = false;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    markAsRead(notification.id);
    notifiedMessageIds.current.add(notification.id);
    console.log('🔒 ID verrouillé dans le cache:', notification.id);

    markingAsReadRef.current = true;

    try {
      if (notification.chatType === 'client') {
        const clientId = parseInt(notification.id.replace('client-', ''));
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('client_id', clientId)
          .eq('sender_type', 'client')
          .eq('read', false);
        console.log('✅ Tous les messages du client', clientId, 'marqués comme lus');
      } else if (notification.chatType === 'seller') {
        const sellerId = notification.id.replace('seller-', '');
        await supabase
          .from('admin_seller_messages')
          .update({ read: true })
          .eq('sender_id', `seller-${sellerId}`)
          .eq('sender_type', 'seller')
          .eq('read', false);
        console.log('✅ Tous les messages du vendeur', sellerId, 'marqués comme lus');
      }

      setTimeout(() => {
        markingAsReadRef.current = false;
        console.log('✅ Clic sur notification terminé');
      }, 1000);
    } catch (error) {
      console.error('❌ Erreur lors du marquage du message comme lu:', error);
      markingAsReadRef.current = false;
    }

    if (onNotificationClick) {
      onNotificationClick(notification.chatType, notification.entityId);
    }
    setShowPanel(false);
  };

  const handleBellClick = async () => {
    if (!showPanel && notifications.length > 0) {
      console.log('🔔 [ADMIN] Badge disparaît, notifications conservées');

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      markingAsReadRef.current = true;

      try {
        const { error: clientError } = await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('sender_type', 'client')
          .eq('read', false);

        if (clientError) {
          console.error('❌ [ADMIN] Erreur messages clients:', clientError);
        }

        const { error: sellerError } = await supabase
          .from('admin_seller_messages')
          .update({ read: true })
          .eq('sender_type', 'seller')
          .eq('read', false);

        if (sellerError) {
          console.error('❌ [ADMIN] Erreur messages vendeurs:', sellerError);
        }

        console.log('✅ [ADMIN] Badge effacé, notifications conservées');

        setTimeout(() => {
          markingAsReadRef.current = false;
        }, 2000);
      } catch (error) {
        console.error('❌ [ADMIN] Erreur:', error);
        markingAsReadRef.current = false;
      }
    }
    setShowPanel(!showPanel);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log('🔢 [ADMIN] Nombre de notifications:', notifications.length, '| Badge:', unreadCount);

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
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
                title="Tout effacer et réinitialiser"
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.chatType === 'client'
                            ? 'bg-gradient-to-r from-[#2d4578] to-[#1a2847]'
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
