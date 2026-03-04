/*
  # Add new fields to leads table

  1. Changes
    - Add `rendez_vous` (timestamptz) - Date et heure du rendez-vous
    - Add `prenom` (text) - Prénom du lead
    - Add `nom` (text) - Nom du lead
    - Add `portable` (text) - Numéro de portable
    - Add `activite` (text) - Activité du lead
    - Add `siret` (text) - Numéro SIRET
    - Add `commentaires` (text) - Commentaires
    - Add `status_id` (uuid) - Reference to statuses table
    
  2. Notes
    - These fields support the new column structure requested
    - All new fields are nullable to maintain compatibility
*/

-- Add new columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'rendez_vous'
  ) THEN
    ALTER TABLE leads ADD COLUMN rendez_vous timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'prenom'
  ) THEN
    ALTER TABLE leads ADD COLUMN prenom text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'nom'
  ) THEN
    ALTER TABLE leads ADD COLUMN nom text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'portable'
  ) THEN
    ALTER TABLE leads ADD COLUMN portable text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'activite'
  ) THEN
    ALTER TABLE leads ADD COLUMN activite text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'siret'
  ) THEN
    ALTER TABLE leads ADD COLUMN siret text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'commentaires'
  ) THEN
    ALTER TABLE leads ADD COLUMN commentaires text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'status_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN status_id uuid REFERENCES statuses(id);
  END IF;
END $$;