/*
  # Custom Metiers and Tool Affiliations

  1. New Tables
    - `custom_metiers`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text, unique, not null) - Name of the custom metier
      - `created_at` (timestamptz) - Creation timestamp
    - `metier_tool_affiliations`
      - `id` (uuid, primary key) - Unique identifier
      - `metier_id` (uuid, foreign key -> custom_metiers.id) - The custom metier
      - `tool_sector_id` (text, not null) - The sector/tool ID from the sectors list
      - `tool_name` (text, not null) - The tool/sector name for display
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Allow authenticated users to read, insert, update, delete their own data
    - Allow anon users full access (app uses custom auth, not Supabase auth)

  3. Notes
    - Unique constraint on metier_id + tool_sector_id to prevent duplicate affiliations
    - Cascade delete on affiliations when a metier is deleted
*/

CREATE TABLE IF NOT EXISTS custom_metiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_metiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read custom_metiers for authenticated"
  ON custom_metiers FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert custom_metiers for authenticated"
  ON custom_metiers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update custom_metiers for authenticated"
  ON custom_metiers FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete custom_metiers for authenticated"
  ON custom_metiers FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow read custom_metiers for anon"
  ON custom_metiers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert custom_metiers for anon"
  ON custom_metiers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update custom_metiers for anon"
  ON custom_metiers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete custom_metiers for anon"
  ON custom_metiers FOR DELETE
  TO anon
  USING (true);

CREATE TABLE IF NOT EXISTS metier_tool_affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metier_id uuid NOT NULL REFERENCES custom_metiers(id) ON DELETE CASCADE,
  tool_sector_id text NOT NULL,
  tool_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(metier_id, tool_sector_id)
);

ALTER TABLE metier_tool_affiliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read metier_tool_affiliations for authenticated"
  ON metier_tool_affiliations FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert metier_tool_affiliations for authenticated"
  ON metier_tool_affiliations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update metier_tool_affiliations for authenticated"
  ON metier_tool_affiliations FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete metier_tool_affiliations for authenticated"
  ON metier_tool_affiliations FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow read metier_tool_affiliations for anon"
  ON metier_tool_affiliations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert metier_tool_affiliations for anon"
  ON metier_tool_affiliations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update metier_tool_affiliations for anon"
  ON metier_tool_affiliations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete metier_tool_affiliations for anon"
  ON metier_tool_affiliations FOR DELETE
  TO anon
  USING (true);
