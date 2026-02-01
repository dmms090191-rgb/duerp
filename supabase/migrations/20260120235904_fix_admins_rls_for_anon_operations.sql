/*
  # Fix RLS policies for admins table to allow anon operations

  1. Changes
    - Update all policies to allow both anon and authenticated users
    - This is necessary because the application uses custom authentication (not Supabase Auth)
    - All users connect as anon by default

  2. Security
    - SELECT: Public access (anon + authenticated)
    - INSERT: Public access (anon + authenticated)
    - UPDATE: Public access (anon + authenticated)
    - DELETE: Public access (anon + authenticated)
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins peuvent tout voir" ON admins;
DROP POLICY IF EXISTS "Admins peuvent tout insérer" ON admins;
DROP POLICY IF EXISTS "Admins peuvent tout mettre à jour" ON admins;
DROP POLICY IF EXISTS "Admins peuvent tout supprimer" ON admins;

-- Create new policies that allow anon users
CREATE POLICY "Tout le monde peut voir les admins"
  ON admins
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Tout le monde peut insérer des admins"
  ON admins
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut mettre à jour les admins"
  ON admins
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut supprimer les admins"
  ON admins
  FOR DELETE
  TO anon, authenticated
  USING (true);
