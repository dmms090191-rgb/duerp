# 🚀 Améliorer la délivrabilité des emails (éviter les spams)

## Problème actuel
Les emails partent bien mais arrivent dans les spams sur **iCloud** (et potentiellement d'autres fournisseurs).

---

## ✅ Solutions immédiates

### Pour les destinataires iCloud :
1. **Ouvrir l'email dans les Spams**
2. **Cliquer sur "Ce n'est pas du spam"**
3. **Ajouter `administration@securiteprofessionnelle.fr` aux contacts**
4. Les prochains emails iront en boîte de réception

---

## 🔧 Configuration DNS (à faire chez Hostinger)

### Vérifier les enregistrements DNS actuels

Allez sur : https://mxtoolbox.com/SuperTool.aspx
- Entrez : `securiteprofessionnelle.fr`
- Vérifiez : SPF, DKIM, DMARC

---

## 📝 Enregistrements à configurer chez Hostinger

### 1. SPF (Sender Policy Framework)
Autorise Hostinger à envoyer des emails pour votre domaine.

**Type :** TXT
**Nom :** `@` ou `securiteprofessionnelle.fr`
**Valeur :** `v=spf1 include:_spf.hostinger.com ~all`

### 2. DKIM (DomainKeys Identified Mail)
Signature cryptographique des emails.

**Chez Hostinger :**
1. Allez dans **Panneau de contrôle** → **Email**
2. Cherchez **DKIM** ou **Authentification email**
3. **Activez DKIM**
4. Copiez l'enregistrement DNS fourni
5. Ajoutez-le dans vos DNS

**Format typique :**
**Type :** TXT
**Nom :** `default._domainkey`
**Valeur :** `v=DKIM1; k=rsa; p=MIGfMA0GCS...` (fourni par Hostinger)

### 3. DMARC (Domain-based Message Authentication)
Politique d'authentification des emails.

**Type :** TXT
**Nom :** `_dmarc`
**Valeur :** `v=DMARC1; p=quarantine; rua=mailto:administration@securiteprofessionnelle.fr; pct=100`

**Explication :**
- `p=quarantine` : Met en quarantaine les emails suspects
- `rua=mailto:...` : Reçoit les rapports
- `pct=100` : Applique la politique à 100% des emails

---

## 🎯 Comment configurer chez Hostinger

### Étape 1 : Connexion
1. Allez sur https://www.hostinger.fr
2. Connectez-vous à votre compte
3. Allez dans **Hébergement** → **Gérer**

### Étape 2 : DNS
1. Cliquez sur **Zone DNS** (ou **DNS/Nameservers**)
2. Cherchez la section **Enregistrements DNS**
3. Cliquez sur **Ajouter un enregistrement**

### Étape 3 : Ajoutez les 3 enregistrements
Ajoutez SPF, DKIM et DMARC comme indiqué ci-dessus.

### Étape 4 : Vérification
- Attendez 1-2 heures (propagation DNS)
- Vérifiez sur https://mxtoolbox.com/SuperTool.aspx
- Testez un envoi d'email

---

## 📊 Vérifier la réputation du domaine

### Outils de test :
- https://mxtoolbox.com/SuperTool.aspx
- https://www.mail-tester.com/ (envoyez un email à l'adresse donnée)
- https://www.gmass.co/spam-checker

### Score idéal :
- **Mail-tester :** 8/10 minimum (10/10 idéal)
- **MXToolbox :** Tous verts ✅

---

## 🚨 Autres vérifications

### 1. Contenu des emails
- **Évitez les mots spammy :** GRATUIT, URGENT, CLIQUEZ ICI
- **Ratio texte/images équilibré**
- **Lien de désinscription présent** (déjà fait ✅)
- **Pas de fautes d'orthographe**

### 2. Volume d'envoi
- **Ne pas envoyer trop d'emails d'un coup**
- **Augmenter progressivement le volume**
- **Éviter les pics soudains**

### 3. Taux d'engagement
- **Encouragez les destinataires à répondre**
- **Évitez les listes inactives**
- **Supprimez les emails qui rebondent (bounce)**

---

## 🎓 Pourquoi iCloud est si strict ?

Apple iCloud Mail utilise des **filtres anti-spam très agressifs** :
- Vérifie SPF, DKIM, DMARC
- Analyse la réputation de l'IP et du domaine
- Détecte les patterns de spam dans le contenu
- Privilégie les expéditeurs connus (dans les contacts)

---

## ✨ Résultat attendu

Après configuration complète :
- ✅ Gmail : Boîte de réception
- ✅ iCloud : Boîte de réception (après configuration DNS)
- ✅ Outlook : Boîte de réception
- ✅ Yahoo : Boîte de réception

**Délai :** 24-48h après configuration DNS pour que la réputation s'améliore.

---

## 💡 Besoin d'aide ?

Si vous ne savez pas comment configurer chez Hostinger :
1. **Contactez le support Hostinger** (ils sont très réactifs)
2. Dites : "Je veux configurer SPF, DKIM et DMARC pour mes emails"
3. Donnez-leur ce document comme référence

---

## 📞 Support Hostinger
- Chat en direct : https://www.hostinger.fr
- Email : support@hostinger.com
- Ils peuvent configurer ça en 10 minutes pour vous !
