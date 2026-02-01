# Système d'envoi de fichiers dans le chat

## Fonctionnalité ajoutée (28 janvier 2026)

Le système de chat permet désormais d'envoyer des documents et fichiers dans TOUS les chats de l'application :
- Chat client-vendeur (ChatWindow)
- Chat vendeur-admin (SellerWorkChat)
- Chat admin-client (AdminChatViewer)
- Chat admin-vendeur (SellerChatViewer)

## Caractéristiques

### 1. Upload de fichiers
- **Bouton trombone** : Un bouton avec une icône de trombone (📎) permet de sélectionner un fichier depuis l'ordinateur
- **Taille maximale** : 10 Mo par fichier
- **Types acceptés** : Tous types de fichiers (documents, images, PDF, etc.)

### 2. Aperçu avant envoi
Quand un fichier est sélectionné :
- Le nom du fichier s'affiche dans une carte bleue
- La taille du fichier est indiquée en Ko
- Un bouton X permet de retirer le fichier avant l'envoi

### 3. Envoi
- Possibilité d'envoyer uniquement un fichier sans message
- Possibilité d'envoyer un fichier avec un message texte
- Indicateur de chargement (spinner) pendant l'upload
- Le bouton d'envoi est désactivé si aucun message ni fichier n'est présent

### 4. Affichage des fichiers
Les fichiers envoyés apparaissent dans les messages :
- Icône de document
- Nom du fichier (tronqué si trop long)
- Bouton de téléchargement
- Style adapté selon l'expéditeur (client/vendeur/admin)

## Architecture technique

### Base de données

**Table `chat_messages`** - Nouvelles colonnes ajoutées :
- `attachment_url` (text) : URL publique du fichier dans Supabase Storage
- `attachment_name` (text) : Nom original du fichier
- `attachment_type` (text) : Type MIME du fichier

**Table `admin_seller_messages`** - Nouvelles colonnes ajoutées :
- `attachment_url` (text) : URL publique du fichier dans Supabase Storage
- `attachment_name` (text) : Nom original du fichier
- `attachment_type` (text) : Type MIME du fichier

### Stockage

**Bucket Supabase Storage** : `chat-attachments`
- Stockage public pour permettre le téléchargement direct
- Organisation par dossier : `{client_id}/{fichier}`
- Nom de fichier unique : `{random}-{timestamp}.{extension}`

**Policies de sécurité** :
- Lecture publique : Tous peuvent télécharger les fichiers
- Écriture publique : Tous peuvent uploader (nécessaire pour les utilisateurs anonymes)
- Suppression publique : Tous peuvent supprimer (pour gérer les erreurs)

### Code modifié

**Fichiers modifiés** :
1. `src/components/ChatWindow.tsx` - Chat client-vendeur
2. `src/components/SellerWorkChat.tsx` - Chat vendeur-admin
3. `src/components/AdminChatViewer.tsx` - Chat admin-client
4. `src/components/SellerChatViewer.tsx` - Chat admin-vendeur

**Nouvelles fonctionnalités ajoutées à tous les composants** :
- `uploadFile()` : Upload d'un fichier dans Supabase Storage
- `handleFileSelect()` : Gestion de la sélection de fichier avec validation de taille
- `removeSelectedFile()` : Retrait d'un fichier sélectionné avant envoi
- Interface `Message` étendue avec les champs de pièces jointes
- States `selectedFile` et `uploading` pour gérer l'état de l'upload

**UI ajoutée à tous les chats** :
- Bouton trombone (Paperclip) pour sélectionner un fichier
- Carte de prévisualisation du fichier sélectionné avec nom et taille
- Affichage des fichiers joints dans les messages avec lien de téléchargement
- Animation de chargement pendant l'upload
- Bouton pour retirer un fichier avant envoi

## Tables de messages

L'application utilise deux tables distinctes pour les messages :

1. **`chat_messages`** : Messages entre clients et vendeurs/admins
   - Utilisée par ChatWindow (client-vendeur) et AdminChatViewer (admin-client)

2. **`admin_seller_messages`** : Messages entre admins et vendeurs
   - Utilisée par SellerWorkChat (vendeur vers admin) et SellerChatViewer (admin vers vendeur)

Les deux tables ont maintenant les mêmes colonnes pour gérer les pièces jointes.

## Utilisation

### Pour envoyer un fichier :

1. Cliquez sur le bouton trombone (à gauche du champ de message)
2. Sélectionnez un fichier depuis votre ordinateur (max 10 Mo)
3. Le fichier apparaît dans une carte bleue
4. Ajoutez un message texte (optionnel)
5. Cliquez sur le bouton d'envoi (flèche)

### Pour télécharger un fichier reçu :

1. Les fichiers apparaissent dans les messages avec une icône de document
2. Cliquez sur le fichier pour le télécharger ou l'ouvrir dans un nouvel onglet

## Limitations

- **Taille maximale** : 10 Mo par fichier
- **Pas de prévisualisation** : Les images et PDF ne sont pas prévisualisés directement dans le chat
- **Un fichier à la fois** : Impossible d'envoyer plusieurs fichiers en même temps

## Sécurité

- Les fichiers sont stockés dans un bucket public Supabase
- Chaque fichier a un nom unique généré aléatoirement
- Les fichiers sont organisés par ID de client pour faciliter la gestion
- Aucune authentification requise pour le téléchargement (liens publics)

## Améliorations futures possibles

- Prévisualisation des images directement dans le chat
- Affichage des PDF en inline
- Support de l'envoi multiple (plusieurs fichiers à la fois)
- Compression automatique des images volumineuses
- Vignettes pour les images
- Possibilité de rechercher dans les fichiers envoyés
