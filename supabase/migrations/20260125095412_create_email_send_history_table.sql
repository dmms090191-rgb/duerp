/*
  # Create email send history table
  
  1. New Tables
    - `email_send_history`
      - `id` (uuid, primary key)
      - `client_id` (integer) - ID du client destinataire
      - `email_type` (text) - Type d'email (identifiants, relance, procedure_prise_en_charge)
      - `recipient_email` (text) - Email du destinataire
      - `recipient_name` (text) - Nom du destinataire
      - `subject` (text) - Sujet de l'email
      - `body` (text) - Corps de l'email
      - `attachments` (jsonb) - Liste des pièces jointes (nom, type, taille)
      - `status` (text) - Statut (sent, failed, pending)
      - `error_message` (text, nullable) - Message d'erreur en cas d'échec
      - `sent_at` (timestamptz) - Date d'envoi
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `email_send_history` table
    - Add policy for public read/write access
*/

CREATE TABLE IF NOT EXISTS email_send_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer REFERENCES clients(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  error_message text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_send_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to email_send_history"
  ON email_send_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to email_send_history"
  ON email_send_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to email_send_history"
  ON email_send_history FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to email_send_history"
  ON email_send_history FOR DELETE
  TO anon, authenticated
  USING (true);