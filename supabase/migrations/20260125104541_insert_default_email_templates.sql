/*
  # Insertion des templates d'email par défaut

  1. Description
    Insère 3 templates d'email par défaut pour le système d'envoi automatique

  2. Templates créés
    - **identifiants** : Envoi des identifiants de connexion au portail client
    - **relance** : Email de relance pour dossier en attente
    - **procedure_prise_en_charge** : Email de confirmation avec facture et attestation PDF

  3. Variables disponibles
    - {{prenom}} : Prénom du client
    - {{nom}} : Nom du client  
    - {{email}} : Email du client
    - {{password}} : Mot de passe du client
    - {{societe}} : Nom de la société
    - {{siret}} : Numéro SIRET
    - {{full_name}} : Nom complet du client
*/

-- Supprimer les templates existants s'ils existent (pour éviter les doublons)
DELETE FROM email_templates WHERE type IN ('identifiants', 'relance', 'procedure_prise_en_charge');

-- Template: Identifiants portail numérique
INSERT INTO email_templates (name, subject, body, type)
VALUES (
  'Identifiants portail numérique',
  'Vos identifiants pour le portail client - Cabinet FPE',
  'Bonjour {{prenom}} {{nom}},

Nous vous confirmons la création de votre compte sur notre portail client sécurisé.

Vos identifiants de connexion :
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Email : {{email}}
🔒 Mot de passe : {{password}}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Vous pouvez vous connecter dès maintenant sur notre plateforme pour :
• Consulter l''avancement de votre dossier DUERP
• Télécharger vos documents
• Échanger avec votre conseiller
• Suivre votre projet en temps réel

Pour votre sécurité, nous vous recommandons de modifier votre mot de passe lors de votre première connexion.

Besoin d''aide ? Notre équipe est à votre disposition.

Cordialement,
L''équipe Cabinet FPE
administration@securiteprofessionnelle.fr',
  'identifiants'
);

-- Template: Mail de relance
INSERT INTO email_templates (name, subject, body, type)
VALUES (
  'Mail de relance',
  'Rappel : Votre dossier DUERP en attente - {{societe}}',
  'Bonjour {{prenom}} {{nom}},

Nous revenons vers vous concernant votre dossier d''élaboration du Document Unique d''Évaluation des Risques Professionnels (DUERP).

📋 Informations de votre dossier :
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Société : {{societe}}
📇 SIRET : {{siret}}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Votre dossier est actuellement en attente de complétion. Nous vous invitons à :

1️⃣ Vous connecter à votre espace client
2️⃣ Compléter les informations manquantes
3️⃣ Valider votre diagnostic de risques

Notre équipe reste à votre entière disposition pour vous accompagner dans cette démarche obligatoire et vous aider à finaliser votre DUERP dans les meilleurs délais.

N''hésitez pas à nous contacter pour toute question.

Cordialement,
L''équipe Cabinet FPE
📧 administration@securiteprofessionnelle.fr
📞 Contactez-nous via votre espace client',
  'relance'
);

-- Template: Procédure de prise en charge
INSERT INTO email_templates (name, subject, body, type)
VALUES (
  'Procédure de prise en charge',
  'Confirmation de prise en charge DUERP - {{societe}} - Documents officiels',
  'Bonjour {{prenom}} {{nom}},

Nous vous confirmons la prise en charge de votre Document Unique d''Évaluation des Risques Professionnels (DUERP).

🎉 VOTRE DOSSIER EST VALIDÉ

📎 Vous trouverez en pièces jointes :
━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Facture acquittée (500€ HT + TVA 20% = 600€ TTC)
✅ Attestation officielle de prise en charge DUERP
━━━━━━━━━━━━━━━━━━━━━━━━━━

Ces documents officiels certifient votre conformité réglementaire et peuvent être présentés lors de tout contrôle de l''inspection du travail.

📋 Informations du dossier :
🏢 Société : {{societe}}
📇 SIRET : {{siret}}

Prochaines étapes :
━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Conservez précieusement ces documents
2. Votre DUERP sera finalisé sous 48-72h
3. Vous recevrez une notification pour le télécharger
4. Le document sera disponible dans votre espace client

Notre équipe reste à votre disposition pour toute question ou accompagnement supplémentaire.

Merci de votre confiance,

L''équipe Cabinet FPE
Sécurité Professionnelle
━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 administration@securiteprofessionnelle.fr
🌐 www.securiteprofessionnelle.fr',
  'procedure_prise_en_charge'
);
