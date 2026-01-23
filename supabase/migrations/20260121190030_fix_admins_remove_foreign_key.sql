/*
  # Supprimer la contrainte de clé étrangère sur admins
  
  1. Modifications
    - Supprimer la contrainte admins_id_fkey qui force admins.id à référencer auth.users(id)
    - Permettre la création d'admins sans compte auth.users
    - L'application utilise une authentification personnalisée, pas Supabase Auth
  
  2. Sécurité
    - Les politiques RLS existantes restent en place
    - Pas de changement aux permissions
*/

-- Supprimer la contrainte de clé étrangère existante
ALTER TABLE IF EXISTS admins
  DROP CONSTRAINT IF EXISTS admins_id_fkey;

-- Ajouter une valeur par défaut pour l'ID si elle n'existe pas déjà
DO $$
BEGIN
  ALTER TABLE admins ALTER COLUMN id SET DEFAULT gen_random_uuid();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
