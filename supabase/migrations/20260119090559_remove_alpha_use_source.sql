/*
  # Remove alpha column and use source instead

  1. Changes
    - Drop `alpha` column from `leads` table (source column already exists)
    - Rename `alpha` column to `source` in `clients` table
  
  2. Notes
    - The leads table already has a source column, so we just remove alpha
    - The clients table has alpha which will be renamed to source
    - No data will be lost as alpha column in leads is empty
*/

-- Drop alpha from leads table (source already exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'alpha'
  ) THEN
    ALTER TABLE leads DROP COLUMN alpha;
  END IF;
END $$;

-- Rename alpha to source in clients table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'alpha'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'source'
  ) THEN
    ALTER TABLE clients RENAME COLUMN alpha TO source;
  END IF;
END $$;