# Configuration Stripy - Paiement en 3 fois

## Problème résolu

Désormais, lorsqu'un client effectue un paiement en 3 fois via Stripy, le même processus de génération de documents et d'envoi d'email se déclenche automatiquement, comme pour les paiements en 1 fois via Stripe.

## Comment ça fonctionne

Une nouvelle page `/payment-success-3x` a été créée spécialement pour les paiements Stripy. Cette page :

1. ✅ Génère automatiquement la facture DUERP
2. ✅ Génère l'attestation de conformité
3. ✅ Envoie l'email de confirmation avec les documents
4. ✅ Redirige le client vers ses documents

### Mécanisme de récupération des informations

Le système utilise **deux mécanismes complémentaires** pour récupérer les informations du client :

1. **Via l'URL** (méthode préférée) : Si Stripy permet de configurer une URL de retour avec des paramètres
2. **Via localStorage** (méthode de secours) : Les informations sont sauvegardées avant la redirection vers Stripy et récupérées au retour (valide pendant 30 minutes)

## Configuration nécessaire dans Stripy

Pour que le processus fonctionne automatiquement après un paiement, vous devez configurer l'URL de retour dans votre compte Stripy :

### Étapes à suivre :

1. **Connectez-vous à votre compte Stripy**
   - Allez sur https://app.stripy.fr

2. **Accédez aux paramètres de vos liens de paiement**
   - Trouvez le lien de paiement en 3 fois (actuellement : `prod_TuAf4U7yu5zskb`)

3. **Configurez l'URL de retour (Success URL)**
   - Dans les paramètres du lien de paiement, cherchez "URL de succès" ou "Success URL" ou "URL de redirection"
   - Configurez l'URL suivante :

   ```
   https://[VOTRE-DOMAINE]/payment-success-3x?client_id={CLIENT_ID}&employee_range={EMPLOYEE_RANGE}
   ```

   **Remplacez `[VOTRE-DOMAINE]` par votre domaine réel**, par exemple :
   - `https://www.votre-site.com/payment-success-3x?client_id={CLIENT_ID}&employee_range={EMPLOYEE_RANGE}`

4. **Configurez les paramètres dynamiques**

   Si Stripy permet de passer des paramètres dynamiques, assurez-vous que :
   - `{CLIENT_ID}` est remplacé par l'ID du client
   - `{EMPLOYEE_RANGE}` est remplacé par la plage d'employés (ex: "1-5", "6-10", etc.)

## Flux après paiement

### Paiement en 1 fois (Stripe) :
1. Client effectue le paiement
2. Stripe redirige vers `/payment-success?client_id=X&employee_range=Y&session_id=Z`
3. Vérification du paiement avec Stripe
4. Génération des documents
5. Envoi de l'email
6. Redirection vers les documents

### Paiement en 3 fois (Stripy) :
1. Client effectue le paiement
2. Stripy redirige vers `/payment-success-3x?client_id=X&employee_range=Y`
3. Génération directe des documents (pas de vérification Stripe)
4. Envoi de l'email
5. Redirection vers les documents

## Remarques importantes

- La page `/payment-success-3x` ne vérifie pas le statut du paiement avec Stripe (car c'est un paiement Stripy)
- Les documents sont générés directement après la redirection
- Si vous ne configurez pas l'URL de retour dans Stripy, les clients resteront sur la page Stripy après le paiement

## Configuration selon les capacités de Stripy

### Option A : Stripy permet de configurer une URL de retour personnalisée

**C'est la méthode recommandée.**

Configurez l'URL de retour dans Stripy :
```
https://[VOTRE-DOMAINE]/payment-success-3x?client_id={CLIENT_ID}&employee_range={EMPLOYEE_RANGE}
```

Si Stripy ne supporte pas les variables dynamiques `{CLIENT_ID}` et `{EMPLOYEE_RANGE}`, vous pouvez utiliser une URL simple :
```
https://[VOTRE-DOMAINE]/payment-success-3x
```

Le système récupérera automatiquement les informations depuis le localStorage (méthode de secours).

### Option B : Stripy ne permet PAS de configurer une URL de retour

**Pas de problème !** Le système fonctionne quand même grâce au mécanisme de localStorage.

**Comment ça marche :**
1. Avant la redirection vers Stripy, les informations du client sont sauvegardées dans le localStorage du navigateur
2. Après le paiement, le client doit revenir manuellement sur votre site
3. Il peut cliquer sur l'URL `/payment-success-3x` que vous lui communiquez par email ou affichée sur votre site
4. Le système récupère automatiquement ses informations et génère les documents

**Instructions pour l'utilisateur :**

Après avoir effectué le paiement sur Stripy, vous pouvez :
- Revenir sur le site et cliquer sur "Mes documents"
- Ou accéder directement à : `https://[VOTRE-DOMAINE]/payment-success-3x`

Les informations de paiement sont conservées pendant 30 minutes.

## Support

Si vous rencontrez des difficultés pour configurer l'URL de retour dans Stripy, contactez le support Stripy pour obtenir de l'aide sur la configuration des redirections après paiement.
