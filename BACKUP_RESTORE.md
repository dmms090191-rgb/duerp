# 📦 GUIDE COMPLET DE RESTAURATION

Date de création du backup: **2026-01-22**

Ce guide vous permet de restaurer COMPLÈTEMENT votre application (structure + données) sur un nouveau projet Supabase ou un nouveau serveur.

---

## 📊 CONTENU DU BACKUP

### Données sauvegardées:
- ✅ **10 clients** avec toutes leurs informations
- ✅ **1 administrateur** (a.m@gmail.com)
- ✅ **1 commercial** (m.amouyal@gmail.com)
- ✅ **3 statuts** personnalisés
- ✅ Structure complète de la base de données (migrations)
- ✅ Configuration des Edge Functions
- ✅ Tous les fichiers de code source

### Total: **15 enregistrements de données**

---

## 🚀 ÉTAPE 1: CRÉER UN NOUVEAU PROJET SUPABASE

### 1.1 Créer le projet
1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Choisissez:
   - **Organization**: Votre organisation
   - **Project name**: Nom de votre choix (ex: "duerp-production")
   - **Database Password**: Notez-le précieusement!
   - **Region**: Choisissez la région la plus proche de vos utilisateurs
4. Cliquez sur "Create new project"
5. Attendez ~2 minutes que le projet soit prêt

### 1.2 Récupérer les clés API
1. Dans votre nouveau projet, allez dans **Settings** → **API**
2. Notez ces 3 informations:
   - `Project URL` (ex: https://xxxxx.supabase.co)
   - `anon public` key
   - `service_role` key (gardez-la secrète!)

---

## 🔧 ÉTAPE 2: CONFIGURER LE PROJET LOCAL

### 2.1 Mettre à jour le fichier .env

Ouvrez le fichier `.env` à la racine du projet et remplacez par vos nouvelles valeurs:

```env
VITE_SUPABASE_URL=https://VOTRE-NOUVEAU-PROJECT-URL.supabase.co
VITE_SUPABASE_ANON_KEY=votre-nouvelle-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-nouvelle-service-role-key
```

### 2.2 Installer les dépendances (si pas déjà fait)

```bash
npm install
```

---

## 🗄️ ÉTAPE 3: RESTAURER LA STRUCTURE (MIGRATIONS)

### Option A: Via l'interface Supabase (RECOMMANDÉ)

1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Pour chaque fichier dans `supabase/migrations/`, **dans l'ordre chronologique**:
   - Ouvrez le fichier
   - Copiez tout son contenu
   - Collez dans l'éditeur SQL
   - Cliquez sur **Run**
   - Attendez le message de succès

**Liste des migrations à exécuter dans l'ordre:**

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

### Option B: Via un seul fichier SQL consolidé

Si vous préférez, vous pouvez créer un fichier qui combine toutes les migrations:

1. Ouvrez le fichier `INSTALLATION.sql` (à la racine du projet)
2. Copiez tout son contenu
3. Dans Supabase → **SQL Editor**
4. Collez et cliquez sur **Run**

---

## 📥 ÉTAPE 4: RESTAURER LES DONNÉES

### 4.1 Importer les données

1. Dans Supabase, allez dans **SQL Editor**
2. Ouvrez le fichier `BACKUP_DATA.sql`
3. Copiez TOUT son contenu
4. Collez dans l'éditeur SQL de Supabase
5. Cliquez sur **Run**
6. Vérifiez qu'il n'y a pas d'erreurs

### 4.2 Vérifier l'import

Pour vérifier que tout a été importé correctement:

```sql
-- Vérifier le nombre d'enregistrements
SELECT 'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'admins', COUNT(*) FROM admins
UNION ALL
SELECT 'sellers', COUNT(*) FROM sellers
UNION ALL
SELECT 'statuses', COUNT(*) FROM statuses
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'argumentaire', COUNT(*) FROM argumentaire
UNION ALL
SELECT 'diagnostic_admin_notes', COUNT(*) FROM diagnostic_admin_notes
UNION ALL
SELECT 'admin_seller_messages', COUNT(*) FROM admin_seller_messages;
```

**Résultats attendus:**
- clients: **10**
- admins: **1**
- sellers: **1**
- statuses: **3**
- Toutes les autres tables: **0**

---

## ⚡ ÉTAPE 5: DÉPLOYER LES EDGE FUNCTIONS

Vous avez 3 Edge Functions à redéployer:

### 5.1 create-client

Cette fonction crée des comptes clients.

**Fichier**: `supabase/functions/create-client/index.ts`

### 5.2 create-seller

Cette fonction crée des comptes commerciaux.

**Fichier**: `supabase/functions/create-seller/index.ts`

### 5.3 update-seller-password

Cette fonction met à jour les mots de passe des commerciaux.

**Fichier**: `supabase/functions/update-seller-password/index.ts`

### Déploiement automatique

Si vous utilisez cette application via Bolt.new ou un environnement similaire, les fonctions seront redéployées automatiquement quand vous les modifierez ou via l'outil de déploiement intégré.

---

## 🧪 ÉTAPE 6: TESTER LA RESTAURATION

### 6.1 Tester la connexion

```bash
npm run dev
```

### 6.2 Tester les comptes

1. **Test Admin:**
   - Email: `a.m@gmail.com`
   - Le mot de passe est celui défini dans votre système

2. **Test Commercial:**
   - Email: `m.amouyal@gmail.com`
   - Le mot de passe est celui défini dans votre système

3. **Test Client:**
   - Email: `lou@gmail.com`
   - Mot de passe: `000000`

### 6.3 Vérifier les fonctionnalités

- ✅ Connexion admin fonctionne
- ✅ Connexion commercial fonctionne
- ✅ Connexion client fonctionne
- ✅ Liste des clients s'affiche
- ✅ Création de nouveaux clients
- ✅ Chat fonctionne
- ✅ Import de fichiers fonctionne

---

## 🔐 ÉTAPE 7: CONFIGURER LES MOTS DE PASSE (IMPORTANT!)

⚠️ **ATTENTION**: Les mots de passe ne sont PAS stockés dans la base de données pour des raisons de sécurité!

Vous devez recréer les mots de passe pour:

### 7.1 Administrateur (a.m@gmail.com)

Dans Supabase → **SQL Editor**, exécutez:

```sql
-- Créer le compte auth pour l'admin
-- Remplacez 'NOUVEAU_MOT_DE_PASSE' par votre mot de passe
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'af2ee8e4-d7ce-4516-978c-adfd3002c607',
  'a.m@gmail.com',
  crypt('NOUVEAU_MOT_DE_PASSE', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

### 7.2 Commercial (m.amouyal@gmail.com)

```sql
-- Créer le compte auth pour le commercial
-- Remplacez 'NOUVEAU_MOT_DE_PASSE' par votre mot de passe
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '20a57e1d-f262-4b3a-8c4d-ca53245550c0',
  'm.amouyal@gmail.com',
  crypt('NOUVEAU_MOT_DE_PASSE', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

### 7.3 Clients

Les clients utilisent des mots de passe stockés dans la table `clients` (champ `client_password`).
Ces mots de passe ont été restaurés automatiquement avec les données.

---

## 📝 ÉTAPE 8: CONFIGURATION DU STOCKAGE (STORAGE)

Pour que l'upload de documents fonctionne:

1. Dans Supabase → **Storage**
2. Créez un bucket nommé: `documents`
3. Configurez les permissions:
   - Public: **OUI**
   - Allowed MIME types: `application/pdf`, `image/*`, `application/msword`, etc.

Ou exécutez ce SQL:

```sql
-- Créer le bucket de stockage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Ajouter les policies d'accès
CREATE POLICY "Public can upload documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

CREATE POLICY "Public can delete documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'documents');
```

---

## ✅ CHECKLIST FINALE

Avant de mettre en production, vérifiez:

- [ ] Toutes les migrations ont été exécutées sans erreur
- [ ] Les données sont bien importées (10 clients, 1 admin, 1 seller, 3 statuses)
- [ ] Le fichier `.env` contient les bonnes clés API
- [ ] Les Edge Functions sont déployées
- [ ] Le bucket `documents` est créé et configuré
- [ ] Les mots de passe admin et seller sont configurés
- [ ] La connexion admin fonctionne
- [ ] La connexion commercial fonctionne
- [ ] La connexion client fonctionne
- [ ] L'application se lance avec `npm run dev`
- [ ] Les clients s'affichent dans le dashboard
- [ ] Le chat fonctionne
- [ ] L'upload de documents fonctionne

---

## 🆘 DÉPANNAGE

### Problème: "relation does not exist"
➡️ **Solution**: Vous avez oublié d'exécuter certaines migrations. Reprenez l'étape 3.

### Problème: "duplicate key value violates unique constraint"
➡️ **Solution**: Les données ont déjà été importées. Supprimez les données existantes ou créez un nouveau projet.

### Problème: "permission denied"
➡️ **Solution**: Vérifiez que toutes les RLS policies ont été créées (elles sont dans les migrations).

### Problème: "Cannot connect to Supabase"
➡️ **Solution**: Vérifiez votre fichier `.env` et que les clés API sont correctes.

### Problème: Edge Functions ne fonctionnent pas
➡️ **Solution**: Redéployez les Edge Functions manuellement.

---

## 📞 SUPPORT

Si vous rencontrez des difficultés:

1. Vérifiez les logs dans Supabase → **Logs**
2. Consultez la documentation: [https://supabase.com/docs](https://supabase.com/docs)
3. Vérifiez que toutes les étapes ont été suivies dans l'ordre

---

## 🎉 C'EST TERMINÉ!

Votre application est maintenant complètement restaurée avec:
- ✅ Structure de base de données complète
- ✅ Toutes les données sauvegardées
- ✅ Tous les comptes utilisateurs
- ✅ Configuration de sécurité (RLS)
- ✅ Edge Functions
- ✅ Stockage de documents

**Votre application est prête à l'emploi!** 🚀
