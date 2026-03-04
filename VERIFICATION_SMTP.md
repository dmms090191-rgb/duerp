# Vérification de la configuration SMTP

## Le problème le plus probable

Le **mot de passe SMTP n'est pas configuré** dans Supabase, c'est pour ça que les emails ne partent pas.

## Solution : Configurer le mot de passe SMTP

### Étape 1 : Accéder aux Secrets Supabase

1. Allez sur **https://supabase.com/dashboard**
2. Connectez-vous à votre compte
3. Sélectionnez votre projet : **zjsdmythkltkbhmocude**
4. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
5. Cliquez sur **Edge Functions**
6. Cherchez la section **Secrets** ou **Environment Variables**

### Étape 2 : Ajouter le secret SMTP_PASSWORD

1. Cliquez sur **Add new secret** ou **New secret**
2. Remplissez:
   - **Name (Nom):** `SMTP_PASSWORD`
   - **Value (Valeur):** Le mot de passe de l'email `administration@securiteprofessionnelle.fr`

3. Cliquez sur **Save** ou **Create**

### Étape 3 : Redéployer l'Edge Function

Après avoir ajouté le secret, l'Edge Function doit être redéployée:

```bash
# Si vous avez accès au terminal
npm run deploy-function send-email
```

OU utilisez l'interface Supabase pour redéployer la fonction.

---

## Comment obtenir le mot de passe SMTP Hostinger

### Option 1 : Depuis votre compte Hostinger

1. Connectez-vous à **https://hpanel.hostinger.com**
2. Allez dans **Emails** → **Email Accounts**
3. Trouvez l'email `administration@securiteprofessionnelle.fr`
4. Cliquez sur **Manage** ou **Gérer**
5. Consultez ou réinitialisez le mot de passe

### Option 2 : Réinitialiser le mot de passe

Si vous ne connaissez pas le mot de passe:

1. Dans Hostinger → Emails
2. Sélectionnez `administration@securiteprofessionnelle.fr`
3. Cliquez sur **Change Password** ou **Changer le mot de passe**
4. Créez un nouveau mot de passe sécurisé
5. Copiez ce mot de passe
6. Ajoutez-le dans Supabase comme indiqué ci-dessus

---

## Vérifier si le secret est bien configuré

Une fois le secret ajouté, testez à nouveau:

1. Allez sur votre site
2. Connectez-vous comme client (email: `dmms090191@gmail.com`, mot de passe: `559000`)
3. Cliquez sur l'onglet **Mail**
4. Cliquez sur **"Envoyer une relance"**
5. **Ouvrez la console (F12)**
6. Vous devriez voir:
   ```
   📧 Envoi d'email avec les paramètres: ...
   ✅ Email envoyé avec succès
   ```

7. Un message vert devrait apparaître en haut de la page: **"✅ Email envoyé avec succès!"**

8. Vérifiez votre boîte email `dmms090191@gmail.com` (et les SPAM)

---

## Si ça ne marche toujours pas

Vérifiez dans la console (F12) quel est le message d'erreur exact:

### Erreur possible 1: "Invalid login: 535 Authentication failed"
➡️ Le mot de passe SMTP est incorrect ou non configuré

**Solution:** Vérifiez que vous avez bien ajouté le secret `SMTP_PASSWORD` avec le bon mot de passe

### Erreur possible 2: "Template email non trouvé"
➡️ Les templates n'existent pas dans la base de données

**Solution:** Les templates ont déjà été créés dans la migration. Vérifiez qu'ils existent:
```sql
SELECT name, type FROM email_templates;
```

### Erreur possible 3: "Failed to invoke function"
➡️ L'Edge Function n'est pas déployée ou a une erreur

**Solution:** Redéployez l'Edge Function

### Erreur possible 4: Aucune erreur mais pas d'email
➡️ L'email est peut-être dans les SPAM

**Solution:** Vérifiez votre dossier courrier indésirable

---

## Configuration SMTP actuelle

```
Serveur: smtp.hostinger.com
Port: 465
Sécurité: SSL/TLS
Email: administration@securiteprofessionnelle.fr
Mot de passe: [À configurer dans Supabase Secrets]
```

---

## Besoin d'aide ?

Envoyez-moi une capture d'écran de:
1. La console du navigateur (F12) après avoir cliqué sur le bouton
2. La section Secrets dans Supabase (masquez le mot de passe!)
3. Le message d'erreur affiché sur la page
