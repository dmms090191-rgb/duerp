/*
  # Créer séquence pour les IDs de la table clients
  
  ## Résumé
  La table clients utilise SERIAL mais la séquence n'existe pas. Cette migration
  recrée la séquence et configure l'ID pour démarrer à 10000.
  
  ## Actions
  - Crée la séquence clients_id_seq si elle n'existe pas
  - Configure la valeur de départ à 10000
  - Associe la séquence à la colonne id de clients
  - Configure la valeur par défaut de la colonne
  
  ## Notes
  - Les IDs existants ne sont pas affectés
  - Les nouveaux clients commenceront à 10000 ou après le max existant
*/

-- Créer la séquence si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'clients_id_seq') THEN
    CREATE SEQUENCE clients_id_seq START WITH 10000;
    
    -- Associer la séquence à la colonne
    ALTER TABLE clients ALTER COLUMN id SET DEFAULT nextval('clients_id_seq');
    
    -- Définir la propriété de la séquence
    ALTER SEQUENCE clients_id_seq OWNED BY clients.id;
    
    -- Ajuster la séquence en fonction des IDs existants
    PERFORM setval('clients_id_seq', COALESCE((SELECT MAX(id) FROM clients), 9999) + 1, false);
  END IF;
END $$;