/*
  # Ajouter le champ password à la table sellers

  1. Modifications
    - Ajouter le champ `password` (text) à la table sellers pour stocker le mot de passe en clair
    - Ce champ permettra aux administrateurs de voir et modifier le mot de passe des vendeurs

  Note: Stocker les mots de passe en clair n'est pas une bonne pratique de sécurité.
  Cette modification est faite uniquement pour répondre à une demande spécifique.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'password'
  ) THEN
    ALTER TABLE sellers ADD COLUMN password text;
  END IF;
END $$;