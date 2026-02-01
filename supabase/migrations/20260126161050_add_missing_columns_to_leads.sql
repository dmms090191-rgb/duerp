/*
  # Ajouter colonnes manquantes à la table leads
  
  ## Résumé
  Ajoute toutes les colonnes manquantes nécessaires pour l'import CSV et le transfert vers clients.
  
  ## Colonnes ajoutées
  - ville (text) - Ville du lead
  - code_postal (text) - Code postal
  - pays (text) - Pays (défaut: France)
  - anniversaire (text) - Date d'anniversaire
  - autre_courriel (text) - Email secondaire
  - date_affectation (text) - Date d'affectation
  - representant (text) - Nom du représentant
  - prevente (text) - Informations prévente
  - retention (text) - Informations rétention
  - sous_affilie (text) - Sous-affilié
  - langue (text) - Langue (défaut: Français)
  - conseiller (text) - Nom du conseiller
  - qualifiee (boolean) - Lead qualifié ou non (défaut: false)
  
  ## Notes
  - Toutes les colonnes sont nullable pour compatibilité avec données existantes
  - Valeurs par défaut ajoutées pour certaines colonnes (pays, langue, qualifiee)
*/

-- Ajouter les colonnes manquantes à leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'ville'
  ) THEN
    ALTER TABLE leads ADD COLUMN ville text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'code_postal'
  ) THEN
    ALTER TABLE leads ADD COLUMN code_postal text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'pays'
  ) THEN
    ALTER TABLE leads ADD COLUMN pays text DEFAULT 'France';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'anniversaire'
  ) THEN
    ALTER TABLE leads ADD COLUMN anniversaire text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'autre_courriel'
  ) THEN
    ALTER TABLE leads ADD COLUMN autre_courriel text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'date_affectation'
  ) THEN
    ALTER TABLE leads ADD COLUMN date_affectation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'representant'
  ) THEN
    ALTER TABLE leads ADD COLUMN representant text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'prevente'
  ) THEN
    ALTER TABLE leads ADD COLUMN prevente text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'retention'
  ) THEN
    ALTER TABLE leads ADD COLUMN retention text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'sous_affilie'
  ) THEN
    ALTER TABLE leads ADD COLUMN sous_affilie text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'langue'
  ) THEN
    ALTER TABLE leads ADD COLUMN langue text DEFAULT 'Français';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'conseiller'
  ) THEN
    ALTER TABLE leads ADD COLUMN conseiller text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'qualifiee'
  ) THEN
    ALTER TABLE leads ADD COLUMN qualifiee boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'status_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN status_id uuid REFERENCES statuses(id);
  END IF;
END $$;