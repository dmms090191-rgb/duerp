# Comment résoudre le problème d'envoi d'emails

## Problème identifié

Les emails ne s'envoient plus quand vous cliquez sur les boutons :
- Identifiants
- Relance
- Procédure de prise en charge
- Autre moyen de paiement

## Cause du problème

Le secret `SMTP_PASSWORD` n'est pas configuré dans Supabase, ou le mot de passe a expiré.

## Solution : Configurer le secret SMTP dans Supabase

### Étape 1 : Accéder aux secrets Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet (**oxnmuprorefjrpnpixwa**)

### Étape 2 : Ajouter le secret SMTP_PASSWORD

1. Dans le menu de gauche, cliquez sur **Settings** (icône d'engrenage ⚙️)
2. Dans la section Settings, cliquez sur **Edge Functions**
3. Faites défiler jusqu'à la section **Secrets**
4. Cliquez sur le bouton **Add new secret**

### Étape 3 : Entrer les informations

Dans le formulaire qui apparaît :

**Nom du secret :**
```
SMTP_PASSWORD
```

**Valeur :**
```
Votre mot de passe pour administration@securiteprofessionnelle.fr
```

IMPORTANT : Utilisez le mot de passe du compte email Hostinger

### Étape 4 : Sauvegarder

1. Cliquez sur **Save** ou **Create secret**
2. Le secret est maintenant configuré

### Étape 5 : Attendre quelques minutes

Les Edge Functions Supabase mettent quelques minutes à récupérer les nouveaux secrets.
Attendez 2-3 minutes avant de tester.

### Étape 6 : Tester l'envoi d'email

1. Retournez sur votre application
2. Allez sur le dashboard d'un client
3. Cliquez sur l'onglet "Mail"
4. Cliquez sur **Identifiants**
5. Vérifiez que l'email est bien envoyé

## Vérification

Si tout fonctionne correctement, vous devriez voir :
- ✅ Un message de succès "Email envoyé avec succès"
- ✅ L'email arrive dans la boîte du client
- ✅ Les logs dans la console montrent "✅ Email envoyé avec succès"

## Si ça ne fonctionne toujours pas

### Vérifier les logs Supabase

1. Allez dans **Edge Functions** dans le menu Supabase
2. Cliquez sur la fonction **send-email-v2**
3. Cliquez sur **Logs**
4. Regardez les messages d'erreur

### Erreurs communes

#### Erreur : "Invalid login: 535 Authentication failed"
- Le mot de passe SMTP est incorrect
- Vérifiez le mot de passe dans Hostinger
- Mettez à jour le secret dans Supabase

#### Erreur : "Template non trouvé"
- Les templates d'emails ne sont pas en base de données
- Contactez l'administrateur pour insérer les templates

#### Erreur : "Client non trouvé"
- Le client n'existe pas en base
- Vérifiez que le client est bien créé

## Informations SMTP utilisées

```
Serveur : smtp.hostinger.com
Port : 465
Sécurité : SSL/TLS
Email expéditeur : administration@securiteprofessionnelle.fr
Mot de passe : [À configurer dans Supabase Secrets]
```

## Contact support

Si le problème persiste après avoir suivi toutes ces étapes :
1. Prenez une capture d'écran des logs Supabase
2. Notez le message d'erreur exact
3. Contactez l'administrateur système
