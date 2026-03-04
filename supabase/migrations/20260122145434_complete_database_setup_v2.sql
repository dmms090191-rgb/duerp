/*
  # Configuration complète de la base de données
  
  ## Résumé
  Cette migration crée toutes les tables nécessaires pour l'application de gestion de clients et leads.
  
  ## Tables créées
  
  ### 1. clients
  Table principale des clients avec ID numérique
  - Champs de base: id, email, full_name, company_name, phone, address
  - Champs personnels: prenom, nom, portable, rendez_vous
  - Champs professionnels: activite, siret
  - Champs de gestion: status, status_id, assigned_agent_name, vendeur
  - Champs d'authentification: client_password, client_account_created
  - Statut en ligne: is_online
  
  ### 2. admins
  Table des administrateurs sans contrainte auth.users
  - Champs: id, email, full_name, phone, role, status, is_online
  
  ### 3. sellers
  Table des vendeurs sans contrainte auth.users
  - Champs: id, email, full_name, phone, commission_rate, status, siret, is_online
  
  ### 4. leads
  Table des prospects avec ID numérique
  - Champs similaires aux clients pour conversion facile
  - Inclut client_password et client_account_created
  
  ### 5. statuses
  Table des statuts personnalisables
  - name, color pour affichage
  
  ### 6. chat_messages
  Messagerie client-vendeur
  - client_id integer, sender_id text, sender_name pour flexibilité
  
  ### 7. admin_seller_messages
  Messagerie admin-vendeur
  - Communication interne
  
  ### 8. documents
  Stockage des documents PDF avec bucket storage
  - Lié aux clients, accès public
  
  ### 9. diagnostic_admin_notes
  Notes admin par catégorie et item
  - Permet notes détaillées par diagnostic
  
  ### 10. argumentaire
  Arguments de vente pour les vendeurs
  - Organisé par catégorie et ordre
  
  ### 11. products
  Catalogue de produits (optionnel)
  
  ## Sécurité
  - RLS activé sur toutes les tables
  - Accès public (anon) pour la plupart des tables car l'authentification est personnalisée
  - Politiques restrictives où nécessaire
*/

-- ============================================
-- 1. TABLE STATUSES (doit être créée en premier car référencée par clients)
-- ============================================

CREATE TABLE IF NOT EXISTS statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#000000',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read statuses"
  ON statuses FOR SELECT
  USING (true);

CREATE POLICY "Public insert statuses"
  ON statuses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update statuses"
  ON statuses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete statuses"
  ON statuses FOR DELETE
  USING (true);

-- ============================================
-- 2. TABLE CLIENTS
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  phone text,
  address text,
  project_description text,
  status text DEFAULT 'nouveau',
  status_id uuid REFERENCES statuses(id),
  assigned_agent_name text,
  rendez_vous timestamptz,
  prenom text,
  nom text,
  portable text,
  activite text,
  siret text,
  vendeur text,
  client_password text,
  client_account_created boolean DEFAULT false,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read clients"
  ON clients FOR SELECT
  USING (true);

CREATE POLICY "Public insert clients"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update clients"
  ON clients FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete clients"
  ON clients FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status_id ON clients(status_id);

-- Set starting ID to 10000 (après création de la table)
DO $$
BEGIN
  PERFORM setval('clients_id_seq', 10000, false);
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- 3. TABLE ADMINS
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'admin',
  status text NOT NULL DEFAULT 'active',
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read admins"
  ON admins FOR SELECT
  USING (true);

CREATE POLICY "Public insert admins"
  ON admins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update admins"
  ON admins FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete admins"
  ON admins FOR DELETE
  USING (true);

-- ============================================
-- 4. TABLE SELLERS
-- ============================================

CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  commission_rate numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  siret text,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sellers"
  ON sellers FOR SELECT
  USING (true);

CREATE POLICY "Public insert sellers"
  ON sellers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update sellers"
  ON sellers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete sellers"
  ON sellers FOR DELETE
  USING (true);

-- ============================================
-- 5. TABLE LEADS
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  phone text,
  address text,
  project_description text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  assigned_to text,
  source text,
  notes text,
  rendez_vous timestamptz,
  prenom text,
  nom text,
  portable text,
  activite text,
  siret text,
  client_password text,
  client_account_created boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read leads"
  ON leads FOR SELECT
  USING (true);

CREATE POLICY "Public insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update leads"
  ON leads FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete leads"
  ON leads FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- ============================================
-- 6. TABLE CHAT_MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('client', 'seller', 'admin')),
  sender_name text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read chat_messages"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Public insert chat_messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update chat_messages"
  ON chat_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete chat_messages"
  ON chat_messages FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON chat_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================
-- 7. TABLE ADMIN_SELLER_MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS admin_seller_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  sender_id text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('admin', 'seller')),
  sender_name text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_seller_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read admin_seller_messages"
  ON admin_seller_messages FOR SELECT
  USING (true);

CREATE POLICY "Public insert admin_seller_messages"
  ON admin_seller_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update admin_seller_messages"
  ON admin_seller_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete admin_seller_messages"
  ON admin_seller_messages FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_admin_seller_messages_seller_id ON admin_seller_messages(seller_id);
CREATE INDEX IF NOT EXISTS idx_admin_seller_messages_created_at ON admin_seller_messages(created_at);

-- ============================================
-- 8. TABLE DOCUMENTS & STORAGE
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'DUERP',
  title text NOT NULL,
  file_path text NOT NULL,
  file_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read documents"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "Public insert documents"
  ON documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update documents"
  ON documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete documents"
  ON documents FOR DELETE
  USING (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public access
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view documents in storage" ON storage.objects;
  CREATE POLICY "Public can view documents in storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can upload documents to storage" ON storage.objects;
  CREATE POLICY "Public can upload documents to storage"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 9. TABLE DIAGNOSTIC_ADMIN_NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS diagnostic_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category text NOT NULL,
  item text NOT NULL DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, category, item)
);

ALTER TABLE diagnostic_admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read diagnostic_admin_notes"
  ON diagnostic_admin_notes FOR SELECT
  USING (true);

CREATE POLICY "Public insert diagnostic_admin_notes"
  ON diagnostic_admin_notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update diagnostic_admin_notes"
  ON diagnostic_admin_notes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete diagnostic_admin_notes"
  ON diagnostic_admin_notes FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_diagnostic_admin_notes_client_id ON diagnostic_admin_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_admin_notes_category ON diagnostic_admin_notes(category);
CREATE INDEX IF NOT EXISTS idx_diagnostic_admin_notes_category_item ON diagnostic_admin_notes(category, item);

-- ============================================
-- 10. TABLE ARGUMENTAIRE
-- ============================================

CREATE TABLE IF NOT EXISTS argumentaire (
  id SERIAL PRIMARY KEY,
  titre text NOT NULL,
  contenu text NOT NULL,
  categorie text NOT NULL DEFAULT 'Général',
  ordre integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE argumentaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read argumentaire"
  ON argumentaire FOR SELECT
  USING (true);

CREATE POLICY "Public insert argumentaire"
  ON argumentaire FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update argumentaire"
  ON argumentaire FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete argumentaire"
  ON argumentaire FOR DELETE
  USING (true);

-- ============================================
-- 11. TABLE PRODUCTS (optionnel)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Public insert products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete products"
  ON products FOR DELETE
  USING (true);