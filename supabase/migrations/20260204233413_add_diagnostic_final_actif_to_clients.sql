/*
  # Ajouter colonne diagnostic_final_actif à la table clients

  1. Modifications
    - Ajout de la colonne `diagnostic_final_actif` (boolean) à la table `clients`
    - Valeur par défaut : `false` (désactivé par défaut)
  
  2. Raisons
    - Permet aux admins et vendeurs d'activer/désactiver l'accès au formulaire de diagnostic final
    - Si désactivé, le client verra un message l'informant qu'il ne peut pas remplir le formulaire
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'diagnostic_final_actif'
  ) THEN
    ALTER TABLE clients ADD COLUMN diagnostic_final_actif boolean DEFAULT false;
  END IF;
END $$;