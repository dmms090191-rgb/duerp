/*
  # Ajouter assigned_agent (UUID) aux tables clients et leads

  1. Modifications
    - Ajoute la colonne `assigned_agent` (uuid, nullable) à la table `clients` avec référence à `admins(id)`
    - Ajoute la colonne `assigned_agent` (uuid, nullable) à la table `leads` avec référence à `admins(id)`
  
  2. Sécurité
    - Aucune modification des politiques RLS
    - Les colonnes sont nullables pour éviter les problèmes avec les enregistrements existants
*/

-- Ajouter assigned_agent (UUID) à la table clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'assigned_agent'
  ) THEN
    ALTER TABLE clients ADD COLUMN assigned_agent uuid REFERENCES admins(id);
  END IF;
END $$;

-- Ajouter assigned_agent (UUID) à la table leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'assigned_agent'
  ) THEN
    ALTER TABLE leads ADD COLUMN assigned_agent uuid REFERENCES admins(id);
  END IF;
END $$;