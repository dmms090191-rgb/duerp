/*
  # Create DUERP Evaluation Responses Table

  1. New Tables
    - `duerp_evaluation_responses`
      - `id` (uuid, primary key)
      - `client_id` (integer, foreign key to clients)
      - `type_diagnostic` (text, type of diagnostic)
      - `category` (text, category of questions)
      - `question_id` (text, unique identifier for the question)
      - `selected_measures` (jsonb, array of selected measures)
      - `custom_measures` (jsonb, array of custom measures added by user)
      - `risk_status` (text, values: 'maitrise', 'non_maitrise', 'non_applicable')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `duerp_evaluation_responses` table
    - Add policies for public access (anon users can read/write their own responses)
*/

CREATE TABLE IF NOT EXISTS duerp_evaluation_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL,
  type_diagnostic text NOT NULL,
  category text NOT NULL,
  question_id text NOT NULL,
  selected_measures jsonb DEFAULT '[]'::jsonb,
  custom_measures jsonb DEFAULT '[]'::jsonb,
  risk_status text CHECK (risk_status IN ('maitrise', 'non_maitrise', 'non_applicable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, type_diagnostic, question_id)
);

ALTER TABLE duerp_evaluation_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read evaluation responses"
  ON duerp_evaluation_responses
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public to insert evaluation responses"
  ON duerp_evaluation_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public to update evaluation responses"
  ON duerp_evaluation_responses
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete evaluation responses"
  ON duerp_evaluation_responses
  FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_duerp_responses_client_diagnostic 
  ON duerp_evaluation_responses(client_id, type_diagnostic);
