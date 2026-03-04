# SCHÉMA COMPLET DU PROJET SUPABASE zjsdmythkltkbhmocude

## PREUVE D'EXÉCUTION SUR LE PROJET zjsdmythkltkbhmocude

### Tables existantes dans le schéma public
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Résultat (exécuté le 2026-01-23):**
- admin_seller_messages
- admins
- argumentaire
- chat_messages
- clients
- diagnostic_admin_notes
- documents
- leads
- products
- sellers
- statuses

---

## MIGRATIONS APPLIQUÉES

**Liste des 49 migrations appliquées dans l'ordre chronologique:**

1. `20251029101705_create_clients_table.sql`
2. `20251029135229_create_admins_sellers_tables.sql`
3. `20251029144323_add_assigned_agent_to_clients.sql`
4. `20251029145155_create_chat_messages_table.sql`
5. `20251029152621_create_products_table.sql`
6. `20251029154141_create_leads_table.sql`
7. `20251029155446_add_public_read_sellers.sql`
8. `20251101184701_add_insert_policy_clients.sql`
9. `20251101184737_fix_leads_insert_policy.sql`
10. `20251101185925_fix_leads_insert_policy_final.sql`
11. `20251101185951_fix_leads_rls_complete.sql`
12. `20251101190028_disable_rls_on_leads_temporarily.sql`
13. `20251101190256_change_leads_id_to_numeric.sql`
14. `20251101195439_create_statuses_table.sql`
15. `20251101195804_add_status_to_clients.sql`
16. `20251101200954_fix_statuses_rls_public_access.sql`
17. `20251101201405_fix_clients_rls_public_update.sql`
18. `20251101203116_convert_leads_id_to_uuid.sql`
19. `20251101203956_convert_clients_to_numeric_id.sql`
20. `20251101204321_convert_leads_back_to_numeric_id.sql`
21. `20251101210901_fix_leads_delete_policy.sql`
22. `20260119080510_add_client_fields.sql`
23. `20260119080635_add_lead_fields.sql`
24. `20260119082714_add_additional_client_fields.sql`
25. `20260119090559_remove_alpha_use_source.sql`
26. `20260119091749_add_client_password_to_leads.sql`
27. `20260119092509_add_client_password_to_clients.sql`
28. `20260119094426_add_client_account_created_to_leads.sql`
29. `20260120004636_add_admin_chat_support.sql`
30. `20260120010838_update_chat_messages_client_id_to_integer.sql`
31. `20260120113831_update_chat_rls_for_public_access.sql`
32. `20260120113902_update_chat_messages_sender_id_to_text.sql`
33. `20260120114727_add_sender_name_to_chat_messages.sql`
34. `20260120200417_create_documents_table_and_storage.sql`
35. `20260120201843_fix_documents_rls_for_anon_users.sql`
36. `20260120203259_add_delete_policies_documents.sql`
37. `20260120235851_fix_sellers_rls_for_anon_operations.sql`
38. `20260120235904_fix_admins_rls_for_anon_operations.sql`
39. `20260121002708_rename_commentaires_to_vendeur_in_clients.sql`
40. `20260121094427_create_admin_seller_messages.sql`
41. `20260121110645_create_diagnostic_admin_notes.sql`
42. `20260121111133_update_diagnostic_notes_add_item.sql`
43. `20260121112354_create_diagnostic_admin_notes.sql`
44. `20260121112407_update_diagnostic_notes_add_item.sql`
45. `20260121190030_fix_admins_remove_foreign_key.sql`
46. `20260121190042_fix_sellers_remove_foreign_key.sql`
47. `20260121191507_add_siret_to_sellers.sql`
48. `20260121194531_add_online_status_to_clients.sql`
49. `20260121194727_add_online_status_to_sellers.sql`
50. `20260122100200_create_argumentaire_table.sql`
51. `20260122145434_complete_database_setup_v2.sql`

**Méthode d'application:** Outil `mcp__supabase__apply_migration` via l'API Supabase Management

---

## SQL COMPLET DE CRÉATION DES 11 TABLES

### 1. TABLE STATUSES

```sql
-- Table des statuts personnalisables
CREATE TABLE IF NOT EXISTS statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#000000',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Activer RLS
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read statuses" ON statuses FOR SELECT USING (true);
CREATE POLICY "Public insert statuses" ON statuses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update statuses" ON statuses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete statuses" ON statuses FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX statuses_pkey ON statuses USING btree (id);
```

---

### 2. TABLE CLIENTS

```sql
-- Table principale des clients avec ID numérique auto-incrémenté
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
  ville text,
  code_postal text,
  pays text DEFAULT 'France',
  anniversaire date,
  autre_courriel text,
  date_affectation timestamptz,
  representant text,
  prevente text,
  retention text,
  sous_affilie text,
  langue text DEFAULT 'Français',
  conseiller text,
  source text,
  qualifiee boolean DEFAULT false,
  client_password text,
  client_account_created boolean DEFAULT false,
  is_online boolean DEFAULT false,
  last_connection timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Configurer l'ID de départ à 10000
SELECT setval('clients_id_seq', 10000, false);

-- Activer RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Public insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update clients" ON clients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete clients" ON clients FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX clients_pkey ON clients USING btree (id);
CREATE UNIQUE INDEX clients_email_key ON clients USING btree (email);
CREATE INDEX clients_email_idx ON clients USING btree (email);
CREATE INDEX clients_status_id_idx ON clients USING btree (status_id);
CREATE INDEX idx_clients_email ON clients USING btree (email);
CREATE INDEX idx_clients_status_id ON clients USING btree (status_id);
```

---

### 3. TABLE ADMINS

```sql
-- Table des administrateurs (sans référence à auth.users)
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

-- Activer RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Public insert admins" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update admins" ON admins FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete admins" ON admins FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX admins_pkey ON admins USING btree (id);
CREATE UNIQUE INDEX admins_email_key ON admins USING btree (email);
```

---

### 4. TABLE SELLERS

```sql
-- Table des vendeurs (sans référence à auth.users)
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  commission_rate numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  siret text UNIQUE,
  is_online boolean DEFAULT false,
  last_connection timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read sellers" ON sellers FOR SELECT USING (true);
CREATE POLICY "Public insert sellers" ON sellers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sellers" ON sellers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete sellers" ON sellers FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX sellers_pkey ON sellers USING btree (id);
CREATE UNIQUE INDEX sellers_email_key ON sellers USING btree (email);
CREATE UNIQUE INDEX sellers_siret_key ON sellers USING btree (siret);
```

---

### 5. TABLE LEADS

```sql
-- Table des prospects/leads avec ID numérique auto-incrémenté
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  company_name text,
  project_description text,
  status text DEFAULT 'nouveau',
  source text,
  notes text,
  assigned_to uuid,
  rendez_vous timestamptz,
  prenom text,
  nom text,
  portable text,
  activite text,
  siret text,
  commentaires text,
  status_id uuid,
  ville text,
  code_postal text,
  pays text,
  anniversaire date,
  autre_courriel text,
  date_affectation timestamptz,
  representant text,
  prevente text,
  retention text,
  sous_affilie text,
  langue text,
  conseiller text,
  qualifiee boolean,
  client_password text,
  client_account_created boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update leads" ON leads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete leads" ON leads FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX leads_pkey ON leads USING btree (id);
CREATE UNIQUE INDEX leads_email_key ON leads USING btree (email);
CREATE INDEX leads_email_idx ON leads USING btree (email);
CREATE INDEX leads_assigned_to_idx ON leads USING btree (assigned_to);
CREATE INDEX idx_leads_email ON leads USING btree (email);
CREATE INDEX idx_leads_status ON leads USING btree (status);
CREATE INDEX idx_leads_assigned_to ON leads USING btree (assigned_to);
```

---

### 6. TABLE CHAT_MESSAGES

```sql
-- Table de messagerie client-vendeur-admin
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

-- Activer RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read chat_messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public insert chat_messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update chat_messages" ON chat_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete chat_messages" ON chat_messages FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX chat_messages_pkey ON chat_messages USING btree (id);
CREATE INDEX idx_chat_messages_client_id ON chat_messages USING btree (client_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages USING btree (created_at);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages USING btree (sender_id);
```

---

### 7. TABLE ADMIN_SELLER_MESSAGES

```sql
-- Table de messagerie admin-vendeur
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

-- Activer RLS
ALTER TABLE admin_seller_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read admin_seller_messages" ON admin_seller_messages FOR SELECT USING (true);
CREATE POLICY "Public insert admin_seller_messages" ON admin_seller_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update admin_seller_messages" ON admin_seller_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete admin_seller_messages" ON admin_seller_messages FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX admin_seller_messages_pkey ON admin_seller_messages USING btree (id);
CREATE INDEX idx_admin_seller_messages_seller_id ON admin_seller_messages USING btree (seller_id);
CREATE INDEX idx_admin_seller_messages_created_at ON admin_seller_messages USING btree (created_at);
```

---

### 8. TABLE DOCUMENTS

```sql
-- Table de stockage des métadonnées de documents PDF
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id integer NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'DUERP',
  title text NOT NULL,
  file_path text NOT NULL,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public insert documents" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update documents" ON documents FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete documents" ON documents FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX documents_pkey ON documents USING btree (id);

-- Créer le bucket de stockage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage
CREATE POLICY "Public can view documents in storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Public can upload documents to storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');
```

---

### 9. TABLE DIAGNOSTIC_ADMIN_NOTES

```sql
-- Table des notes admin par catégorie et item de diagnostic
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

-- Activer RLS
ALTER TABLE diagnostic_admin_notes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read diagnostic_admin_notes" ON diagnostic_admin_notes FOR SELECT USING (true);
CREATE POLICY "Public insert diagnostic_admin_notes" ON diagnostic_admin_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update diagnostic_admin_notes" ON diagnostic_admin_notes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete diagnostic_admin_notes" ON diagnostic_admin_notes FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX diagnostic_admin_notes_pkey ON diagnostic_admin_notes USING btree (id);
CREATE UNIQUE INDEX diagnostic_admin_notes_client_id_category_item_key ON diagnostic_admin_notes USING btree (client_id, category, item);
CREATE INDEX idx_diagnostic_admin_notes_client_id ON diagnostic_admin_notes USING btree (client_id);
CREATE INDEX idx_diagnostic_admin_notes_category ON diagnostic_admin_notes USING btree (category);
CREATE INDEX idx_diagnostic_admin_notes_category_item ON diagnostic_admin_notes USING btree (category, item);
```

---

### 10. TABLE ARGUMENTAIRE

```sql
-- Table des arguments de vente pour les vendeurs
CREATE TABLE IF NOT EXISTS argumentaire (
  id SERIAL PRIMARY KEY,
  titre text NOT NULL,
  contenu text NOT NULL,
  categorie text NOT NULL DEFAULT 'Général',
  ordre integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE argumentaire ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read argumentaire" ON argumentaire FOR SELECT USING (true);
CREATE POLICY "Public insert argumentaire" ON argumentaire FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update argumentaire" ON argumentaire FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete argumentaire" ON argumentaire FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX argumentaire_pkey ON argumentaire USING btree (id);
```

---

### 11. TABLE PRODUCTS

```sql
-- Table des produits (catalogue)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete products" ON products FOR DELETE USING (true);

-- Index
CREATE UNIQUE INDEX products_pkey ON products USING btree (id);
```

---

## RÉSUMÉ DES CARACTÉRISTIQUES

### Types d'ID utilisés:
- **UUID**: admins, sellers, statuses, products, chat_messages, admin_seller_messages, documents, diagnostic_admin_notes
- **SERIAL (integer auto-incrémenté)**: clients (départ à 10000), leads, argumentaire

### Sécurité RLS:
- **Toutes les tables ont RLS activé**
- **Politiques publiques** (USING true) pour permettre l'accès sans authentification
- **Raison**: L'application utilise une authentification personnalisée, pas l'auth.users de Supabase

### Relations entre tables:
- `clients.status_id` → `statuses.id` (FK)
- `chat_messages.client_id` → `clients.id` (FK CASCADE)
- `documents.client_id` → `clients.id` (FK CASCADE)
- `diagnostic_admin_notes.client_id` → `clients.id` (FK CASCADE)

### Stockage:
- **Bucket**: `documents` (public)
- **Politiques**: Lecture et écriture publiques sur bucket `documents`

---

## COMMANDES POUR RECRÉER MANUELLEMENT

Si vous souhaitez recréer ces tables manuellement, exécutez les blocs SQL ci-dessus dans l'ordre suivant:

1. statuses (en premier car référencée par clients)
2. clients
3. admins
4. sellers
5. leads
6. chat_messages
7. admin_seller_messages
8. documents (+ bucket storage)
9. diagnostic_admin_notes
10. argumentaire
11. products

**Note**: Les tables existent déjà dans votre projet `zjsdmythkltkbhmocude`. Ce document sert de référence complète du schéma actuel.
