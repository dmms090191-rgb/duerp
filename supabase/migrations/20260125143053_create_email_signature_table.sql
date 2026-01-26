/*
  # Create Email Signature Configuration Table

  1. New Tables
    - `email_signature`
      - `id` (uuid, primary key) - Unique identifier
      - `signature_html` (text) - HTML content of the email signature
      - `is_active` (boolean) - Whether this signature is currently active
      - `created_at` (timestamptz) - When the signature was created
      - `updated_at` (timestamptz) - When the signature was last updated
  
  2. Security
    - Enable RLS on `email_signature` table
    - Add policy for anonymous users to read active signature
    - Add policy for anonymous users to insert/update signatures
  
  3. Initial Data
    - Insert a default signature template
*/

-- Create email_signature table
CREATE TABLE IF NOT EXISTS email_signature (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_html text NOT NULL DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_signature ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read active signatures
CREATE POLICY "Anyone can read active signatures"
  ON email_signature
  FOR SELECT
  USING (is_active = true);

-- Allow anonymous users to insert signatures
CREATE POLICY "Anyone can insert signatures"
  ON email_signature
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous users to update signatures
CREATE POLICY "Anyone can update signatures"
  ON email_signature
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete signatures
CREATE POLICY "Anyone can delete signatures"
  ON email_signature
  FOR DELETE
  USING (true);

-- Insert default signature
INSERT INTO email_signature (signature_html, is_active)
VALUES (
  '<div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-family: Arial, sans-serif;">
    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1f2937;">Cabinet FPE</p>
    <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280;">Expert en prévention des risques professionnels</p>
    <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280;">📧 contact@cabinet-fpe.fr</p>
    <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280;">📞 01 23 45 67 89</p>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">🌐 www.cabinet-fpe.fr</p>
  </div>',
  true
)
ON CONFLICT DO NOTHING;