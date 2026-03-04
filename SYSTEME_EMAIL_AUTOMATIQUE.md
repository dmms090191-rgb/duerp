# Système d'Envoi d'Emails Automatiques avec PDF

## Vue d'ensemble

Le système d'envoi d'emails automatiques est maintenant opérationnel dans votre CRM. Il permet d'envoyer des emails personnalisés depuis l'onglet "Mail" du dashboard client, avec génération automatique de PDF pour certains types d'emails.

## Architecture du système

### 1. Base de données

#### Tables créées :
- **`email_send_history`** : Historique de tous les emails envoyés
  - Enregistre le client, le type d'email, le statut, les pièces jointes
  - Accessible pour consultation dans l'admin

- **`email_templates`** : Templates d'emails modifiables
  - 3 templates créés : identifiants, relance, procedure_prise_en_charge
  - Support des variables dynamiques ({{nom}}, {{email}}, etc.)

- **`pdf_templates`** : Templates PDF pour les documents
  - 2 templates créés : facture_client, attestation_duerp
  - Structure JSON pour définir les champs dynamiques
  - En-têtes, pieds de page et styles CSS personnalisables

### 2. Edge Function

**Fonction : `send-email`**
- Déployée sur Supabase
- Gère l'envoi SMTP via Hostinger
- Génère les PDF dynamiques à la volée
- Enregistre l'historique des envois

**Configuration SMTP :**
- Serveur : smtp.hostinger.com
- Port : 465 (SSL)
- Email : administration@securiteprofessionnelle.fr
- Nom : Cabinet FPE

### 3. Interface utilisateur

**Onglet "Mail" dans le ClientDashboard**

Accessible depuis n'importe quel compte client, l'onglet Mail propose 3 boutons :

#### 1. Identifiants : portail numérique
- Envoie les identifiants de connexion au portail
- Variables utilisées : email, password, nom, prénom

#### 2. Mail de relance
- Envoie un rappel pour les dossiers en attente
- Variables utilisées : nom, prénom, société, SIRET

#### 3. Procédure de prise en charge
- Envoie l'email avec 2 PDF en pièces jointes :
  - **Facture** : Facture_[Société]_[ID].pdf
  - **Attestation DUERP** : Attestation_DUERP_[Société]_[ID].pdf
- Variables utilisées : nom, prénom, société, SIRET + données de facturation

## Gestion des templates

### Templates Email

Accès : **Admin Panel > Gestion des Emails > Templates Email**

Chaque template peut être modifié et contient :
- Nom du template
- Type (identifiants, relance, procedure_prise_en_charge)
- Sujet de l'email
- Corps de l'email avec variables dynamiques

**Variables disponibles :**
- `{{prenom}}` : Prénom du client
- `{{nom}}` : Nom du client
- `{{email}}` : Email du client
- `{{password}}` : Mot de passe du client
- `{{societe}}` : Nom de la société
- `{{siret}}` : Numéro SIRET
- `{{full_name}}` : Nom complet du client

### Templates PDF

Accès : **Admin Panel > Gestion des Emails > Templates PDF**

Chaque template PDF contient :
- Nom et type du template
- Description
- Contenu JSON (structure des données)
- En-tête HTML
- Pied de page HTML
- Styles CSS

**Templates créés :**

1. **Facture Client** (facture_client)
   - Design professionnel avec logo Cabinet FPE
   - Numéro de facture auto-généré
   - Tableau des prestations
   - Calcul HT/TTC/TVA

2. **Attestation Prise en Charge DUERP** (attestation_duerp)
   - Document officiel avec en-tête
   - Numéro d'attestation unique
   - Informations client complètes
   - Signature et cachet

## Fonctionnalités

### Envoi d'email

1. Le client (ou admin visualisant le compte) accède à l'onglet "Mail"
2. Il clique sur un des 3 boutons
3. Le système :
   - Récupère les données du client
   - Charge le template email correspondant
   - Remplace les variables par les vraies valeurs
   - Génère les PDF si nécessaire (procédure de prise en charge)
   - Envoie l'email via SMTP
   - Enregistre l'envoi dans l'historique

### Historique des envois

Tous les envois sont enregistrés avec :
- Date et heure d'envoi
- Client destinataire
- Type d'email
- Statut (sent, failed, pending)
- Liste des pièces jointes

## Sécurité

- Les templates et l'historique sont accessibles uniquement aux admins
- L'envoi d'email nécessite d'être connecté (client ou admin)
- Les mots de passe SMTP sont stockés de manière sécurisée dans les variables d'environnement
- Toutes les tables utilisent Row Level Security (RLS)

## Configuration requise

### Variables d'environnement Supabase

Pour que le système fonctionne en production, assurez-vous que la variable suivante est configurée dans Supabase :

```
SMTP_PASSWORD=<votre_mot_de_passe_email>
```

Cette configuration se fait dans :
**Supabase Dashboard > Settings > Edge Functions > Secrets**

## Utilisation

### Pour les clients

1. Se connecter au portail client
2. Cliquer sur l'onglet "Mail" dans le menu
3. Choisir le type d'email à recevoir
4. Cliquer sur le bouton correspondant
5. Attendre la confirmation d'envoi

### Pour les administrateurs

#### Modifier les templates email :
1. Aller dans Admin Panel > Gestion des Emails
2. Onglet "Templates Email"
3. Cliquer sur "Modifier" sur le template souhaité
4. Ajuster le sujet et le corps
5. Utiliser les variables dynamiques {{variable}}
6. Sauvegarder

#### Modifier les templates PDF :
1. Aller dans Admin Panel > Gestion des Emails
2. Onglet "Templates PDF"
3. Cliquer sur "Modifier" sur le template souhaité
4. Modifier l'en-tête, le pied de page ou les styles CSS
5. Sauvegarder

#### Consulter l'historique :
1. Aller dans Admin Panel > Gestion des Emails
2. Onglet "Historique"
3. Voir tous les emails envoyés avec leurs détails

## Notes importantes

1. **Génération des PDF** : Les PDF sont générés automatiquement avec jsPDF directement dans l'Edge Function. La facture et l'attestation DUERP sont créées avec un design professionnel incluant toutes les informations du client.

2. **Envoi SMTP réel** : L'Edge Function utilise Nodemailer pour envoyer les emails via SMTP Hostinger. Les emails sont envoyés automatiquement dès que vous cliquez sur un bouton.

3. **Personnalisation** : Tous les templates (email et PDF) sont modifiables depuis l'interface admin pour s'adapter aux besoins spécifiques.

4. **Évolutivité** : Le système est conçu pour être facilement extensible :
   - Ajouter de nouveaux types d'emails
   - Créer de nouveaux templates PDF
   - Ajouter des variables dynamiques supplémentaires

## Support

Pour toute question ou assistance sur le système d'envoi d'emails automatiques, contactez le support technique.
