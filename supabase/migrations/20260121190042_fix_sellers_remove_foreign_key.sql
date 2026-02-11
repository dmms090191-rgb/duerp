/*
  # Supprimer la contrainte de clé étrangère sur sellers
  
  1. Modifications
    - Supprimer la contrainte sellers_id_fkey qui force sellers.id à référencer auth.users(id)
    - Permettre la création de sellers sans compte auth.users
    - L'application utilise une authentification personnalisée, pas Supabase Auth
  
  2. Sécurité
    - Les politiques RLS existantes restent en place
    - Pas de changement aux permissions
*/

-- Supprimer la contrainte de clé étrangère existante
ALTER TABLE IF EXISTS sellers
  DROP CONSTRAINT IF EXISTS sellers_id_fkey;

-- Ajouter une valeur par défaut pour l'ID si elle n'existe pas déjà
DO $$
BEGIN
  ALTER TABLE sellers ALTER COLUMN id SET DEFAULT gen_random_uuid();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
