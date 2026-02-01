/*
  # Créer le compte Super Admin

  1. Création du compte
    - Insère le super admin avec l'email dmms090191@gmail.com
    - Définit le rôle comme 'super_admin'
    - Définit le nom complet comme 'Super Admin'
    
  2. Sécurité
    - Le super admin a tous les privilèges
*/

-- Créer le super admin s'il n'existe pas déjà
INSERT INTO admins (
  email,
  full_name,
  role,
  status,
  is_online,
  created_at,
  updated_at
)
VALUES (
  'dmms090191@gmail.com',
  'Super Admin',
  'super_admin',
  'active',
  false,
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;