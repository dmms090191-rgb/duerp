/*
  # Ajouter les pièces jointes aux messages admin-vendeur

  1. Modifications
    - Ajout de `attachment_url` dans `admin_seller_messages` pour stocker l'URL du fichier joint
    - Ajout de `attachment_name` pour stocker le nom original du fichier
    - Ajout de `attachment_type` pour stocker le type MIME du fichier

  2. Notes
    - Les fichiers seront stockés dans le bucket `chat-attachments` déjà existant
    - Ces colonnes permettent aux admins et vendeurs d'échanger des documents
*/

-- Ajouter les colonnes pour les pièces jointes aux messages admin-vendeur
ALTER TABLE admin_seller_messages 
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_name text,
ADD COLUMN IF NOT EXISTS attachment_type text;