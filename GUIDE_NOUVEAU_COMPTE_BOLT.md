# 🚀 GUIDE: RESTAURER SUR UN NOUVEAU COMPTE BOLT

## 📋 CE QU'IL VOUS FAUT AVANT DE COMMENCER

Assurez-vous d'avoir téléchargé et sauvegardé:
- ✅ **BACKUP_DATA.sql** (vos données)
- ✅ **BACKUP_RESTORE.md** (guide détaillé)
- ✅ **INSTALLATION.sql** (structure complète)
- ✅ **Fichier .env** (vos anciennes clés - pour référence)
- ✅ **Dossier supabase/** (migrations + fonctions)
- ✅ **Dossier src/** (tout le code source)
- ✅ **package.json**

---

## 🎯 ÉTAPE PAR ÉTAPE: RESTAURATION SUR NOUVEAU COMPTE BOLT

### 1️⃣ CRÉER UN NOUVEAU PROJET BOLT
- Allez sur bolt.new
- Créez un nouveau compte ou connectez-vous
- Cliquez sur "New Project"
- Choisissez "Start from scratch" ou "Blank React + Vite"

### 2️⃣ UPLOADER VOS FICHIERS

**Option A: Upload ZIP complet**
- Si vous avez téléchargé le ZIP complet du projet
- Cherchez l'option "Upload" ou "Import Project"
- Uploadez le fichier ZIP
- Bolt va dézipper et restaurer tous les fichiers

**Option B: Upload fichiers individuels**
Si pas de ZIP, uploadez fichier par fichier:
```
1. Commencez par package.json
2. Puis dossier src/ complet
3. Puis dossier supabase/ complet
4. Puis les fichiers de config (vite.config.ts, tailwind.config.js, etc.)
5. Ne pas uploader le .env encore (on va le recréer)
```

### 3️⃣ CRÉER UNE NOUVELLE BASE SUPABASE

**C'est OBLIGATOIRE car l'ancienne base reste sur votre ancien projet!**

Dans votre nouveau projet Bolt:

1. **Demandez à l'assistant:**
   ```
   "Crée-moi une nouvelle base de données Supabase"
   ```

2. **Bolt va:**
   - Créer un nouveau projet Supabase
   - Générer de nouvelles clés API
   - Créer un nouveau fichier .env avec les nouvelles clés

3. **Notez vos nouvelles clés:**
   - SUPABASE_URL (nouvelle)
   - SUPABASE_ANON_KEY (nouvelle)
   - SUPABASE_SERVICE_ROLE_KEY (nouvelle)

### 4️⃣ RESTAURER LA STRUCTURE DE LA BASE

Maintenant que vous avez une nouvelle base Supabase vide, il faut recréer la structure:

**Donnez le fichier INSTALLATION.sql à l'assistant:**
```
"J'ai un fichier INSTALLATION.sql qui contient toute la structure de ma base.
Peux-tu l'exécuter dans la nouvelle base Supabase?"
```

L'assistant va:
- Lire le fichier INSTALLATION.sql
- Créer toutes les tables (clients, sellers, admins, statuses, etc.)
- Configurer tous les RLS (sécurité)
- Créer les Edge Functions

### 5️⃣ RESTAURER VOS DONNÉES

Une fois la structure créée, restaurez vos données:

**Donnez le fichier BACKUP_DATA.sql à l'assistant:**
```
"J'ai un fichier BACKUP_DATA.sql avec toutes mes données.
Peux-tu restaurer ces données dans la nouvelle base?"
```

Cela va restaurer:
- ✅ Vos 10 clients
- ✅ Votre compte admin
- ✅ Votre compte commercial
- ✅ Tous les statuts

### 6️⃣ TESTER L'APPLICATION

Testez que tout fonctionne:

```
1. Ouvrez l'application (le dev server devrait démarrer automatiquement)

2. Testez la connexion admin:
   - Email: admin@duerp.fr
   - Mot de passe: Admin2025!

3. Testez la connexion commercial:
   - Email: commercial@duerp.fr
   - Mot de passe: Commercial2025!

4. Testez un compte client:
   - Exemple: sophie.bernard@gmail.com
   - Mot de passe: client123

5. Vérifiez que tous les clients apparaissent
6. Vérifiez que le chat fonctionne
7. Vérifiez que vous pouvez créer de nouveaux clients
```

---

## 🔧 COMMANDES RAPIDES POUR L'ASSISTANT

Copiez-collez ces commandes à l'assistant Bolt:

### 📝 Commande 1: Créer la base Supabase
```
Crée-moi une nouvelle base de données Supabase pour ce projet
```

### 📝 Commande 2: Restaurer la structure
```
J'ai un fichier INSTALLATION.sql qui contient toute la structure
de ma base de données. Peux-tu l'exécuter pour créer toutes les
tables et configurations?
```

### 📝 Commande 3: Restaurer les données
```
J'ai un fichier BACKUP_DATA.sql avec toutes mes données (10 clients,
admin, commercial, statuts). Peux-tu restaurer ces données dans la
nouvelle base?
```

### 📝 Commande 4: Vérifier que tout fonctionne
```
Peux-tu vérifier que toutes les données sont bien restaurées?
Compte le nombre de clients, admins, sellers et statuts.
```

---

## 🆘 PROBLÈMES COURANTS

### ❌ Problème: "Cannot connect to Supabase"
**Solution:** Vérifiez que les nouvelles clés dans .env sont correctes

### ❌ Problème: "Tables already exist"
**Solution:**
1. Supprimez toutes les tables existantes
2. Réexécutez INSTALLATION.sql

### ❌ Problème: "No data showing"
**Solution:**
1. Vérifiez que INSTALLATION.sql a bien été exécuté
2. Puis réexécutez BACKUP_DATA.sql

### ❌ Problème: "Cannot login"
**Solution:**
1. Vérifiez que BACKUP_DATA.sql a été exécuté
2. Les mots de passe par défaut sont:
   - Admin: Admin2025!
   - Commercial: Commercial2025!
   - Clients: client123

---

## ⚡ VERSION RAPIDE (SI VOUS ÊTES PRESSÉ)

1. **Nouveau projet Bolt** → Créé ✅
2. **Demandez:** "Crée une base Supabase" → Base créée ✅
3. **Uploadez:** INSTALLATION.sql → Structure créée ✅
4. **Uploadez:** BACKUP_DATA.sql → Données restaurées ✅
5. **Testez:** Connexion admin → Tout fonctionne ✅

**Durée totale: 15-30 minutes**

---

## 📞 ORDRE DES FICHIERS À UPLOADER

```
1️⃣ package.json (pour installer les dépendances)
2️⃣ Dossier src/ (tout le code)
3️⃣ Fichiers config (vite.config.ts, tailwind.config.js, etc.)
4️⃣ Dossier supabase/ (migrations + functions)
5️⃣ INSTALLATION.sql (structure DB)
6️⃣ BACKUP_DATA.sql (données)
```

**NE PAS UPLOADER:** Le fichier .env (il sera recréé automatiquement)

---

## ✅ CHECKLIST DE RESTAURATION

- [ ] Nouveau compte Bolt créé
- [ ] Nouveau projet créé
- [ ] Fichiers uploadés (src/, supabase/, etc.)
- [ ] Nouvelle base Supabase créée
- [ ] INSTALLATION.sql exécuté
- [ ] BACKUP_DATA.sql exécuté
- [ ] Connexion admin testée
- [ ] Connexion commercial testée
- [ ] Liste des clients visible
- [ ] Chat fonctionnel
- [ ] Tout fonctionne! 🎉

---

## 🎯 RÉSUMÉ ULTRA-SIMPLE

**Vous avez téléchargé tout le projet → Créez nouveau compte Bolt → Uploadez les fichiers → Créez nouvelle base Supabase → Restaurez structure (INSTALLATION.sql) → Restaurez données (BACKUP_DATA.sql) → C'est fini!**

---

## 💡 ASTUCE PRO

**Gardez l'ancien projet Bolt actif pendant quelques jours** au cas où vous auriez oublié quelque chose. Une fois que tout fonctionne parfaitement sur le nouveau compte, vous pourrez supprimer l'ancien.

---

## 🆘 BESOIN D'AIDE?

Si vous êtes bloqué, demandez simplement à l'assistant Bolt:

```
"J'ai restauré mon projet mais [décrivez le problème].
Peux-tu m'aider à le résoudre?"
```

L'assistant pourra:
- Vérifier la base de données
- Tester les connexions
- Débugger les erreurs
- Réexécuter les scripts si nécessaire

---

## 🎉 FÉLICITATIONS!

Une fois tout restauré, vous aurez:
- ✅ Application 100% fonctionnelle
- ✅ Toutes vos données (clients, admin, commercial)
- ✅ Nouveau projet Bolt indépendant
- ✅ Nouvelle base Supabase sécurisée

**Votre application est maintenant sur votre nouveau compte!** 🚀
