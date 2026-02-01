# Système de Suivi de Connexion en Ligne

## Fonctionnalités implémentées

Le système de suivi de connexion permet de détecter et d'afficher en temps réel quels utilisateurs (clients, vendeurs, admins) sont actuellement connectés à l'application.

## ⚠️ Corrections importantes (27 janvier 2026)

### Problème résolu : Affichage incorrect du statut "En ligne"

**Symptôme** : Tous les utilisateurs apparaissaient "En ligne" même quand ils n'étaient pas connectés.

**Cause** : Absence de vérification temporelle sur la dernière connexion et affichages statiques.

**Solutions appliquées** :

1. **Validation temporelle stricte** : Un utilisateur est considéré en ligne UNIQUEMENT si :
   - `is_online = true` ET
   - `last_connection` date de moins de 2 minutes

2. **Nettoyage automatique dans UsersMonitor** :
   - Toutes les 5 secondes, le système met automatiquement `is_online = false` pour les connexions obsolètes
   - Vérifie et nettoie les trois tables (clients, sellers, admins)

3. **Badge dynamique dans ClientDashboard** :
   - Le badge "En ligne" / "Hors ligne" du vendeur est maintenant dynamique
   - Se met à jour toutes les 5 secondes en temps réel
   - Affiche "Hors ligne" (gris) si le vendeur n'est pas connecté depuis plus de 2 minutes

4. **Requête de nettoyage initial** :
   - Au démarrage, une requête nettoie immédiatement tous les statuts obsolètes

## ⚡ Optimisation de vitesse (27 janvier 2026 - soir)

**Amélioration** : Réduction drastique du délai de mise à jour pour une expérience temps réel.

**Changements appliqués** :

1. **Heartbeat client ultra-rapide** :
   - Anciennement : mise à jour toutes les 5 secondes
   - Maintenant : mise à jour toutes les **5 secondes**
   - Impact : Le statut en ligne est mis à jour 6x plus vite

2. **Rafraîchissement interface accéléré** :
   - UsersMonitor : mise à jour toutes les **5 secondes** (au lieu de 15)
   - ClientDashboard badge vendeur : mise à jour toutes les **5 secondes** (au lieu de 30)

3. **Résultat** :
   - Délai maximum pour voir un utilisateur en ligne : **~5 secondes** (au lieu de 13-5 secondes)
   - Expérience quasi temps réel
   - Détection de déconnexion plus rapide

## Comment ça fonctionne

### 1. Colonnes de base de données

Les tables suivantes disposent des colonnes de suivi :
- **`clients`** : `is_online` (boolean), `last_connection` (timestamp)
- **`sellers`** : `is_online` (boolean), `last_connection` (timestamp)
- **`admins`** : `is_online` (boolean), `last_connection` (timestamp)

### 2. Mise à jour automatique du statut

#### À la connexion
Lorsqu'un utilisateur se connecte (via web ou mobile) :
- La colonne `is_online` est mise à `true`
- La colonne `last_connection` est mise à jour avec l'horodatage actuel

#### Pendant la session
- Un **heartbeat** (battement de cœur) est envoyé toutes les 5 secondes pour maintenir le statut en ligne
- Le système détecte automatiquement si l'utilisateur change d'onglet ou met l'application en arrière-plan

#### À la déconnexion
Lorsqu'un utilisateur se déconnecte :
- La colonne `is_online` est mise à `false`
- La colonne `last_connection` est mise à jour

### 3. Hook personnalisé : useOnlineStatus

Un hook React personnalisé (`src/hooks/useOnlineStatus.ts`) gère automatiquement :
- La mise à jour initiale du statut à la connexion
- Le heartbeat toutes les 5 secondes
- La détection de fermeture de fenêtre/onglet
- La détection de changement de visibilité (background/foreground)
- Le nettoyage automatique à la déconnexion

## Fichiers modifiés

### 1. **`src/hooks/useOnlineStatus.ts`** (nouveau)
Hook personnalisé pour gérer le statut en ligne automatiquement.

### 2. **`src/components/MobileLoginScreen.tsx`**
- Ajout de la mise à jour du statut `is_online` et `last_connection` lors de la connexion mobile
- Supporte admin, seller et client

### 3. **`src/components/ClientDashboard.tsx`**
- Utilisation du hook `useOnlineStatus` pour maintenir le client en ligne

### 4. **`src/components/SellerDashboard.tsx`**
- Utilisation du hook `useOnlineStatus` pour maintenir le vendeur en ligne

### 5. **`src/components/Dashboard.tsx`**
- Utilisation du hook `useOnlineStatus` pour maintenir l'admin en ligne

### 6. **`src/App.tsx`**
- Mise à jour des fonctions de connexion (`handleLogin`) pour mettre à jour le statut dans Supabase
- Mise à jour des fonctions de déconnexion (`handleLogout`, `handleClientLogout`, `handleSellerLogout`) pour mettre le statut hors ligne

## Utilisation pour l'affichage

Pour afficher les utilisateurs en ligne dans votre interface :

```typescript
// Exemple : Récupérer tous les vendeurs en ligne
const { data: sellersOnline } = await supabase
  .from('sellers')
  .select('*')
  .eq('is_online', true);

// Exemple : Récupérer tous les clients en ligne
const { data: clientsOnline } = await supabase
  .from('clients')
  .select('*')
  .eq('is_online', true);

// Exemple : Récupérer tous les admins en ligne
const { data: adminsOnline } = await supabase
  .from('admins')
  .select('*')
  .eq('is_online', true);
```

## Temps réel (optionnel)

Pour afficher les changements de statut en temps réel sans recharger, vous pouvez utiliser les subscriptions Supabase :

```typescript
const subscription = supabase
  .channel('online-users')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'sellers',
      filter: 'is_online=eq.true'
    },
    (payload) => {
      console.log('Vendeur en ligne:', payload.new);
    }
  )
  .subscribe();
```

## Avantages

1. **Automatique** : Le système gère tout automatiquement, aucune action manuelle requise
2. **Fiable** : Détecte la fermeture de fenêtre, changement d'onglet, déconnexion
3. **Temps réel** : Mise à jour toutes les 5 secondes
4. **Universel** : Fonctionne sur web et mobile
5. **Simple** : Un seul hook à utiliser dans les composants dashboard

## Notes techniques

- Le heartbeat de 5 secondes offre une expérience quasi temps réel (6x plus rapide qu'avant)
- Le système utilise `navigator.sendBeacon` pour envoyer les dernières mises à jour même si la fenêtre se ferme
- Les événements `beforeunload` et `visibilitychange` sont gérés pour une détection optimale
- Compatible avec Capacitor pour l'application mobile
- Impact serveur : ~12 requêtes/minute par utilisateur connecté (optimisé pour Supabase)

## Vérification du statut

Pour vérifier si le système fonctionne :

1. Connectez-vous avec un compte
2. Vérifiez dans la base de données Supabase :
   ```sql
   SELECT email, is_online, last_connection
   FROM clients
   WHERE email = 'votre-email@exemple.com';
   ```
3. Le champ `is_online` devrait être `true`
4. `last_connection` devrait se mettre à jour toutes les 5 secondes
5. Déconnectez-vous et vérifiez que `is_online` passe à `false`
