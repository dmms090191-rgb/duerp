/*
  # Ajout du suivi de connexion pour les clients

  1. Modifications
    - Ajout de la colonne `is_online` (boolean) à la table `clients`
    - Ajout de la colonne `last_connection` (timestamp) à la table `clients`
  
  2. Notes
    - Ces colonnes permettent de suivre l'état de connexion des clients en temps réel
    - `is_online` indique si le client est actuellement connecté
    - `last_connection` enregistre la date/heure de la dernière connexion
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE clients ADD COLUMN is_online boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'last_connection'
  ) THEN
    ALTER TABLE clients ADD COLUMN last_connection timestamptz;
  END IF;
END $$;