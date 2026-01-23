/*
  # Add online status to admins table

  1. Changes
    - Add `is_online` column to track admin online status
    - Add `last_connection` column to track last connection time
  
  2. Security
    - No RLS changes needed (already configured)
*/

-- Add is_online column to admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE admins ADD COLUMN is_online boolean DEFAULT false;
  END IF;
END $$;

-- Add last_connection column to admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'last_connection'
  ) THEN
    ALTER TABLE admins ADD COLUMN last_connection timestamptz;
  END IF;
END $$;
