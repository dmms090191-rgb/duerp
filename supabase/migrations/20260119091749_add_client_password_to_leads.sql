/*
  # Add client_password field to leads table

  ## Changes
    - Add `client_password` column to `leads` table to store the 6-digit password for client login
    - This password will be used with the SIRET number for client authentication

  ## Details
    - Column: client_password (text, nullable)
    - Purpose: Store the 6-digit password for client portal access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'client_password'
  ) THEN
    ALTER TABLE leads ADD COLUMN client_password text;
  END IF;
END $$;