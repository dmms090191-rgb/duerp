/*
  # BACKUP COMPLET DES DONNÉES

  Date de création: 2026-01-22

  Ce fichier contient toutes les données de votre base de données au format INSERT.
  Il peut être utilisé pour restaurer complètement vos données sur un nouveau projet Supabase.

  Tables incluses:
  - clients (10 enregistrements)
  - admins (1 enregistrement)
  - sellers (1 enregistrement)
  - statuses (3 enregistrements)
  - leads (0 enregistrement)
  - chat_messages (0 enregistrement)
  - documents (0 enregistrement)
  - products (0 enregistrement)
  - argumentaire (0 enregistrement)
  - diagnostic_admin_notes (0 enregistrement)
  - admin_seller_messages (0 enregistrement)

  IMPORTANT: Avant d'exécuter ce fichier:
  1. Assurez-vous que toutes les migrations ont été appliquées
  2. Les tables doivent exister avec la structure correcte
  3. Exécutez ce fichier dans l'ordre (les contraintes de clés étrangères sont respectées)
*/

-- ============================================================================
-- TABLE: statuses
-- ============================================================================

INSERT INTO statuses (id, name, color, created_at, created_by) VALUES
('82092976-b5eb-41dc-9a34-16cfe60792f0', 'mail relance', '#7df73b', '2026-01-20 01:02:00.185887+00', NULL),
('895069fe-1c3a-4e32-abe6-2e0e1ee7e2cb', 'nrp2', '#3B82F6', '2025-11-01 20:51:29.940444+00', NULL),
('e974ce37-ffad-42e3-a56d-f5ab72be0963', 'nrp', '#069845', '2025-11-01 20:11:35.715551+00', NULL);

-- ============================================================================
-- TABLE: admins
-- ============================================================================

INSERT INTO admins (id, email, full_name, phone, role, status, created_at, updated_at) VALUES
('af2ee8e4-d7ce-4516-978c-adfd3002c607', 'a.m@gmail.com', 'marc amoyal', NULL, 'admin', 'active', '2026-01-20 10:52:01.714814+00', '2026-01-20 10:52:01.714814+00');

-- ============================================================================
-- TABLE: sellers
-- ============================================================================

INSERT INTO sellers (id, email, full_name, phone, commission_rate, status, created_at, updated_at, siret, is_online, last_connection) VALUES
('20a57e1d-f262-4b3a-8c4d-ca53245550c0', 'm.amouyal@gmail.com', 'amouyal marc', NULL, '0', 'active', '2026-01-20 23:57:11.338418+00', '2026-01-20 23:57:11.338418+00', NULL, false, NULL);

-- ============================================================================
-- TABLE: clients
-- ============================================================================

INSERT INTO clients (id, email, full_name, company_name, phone, address, project_description, status, status_id, assigned_agent_name, created_at, updated_at, rendez_vous, prenom, nom, portable, activite, siret, vendeur, ville, code_postal, pays, anniversaire, autre_courriel, date_affectation, representant, prevente, retention, sous_affilie, langue, conseiller, source, qualifiee, client_password, client_account_created, is_online, last_connection) VALUES
(10000, 'courrier15.09.25@117', 'Julien ROUGE-GALLES', 'JLJC', '0988333144', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:42.080774+00', '2026-01-22 09:34:42.080774+00', NULL, 'Julien', 'ROUGE-GALLES', '', 'Garage', '85342031300019', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '484639', false, false, NULL),
(10001, 'johann.garage.auto@gmail.com', 'JOHANN IBANEZ', 'CYCLES IBANEZ', '0987540589', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:42.742356+00', '2026-01-22 09:34:42.742356+00', NULL, 'JOHANN', 'IBANEZ', '', 'Garage', '84178339200019', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '176195', false, false, NULL),
(10002, 'courrier15.09.25@111', 'Raphaël JANKOWIAK', 'JOHANN AUTOMOBILES', '0987136700', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:43.44084+00', '2026-01-22 09:34:43.44084+00', NULL, 'Raphaël', 'JANKOWIAK', '', 'Garage', '83862642200011', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '733045', false, false, NULL),
(10003, 'contact@bourzeau.com', 'Nicolas BOUGEOT', 'MODIFICATION DES MOTOS', '0987027100', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:44.091791+00', '2026-01-22 09:34:44.091791+00', NULL, 'Nicolas', 'BOUGEOT', '', 'Garage', '79871168500049', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '804596', false, false, NULL),
(10004, 'wrapfunexpress@gmail.com', 'Cédrik OZOUF', 'CARROSSERIE BOURZEAU', '0987002378', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:44.731297+00', '2026-01-22 09:34:44.731297+00', NULL, 'Cédrik', 'OZOUF', '', 'Garage', '83823998600022', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '866943', false, false, NULL),
(10005, 'courrier15.09.25@106', 'Lionel KETFA', 'WRAPFUNEXPRESS', '0986735104', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:45.371003+00', '2026-01-22 09:34:45.371003+00', NULL, 'Lionel', 'KETFA', '', 'Garage', '90294182200014', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '202897', false, false, NULL),
(10006, 'premiumwagen33@gmail.com', 'Julien AMPOURNALES', 'KL AUTO', '0986399153', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:46.013742+00', '2026-01-22 09:34:46.013742+00', NULL, 'Julien', 'AMPOURNALES', '', 'Garage', '83228945800016', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '580443', false, false, NULL),
(10007, 'courrier15.09.25@102', 'David FORESTIER', 'PREMIUM WAG', '0986387508', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:46.660625+00', '2026-01-22 09:34:46.660625+00', NULL, 'David', 'FORESTIER', '', 'Garage', '81485776900016', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '192969', false, false, NULL),
(10008, 'bikezone86@free.fr', 'Félix Wetzel', 'FOREST''CAR', '0986269093', NULL, NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:47.305816+00', '2026-01-22 09:34:47.305816+00', NULL, 'Félix', 'Wetzel', '', 'Garage', '84870559600015', NULL, NULL, NULL, 'France', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Français', '', '', false, '914473', false, false, NULL),
(10009, 'lou@gmail.com', 'Serge ALMEIDA', 'loulou2', '0984388326', '', NULL, 'nouveau', NULL, NULL, '2026-01-22 09:34:47.938365+00', '2026-01-22 09:34:47.938365+00', NULL, 'Serge', 'ALMEIDA', '0659595959', 'Garage', '84870559600026', 'amouyal marc', '', '', 'France', NULL, '', NULL, '', '', '', '', 'Français', '', '', false, '000000', false, false, '2026-01-22 09:52:46.764+00');

-- ============================================================================
-- TABLE: leads (vide)
-- ============================================================================
-- Aucune donnée à restaurer

-- ============================================================================
-- TABLE: chat_messages (vide)
-- ============================================================================
-- Aucune donnée à restaurer

-- ============================================================================
-- TABLE: documents (vide)
-- ============================================================================
-- Aucune donnée à restaurer

-- ============================================================================
-- TABLE: products (vide)
-- ============================================================================
-- Aucune donnée à restaurer

-- ============================================================================
-- TABLE: argumentaire (vide)
-- ============================================================================
-- Aucune donnée à restaurer

-- ============================================================================
-- TABLE: diagnostic_admin_notes (vide)
-- ============================================================================
-- Aucune donnée à restaurer

-- ============================================================================
-- TABLE: admin_seller_messages (vide)
-- ============================================================================
-- Aucune donnée à restaurer

-- ============================================================================
-- FIN DU BACKUP
-- ============================================================================

/*
  RÉSUMÉ DU BACKUP:
  - 10 clients
  - 1 admin
  - 1 seller (commercial)
  - 3 statuses
  - 0 leads
  - 0 messages de chat
  - 0 documents
  - 0 produits
  - 0 argumentaires
  - 0 notes de diagnostic
  - 0 messages admin-seller

  Total: 15 enregistrements
*/
