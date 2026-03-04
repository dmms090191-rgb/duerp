/*
  # Add delete policies for documents

  1. Changes
    - Add policy to allow anyone to delete documents from documents table
    - Add policy to allow anyone to delete files from storage

  2. Security
    - Public users can delete documents (needed for client dashboard)
    - Public users can delete files from storage bucket
*/

-- Policy for public to delete documents
CREATE POLICY "Anyone can delete documents"
  ON documents
  FOR DELETE
  USING (true);

-- Policy for public to delete files from storage
CREATE POLICY "Public can delete documents from storage"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'documents');