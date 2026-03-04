/*
  # Fix leads table RLS policies for delete operations

  1. Changes
    - Drop all existing policies on leads table to avoid conflicts
    - Recreate all policies with correct permissions
    - Ensure DELETE policy allows public access (for admin panel)

  2. Security
    - Table has RLS enabled
    - All operations allowed for anon users (required for admin dashboard)
    - In production, consider restricting to authenticated users only
*/

-- Drop all existing policies on leads
DROP POLICY IF EXISTS "Anyone can view leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON leads;
DROP POLICY IF EXISTS "Anyone can delete leads" ON leads;
DROP POLICY IF EXISTS "Public read leads" ON leads;
DROP POLICY IF EXISTS "Public insert leads" ON leads;
DROP POLICY IF EXISTS "Public update leads" ON leads;
DROP POLICY IF EXISTS "Public delete leads" ON leads;

-- Ensure RLS is enabled
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for all operations
CREATE POLICY "Public can view leads"
  ON leads
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert leads"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update leads"
  ON leads
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete leads"
  ON leads
  FOR DELETE
  TO anon, authenticated
  USING (true);
