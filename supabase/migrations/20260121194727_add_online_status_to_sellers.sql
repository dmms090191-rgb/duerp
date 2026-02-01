/*
  # Ajout du suivi de connexion pour les vendeurs

  1. Modifications
    - Ajout de la colonne `is_online` (boolean) à la table `sellers`
    - Ajout de la colonne `last_connection` (timestamp) à la table `sellers`
  
  2. Notes
    - Ces colonnes permettent de suivre l'état de connexion des vendeurs en temps réel
    - `is_online` indique si le vendeur est actuellement connecté
    - `last_connection` enregistre la date/heure de la dernière connexion
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE sellers ADD COLUMN is_online boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'last_connection'
  ) THEN
    ALTER TABLE sellers ADD COLUMN last_connection timestamptz;
  END IF;
END $$;