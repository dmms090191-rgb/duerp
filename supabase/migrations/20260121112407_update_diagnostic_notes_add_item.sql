/*
  # Update diagnostic admin notes to include item field

  1. Changes
    - Drop existing unique constraint
    - Add `item` field to store specific option/item within category
    - Create new unique constraint on (client_id, category, item)
    
  2. Details
    - This allows admins to add notes at both category level (item='') and individual option level (item='Option Name')
    - Each note is uniquely identified by the combination of client_id, category, and item
*/

-- Drop old unique constraint if it exists
ALTER TABLE diagnostic_admin_notes DROP CONSTRAINT IF EXISTS diagnostic_admin_notes_client_id_category_key;

-- Add item column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diagnostic_admin_notes' AND column_name = 'item'
  ) THEN
    ALTER TABLE diagnostic_admin_notes ADD COLUMN item text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Create new unique constraint
ALTER TABLE diagnostic_admin_notes DROP CONSTRAINT IF EXISTS diagnostic_admin_notes_client_id_category_item_key;
ALTER TABLE diagnostic_admin_notes ADD CONSTRAINT diagnostic_admin_notes_client_id_category_item_key UNIQUE(client_id, category, item);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_diagnostic_admin_notes_category_item ON diagnostic_admin_notes(category, item);