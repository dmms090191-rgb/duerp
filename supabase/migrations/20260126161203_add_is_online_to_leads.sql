/*
  # Ajouter colonne is_online à la table leads
  
  ## Résumé
  Ajoute la colonne is_online pour correspondre à la table clients.
  
  ## Colonne ajoutée
  - is_online (boolean) - Statut en ligne du lead (défaut: false)
  
  ## Notes
  - Colonne avec valeur par défaut false
*/

-- Ajouter is_online à leads si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE leads ADD COLUMN is_online boolean DEFAULT false;
  END IF;
END $$;