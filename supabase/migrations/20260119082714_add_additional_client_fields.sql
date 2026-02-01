/*
  # Add additional fields to clients and leads tables

  1. Changes to clients table
    - Add `ville` (text) - Ville du client
    - Add `code_postal` (text) - Code postal
    - Add `pays` (text) - Pays
    - Add `anniversaire` (date) - Date d'anniversaire
    - Add `autre_courriel` (text) - Autre email
    - Add `date_affectation` (timestamptz) - Date d'affectation
    - Add `representant` (text) - Représentant
    - Add `prevente` (text) - Prévente
    - Add `retention` (text) - Rétention
    - Add `sous_affilie` (text) - Sous-affilié
    - Add `langue` (text) - Langue
    - Add `conseiller` (text) - Conseiller
    - Add `alpha` (text) - ALPHA
    - Add `qualifiee` (boolean) - Qualifiée
    
  2. Changes to leads table
    - Add same fields as clients
    
  3. Notes
    - All new fields are nullable for compatibility
*/

-- Add new columns to clients table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'ville') THEN
    ALTER TABLE clients ADD COLUMN ville text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'code_postal') THEN
    ALTER TABLE clients ADD COLUMN code_postal text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'pays') THEN
    ALTER TABLE clients ADD COLUMN pays text DEFAULT 'France';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'anniversaire') THEN
    ALTER TABLE clients ADD COLUMN anniversaire date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'autre_courriel') THEN
    ALTER TABLE clients ADD COLUMN autre_courriel text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'date_affectation') THEN
    ALTER TABLE clients ADD COLUMN date_affectation timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'representant') THEN
    ALTER TABLE clients ADD COLUMN representant text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'prevente') THEN
    ALTER TABLE clients ADD COLUMN prevente text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'retention') THEN
    ALTER TABLE clients ADD COLUMN retention text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'sous_affilie') THEN
    ALTER TABLE clients ADD COLUMN sous_affilie text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'langue') THEN
    ALTER TABLE clients ADD COLUMN langue text DEFAULT 'Français';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'conseiller') THEN
    ALTER TABLE clients ADD COLUMN conseiller text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'alpha') THEN
    ALTER TABLE clients ADD COLUMN alpha text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'qualifiee') THEN
    ALTER TABLE clients ADD COLUMN qualifiee boolean DEFAULT false;
  END IF;
END $$;

-- Add new columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ville') THEN
    ALTER TABLE leads ADD COLUMN ville text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'code_postal') THEN
    ALTER TABLE leads ADD COLUMN code_postal text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'pays') THEN
    ALTER TABLE leads ADD COLUMN pays text DEFAULT 'France';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'anniversaire') THEN
    ALTER TABLE leads ADD COLUMN anniversaire date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'autre_courriel') THEN
    ALTER TABLE leads ADD COLUMN autre_courriel text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'date_affectation') THEN
    ALTER TABLE leads ADD COLUMN date_affectation timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'representant') THEN
    ALTER TABLE leads ADD COLUMN representant text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'prevente') THEN
    ALTER TABLE leads ADD COLUMN prevente text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'retention') THEN
    ALTER TABLE leads ADD COLUMN retention text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'sous_affilie') THEN
    ALTER TABLE leads ADD COLUMN sous_affilie text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'langue') THEN
    ALTER TABLE leads ADD COLUMN langue text DEFAULT 'Français';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'conseiller') THEN
    ALTER TABLE leads ADD COLUMN conseiller text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'alpha') THEN
    ALTER TABLE leads ADD COLUMN alpha text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'qualifiee') THEN
    ALTER TABLE leads ADD COLUMN qualifiee boolean DEFAULT false;
  END IF;
END $$;