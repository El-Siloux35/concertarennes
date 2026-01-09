-- Migration de test et correction pour le problème d'authentification RLS
-- Le problème : auth.uid() ne semble pas fonctionner correctement dans les politiques UPDATE

-- 1. Vérifier que RLS est activé
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events';
    END LOOP;
END $$;

-- 3. Test : Vérifier que auth.uid() fonctionne
-- Exécutez cette requête en étant connecté pour voir si auth.uid() retourne votre ID
-- SELECT auth.uid() as current_user_id;

-- 4. Recréer les politiques avec une approche différente

-- SELECT : Tout le monde peut voir
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT 
  USING (true);

-- INSERT : Les utilisateurs authentifiés peuvent créer
CREATE POLICY "Users can create own events" ON public.events
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Solution alternative - permettre à tous les utilisateurs authentifiés de modifier
-- puis vérifier côté application (mais ce n'est pas idéal pour la sécurité)
-- On va essayer une politique plus permissive d'abord pour tester
CREATE POLICY "Authenticated users can update events" ON public.events
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ATTENTION : La politique ci-dessus est trop permissive (tous les utilisateurs authentifiés peuvent modifier tous les événements)
-- C'est juste pour tester si le problème vient de auth.uid()
-- Si ça fonctionne avec cette politique, on saura que le problème vient de la condition auth.uid() = user_id

-- DELETE : Les utilisateurs peuvent supprimer leurs propres événements
CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE 
  USING (auth.uid() = user_id);

-- DELETE : Les admins peuvent supprimer tous les événements
CREATE POLICY "Admins can delete all events" ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::app_role
    )
  );

-- Note: Si la politique UPDATE permissive fonctionne, on saura que le problème vient de auth.uid() = user_id
-- Dans ce cas, on devra utiliser une fonction SECURITY DEFINER pour contourner le problème
