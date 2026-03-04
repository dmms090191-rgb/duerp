/*
  # Add last_connection to leads table

  1. Changes
    - Add `last_connection` column to track last connection time for leads

  2. Security
    - No RLS changes needed
*/

-- Add last_connection column to leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'last_connection'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_connection timestamptz;
  END IF;
END $$;
