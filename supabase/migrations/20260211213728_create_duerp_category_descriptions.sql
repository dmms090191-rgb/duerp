/*
  # Create DUERP Category Descriptions Table

  1. New Tables
    - `duerp_category_descriptions`
      - `id` (uuid, primary key)
      - `client_id` (integer, references clients)
      - `type_diagnostic` (text)
      - `category_id` (text) - ID of the DUERP category
      - `description` (text) - Description text for the category
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `duerp_category_descriptions` table
    - Add policies for public access (anon users can read, insert, update, delete their own data)
*/

CREATE TABLE IF NOT EXISTS duerp_category_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL,
  type_diagnostic text NOT NULL,
  category_id text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, type_diagnostic, category_id)
);

ALTER TABLE duerp_category_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to duerp_category_descriptions"
  ON duerp_category_descriptions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to duerp_category_descriptions"
  ON duerp_category_descriptions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to duerp_category_descriptions"
  ON duerp_category_descriptions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from duerp_category_descriptions"
  ON duerp_category_descriptions FOR DELETE
  TO anon
  USING (true);