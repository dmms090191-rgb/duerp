/*
  # Ajouter colonne address à la table leads
  
  ## Résumé
  Ajoute la colonne address qui manque dans leads pour correspondre à clients.
  
  ## Colonne ajoutée
  - address (text) - Adresse complète du lead
  
  ## Notes
  - Colonne nullable pour compatibilité avec données existantes
*/

-- Ajouter address à leads si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'address'
  ) THEN
    ALTER TABLE leads ADD COLUMN address text;
  END IF;
END $$;