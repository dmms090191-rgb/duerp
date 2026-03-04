/*
  # Mise à jour de chat_messages pour supporter sender_id en TEXT

  1. Modifications
    - Modifier sender_id de uuid à text pour supporter différents types d'IDs
    - Supprimer la contrainte de clé étrangère vers auth.users
    - Permettre l'utilisation d'IDs de clients (integer) ou d'autres identifiants

  2. Sécurité
    - Les politiques RLS restent actives
    - L'accès est contrôlé par les politiques existantes

  3. Notes importantes
    - Compatible avec l'authentification client simple (sans Supabase Auth)
    - Les messages existants seront préservés
*/

-- Sauvegarder les données existantes
CREATE TEMP TABLE chat_messages_backup AS SELECT * FROM chat_messages;

-- Supprimer la table existante
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Recréer la table avec sender_id en TEXT
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL,
  sender_id text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('client', 'seller', 'admin')),
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Activer RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Recréer les politiques RLS
CREATE POLICY "Allow public read on chat_messages"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on chat_messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on chat_messages"
  ON chat_messages FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on chat_messages"
  ON chat_messages FOR DELETE
  TO anon, authenticated
  USING (true);

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON chat_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Restaurer les données existantes en convertissant les UUIDs en TEXT
INSERT INTO chat_messages (id, client_id, sender_id, sender_type, message, read, created_at)
SELECT id, client_id, sender_id::text, sender_type, message, read, created_at
FROM chat_messages_backup;
