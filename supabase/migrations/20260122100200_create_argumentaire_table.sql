/*
  # Create argumentaire table

  1. New Tables
    - `argumentaire`
      - `id` (integer, primary key, auto-increment)
      - `titre` (text, not null) - Titre de l'argument
      - `contenu` (text, not null) - Contenu détaillé de l'argument
      - `categorie` (text, not null) - Catégorie de l'argument
      - `ordre` (integer, default 1) - Ordre d'affichage
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `argumentaire` table
    - Add policy for public read access (for sellers and admins)
    - Add policy for public insert, update, delete (for admins and sellers)
*/

CREATE TABLE IF NOT EXISTS argumentaire (
  id SERIAL PRIMARY KEY,
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  categorie TEXT NOT NULL DEFAULT 'Général',
  ordre INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE argumentaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read argumentaire"
  ON argumentaire
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert argumentaire"
  ON argumentaire
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update argumentaire"
  ON argumentaire
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete argumentaire"
  ON argumentaire
  FOR DELETE
  USING (true);
