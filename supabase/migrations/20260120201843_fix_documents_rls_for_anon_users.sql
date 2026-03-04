/*
  # Fix documents table RLS for anonymous users

  1. Changes
    - Drop the existing "Authenticated users can insert documents" policy
    - Add a new policy that allows anonymous (anon) users to insert documents
    - This is needed because clients are not Supabase Auth users, they use the anon role

  2. Security
    - Anonymous users can insert documents (needed for client dashboard PDF generation)
    - All users can still view documents (existing policy)
*/

-- Drop the old policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;

-- Create new policy for anon users to insert
CREATE POLICY "Anyone can insert documents"
  ON documents
  FOR INSERT
  WITH CHECK (true);