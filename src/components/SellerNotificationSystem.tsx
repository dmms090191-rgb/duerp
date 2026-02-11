import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, MessageSquare, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  messageId?: string;
  type: 'admin' | 'client';
  clientName?: string;
  clientSiret?: string;
  clientPrenom?: string;
  clientNom?: string;
}

interface SellerNotificationSystemProps {
  sellerUuid: string;
  sellerFullName?: string;
  onNotificationClick?: (type?: 'admin' | 'client') => void;
}

const SellerNotificationSystem: React.FC<SellerNotificationSystemProps> = ({
  sellerUuid,
  sellerFullName,
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

    const adminSubscription = supabase
      .channel(`seller-admin-messages-${sellerUuid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_seller_messages',
          filter: `seller_id=eq.${sellerUuid}`
        },
        (payload) => {
          console.log('🔔 [SELLER] Nouveau message admin détecté en temps réel:', payload.new);
          checkForNewMessages();
        }
      )
      .subscribe();

    const clientSubscription = supabase
      .channel(`seller-client-messages-${sellerUuid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'sender_type=eq.client'
        },
        (payload) => {
          console.log('🔔 [SELLER] Nouveau message client détecté en temps réel:', payload.new);
          checkForNewMessages();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      adminSubscription.unsubscribe();
      clientSubscription.unsubscribe();
    };
  }, [sellerUuid]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OalTgwOVKzn77FgGgU7k9n0yoInBSt+zPLaizsIHGzA7+yqVhQMVK/o8rJjGgU7lNn0y4EnBSuBzvLaizsIG2e+7u2oUhQMU7Dn8rJkGgU7lNn0yoInBSt+zPLaizsIG2vA7+upUxQMVK/o8rFiGgU8k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMU6/n8rJjGgY7lNn0yoInBSuBzvLZizsIG2e+7u2qUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQMU6/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUhQNU6/n8rJiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSt/zPLaizsIGme97u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIGme97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGme97e2pUxQMVLDo8bJiGgU7lNn0yYInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJiGgU7lNn0yoInBSuBzvLZizsIG2a97e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2pUhQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIGma+7e2pUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIGma+7u2oUxQMVK/n8rJjGgU6k9n0yoInBSuBzvLZizsIG2e+7e2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/o8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rFiGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/o8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2pUxQMVLDo8rFiGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2oUxQMVK/n8rFiGgU7lNn0yoInBSt/zPLbizsIGme97u2pUxQMVK/n8rJjGgU7lNn0yoInBSt/zPLaizsIG2e+7u2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUhQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/n8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7e2oUxQMVK/o8rJjGgU7lNn0yoInBSuBzvLZizsIG2e+7u2pUxQMVK/n8rFiGgU7');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const checkForNewMessages = async () => {
    if (isCheckingRef.current) return;

    try {
      isCheckingRef.current = true;
      console.log('🔔 [SELLER] Vérification des nouveaux messages (Premier chargement:', isFirstLoad, ')');

      const newNotifications: Notification[] = [];

      const { data: adminMessages, error: adminError } = await supabase
        .from('admin_seller_messages')
        .select('id, message, created_at, sender_type, read')
        .eq('seller_id', sellerUuid)
        .eq('sender_type', 'admin')
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (adminError) {
        console.error('❌ [SELLER] Erreur lors de la récupération des messages admin:', adminError);
      } else {
        console.log('📨 [SELLER] Messages admin trouvés:', adminMessages?.length || 0);

        if (adminMessages && adminMessages.length > 0) {
          adminMessages.forEach((msg) => {
            const notifId = `admin-msg-${msg.id}`;
            if (!notifiedMessageIds.current.has(notifId)) {
              const notification: Notification = {
                id: notifId,
                message: msg.message.substring(0, 100),
                timestamp: new Date(msg.created_at).toLocaleString('fr-FR'),
                read: false,
                messageId: msg.id,
                type: 'admin'
              };
              newNotifications.push(notification);
              notifiedMessageIds.current.add(notifId);
            }
          });
        }
      }

      if (sellerFullName) {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id')
          .eq('vendeur', sellerFullName);

        if (clientsError) {
          console.error('❌ [SELLER] Erreur lors de la récupération des clients:', clientsError);
        } else if (clientsData && clientsData.length > 0) {
          const clientIds = clientsData.map(c => c.id);
          console.log('📋 [SELLER] Clients assignés:', clientIds.length);

          const { data: clientMessages, error: clientMessagesError } = await supabase
            .from('chat_messages')
            .select('id, message, created_at, sender_type, client_id, read')
            .eq('sender_type', 'client')
            .eq('read', false)
            .in('client_id', clientIds)
            .order('created_at', { ascending: false });

          if (clientMessagesError) {
            console.error('❌ [SELLER] Erreur lors de la récupération des messages clients:', clientMessagesError);
          } else {
            console.log('📨 [SELLER] Messages clients trouvés:', clientMessages?.length || 0);

            if (clientMessages && clientMessages.length > 0) {
              // Grouper les messages par client_id pour ne prendre que le dernier message de chaque client
              const messagesByClient = new Map<number, typeof clientMessages[0]>();

              clientMessages.forEach(msg => {
                if (!messagesByClient.has(msg.client_id)) {
                  messagesByClient.set(msg.client_id, msg);
                }
              });

              // Créer une notification par client unique
              for (const [clientId, msg] of messagesByClient) {
                const notifId = `client-${clientId}`;
                if (!notifiedMessageIds.current.has(notifId)) {
                  const { data: clientData } = await supabase
                    .from('clients')
                    .select('full_name, prenom, nom, siret')
                    .eq('id', clientId)
                    .maybeSingle();

                  const clientName = clientData?.full_name || `${clientData?.prenom || ''} ${clientData?.nom || ''}`.trim() || 'Client';
                  const siret = clientData?.siret || '';
                  const messageText = msg.message || 'Nouveau message';

                  const notification: Notification = {
                    id: notifId,
                    message: messageText,
                    timestamp: new Date(msg.created_at).toLocaleString('fr-FR'),
                    read: false,
                    messageId: msg.id,
                    type: 'client',
                    clientName: clientName,
                    clientSiret: siret,
                    clientPrenom: clientData?.prenom || '',
                    clientNom: clientData?.nom || ''
                  };
                  newNotifications.push(notification);
                  notifiedMessageIds.current.add(notifId);
                }
              }
            }
          }
        }
      }

      if (newNotifications.length > 0) {
        console.log('🔔 [SELLER] Création de', newNotifications.length, 'nouvelles notifications');
        setNotifications(prev => [...newNotifications, ...prev]);

        if (notifiedMessageIds.current.size > 100) {
          const idsArray = Array.from(notifiedMessageIds.current);
          notifiedMessageIds.current = new Set(idsArray.slice(-100));
          console.log('🧹 [SELLER] Cache nettoyé');
        }

        if (!isFirstLoad) {
          console.log('🔊 [SELLER] Lecture du son de notification');
          playNotificationSound();

          if ('Notification' in window && Notification.permission === 'granted') {
            console.log('🔔 [SELLER] Envoi de', newNotifications.length, 'notifications de bureau');
            newNotifications.forEach(notif => {
              let title = 'Message de l\'administration';
              let body = notif.message;

              if (notif.type === 'client') {
                title = notif.clientName || 'Message client';
                const details: string[] = [];
                if (notif.clientPrenom && notif.clientNom) {
                  details.push(`${notif.clientPrenom} ${notif.clientNom}`);
                }
                if (notif.clientSiret) {
                  details.push(`SIRET: ${notif.clientSiret}`);
                }
                if (details.length > 0) {
                  body = `${details.join(' - ')}\n${notif.message}`;
                }
              }

              new Notification(title, {
                body: body,
                icon: '/kk copy.png',
                badge: '/kk copy.png',
                tag: notif.id
              });
            });
          }
        } else {
          console.log('⏭️ [SELLER] Premier chargement, pas de son ni de notification');
        }
      }

      if (isFirstLoad) {
        setIsFirstLoad(false);
        console.log('✅ [SELLER] Premier chargement terminé');
      }
    } catch (error) {
      console.error('❌ [SELLER] Erreur lors de la vérification des messages:', error);
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

    if (notification) {
      try {
        if (notification.type === 'admin' && notification.messageId) {
          await supabase
            .from('admin_seller_messages')
            .update({ read: true })
            .eq('id', notification.messageId);
          console.log('✅ [SELLER] Message admin supprimé et marqué comme lu');
        } else if (notification.type === 'client') {
          const clientId = parseInt(notification.id.replace('client-', ''));
          await supabase
            .from('chat_messages')
            .update({ read: true })
            .eq('client_id', clientId)
            .eq('sender_type', 'client')
            .eq('read', false);
          console.log('✅ [SELLER] Tous les messages du client', clientId, 'supprimés et marqués comme lus');
        }
      } catch (error) {
        console.error('❌ [SELLER] Erreur lors du marquage du message comme lu:', error);
      }
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);

    try {
      await supabase
        .from('admin_seller_messages')
        .update({ read: true })
        .eq('seller_id', sellerUuid)
        .eq('sender_type', 'admin')
        .eq('read', false);

      if (sellerFullName) {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id')
          .eq('vendeur', sellerFullName);

        if (clientsData && clientsData.length > 0) {
          const clientIds = clientsData.map(c => c.id);
          await supabase
            .from('chat_messages')
            .update({ read: true })
            .eq('sender_type', 'client')
            .eq('read', false)
            .in('client_id', clientIds);
        }
      }

      console.log('✅ [SELLER] Tous les messages marqués comme lus');
    } catch (error) {
      console.error('❌ [SELLER] Erreur lors du marquage des messages:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setNotifications(prev => prev.filter(n => n.id !== notification.id));

    try {
      if (notification.type === 'admin' && notification.messageId) {
        await supabase
          .from('admin_seller_messages')
          .update({ read: true })
          .eq('id', notification.messageId);
      } else if (notification.type === 'client') {
        const clientId = parseInt(notification.id.replace('client-', ''));
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('client_id', clientId)
          .eq('sender_type', 'client')
          .eq('read', false);
        console.log('✅ [SELLER] Tous les messages du client', clientId, 'marqués comme lus');
      }
    } catch (error) {
      console.error('❌ [SELLER] Erreur lors du marquage du message comme lu:', error);
    }

    if (onNotificationClick) {
      onNotificationClick(notification.type);
    }
    setShowPanel(false);
  };

  const handleBellClick = async () => {
    if (!showPanel && notifications.length > 0) {
      const currentNotifications = [...notifications];

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      console.log('🔔 [SELLER] Badge disparaît, notifications conservées');

      try {
        const adminMessageIds = currentNotifications
          .filter(n => n.type === 'admin' && n.messageId)
          .map(n => n.messageId);

        const clientIds = currentNotifications
          .filter(n => n.type === 'client')
          .map(n => parseInt(n.id.replace('client-', '')));

        if (adminMessageIds.length > 0) {
          await supabase
            .from('admin_seller_messages')
            .update({ read: true })
            .in('id', adminMessageIds);
          console.log('✅ [SELLER] Messages admin marqués comme lus dans la DB:', adminMessageIds.length);
        }

        if (clientIds.length > 0) {
          await supabase
            .from('chat_messages')
            .update({ read: true })
            .in('client_id', clientIds)
            .eq('sender_type', 'client')
            .eq('read', false);
          console.log('✅ [SELLER] Messages de', clientIds.length, 'clients marqués comme lus dans la DB');
        }
      } catch (error) {
        console.error('❌ [SELLER] Erreur lors du marquage des messages dans la DB:', error);
      }
    }
    setShowPanel(!showPanel);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log('🔢 [SELLER] Nombre de notifications:', notifications.length, '| Badge:', unreadCount);

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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'client'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                            : 'bg-gradient-to-r from-[#2d4578] to-[#1a2847]'
                        }`}>
                          {notification.type === 'client' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.type === 'admin'
                                ? 'Message de l\'administration'
                                : notification.clientName || 'Message client'}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          {notification.type === 'client' && (
                            <div className="mb-1.5">
                              {notification.clientPrenom && notification.clientNom && (
                                <p className="text-xs font-medium text-gray-700">
                                  {notification.clientPrenom} {notification.clientNom}
                                </p>
                              )}
                              {notification.clientSiret && (
                                <p className="text-xs text-gray-500">
                                  SIRET: {notification.clientSiret}
                                </p>
                              )}
                            </div>
                          )}
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

export default SellerNotificationSystem;
