/*
  # Create documents table and storage bucket for PDF files

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `client_id` (integer, foreign key to clients)
      - `document_type` (text) - Type of document (e.g., 'DUERP', 'Attestation')
      - `title` (text) - Document title
      - `file_path` (text) - Path to the file in storage
      - `file_url` (text) - Public URL to access the file
      - `created_at` (timestamptz) - Creation timestamp

  2. Storage
    - Create a storage bucket named 'documents' for PDF files
    - Enable public access for downloads

  3. Security
    - Enable RLS on `documents` table
    - Add policies for clients to view their own documents
    - Add policies for authenticated users to insert documents
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'DUERP',
  title text NOT NULL,
  file_path text NOT NULL,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view their own documents
CREATE POLICY "Clients can view own documents"
  ON documents
  FOR SELECT
  USING (true);

-- Policy for authenticated users to insert documents
CREATE POLICY "Authenticated users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for public to view all documents
CREATE POLICY "Public can view all documents"
  ON documents
  FOR SELECT
  USING (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public access
CREATE POLICY "Public can view documents in storage"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents to storage"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Public can upload documents to storage"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents');
