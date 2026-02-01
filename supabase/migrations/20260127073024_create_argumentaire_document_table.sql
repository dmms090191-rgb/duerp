/*
  # Création de la table argumentaire_document

  1. Nouvelle table
    - `argumentaire_document`
      - `id` (integer, primary key, auto-increment)
      - `titre` (text) - Titre du document argumentaire
      - `contenu` (text) - Contenu complet du document
      - `created_at` (timestamp) - Date de création
      - `updated_at` (timestamp) - Date de dernière modification

  2. Sécurité
    - Activer RLS sur la table `argumentaire_document`
    - Politique permettant la lecture publique (accessible à tous les utilisateurs connectés)
    - Politique permettant l'insertion et la mise à jour publique
*/

-- Créer la table argumentaire_document si elle n'existe pas
CREATE TABLE IF NOT EXISTS argumentaire_document (
  id SERIAL PRIMARY KEY,
  titre TEXT NOT NULL DEFAULT '',
  contenu TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE argumentaire_document ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture (SELECT) - accessible à tous
CREATE POLICY "Lecture publique pour argumentaire_document"
  ON argumentaire_document
  FOR SELECT
  TO public
  USING (true);

-- Politique pour l'insertion (INSERT) - accessible à tous
CREATE POLICY "Insertion publique pour argumentaire_document"
  ON argumentaire_document
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Politique pour la mise à jour (UPDATE) - accessible à tous
CREATE POLICY "Mise à jour publique pour argumentaire_document"
  ON argumentaire_document
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Politique pour la suppression (DELETE) - accessible à tous
CREATE POLICY "Suppression publique pour argumentaire_document"
  ON argumentaire_document
  FOR DELETE
  TO public
  USING (true);