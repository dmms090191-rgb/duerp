/*
  # Ajouter colonne type_diagnostic aux tables clients et leads

  1. Modifications
    - Ajout de la colonne `type_diagnostic` (text) à la table `clients`
    - Ajout de la colonne `type_diagnostic` (text) à la table `leads`
    - Valeur par défaut : null
  
  2. Raisons
    - Permet de stocker le type de diagnostic sélectionné (ex: "03 Garages automobiles et poids lourds seulement")
    - Utilisé en conjonction avec diagnostic_final_actif
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'type_diagnostic'
  ) THEN
    ALTER TABLE clients ADD COLUMN type_diagnostic text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'type_diagnostic'
  ) THEN
    ALTER TABLE leads ADD COLUMN type_diagnostic text;
  END IF;
END $$;