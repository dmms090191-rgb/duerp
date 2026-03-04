/*
  # Create PDF templates table

  1. New Tables
    - `pdf_templates`
      - `id` (uuid, primary key)
      - `name` (text) - Nom du template PDF
      - `type` (text) - Type/clé unique du template (ex: duerp, facture, contrat)
      - `description` (text, nullable) - Description du template
      - `content` (jsonb) - Contenu structuré du PDF (sections, champs dynamiques)
      - `header_html` (text, nullable) - HTML pour l'en-tête
      - `footer_html` (text, nullable) - HTML pour le pied de page
      - `styles` (text, nullable) - CSS personnalisé
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `pdf_templates` table
    - Add policy for public read access (anon users can read templates)
    - Add policy for public insert/update/delete access
*/

CREATE TABLE IF NOT EXISTS pdf_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text UNIQUE NOT NULL,
  description text,
  content jsonb DEFAULT '{}'::jsonb,
  header_html text,
  footer_html text,
  styles text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to pdf_templates"
  ON pdf_templates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to pdf_templates"
  ON pdf_templates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to pdf_templates"
  ON pdf_templates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to pdf_templates"
  ON pdf_templates FOR DELETE
  TO anon, authenticated
  USING (true);