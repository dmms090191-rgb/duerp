# Technologies et Langages Utilisés

## 📋 Vue d'ensemble du projet
Ce projet est une application CRM complète pour la gestion de leads, clients, vendeurs et administrateurs avec système de chat en temps réel.

---

## 🔧 Langages de Programmation

### 1. **TypeScript** (Principal)
- **Utilisation:** 95% du code frontend
- **Fichiers:** Tous les `.ts` et `.tsx`
- **Exemples:**
  - `src/App.tsx` - Application principale
  - `src/components/*.tsx` - Tous les composants React
  - `src/services/*.ts` - Services métier
  - `src/types/*.ts` - Définitions de types

### 2. **JavaScript**
- **Utilisation:** Configuration et scripts
- **Fichiers:**
  - `vite.config.ts`
  - `eslint.config.js`
  - `tailwind.config.js`
  - `postcss.config.js`

### 3. **SQL (PostgreSQL)**
- **Utilisation:** Base de données et migrations
- **Fichiers:** `supabase/migrations/*.sql`
- **Exemples:**
  - Création de tables (clients, sellers, admins, leads)
  - Politiques RLS (Row Level Security)
  - Triggers et fonctions

### 4. **CSS**
- **Utilisation:** Styles via Tailwind CSS
- **Fichiers:**
  - `src/index.css` - Styles globaux
  - Tailwind classes dans tous les composants `.tsx`

### 5. **HTML**
- **Utilisation:** Structure JSX/TSX dans React
- **Fichiers:** Intégré dans tous les fichiers `.tsx`

---

## 🛠️ Frameworks et Bibliothèques

### Frontend

#### **React 18.3.1**
- Framework JavaScript pour l'interface utilisateur
- Hooks: useState, useEffect, useCallback
- Composants fonctionnels

#### **React Router DOM 7.9.4**
- Navigation entre pages
- Routes protégées
- Gestion de l'historique

#### **Vite 5.4.2**
- Build tool ultra-rapide
- Hot Module Replacement (HMR)
- Optimisation de production

#### **Tailwind CSS 3.4.1**
- Framework CSS utility-first
- Design responsive
- Classes personnalisées

### Backend / Database

#### **Supabase**
- Backend-as-a-Service (BaaS)
- Base de données PostgreSQL
- Authentication
- Real-time subscriptions
- Row Level Security (RLS)
- Edge Functions (Deno)

#### **@supabase/supabase-js 2.77.0**
- Client JavaScript pour Supabase
- Gestion des requêtes
- Subscriptions en temps réel

### Bibliothèques Utilitaires

#### **Lucide React 0.344.0**
- Icônes SVG modernes
- +1000 icônes disponibles
- Utilisé dans toute l'interface

#### **jsPDF 2.5.2**
- Génération de PDF côté client
- Rapports et exports

---

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
project/
├── src/
│   ├── components/      # Composants React (TypeScript)
│   ├── pages/          # Pages de l'application (TypeScript)
│   ├── services/       # Services métier (TypeScript)
│   ├── types/          # Types TypeScript
│   ├── lib/            # Configuration Supabase (TypeScript)
│   ├── App.tsx         # Application principale (TypeScript)
│   └── main.tsx        # Point d'entrée (TypeScript)
├── supabase/
│   ├── migrations/     # Migrations SQL (PostgreSQL)
│   └── functions/      # Edge Functions (TypeScript/Deno)
├── public/             # Assets statiques
└── Configuration files # JS/TS
```

---

## 📦 Composants Principaux (TypeScript/React)

### Dashboards
- `Dashboard.tsx` - Panel administrateur
- `SellerDashboard.tsx` - Panel vendeur
- `ClientDashboard.tsx` - Panel client

### Gestion
- `LeadManager.tsx` - Gestion des leads
- `SellerManager.tsx` - Gestion des vendeurs
- `AdminManager.tsx` - Gestion des admins
- `StatusManager.tsx` - Gestion des statuts
- `Argumentaire.tsx` - Arguments de vente

### Communication
- `ChatWindow.tsx` - Fenêtre de chat
- `AdminChatViewer.tsx` - Chat admin-client
- `SellerChatViewer.tsx` - Chat admin-vendeur
- `SellerChatList.tsx` - Liste des chats vendeur
- `SellerWorkChat.tsx` - Chat interne vendeur

### Autres
- `LoginPage.tsx` - Page de connexion
- `RegistrationForm.tsx` - Formulaire d'inscription
- `BulkImport.tsx` - Import en masse
- `BackupRestore.tsx` - Sauvegarde/restauration

---

## 🗄️ Base de Données (SQL/PostgreSQL)

### Tables Principales
1. **clients** - Informations clients
2. **sellers** - Informations vendeurs
3. **admins** - Informations administrateurs
4. **leads** - Leads non transférés
5. **chat_messages** - Messages entre clients/vendeurs
6. **admin_seller_messages** - Messages admin-vendeur
7. **statuses** - Statuts des clients
8. **documents** - Documents uploadés
9. **diagnostic_admin_notes** - Notes de diagnostic
10. **argumentaire** - Arguments de vente

### Sécurité (Row Level Security)
- Politiques RLS sur toutes les tables
- Accès contrôlé par authentification
- Lecture publique pour certaines tables

---

## 🚀 Edge Functions (TypeScript/Deno)

### Functions Déployées
1. **create-client** - Création de compte client
2. **create-seller** - Création de compte vendeur
3. **update-seller-password** - Mise à jour mot de passe vendeur

### Runtime
- **Deno** - Runtime JavaScript/TypeScript sécurisé
- API Web standards
- Import de modules npm via `npm:`

---

## 🎨 Design et UI

### Tailwind CSS
- Utility-first CSS framework
- Design system cohérent
- Responsive design

### Couleurs Principales
- Bleu: Éléments UI généraux
- Vert: Vendeurs
- Rouge/Orange: Administrateurs
- Gris: Fond et éléments neutres

### Icônes
- **Lucide React** - Bibliothèque d'icônes modernes

---

## 🔐 Authentification et Sécurité

### Système d'Authentification
- Login par email/mot de passe
- Rôles: Admin, Seller, Client
- Sessions sécurisées

### Sécurité Base de Données
- Row Level Security (RLS)
- Politiques d'accès granulaires
- Validation des données

---

## 📱 Fonctionnalités Principales

### Pour Admins
1. Gestion complète des leads/clients
2. Gestion des vendeurs et admins
3. Chat avec clients et vendeurs
4. Import en masse
5. Gestion des statuts
6. Argumentaire de vente
7. Suivi des connexions

### Pour Vendeurs
1. Vue de leurs clients assignés
2. Chat avec clients
3. Chat interne avec admins
4. Argumentaire de vente
5. Gestion des rendez-vous

### Pour Clients
1. Consultation de leur dossier
2. Chat avec leur vendeur assigné
3. Vue des documents
4. Suivi du statut

---

## 📊 Statistiques du Projet

### Lignes de Code (approximatif)
- **TypeScript/TSX:** ~15,000 lignes
- **SQL:** ~2,000 lignes
- **CSS:** ~500 lignes (+ Tailwind)
- **JavaScript Config:** ~200 lignes

### Fichiers
- **Composants React:** 30+ fichiers
- **Services:** 8 fichiers
- **Types:** 6 fichiers
- **Migrations SQL:** 50+ fichiers
- **Edge Functions:** 3 fichiers

---

## 🔄 Temps Réel (Real-time)

### Supabase Realtime
- Subscriptions aux changements de base de données
- Chat en temps réel
- Statut en ligne/hors ligne
- Notifications instantanées

---

## 📋 Outils de Développement

### Build & Dev Tools
- **Vite** - Build tool
- **ESLint** - Linting JavaScript/TypeScript
- **PostCSS** - Traitement CSS
- **Autoprefixer** - Préfixes CSS automatiques

### TypeScript
- **Version:** 5.5.3
- Configuration stricte
- Types pour toutes les données

---

## 🌐 Déploiement

### Production
- Build optimisé avec Vite
- Code splitting automatique
- Compression gzip
- Assets optimisés

### Base de Données
- Supabase (cloud PostgreSQL)
- Backups automatiques
- Scalabilité automatique

---

## 📝 Résumé

Ce projet utilise une **stack moderne TypeScript/React** avec:
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Build:** Vite
- **Real-time:** Supabase Subscriptions
- **Sécurité:** Row Level Security + Authentication

**Langages principaux:**
1. TypeScript (90%)
2. SQL (8%)
3. CSS/JavaScript (2%)

**Total:** ~17,000+ lignes de code réparties sur 100+ fichiers
