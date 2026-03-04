/*
  # Create diagnostic admin notes table

  1. New Tables
    - `diagnostic_admin_notes`
      - `id` (uuid, primary key)
      - `client_id` (integer, foreign key to clients)
      - `category` (text) - nom de la catégorie
      - `notes` (text) - contenu des notes admin
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `diagnostic_admin_notes` table
    - Add policy for public read/write access (for anonymous users acting as admins)
*/

CREATE TABLE IF NOT EXISTS diagnostic_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, category)
);

ALTER TABLE diagnostic_admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to diagnostic admin notes"
  ON diagnostic_admin_notes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to diagnostic admin notes"
  ON diagnostic_admin_notes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to diagnostic admin notes"
  ON diagnostic_admin_notes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to diagnostic admin notes"
  ON diagnostic_admin_notes
  FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_diagnostic_admin_notes_client_id ON diagnostic_admin_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_admin_notes_category ON diagnostic_admin_notes(category);
