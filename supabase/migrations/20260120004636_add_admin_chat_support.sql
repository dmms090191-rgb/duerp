/*
  # Ajouter le support des messages admin dans le chat

  1. Modifications
    - Modifier la contrainte CHECK pour autoriser sender_type 'admin'
    - Ajouter une policy pour permettre aux admins de voir tous les messages
    - Ajouter une policy pour permettre aux admins d'envoyer des messages
  
  2. Sécurité
    - Les admins peuvent voir tous les messages de tous les clients
    - Les admins peuvent envoyer des messages à n'importe quel client
    - Les messages des admins seront affichés dans le chat des clients
*/

-- Supprimer l'ancienne contrainte CHECK
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;

-- Ajouter la nouvelle contrainte CHECK avec 'admin' inclus
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_type_check 
  CHECK (sender_type IN ('client', 'seller', 'admin'));

-- Policy pour permettre aux admins de voir tous les messages
CREATE POLICY "Admins peuvent voir tous les messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Policy pour permettre aux admins d'envoyer des messages
CREATE POLICY "Admins peuvent envoyer des messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    ) AND sender_id = auth.uid() AND sender_type = 'admin'
  );

-- Policy pour permettre aux admins de marquer les messages comme lus
CREATE POLICY "Admins peuvent marquer messages comme lus"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );