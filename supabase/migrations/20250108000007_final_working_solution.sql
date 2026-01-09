-- Solution FINALE qui devrait fonctionner
-- Cette migration utilise une approche différente pour les politiques UPDATE

-- 1. S'assurer que RLS est activé
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events';
    END LOOP;
END $$;

-- 3. Recréer les politiques avec une syntaxe qui fonctionne à coup sûr

-- SELECT : Tout le monde peut voir
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT 
  USING (true);

-- INSERT : Les utilisateurs authentifiés peuvent créer
CREATE POLICY "Users can create own events" ON public.events
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Solution simplifiée - les utilisateurs peuvent modifier leurs propres événements
-- On utilise seulement USING (pas de WITH CHECK) pour éviter les problèmes
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- UPDATE : Les admins peuvent modifier tous les événements
-- Utilisation directe de la table user_roles au lieu de la fonction
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

-- Vérification : Testez maintenant la modification d'un événement
-- Si ça ne fonctionne toujours pas, le problème vient peut-être de l'authentification
-- Vérifiez dans la console du navigateur que vous êtes bien connecté
