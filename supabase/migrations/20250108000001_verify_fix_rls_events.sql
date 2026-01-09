-- Migration de vérification et correction complète des politiques RLS pour events
-- Exécutez cette migration si vous avez toujours des erreurs de permission

-- 1. S'assurer que RLS est activé
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
DROP POLICY IF EXISTS "Admins can update all events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;
DROP POLICY IF EXISTS "Users can create own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- 3. Recréer toutes les politiques nécessaires

-- SELECT : Tout le monde peut voir les événements (publics)
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

-- Note importante : 
-- - Les politiques UPDATE et DELETE nécessitent TO authenticated (utilisateur connecté)
-- - La fonction has_role doit exister et fonctionner correctement
-- - Vérifiez que vous êtes bien connecté avant de modifier un événement
