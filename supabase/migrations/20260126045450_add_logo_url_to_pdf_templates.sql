/*
  # Add logo URL column to pdf_templates

  1. Changes
    - Add `logo_url` column to `pdf_templates` table to store logo image URLs
    - This allows storing logos for PDF generation customization

  2. Notes
    - Logo URLs will point to images stored in Supabase Storage
    - Used by PDF generation service to add custom logos to PDFs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pdf_templates' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE pdf_templates ADD COLUMN logo_url text;
  END IF;
END $$;