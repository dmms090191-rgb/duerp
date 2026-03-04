# Guide de test - Envoi d'emails automatiques

Le système d'envoi d'emails est maintenant complètement configuré et opérationnel.

## Comment tester l'envoi d'emails

### Prérequis
- ✅ Secret SMTP_PASSWORD configuré dans Supabase
- ✅ Edge Function `send-email` déployée
- ✅ Templates d'emails créés dans la base de données

### Test 1 : Email d'identifiants

1. **Connexion**
   - Allez sur l'application
   - Connectez-vous avec un compte client (ou créez-en un nouveau)

2. **Accès à l'onglet Mail**
   - Une fois connecté au dashboard client
   - Cliquez sur l'onglet **"Mail"**

3. **Envoi de l'email**
   - Cliquez sur le bouton **"Identifiants : portail numérique"**
   - Un message de confirmation apparaîtra
   - L'email sera envoyé instantanément

4. **Vérification**
   - Ouvrez la boîte email du client
   - Vous devriez recevoir un email de `administration@securiteprofessionnelle.fr`
   - L'email contient les identifiants de connexion personnalisés

### Test 2 : Mail de relance

1. Dans l'onglet **"Mail"**
2. Cliquez sur **"Mail de relance"**
3. Vérifiez la réception d'un email de rappel

### Test 3 : Procédure de prise en charge (avec PDFs)

1. Dans l'onglet **"Mail"**
2. Cliquez sur **"Procedure de prise en charge"**
3. Vérifiez la réception d'un email avec **2 pièces jointes PDF** :
   - `Facture_[Nom_Client]_[ID].pdf`
   - `Attestation_DUERP_[Nom_Client]_[ID].pdf`

## Vérification de l'historique (Côté Admin)

1. **Connexion Admin**
   - Connectez-vous avec un compte administrateur
   - Mot de passe par défaut : `admin123`

2. **Accès à l'historique**
   - Allez dans **"Gestion des Emails"**
   - Cliquez sur l'onglet **"Historique"**

3. **Consultation**
   - Vous verrez tous les emails envoyés
   - Date et heure d'envoi
   - Type d'email
   - Destinataire
   - Statut (envoyé/échoué)
   - Pièces jointes (si applicable)

## Contenu des PDF générés

### Facture (Facture_[Nom].pdf)
- En-tête Cabinet FPE avec logo et couleurs
- Numéro de facture unique : `F-[ID_CLIENT]-[TIMESTAMP]`
- Date de facturation
- Informations client (nom, société, SIRET, adresse)
- Détail de la prestation : "DUERP"
- Montants : HT (500€), TVA 20% (100€), TTC (600€)
- Pied de page avec contact

### Attestation (Attestation_DUERP_[Nom].pdf)
- En-tête vert avec titre "ATTESTATION DE PRISE EN CHARGE"
- Numéro d'attestation unique : `ATT-DUERP-[ID_CLIENT]-[TIMESTAMP]`
- Informations client
- Texte de certification officiel
- Date de prise en charge
- Montant de la prestation : 600€ TTC
- Zone pour signature et cachet
- Pied de page Cabinet FPE

## Résolution de problèmes

### Email non reçu
**Vérifications :**
- Le client a une adresse email valide dans sa fiche
- Vérifiez les spams/courrier indésirable
- Consultez les logs de l'Edge Function dans Supabase

### Erreur lors de l'envoi
**Actions :**
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs dans la console
3. Vérifiez les logs Supabase :
   - Dashboard > Edge Functions > send-email > Logs
4. Vérifiez que le secret SMTP_PASSWORD est bien configuré

### PDF non attachés
**Vérifications :**
- Le bouton "Procédure de prise en charge" génère les PDF automatiquement
- Les autres types d'emails n'ont pas de PDF (comportement normal)
- Consultez les logs pour voir si la génération a échoué

## Templates d'emails disponibles

Les templates suivants sont configurés dans la base de données :

1. **identifiants** : Envoi des identifiants de connexion au portail
2. **relance** : Mail de relance pour dossier en attente
3. **procedure_prise_en_charge** : Confirmation avec facture et attestation

Chaque template peut être modifié depuis l'interface admin.

## Configuration SMTP actuelle

```
Serveur : smtp.hostinger.com
Port : 465 (SSL)
Expéditeur : administration@securiteprofessionnelle.fr
Nom : Cabinet FPE
```

## Prochaines étapes

Une fois les tests effectués avec succès :

1. ✅ Les clients peuvent recevoir leurs identifiants automatiquement
2. ✅ Les relances sont automatisées
3. ✅ Les procédures de prise en charge avec PDF sont générées automatiquement
4. ✅ L'historique complet est consultable par les admins

Le système est prêt pour la production !
