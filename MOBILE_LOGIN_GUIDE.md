# Guide de connexion mobile

## Fonctionnalités implémentées

Ce projet dispose maintenant d'un écran de connexion dédié pour l'application mobile (Capacitor Android), tout en conservant intacte la landing page marketing du site web.

## Comportement

### Sur l'application mobile (Capacitor)
- À l'ouverture de l'application, l'utilisateur voit directement l'écran de connexion mobile
- Si une session existe déjà, redirection automatique vers le dashboard approprié
- Design professionnel et épuré, optimisé pour mobile

### Sur le site web (navigateur)
- La landing page marketing reste inchangée sur `/`
- Aucune modification du design ou du comportement existant
- Expérience utilisateur web préservée à 100%

## Fonctionnement technique

### Détection de la plateforme
Le système utilise `Capacitor.isNativePlatform()` pour détecter si l'application tourne en mode mobile ou web.

### Routing intelligent
```typescript
if (isMobileApp) {
  // Logique mobile : affiche MobileLoginScreen
  if (sessionExiste) {
    redirection vers dashboard
  } else {
    afficher écran de connexion mobile
  }
} else {
  // Logique web : comportement classique (landing page)
  afficher LoginPage
}
```

### Authentification
L'écran de connexion mobile supporte :
- Connexion par **email** (admin, seller, client)
- Connexion par **SIRET** (seller uniquement)
- Vérification automatique dans les tables Supabase :
  - `admins`
  - `sellers`
  - `clients`

### Gestion de session
- Stockage dans `sessionStorage`
- Vérification au démarrage
- Redirection automatique vers le bon dashboard

## Fichiers modifiés

1. **`src/components/MobileLoginScreen.tsx`** (nouveau)
   - Écran de connexion dédié mobile
   - Design moderne avec logo
   - Formulaire SIRET/Email + mot de passe

2. **`src/App.tsx`**
   - Import de Capacitor et MobileLoginScreen
   - Ajout de la détection `isMobileApp`
   - Logique conditionnelle de routing

3. **`package.json`**
   - Ajout de `@capacitor/core`
   - Ajout de `@capacitor/app`

## Design mobile

L'écran de connexion mobile présente :
- Logo centré dans un cercle blanc
- En-tête bleu avec dégradé
- Formulaire épuré avec champs arrondis
- Bouton de connexion avec animation
- Messages d'erreur clairs
- Footer avec copyright

## Utilisation

### En développement web
```bash
npm run dev
```
Le site web fonctionne normalement avec la landing page.

### Pour l'application mobile
1. Builder le projet : `npm run build`
2. Synchroniser avec Capacitor
3. Ouvrir dans Android Studio
4. L'application affichera automatiquement l'écran de connexion mobile

## Notes importantes

- Le site web n'est **pas affecté** par ces modifications
- La landing page reste strictement identique
- Aucun changement visuel ou comportemental en mode navigateur
- L'authentification utilise les mêmes tables Supabase
- Compatible avec tous les types d'utilisateurs (admin, seller, client)
