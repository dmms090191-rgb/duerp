/*
  # Create PDF configuration table

  1. New Tables
    - `pdf_configuration`
      - `id` (uuid, primary key)
      - `logo_url` (text, nullable) - URL du logo de l'entreprise
      - `company_name` (text) - Nom de l'entreprise
      - `subtitle` (text) - Sous-titre
      - `email` (text) - Email de contact
      - `primary_color` (text) - Couleur principale
      - `footer_text` (text) - Texte du pied de page
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `pdf_configuration` table
    - Add policies for public access (anon users can read/write configuration)

  3. Default Data
    - Insert default configuration
*/

CREATE TABLE IF NOT EXISTS pdf_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  company_name text DEFAULT 'Cabinet FPE',
  subtitle text DEFAULT 'Sécurité Professionnelle',
  email text DEFAULT 'administration@securiteprofessionnelle.fr',
  primary_color text DEFAULT '#2563eb',
  footer_text text DEFAULT 'Cabinet FPE - Sécurité Professionnelle',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pdf_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to pdf_configuration"
  ON pdf_configuration FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to pdf_configuration"
  ON pdf_configuration FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to pdf_configuration"
  ON pdf_configuration FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to pdf_configuration"
  ON pdf_configuration FOR DELETE
  TO anon, authenticated
  USING (true);

-- Insert default configuration if table is empty
INSERT INTO pdf_configuration (company_name, subtitle, email, primary_color, footer_text)
SELECT 'Cabinet FPE', 'Sécurité Professionnelle', 'administration@securiteprofessionnelle.fr', '#2563eb', 'Cabinet FPE - Sécurité Professionnelle'
WHERE NOT EXISTS (SELECT 1 FROM pdf_configuration LIMIT 1);