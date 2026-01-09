-- Migration FINALE pour corriger tous les problèmes RLS sur events
-- Cette migration résout les problèmes de création ET modification d'événements

-- 1. S'assurer que RLS est activé
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes pour repartir de zéro
-- Note: On supprime toutes les politiques possibles pour éviter les conflits
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events';
    END LOOP;
END $$;

-- 3. Recréer toutes les politiques de manière simple et claire

-- SELECT : Tout le monde peut voir les événements (publics)
-- IMPORTANT: Spécifier explicitement TO anon, authenticated pour permettre l'accès public
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- INSERT : Les utilisateurs authentifiés peuvent créer leurs propres événements
-- IMPORTANT: Pas de TO authenticated, juste WITH CHECK
CREATE POLICY "Users can create own events" ON public.events
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Les utilisateurs peuvent modifier leurs propres événements
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Les admins peuvent modifier tous les événements
CREATE POLICY "Admins can update all events" ON public.events
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DELETE : Les utilisateurs peuvent supprimer leurs propres événements
CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE 
  USING (auth.uid() = user_id);

-- DELETE : Les admins peuvent supprimer tous les événements
CREATE POLICY "Admins can delete all events" ON public.events
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Note importante : 
-- - Les politiques n'utilisent plus "TO authenticated" car cela peut causer des problèmes
-- - La vérification d'authentification se fait via auth.uid() qui retourne NULL si non connecté
-- - Si auth.uid() est NULL, la condition auth.uid() = user_id échouera automatiquement
