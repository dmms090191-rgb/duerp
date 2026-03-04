/*
  # Ajout des templates d'email pour paiement en 3 fois

  1. Description
    Ajoute 4 nouveaux templates d'email pour gérer les paiements en 3 fois

  2. Templates créés
    - **facture_3x** : Facture de paiement en 3 fois
    - **echeance_1** : Email 1ère échéance
    - **echeance_2** : Email 2ème échéance
    - **echeance_3** : Email 3ème échéance

  3. Variables disponibles
    - {{prenom}} : Prénom du client
    - {{nom}} : Nom du client
    - {{email}} : Email du client
    - {{societe}} : Nom de la société
    - {{siret}} : Numéro SIRET
    - {{montant_total}} : Montant total TTC
    - {{montant_echeance}} : Montant de chaque échéance
    - {{date_1}} : Date de la 1ère échéance
    - {{date_2}} : Date de la 2ème échéance
    - {{date_3}} : Date de la 3ème échéance
*/

-- Supprimer les templates existants s'ils existent
DELETE FROM email_templates WHERE type IN ('facture_3x', 'echeance_1', 'echeance_2', 'echeance_3');

-- Template: Facture paiement en 3 fois
INSERT INTO email_templates (name, subject, body, type)
VALUES (
  'Facture paiement en 3 fois',
  'Votre facture - Paiement en 3 fois sans frais - {{societe}}',
  'Bonjour {{prenom}} {{nom}},

Nous vous remercions pour votre confiance et sommes ravis de vous accompagner dans la mise en conformité de votre Document Unique d''Évaluation des Risques Professionnels (DUERP).

📄 FACTURE - PAIEMENT EN 3 FOIS SANS FRAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Informations de votre dossier :
🏢 Société : {{societe}}
📇 SIRET : {{siret}}

💰 Détails du règlement :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Montant total TTC : {{montant_total}}€
Mode de paiement : 3 fois sans frais
Montant par échéance : {{montant_echeance}}€

📅 Échéancier de paiement :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ 1ère échéance : {{montant_echeance}}€ - {{date_1}}
2️⃣ 2ème échéance : {{montant_echeance}}€ - {{date_2}}
3️⃣ 3ème échéance : {{montant_echeance}}€ - {{date_3}}

📎 Vous trouverez en pièce jointe :
• Facture détaillée avec échéancier de paiement
• Document signé électroniquement

Vous recevrez un email de rappel avant chaque échéance avec le lien de paiement sécurisé.

Notre équipe reste à votre disposition pour toute question.

Cordialement,
L''équipe Cabinet FPE
Sécurité Professionnelle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 administration@securiteprofessionnelle.fr
🌐 www.securiteprofessionnelle.fr',
  'facture_3x'
);

-- Template: 1ère échéance
INSERT INTO email_templates (name, subject, body, type)
VALUES (
  'Rappel 1ère échéance',
  'Rappel - 1ère échéance de paiement - {{societe}}',
  'Bonjour {{prenom}} {{nom}},

Nous vous rappelons que la 1ère échéance de votre paiement en 3 fois arrive à échéance.

💳 RAPPEL DE PAIEMENT - 1ÈRE ÉCHÉANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Informations :
🏢 Société : {{societe}}
📇 SIRET : {{siret}}

💰 Détails de cette échéance :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Montant à régler : {{montant_echeance}}€
Date d''échéance : {{date_1}}
Échéance : 1/3

📅 Prochaines échéances :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2ème échéance : {{montant_echeance}}€ - {{date_2}}
3ème échéance : {{montant_echeance}}€ - {{date_3}}

Pour procéder au paiement, cliquez sur le lien ci-dessous :
[LIEN DE PAIEMENT SÉCURISÉ]

En cas de question ou si vous avez déjà effectué ce paiement, n''hésitez pas à nous contacter.

Cordialement,
L''équipe Cabinet FPE
Sécurité Professionnelle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 administration@securiteprofessionnelle.fr
🌐 www.securiteprofessionnelle.fr',
  'echeance_1'
);

-- Template: 2ème échéance
INSERT INTO email_templates (name, subject, body, type)
VALUES (
  'Rappel 2ème échéance',
  'Rappel - 2ème échéance de paiement - {{societe}}',
  'Bonjour {{prenom}} {{nom}},

Nous vous rappelons que la 2ème échéance de votre paiement en 3 fois arrive à échéance.

💳 RAPPEL DE PAIEMENT - 2ÈME ÉCHÉANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Informations :
🏢 Société : {{societe}}
📇 SIRET : {{siret}}

💰 Détails de cette échéance :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Montant à régler : {{montant_echeance}}€
Date d''échéance : {{date_2}}
Échéance : 2/3

✅ 1ère échéance réglée le {{date_1}}

📅 Prochaine échéance :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3ème et dernière échéance : {{montant_echeance}}€ - {{date_3}}

Pour procéder au paiement, cliquez sur le lien ci-dessous :
[LIEN DE PAIEMENT SÉCURISÉ]

En cas de question ou si vous avez déjà effectué ce paiement, n''hésitez pas à nous contacter.

Cordialement,
L''équipe Cabinet FPE
Sécurité Professionnelle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 administration@securiteprofessionnelle.fr
🌐 www.securiteprofessionnelle.fr',
  'echeance_2'
);

-- Template: 3ème échéance
INSERT INTO email_templates (name, subject, body, type)
VALUES (
  'Rappel 3ème échéance',
  'Rappel - Dernière échéance de paiement - {{societe}}',
  'Bonjour {{prenom}} {{nom}},

Nous vous rappelons que la 3ème et dernière échéance de votre paiement en 3 fois arrive à échéance.

💳 RAPPEL DE PAIEMENT - 3ÈME ET DERNIÈRE ÉCHÉANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Informations :
🏢 Société : {{societe}}
📇 SIRET : {{siret}}

💰 Détails de cette échéance :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Montant à régler : {{montant_echeance}}€
Date d''échéance : {{date_3}}
Échéance : 3/3 - DERNIÈRE ÉCHÉANCE

✅ Échéances précédentes réglées :
1ère échéance : {{montant_echeance}}€ - {{date_1}}
2ème échéance : {{montant_echeance}}€ - {{date_2}}

🎉 Après ce paiement, votre dossier sera totalement soldé !

Pour procéder au paiement de cette dernière échéance, cliquez sur le lien ci-dessous :
[LIEN DE PAIEMENT SÉCURISÉ]

Nous vous remercions pour votre confiance et restons à votre disposition pour toute question.

Cordialement,
L''équipe Cabinet FPE
Sécurité Professionnelle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 administration@securiteprofessionnelle.fr
🌐 www.securiteprofessionnelle.fr',
  'echeance_3'
);