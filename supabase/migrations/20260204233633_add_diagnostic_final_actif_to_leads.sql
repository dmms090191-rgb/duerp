/*
  # Ajouter colonne diagnostic_final_actif à la table leads

  1. Modifications
    - Ajout de la colonne `diagnostic_final_actif` (boolean) à la table `leads`
    - Valeur par défaut : `false` (désactivé par défaut)
  
  2. Raisons
    - Permet aux admins et vendeurs d'activer/désactiver l'accès au formulaire de diagnostic final pour les leads
    - Cohérence avec la table clients
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'diagnostic_final_actif'
  ) THEN
    ALTER TABLE leads ADD COLUMN diagnostic_final_actif boolean DEFAULT false;
  END IF;
END $$;