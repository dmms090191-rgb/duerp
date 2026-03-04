# Facture avec Paiement en 3 Fois

## Problème résolu

Les factures pour les paiements en 3 fois affichent désormais les 3 échéances avec les dates précises, contrairement aux factures en 1 fois qui affichent uniquement le montant total.

## Comment ça fonctionne

### Facture Paiement en 1 fois

La facture affiche :
- Montant HT
- TVA (20%)
- **TOTAL TTC**

### Facture Paiement en 3 fois

La facture affiche :
- Montant HT
- TVA (20%)
- **TOTAL TTC**
- **ÉCHÉANCIER DE PAIEMENT** avec les 3 échéances :
  - **1ère échéance** : À la date du paiement (aujourd'hui)
  - **2ème échéance** : Un mois après la première échéance
  - **3ème échéance** : Deux mois après la première échéance

Chaque échéance affiche le montant exact (Total TTC / 3) et la date précise au format JJ/MM/AAAA.

## Exemple de facture 3x

Pour un montant TTC de 450,00 € payé le 03/02/2026 :

```
TOTAL TTC : 450,00 €

ÉCHÉANCIER DE PAIEMENT
1ère échéance - 03/02/2026 : 150,00 €
2ème échéance - 03/03/2026 : 150,00 €
3ème échéance - 03/04/2026 : 150,00 €
```

## Modifications techniques

### 1. Fonction Edge `send-payment-confirmation`

La fonction a été modifiée pour :
- Accepter un nouveau paramètre `paymentType` ('1x' ou '3x')
- Générer une facture différente selon le type de paiement
- Afficher l'échéancier uniquement pour les paiements en 3 fois

### 2. Composants Frontend

**PaymentSuccess.tsx** (Paiement Stripe 1x) :
- Envoie `paymentType: '1x'` à la fonction edge

**PaymentSuccess3x.tsx** (Paiement Stripy 3x) :
- Envoie `paymentType: '3x'` à la fonction edge

### 3. Calcul des échéances

Le système calcule automatiquement :
- Le montant de chaque échéance : `montant_ttc / 3`
- La date de la 1ère échéance : Date du jour
- La date de la 2ème échéance : Date du jour + 1 mois
- La date de la 3ème échéance : Date du jour + 2 mois

Les dates sont affichées au format français (JJ/MM/AAAA).

## Déploiement

La fonction edge `send-payment-confirmation` a été déployée avec ces modifications.

Les changements sont actifs immédiatement pour tous les nouveaux paiements.

## Avantages

- **Transparence** : Le client voit exactement quand il sera prélevé
- **Clarté** : Les dates et montants sont précis
- **Conformité** : La facture indique clairement le mode de paiement échelonné
- **Traçabilité** : Le document peut être utilisé comme preuve de l'accord de paiement en 3 fois
