-- Migration de diagnostic et correction finale
-- Exécutez cette migration pour vérifier et corriger les politiques RLS

-- 1. Vérifier l'état actuel des politiques
SELECT 
    policyname, 
    cmd, 
    qual, 
    with_check,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'events'
ORDER BY policyname;

-- 2. Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';

-- 3. Supprimer TOUTES les politiques existantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events';
    END LOOP;
END $$;

-- 4. S'assurer que RLS est activé
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 5. Recréer les politiques avec la syntaxe la plus simple possible

-- SELECT : Tout le monde peut voir
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT 
  USING (true);

-- INSERT : Les utilisateurs authentifiés peuvent créer
CREATE POLICY "Users can create own events" ON public.events
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Les utilisateurs peuvent modifier leurs propres événements
-- IMPORTANT: Utiliser USING et WITH CHECK pour UPDATE
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Les admins peuvent modifier tous les événements
CREATE POLICY "Admins can update all events" ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- DELETE : Les utilisateurs peuvent supprimer leurs propres événements
CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE 
  USING (auth.uid() = user_id);

-- DELETE : Les admins peuvent supprimer tous les événements
CREATE POLICY "Admins can delete all events" ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 6. Vérification finale
SELECT 
    policyname, 
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN 'SELECT'
        WHEN cmd = 'INSERT' THEN 'INSERT'
        WHEN cmd = 'UPDATE' THEN 'UPDATE'
        WHEN cmd = 'DELETE' THEN 'DELETE'
    END as operation
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'events'
ORDER BY cmd, policyname;
