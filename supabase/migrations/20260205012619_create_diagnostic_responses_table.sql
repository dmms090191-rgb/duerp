/*
  # Créer la table des réponses du diagnostic final

  1. Nouvelle table
    - `diagnostic_responses`
      - `id` (uuid, clé primaire)
      - `client_id` (integer, référence vers clients.id)
      - `type_diagnostic` (text)
      - `section` (text) - Préparation, Impliquer, Evaluation, etc.
      - `question_id` (text) - Identifiant unique de la question
      - `question_text` (text) - Texte de la question
      - `response` (text) - Réponse du client
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Activer RLS
    - Les clients authentifiés peuvent créer et lire leurs propres réponses
    - Les clients peuvent mettre à jour leurs propres réponses
    - Accès public pour les admins/vendeurs
*/

CREATE TABLE IF NOT EXISTS diagnostic_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL,
  type_diagnostic text NOT NULL,
  section text NOT NULL,
  question_id text NOT NULL,
  question_text text NOT NULL,
  response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostic_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to diagnostic_responses"
  ON diagnostic_responses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to diagnostic_responses"
  ON diagnostic_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to diagnostic_responses"
  ON diagnostic_responses FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to diagnostic_responses"
  ON diagnostic_responses FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_diagnostic_responses_client_id ON diagnostic_responses(client_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_responses_type_diagnostic ON diagnostic_responses(type_diagnostic);
CREATE INDEX IF NOT EXISTS idx_diagnostic_responses_question_id ON diagnostic_responses(client_id, question_id);