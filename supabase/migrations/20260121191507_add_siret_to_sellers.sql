/*
  # Add SIRET field to sellers table

  1. Changes
    - Add `siret` column to sellers table for seller identification
    - Add unique constraint to ensure each SIRET is unique

  2. Notes
    - Allows sellers to login using their SIRET number
    - SIRET is optional and can be null
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'siret'
  ) THEN
    ALTER TABLE sellers ADD COLUMN siret text UNIQUE;
  END IF;
END $$;