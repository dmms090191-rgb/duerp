/*
  # Create Storage for Signature Images

  1. New Storage Bucket
    - `signature-images` - For storing signature logos and images
  
  2. Security
    - Allow public access to read signature images
    - Allow anonymous users to upload signature images
    - Allow anonymous users to update/delete signature images
*/

-- Create storage bucket for signature images
INSERT INTO storage.buckets (id, name, public)
VALUES ('signature-images', 'signature-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read signature images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload signature images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update signature images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete signature images" ON storage.objects;

-- Allow anyone to read signature images
CREATE POLICY "Anyone can read signature images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'signature-images');

-- Allow anyone to upload signature images
CREATE POLICY "Anyone can upload signature images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'signature-images');

-- Allow anyone to update signature images
CREATE POLICY "Anyone can update signature images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'signature-images')
  WITH CHECK (bucket_id = 'signature-images');

-- Allow anyone to delete signature images
CREATE POLICY "Anyone can delete signature images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'signature-images');