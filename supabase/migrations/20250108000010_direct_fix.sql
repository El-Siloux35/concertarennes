-- Solution DIRECTE pour corriger le problème UPDATE
-- Basée sur les logs qui montrent que l'utilisateur est bien authentifié et propriétaire

-- 1. S'assurer que RLS est activé
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques UPDATE existantes
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Admins can update all events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Users can update events with function" ON public.events;

-- 3. Créer une politique UPDATE simple qui devrait fonctionner
-- On utilise seulement USING (pas de WITH CHECK) car WITH CHECK peut causer des problèmes
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE 
  USING (
    -- L'utilisateur est connecté ET est le propriétaire
    (auth.uid() IS NOT NULL) AND (auth.uid() = user_id)
  );

-- 4. Politique pour les admins
CREATE POLICY "Admins can update all events" ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::app_role
    )
  );

-- 5. Vérification : Testez si auth.uid() fonctionne
-- Dans Supabase SQL Editor, exécutez cette requête en étant connecté :
-- SELECT auth.uid() as my_user_id, 
--        (SELECT user_id FROM events LIMIT 1) as event_user_id,
--        (auth.uid() = (SELECT user_id FROM events LIMIT 1)) as match;

-- Si cette requête retourne NULL pour my_user_id, c'est que auth.uid() ne fonctionne pas dans ce contexte
-- Dans ce cas, utilisez la migration 20250108000009 qui utilise une fonction SECURITY DEFINER
