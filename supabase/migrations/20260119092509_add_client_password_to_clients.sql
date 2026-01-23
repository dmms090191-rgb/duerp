/*
  # Add client_password field to clients table

  ## Changes
    - Add `client_password` column to `clients` table to store the 6-digit password for client login
    - This password will be used with the SIRET number for client authentication

  ## Details
    - Column: client_password (text, nullable)
    - Purpose: Store the 6-digit password for client portal access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'client_password'
  ) THEN
    ALTER TABLE clients ADD COLUMN client_password text;
  END IF;
END $$;