/*
  # Créer les tables pour la gestion des emails

  1. Nouvelles Tables
    - `email_templates`
      - `id` (uuid, clé primaire)
      - `name` (text) - Nom du template
      - `subject` (text) - Sujet de l'email
      - `body` (text) - Corps de l'email
      - `type` (text) - Type de template (general, welcome, reminder, etc.)
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de dernière modification
    
    - `email_history`
      - `id` (uuid, clé primaire)
      - `recipient_email` (text) - Email du destinataire
      - `recipient_name` (text) - Nom du destinataire
      - `subject` (text) - Sujet de l'email
      - `body` (text) - Corps de l'email
      - `status` (text) - Statut de l'email (sent, failed, pending)
      - `sent_at` (timestamptz) - Date d'envoi
      - `error_message` (text, nullable) - Message d'erreur si échec
  
  2. Sécurité
    - Activer RLS sur les deux tables
    - Ajouter des politiques pour accès public (anonymous users)
*/

-- Créer la table email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table email_history
CREATE TABLE IF NOT EXISTS email_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz DEFAULT now(),
  error_message text
);

-- Activer RLS sur email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur email_history
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour email_templates (accès public complet)
CREATE POLICY "Tous peuvent lire les templates"
  ON email_templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Tous peuvent créer des templates"
  ON email_templates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Tous peuvent modifier les templates"
  ON email_templates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tous peuvent supprimer les templates"
  ON email_templates
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Politiques pour email_history (accès public complet)
CREATE POLICY "Tous peuvent lire l'historique des emails"
  ON email_history
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Tous peuvent créer des entrées d'historique"
  ON email_history
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Tous peuvent modifier l'historique"
  ON email_history
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tous peuvent supprimer l'historique"
  ON email_history
  FOR DELETE
  TO anon, authenticated
  USING (true);
