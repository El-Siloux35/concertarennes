-- Réactiver RLS sur push_subscriptions (sécurité)
-- La migration 20260122011000 avait désactivé RLS pour tests, on le réactive

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Vérifier que les policies existent toujours (les recréer si nécessaire)
-- DROP IF EXISTS pour éviter les erreurs si elles existent déjà

DROP POLICY IF EXISTS "Anyone can insert subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Service role can read all subscriptions" ON public.push_subscriptions;

-- INSERT: Utilisateurs authentifiés avec leur user_id, ou anonymes avec null
CREATE POLICY "Anyone can insert subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (user_id IS NULL)
  );

-- SELECT: Utilisateurs voient leurs propres subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- DELETE: Utilisateurs suppriment leurs propres subscriptions
CREATE POLICY "Users can delete own subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- UPDATE: Utilisateurs mettent à jour leurs propres subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Service role peut lire toutes les subscriptions (pour envoyer les notifications)
CREATE POLICY "Service role can read all subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  TO service_role
  USING (true);
