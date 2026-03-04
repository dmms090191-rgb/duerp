/*
  # Rename commentaires column to vendeur in clients table

  1. Changes
    - Rename column `commentaires` to `vendeur` in the `clients` table
    - This column will store the assigned seller/vendor name for each client

  2. Notes
    - Using IF EXISTS to ensure the column exists before renaming
    - Data is preserved during the rename operation
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'commentaires'
  ) THEN
    ALTER TABLE clients RENAME COLUMN commentaires TO vendeur;
  END IF;
END $$;
