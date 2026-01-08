-- Migration finale : Réactiver RLS avec les permissions GRANT correctes
-- Cette migration restaure la sécurité tout en gardant les permissions nécessaires

-- 1. S'assurer que les permissions GRANT sont en place (au cas où)
GRANT ALL ON public.events TO anon;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 2. Réactiver RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can create own events" ON public.events;
DROP POLICY IF EXISTS "Admins can create events for anyone" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Admins can update all events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete all events" ON public.events;

-- 4. Créer les politiques SELECT
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT
  USING (is_draft = false OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 5. Créer les politiques INSERT
CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create events for anyone" ON public.events
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Créer les politiques UPDATE
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all events" ON public.events
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Créer les politiques DELETE
CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all events" ON public.events
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
