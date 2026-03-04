/*
  # Fix RLS policies for sellers table to allow anon operations

  1. Changes
    - Update INSERT, UPDATE, DELETE policies to allow both anon and authenticated users
    - This is necessary because the application uses custom authentication (not Supabase Auth)
    - All users connect as anon by default

  2. Security
    - SELECT: Public access (anon + authenticated)
    - INSERT: Public access (anon + authenticated)
    - UPDATE: Public access (anon + authenticated)
    - DELETE: Public access (anon + authenticated)
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Sellers peuvent tout insérer" ON sellers;
DROP POLICY IF EXISTS "Sellers peuvent tout mettre à jour" ON sellers;
DROP POLICY IF EXISTS "Sellers peuvent tout supprimer" ON sellers;

-- Create new policies that allow anon users
CREATE POLICY "Tout le monde peut insérer des sellers"
  ON sellers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut mettre à jour les sellers"
  ON sellers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut supprimer les sellers"
  ON sellers
  FOR DELETE
  TO anon, authenticated
  USING (true);
