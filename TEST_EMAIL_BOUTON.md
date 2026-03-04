# Test du bouton d'envoi d'emails

## Étapes pour tester l'envoi d'email:

### 1. Ouvrir la console du navigateur
1. Appuyez sur **F12** pour ouvrir les outils développeur
2. Cliquez sur l'onglet **Console**
3. Gardez cette fenêtre ouverte pendant le test

### 2. Connexion au compte client
1. Allez sur votre site
2. Connectez-vous avec le compte client:
   - Email: `dmms090191@gmail.com`
   - Mot de passe: `559000`

### 3. Accéder à l'onglet Mail
1. Une fois connecté au dashboard client
2. Cherchez l'onglet **"Mail"** dans le menu
3. Cliquez dessus

### 4. Cliquer sur "Mail de relance"
1. Trouvez le bouton **"Mail de relance"**
2. Cliquez dessus
3. **REGARDEZ LA CONSOLE** (F12)

## Ce que vous devriez voir dans la console:

### Si ça fonctionne:
```
📧 Envoi d'email avec les paramètres: {clientId: 10000, emailType: "relance", generatePDFs: false}
📧 Réponse de l'Edge Function: {data: {success: true, message: "Email envoyé avec succès"}, error: null}
✅ Email envoyé avec succès: Email envoyé avec succès
```

### Si ça ne fonctionne pas:
```
❌ Erreur de l'Edge Function: [message d'erreur]
```

## Ce que vous devez me dire:

**COPIER-COLLER EXACTEMENT** tout ce qui apparaît dans la console après avoir cliqué sur le bouton.

Exemple:
- Les lignes qui commencent par 📧
- Les lignes qui commencent par ❌
- Les lignes qui commencent par ✅
- Toute autre erreur en rouge

## Problèmes possibles:

### Erreur: "Template email non trouvé"
➡️ Problème avec la base de données

### Erreur: "Client non trouvé"
➡️ Problème avec l'ID du client

### Erreur: "Invalid login: 535 Authentication failed"
➡️ Mot de passe SMTP non configuré ou incorrect

### Erreur: "Failed to invoke function"
➡️ Problème avec l'Edge Function elle-même

### Aucune erreur mais pas d'email reçu
➡️ Vérifiez vos SPAM/courrier indésirable

---

## Alternative: Test direct de l'Edge Function

Si vous voulez tester directement l'Edge Function sans passer par l'interface:

1. Ouvrez la console du navigateur (F12)
2. Collez et exécutez ce code:

```javascript
const SUPABASE_URL = 'https://zjsdmythkltkbhmocude.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqc2RteXRoa2x0a2JobW9jdWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMjc1NTMsImV4cCI6MjA0NTcwMzU1M30.4tqiwj3B1GF7dKNe74oZ6n2s2e3fZ6FkH5wMdmmw8Lo';

fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clientId: 10000,
    emailType: 'relance',
    generatePDFs: false
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ RÉSULTAT:', data);
})
.catch(error => {
  console.error('❌ ERREUR:', error);
});
```

3. Regardez ce qui s'affiche dans la console

---

**Envoyez-moi les messages d'erreur EXACTS que vous voyez, et je pourrai corriger le problème!**
