/*
  # Add new fields to clients table

  1. Changes
    - Add `rendez_vous` (timestamptz) - Date et heure du rendez-vous
    - Add `prenom` (text) - Prénom du client
    - Add `nom` (text) - Nom du client
    - Add `portable` (text) - Numéro de portable
    - Add `activite` (text) - Activité du client
    - Add `siret` (text) - Numéro SIRET
    - Add `commentaires` (text) - Commentaires
    - Keep existing `phone` as téléphone fixe
    
  2. Notes
    - These fields support the new column structure requested
    - All new fields are nullable to maintain compatibility
*/

-- Add new columns to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'rendez_vous'
  ) THEN
    ALTER TABLE clients ADD COLUMN rendez_vous timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'prenom'
  ) THEN
    ALTER TABLE clients ADD COLUMN prenom text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'nom'
  ) THEN
    ALTER TABLE clients ADD COLUMN nom text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'portable'
  ) THEN
    ALTER TABLE clients ADD COLUMN portable text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'activite'
  ) THEN
    ALTER TABLE clients ADD COLUMN activite text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'siret'
  ) THEN
    ALTER TABLE clients ADD COLUMN siret text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'commentaires'
  ) THEN
    ALTER TABLE clients ADD COLUMN commentaires text;
  END IF;
END $$;