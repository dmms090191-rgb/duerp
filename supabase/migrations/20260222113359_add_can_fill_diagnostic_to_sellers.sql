/*
  # Add can_fill_diagnostic column to sellers

  1. Modified Tables
    - `sellers`
      - `can_fill_diagnostic` (boolean, default false) - Controls whether the seller can enable diagnostic final for their clients

  2. Notes
    - When false (default), the seller cannot toggle the diagnostic final option for their clients
    - Only admins can enable this permission for sellers
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sellers' AND column_name = 'can_fill_diagnostic'
  ) THEN
    ALTER TABLE sellers ADD COLUMN can_fill_diagnostic boolean DEFAULT false;
  END IF;
END $$;