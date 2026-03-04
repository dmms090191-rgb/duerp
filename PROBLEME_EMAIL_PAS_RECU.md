# Pourquoi les emails n'arrivent pas chez certains destinataires

## Problème

Les emails s'envoient correctement (ça marche pour vous) mais certaines personnes ne les reçoivent pas.

## Causes possibles et solutions

### 1. L'email est dans les SPAMS

**C'est la cause la plus fréquente !**

**Solution :**
1. Demandez à votre copine de vérifier son dossier **SPAM/Courrier indésirable**
2. L'email vient de : `administration@securiteprofessionnelle.fr`
3. Si l'email est dans les spams :
   - Le marquer comme "Non spam" ou "Pas un spam"
   - Ajouter `administration@securiteprofessionnelle.fr` aux contacts

### 2. L'adresse email est incorrecte

**Vérification :**
1. Connectez-vous en tant qu'Admin
2. Allez dans "Gestion des Clients"
3. Recherchez le compte de votre copine
4. Vérifiez que l'email est correct (pas de faute de frappe)

**Correction :**
- Si l'email est incorrect, modifiez-le directement dans la fiche client
- Puis renvoyez l'email

### 3. Le serveur email bloque l'expéditeur

Certains fournisseurs d'email (Gmail, Outlook, Yahoo, etc.) peuvent bloquer les emails :

**Si elle utilise Gmail :**
- Vérifier les spams
- Vérifier l'onglet "Promotions" ou "Social"

**Si elle utilise Outlook/Hotmail :**
- Vérifier le dossier "Courrier indésirable"
- Parfois Outlook bloque complètement les emails

**Si elle utilise un email professionnel :**
- Le serveur de l'entreprise peut bloquer les emails
- Demander à l'administrateur IT d'autoriser `administration@securiteprofessionnelle.fr`

### 4. Vérifier l'historique d'envoi

**Pour confirmer que l'email a bien été envoyé :**

1. Connectez-vous en Admin
2. Allez dans **Gestion des Emails**
3. Cliquez sur l'onglet **Historique**
4. Recherchez l'email envoyé à votre copine
5. Vérifiez :
   - ✅ Status : "sent" (envoyé)
   - ✅ Email destinataire : correct
   - ✅ Date d'envoi

Si l'email apparaît comme "sent", cela signifie qu'il a été envoyé avec succès par le serveur.

### 5. Délai de réception

Parfois, les emails peuvent prendre du temps à arriver :
- Attendre 5-10 minutes
- Recharger la boîte email
- Se déconnecter/reconnecter à la boîte email

## Solution rapide : Renvoyer l'email

1. Connectez-vous sur le compte de votre copine (ou demandez-lui de le faire)
2. Allez dans l'onglet **Mail**
3. Cliquez à nouveau sur le bouton de l'email (Identifiants, Relance, etc.)
4. L'email sera renvoyé

## Test avec une autre adresse email

Pour tester si le problème vient de l'adresse email :

1. Connectez-vous en Admin
2. Ouvrez la fiche client de votre copine
3. Changez temporairement son email pour une autre adresse (Gmail par exemple)
4. Renvoyez l'email
5. Vérifiez si l'email arrive sur cette nouvelle adresse

Si ça marche → Le problème vient de l'adresse email d'origine
Si ça ne marche pas → Le problème est ailleurs

## Fournisseurs email connus pour filtrer fort

Ces fournisseurs sont connus pour filtrer agressivement :
- **Hotmail/Outlook.com** → Très strict, souvent bloqué
- **Orange/Wanadoo** → Filtrage strict
- **Free.fr** → Filtrage strict
- **Yahoo** → Filtrage modéré
- **Gmail** → Généralement OK, mais parfois dans Spam

## Alternative : Utiliser un autre email

Si aucune solution ne fonctionne :
1. Demandez à votre copine de créer un compte Gmail
2. Changez son email dans la fiche client
3. Renvoyez l'email

Gmail est généralement le plus fiable pour recevoir les emails.

## Vérifier la configuration SMTP (Admin)

Si personne ne reçoit les emails :

1. Vérifiez que le secret `SMTP_PASSWORD` est bien configuré dans Supabase
2. Vérifiez les logs des Edge Functions pour voir les erreurs
3. Testez avec votre propre email

## Contact support

Si le problème persiste :
1. Notez l'adresse email du destinataire
2. Notez le type d'email envoyé
3. Prenez une capture d'écran de l'historique d'envoi
4. Contactez l'administrateur système
