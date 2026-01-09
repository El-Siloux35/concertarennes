-- Migration COMPLÈTE pour corriger TOUS les problèmes RLS sur events
-- Cette migration corrige : création, modification, suppression ET affichage des événements
-- Exécutez cette migration dans Supabase SQL Editor

-- 1. S'assurer que RLS est activé
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes pour repartir de zéro
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events';
    END LOOP;
END $$;

-- 3. Recréer toutes les politiques correctement

-- SELECT : Tout le monde peut voir les événements (publics)
-- IMPORTANT: Spécifier TO anon, authenticated pour permettre l'accès public
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- INSERT : Les utilisateurs authentifiés peuvent créer leurs propres événements
CREATE POLICY "Users can create own events" ON public.events
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Les utilisateurs peuvent modifier leurs propres événements
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Les admins peuvent modifier tous les événements
CREATE POLICY "Admins can update all events" ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DELETE : Les utilisateurs peuvent supprimer leurs propres événements
CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- DELETE : Les admins peuvent supprimer tous les événements
CREATE POLICY "Admins can delete all events" ON public.events
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Vérification : Après avoir exécuté cette migration, testez :
-- 1. Voir les événements (devrait fonctionner pour tout le monde)
-- 2. Créer un événement (devrait fonctionner si connecté)
-- 3. Modifier un événement (devrait fonctionner si vous êtes le propriétaire)
-- 4. Supprimer un événement (devrait fonctionner si vous êtes le propriétaire)
