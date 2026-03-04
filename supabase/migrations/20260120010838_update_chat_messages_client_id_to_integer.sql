/*
  # Mise à jour de la table chat_messages pour utiliser client_id integer
  
  1. Modifications
    - Supprimer la contrainte de clé étrangère existante
    - Modifier client_id de uuid à integer
    - Recréer la contrainte de clé étrangère vers clients(id)
    - Mettre à jour les politiques RLS si nécessaire
  
  2. Sécurité
    - Les politiques RLS existantes restent en vigueur
    - La référence vers la table clients est maintenue
  
  3. Notes importantes
    - Cette migration est nécessaire car la table clients utilise maintenant integer comme ID
    - Les données existantes dans chat_messages seront préservées
*/

-- Supprimer la contrainte de clé étrangère existante
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_messages_client_id_fkey'
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_client_id_fkey;
  END IF;
END $$;

-- Créer une table temporaire pour sauvegarder les données
CREATE TEMP TABLE chat_messages_backup AS SELECT * FROM chat_messages;

-- Supprimer la table chat_messages
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Recréer la table avec client_id integer
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('client', 'seller', 'admin')),
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Activer RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Recréer toutes les politiques RLS

-- Policy pour les clients
CREATE POLICY "Clients peuvent voir leurs propres messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Clients peuvent envoyer des messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) AND sender_id = auth.uid() AND sender_type = 'client'
  );

CREATE POLICY "Clients peuvent marquer messages comme lus"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy pour les sellers
CREATE POLICY "Sellers peuvent voir messages de leurs clients"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN sellers s ON s.full_name = c.assigned_agent_name
      WHERE s.id = auth.uid()
    )
  );

CREATE POLICY "Sellers peuvent envoyer des messages à leurs clients"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN sellers s ON s.full_name = c.assigned_agent_name
      WHERE s.id = auth.uid()
    ) AND sender_id = auth.uid() AND sender_type = 'seller'
  );

CREATE POLICY "Sellers peuvent marquer messages comme lus"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN sellers s ON s.full_name = c.assigned_agent_name
      WHERE s.id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN sellers s ON s.full_name = c.assigned_agent_name
      WHERE s.id = auth.uid()
    )
  );

-- Policy pour les admins
CREATE POLICY "Admins peuvent voir tous les messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins peuvent envoyer des messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    ) AND sender_id = auth.uid() AND sender_type = 'admin'
  );

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

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON chat_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
