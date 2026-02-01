# Configuration SMTP pour l'envoi d'emails automatiques

## Configuration requise

Pour que le système d'envoi d'emails fonctionne, vous devez configurer le mot de passe SMTP dans Supabase.

## Étapes de configuration

### 1. Accéder au Dashboard Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
4. Cliquez sur **Edge Functions**

### 2. Ajouter le secret SMTP_PASSWORD

1. Dans la section **Edge Functions Secrets**, cliquez sur **Add new secret**
2. Remplissez les champs :
   - **Name** : `SMTP_PASSWORD`
   - **Value** : Votre mot de passe email Hostinger pour `administration@securiteprofessionnelle.fr`
3. Cliquez sur **Save**

### 3. Vérifier la configuration

Une fois le secret ajouté, l'Edge Function `send-email` pourra :
- Se connecter au serveur SMTP Hostinger
- Envoyer des emails depuis `administration@securiteprofessionnelle.fr`
- Joindre automatiquement les PDF générés

## Paramètres SMTP utilisés

```
Serveur SMTP : smtp.hostinger.com
Port : 465
Sécurité : SSL/TLS
Email expéditeur : administration@securiteprofessionnelle.fr
Nom expéditeur : Cabinet FPE
```

## Test de l'envoi

Pour tester que tout fonctionne :

1. Connectez-vous à un compte client
2. Allez dans l'onglet **Mail**
3. Cliquez sur **"Identifiants : portail numérique"**
4. Vérifiez que vous recevez un email dans la boîte du client

## Résolution de problèmes

### L'email n'est pas reçu

Vérifications :
1. Le secret `SMTP_PASSWORD` est bien configuré dans Supabase
2. Le mot de passe est correct pour le compte `administration@securiteprofessionnelle.fr`
3. L'adresse email du client est valide
4. Vérifiez les logs de l'Edge Function dans Supabase Dashboard > Edge Functions > Logs

### Erreur d'authentification SMTP

Si vous voyez une erreur d'authentification :
1. Vérifiez que le mot de passe SMTP est correct
2. Assurez-vous que l'accès SMTP est activé dans Hostinger
3. Vérifiez qu'il n'y a pas de restrictions d'IP

### Les PDF ne sont pas joints

Si les PDF ne sont pas joints à l'email "Procédure de prise en charge" :
1. Vérifiez que le paramètre `generatePDFs` est bien à `true`
2. Consultez les logs de l'Edge Function pour voir les erreurs de génération

## Support

Si vous rencontrez des problèmes de configuration, contactez votre administrateur système avec :
- Les logs de l'Edge Function
- Le type d'email que vous essayez d'envoyer
- Le message d'erreur exact reçu
