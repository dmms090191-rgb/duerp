/*
  # Système de pièces jointes pour le chat

  1. Modifications
    - Ajout d'une colonne `attachment_url` dans `chat_messages` pour stocker l'URL du fichier joint
    - Ajout d'une colonne `attachment_name` pour stocker le nom original du fichier
    - Ajout d'une colonne `attachment_type` pour stocker le type MIME du fichier

  2. Storage
    - Création du bucket `chat-attachments` pour stocker les fichiers du chat
    - Policies publiques pour permettre l'upload et la lecture des fichiers

  3. Sécurité
    - Les fichiers sont accessibles publiquement en lecture
    - Tout le monde peut uploader (pour permettre les uploads anonymes depuis le chat)
*/

-- Ajouter les colonnes pour les pièces jointes
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_name text,
ADD COLUMN IF NOT EXISTS attachment_type text;

-- Créer le bucket pour les pièces jointes du chat
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy pour permettre à tout le monde de lire les fichiers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for chat attachments'
  ) THEN
    CREATE POLICY "Public read access for chat attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'chat-attachments');
  END IF;
END $$;

-- Policy pour permettre à tout le monde d'uploader des fichiers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public upload access for chat attachments'
  ) THEN
    CREATE POLICY "Public upload access for chat attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'chat-attachments');
  END IF;
END $$;

-- Policy pour permettre à tout le monde de supprimer des fichiers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public delete access for chat attachments'
  ) THEN
    CREATE POLICY "Public delete access for chat attachments"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'chat-attachments');
  END IF;
END $$;