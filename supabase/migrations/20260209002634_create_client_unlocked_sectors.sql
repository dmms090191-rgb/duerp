/*
  # Create client unlocked sectors table

  1. New Tables
    - `client_unlocked_sectors`
      - `id` (uuid, primary key) - Unique identifier
      - `client_id` (integer, not null) - Reference to the client
      - `sector_id` (text, not null) - Sector identifier (e.g., "01")
      - `sector_name` (text, not null) - Full sector name
      - `unlocked_by` (uuid) - Admin who unlocked the sector
      - `unlocked_at` (timestamptz, default now()) - When the sector was unlocked
      - `created_at` (timestamptz, default now()) - Record creation timestamp

  2. Security
    - Enable RLS on `client_unlocked_sectors` table
    - Add policy for public read access (for clients to see their unlocked sectors)
    - Add policy for public insert/update/delete access (for admins to manage unlocked sectors)

  3. Indexes
    - Add index on `client_id` for fast lookups
    - Add unique constraint on (`client_id`, `sector_id`) to prevent duplicates
*/

-- Create table
CREATE TABLE IF NOT EXISTS client_unlocked_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL,
  sector_id text NOT NULL,
  sector_name text NOT NULL,
  unlocked_by uuid,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_unlocked_sectors_client_id ON client_unlocked_sectors(client_id);

-- Add unique constraint to prevent duplicate unlocks
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_unlocked_sectors_unique ON client_unlocked_sectors(client_id, sector_id);

-- Enable RLS
ALTER TABLE client_unlocked_sectors ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Anyone can read unlocked sectors"
  ON client_unlocked_sectors
  FOR SELECT
  USING (true);

-- Policy for public insert access
CREATE POLICY "Anyone can insert unlocked sectors"
  ON client_unlocked_sectors
  FOR INSERT
  WITH CHECK (true);

-- Policy for public update access
CREATE POLICY "Anyone can update unlocked sectors"
  ON client_unlocked_sectors
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy for public delete access
CREATE POLICY "Anyone can delete unlocked sectors"
  ON client_unlocked_sectors
  FOR DELETE
  USING (true);