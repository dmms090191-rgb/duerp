/*
  # Ajouter les champs pour les risques personnalisés
  
  1. Modifications
    - Ajouter `custom_risk_title` (text) - Titre du risque personnalisé
    - Ajouter `custom_risk_information` (text) - Information/description du risque personnalisé
  
  2. Notes
    - Ces champs permettent de stocker les risques personnalisés créés par les utilisateurs
    - Ces champs seront NULL pour les questions DUERP standards
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duerp_evaluation_responses' AND column_name = 'custom_risk_title'
  ) THEN
    ALTER TABLE duerp_evaluation_responses ADD COLUMN custom_risk_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'duerp_evaluation_responses' AND column_name = 'custom_risk_information'
  ) THEN
    ALTER TABLE duerp_evaluation_responses ADD COLUMN custom_risk_information text;
  END IF;
END $$;