/*
  # Ajout du code PIN pour les vendeurs

  1. Modifications
    - Ajout de la colonne `pin_code` à la table `sellers`
      - Type: text (6 chiffres)
      - Nullable: true (optionnel)
      - Contrainte: doit contenir exactement 6 chiffres si défini
  
  2. Notes
    - Le code PIN permet aux vendeurs d'avoir un code de sécurité numérique
    - Le PIN est optionnel et peut être défini/modifié à tout moment
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'pin_code'
  ) THEN
    ALTER TABLE sellers ADD COLUMN pin_code text;
    ALTER TABLE sellers ADD CONSTRAINT pin_code_format CHECK (pin_code IS NULL OR (pin_code ~ '^[0-9]{6}$'));
  END IF;
END $$;