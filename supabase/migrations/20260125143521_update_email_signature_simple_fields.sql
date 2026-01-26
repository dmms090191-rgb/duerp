/*
  # Update Email Signature Table for Simple Interface

  1. Changes
    - Add `image_url` (text) - URL of the signature logo/image
    - Add `company_name` (text) - Company name
    - Add `company_title` (text) - Company title/tagline
    - Add `email_address` (text) - Email address
    - Add `phone` (text) - Phone number
    - Add `website` (text) - Website URL
    - Add `additional_text` (text) - Any additional text
    - Keep `signature_html` for generated HTML
  
  2. Notes
    - The HTML will be automatically generated from these fields
    - This makes it much easier for users to create signatures
*/

-- Add new columns to email_signature table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_signature' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE email_signature ADD COLUMN image_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_signature' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE email_signature ADD COLUMN company_name text DEFAULT 'Cabinet FPE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_signature' AND column_name = 'company_title'
  ) THEN
    ALTER TABLE email_signature ADD COLUMN company_title text DEFAULT 'Expert en prévention des risques professionnels';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_signature' AND column_name = 'email_address'
  ) THEN
    ALTER TABLE email_signature ADD COLUMN email_address text DEFAULT 'contact@cabinet-fpe.fr';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_signature' AND column_name = 'phone'
  ) THEN
    ALTER TABLE email_signature ADD COLUMN phone text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_signature' AND column_name = 'website'
  ) THEN
    ALTER TABLE email_signature ADD COLUMN website text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_signature' AND column_name = 'additional_text'
  ) THEN
    ALTER TABLE email_signature ADD COLUMN additional_text text DEFAULT '';
  END IF;
END $$;