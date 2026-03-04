/*
  # Add client_account_created field to leads/clients table

  ## Changes
    - Add `client_account_created` boolean column to track if a client account has been created
    - Default value is false
    - This field indicates whether the "Create Client Access" action has been completed

  ## Details
    - Column: client_account_created (boolean, default false)
    - Purpose: Track whether client portal access has been created for this lead
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'client_account_created'
  ) THEN
    ALTER TABLE leads ADD COLUMN client_account_created boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'client_account_created'
  ) THEN
    ALTER TABLE clients ADD COLUMN client_account_created boolean DEFAULT false;
  END IF;
END $$;