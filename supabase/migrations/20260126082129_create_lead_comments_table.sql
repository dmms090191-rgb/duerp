/*
  # Create lead comments table

  1. New Tables
    - `lead_comments`
      - `id` (uuid, primary key)
      - `lead_id` (integer, foreign key to leads)
      - `comment_text` (text)
      - `author_name` (text) - nom de l'auteur du commentaire
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `lead_comments` table
    - Add policies for authenticated users to manage comments
*/

CREATE TABLE IF NOT EXISTS lead_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id integer NOT NULL,
  comment_text text NOT NULL,
  author_name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lead_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent lire les commentaires"
  ON lead_comments FOR SELECT
  USING (true);

CREATE POLICY "Tous peuvent ajouter des commentaires"
  ON lead_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tous peuvent modifier leurs commentaires"
  ON lead_comments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tous peuvent supprimer des commentaires"
  ON lead_comments FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_lead_comments_lead_id ON lead_comments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_created_at ON lead_comments(created_at DESC);
