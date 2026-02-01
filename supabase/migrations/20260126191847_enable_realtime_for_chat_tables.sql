/*
  # Activer la réplication en temps réel pour les notifications de chat

  1. Modifications
    - Active la publication realtime pour la table `chat_messages`
    - Active la publication realtime pour la table `admin_seller_messages`
  
  2. Impact
    - Les notifications fonctionneront en temps réel via WebSocket
    - Les admins recevront instantanément les notifications quand un client ou vendeur envoie un message
*/

-- Activer la réplication en temps réel pour chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Activer la réplication en temps réel pour admin_seller_messages
ALTER PUBLICATION supabase_realtime ADD TABLE admin_seller_messages;
