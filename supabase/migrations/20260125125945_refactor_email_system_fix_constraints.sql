/*
  # Refonte système d'emails - Fix contraintes
  
  ## Changements
  
  1. Suppression de la contrainte UNIQUE sur pdf_templates.type
  2. Ajout des colonnes nécessaires
  3. Création des relations
  4. Insertion des données par défaut
*/

-- Supprimer la contrainte UNIQUE sur type de pdf_templates
ALTER TABLE pdf_templates DROP CONSTRAINT IF EXISTS pdf_templates_type_key;

-- Ajouter les colonnes manquantes à email_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'key'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'body_html'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN body_html text;
    UPDATE email_templates SET body_html = body WHERE body_html IS NULL;
  END IF;
END $$;

-- Mettre à jour les clés
UPDATE email_templates SET key = type WHERE key IS NULL OR key = '';

-- Ajouter la contrainte unique sur key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'email_templates' 
    AND constraint_name = 'email_templates_key_key'
  ) THEN
    ALTER TABLE email_templates ADD CONSTRAINT email_templates_key_key UNIQUE (key);
  END IF;
END $$;

-- Ajouter les colonnes manquantes à pdf_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pdf_templates' AND column_name = 'pdf_type'
  ) THEN
    ALTER TABLE pdf_templates ADD COLUMN pdf_type text;
    UPDATE pdf_templates SET pdf_type = 'dynamic' WHERE pdf_type IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pdf_templates' AND column_name = 'dynamic_type'
  ) THEN
    ALTER TABLE pdf_templates ADD COLUMN dynamic_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pdf_templates' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE pdf_templates ADD COLUMN file_url text;
  END IF;
END $$;

-- Créer la table de relation email_template_pdfs
CREATE TABLE IF NOT EXISTS email_template_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_template_id uuid REFERENCES email_templates(id) ON DELETE CASCADE,
  pdf_template_id uuid REFERENCES pdf_templates(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email_template_id, pdf_template_id)
);

-- Ajouter les colonnes manquantes à email_send_history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_send_history' AND column_name = 'template_key'
  ) THEN
    ALTER TABLE email_send_history ADD COLUMN template_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_send_history' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE email_send_history ADD COLUMN error_message text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_send_history' AND column_name = 'retry_count'
  ) THEN
    ALTER TABLE email_send_history ADD COLUMN retry_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_send_history' AND column_name = 'last_retry_at'
  ) THEN
    ALTER TABLE email_send_history ADD COLUMN last_retry_at timestamptz;
  END IF;
END $$;

-- Activer RLS sur email_template_pdfs
ALTER TABLE email_template_pdfs ENABLE ROW LEVEL SECURITY;

-- Policies pour email_template_pdfs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_template_pdfs' AND policyname = 'Public can read relations'
  ) THEN
    CREATE POLICY "Public can read relations"
      ON email_template_pdfs FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_template_pdfs' AND policyname = 'Public can insert relations'
  ) THEN
    CREATE POLICY "Public can insert relations"
      ON email_template_pdfs FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_template_pdfs' AND policyname = 'Public can update relations'
  ) THEN
    CREATE POLICY "Public can update relations"
      ON email_template_pdfs FOR UPDATE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_template_pdfs' AND policyname = 'Public can delete relations'
  ) THEN
    CREATE POLICY "Public can delete relations"
      ON email_template_pdfs FOR DELETE
      USING (true);
  END IF;
END $$;

-- Créer les PDFs dynamiques par défaut
INSERT INTO pdf_templates (name, type, pdf_type, dynamic_type, description)
SELECT 'Facture personnalisée', 'document', 'dynamic', 'facture', 'Facture générée automatiquement avec les informations du client'
WHERE NOT EXISTS (SELECT 1 FROM pdf_templates WHERE dynamic_type = 'facture');

INSERT INTO pdf_templates (name, type, pdf_type, dynamic_type, description)
SELECT 'Attestation de prise en charge DUERP', 'document', 'dynamic', 'attestation', 'Attestation DUERP personnalisée avec informations client'
WHERE NOT EXISTS (SELECT 1 FROM pdf_templates WHERE dynamic_type = 'attestation');

-- Associer le template "procedure_prise_en_charge" avec les PDFs dynamiques
DO $$
DECLARE
  template_id uuid;
  pdf_facture_id uuid;
  pdf_attestation_id uuid;
BEGIN
  SELECT id INTO template_id 
  FROM email_templates 
  WHERE key = 'procedure_prise_en_charge' OR type = 'procedure_prise_en_charge'
  LIMIT 1;
  
  SELECT id INTO pdf_facture_id 
  FROM pdf_templates 
  WHERE dynamic_type = 'facture' 
  LIMIT 1;
  
  SELECT id INTO pdf_attestation_id 
  FROM pdf_templates 
  WHERE dynamic_type = 'attestation' 
  LIMIT 1;
  
  IF template_id IS NOT NULL AND pdf_facture_id IS NOT NULL THEN
    INSERT INTO email_template_pdfs (email_template_id, pdf_template_id, display_order)
    VALUES (template_id, pdf_facture_id, 1)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF template_id IS NOT NULL AND pdf_attestation_id IS NOT NULL THEN
    INSERT INTO email_template_pdfs (email_template_id, pdf_template_id, display_order)
    VALUES (template_id, pdf_attestation_id, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Mettre à jour template_key dans l'historique
UPDATE email_send_history
SET template_key = email_type
WHERE template_key IS NULL AND email_type IS NOT NULL;
