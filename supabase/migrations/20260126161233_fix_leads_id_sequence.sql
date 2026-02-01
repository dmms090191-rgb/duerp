/*
  # Créer séquence pour les IDs de la table leads
  
  ## Résumé
  La table leads utilise SERIAL mais la séquence n'existe pas. Cette migration
  recrée la séquence et configure l'ID pour démarrer à 10000.
  
  ## Actions
  - Crée la séquence leads_id_seq si elle n'existe pas
  - Configure la valeur de départ à 10000
  - Associe la séquence à la colonne id de leads
  - Configure la valeur par défaut de la colonne
  
  ## Notes
  - Les IDs existants ne sont pas affectés
  - Les nouveaux leads commenceront à 10000
*/

-- Créer la séquence si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'leads_id_seq') THEN
    CREATE SEQUENCE leads_id_seq START WITH 10000;
    
    -- Associer la séquence à la colonne
    ALTER TABLE leads ALTER COLUMN id SET DEFAULT nextval('leads_id_seq');
    
    -- Définir la propriété de la séquence
    ALTER SEQUENCE leads_id_seq OWNED BY leads.id;
    
    -- Ajuster la séquence en fonction des IDs existants
    PERFORM setval('leads_id_seq', COALESCE((SELECT MAX(id) FROM leads), 9999) + 1, false);
  END IF;
END $$;