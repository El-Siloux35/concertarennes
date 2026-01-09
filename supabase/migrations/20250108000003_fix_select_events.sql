-- Migration pour corriger le problème de SELECT sur events
-- Si vous ne voyez plus aucun événement, exécutez cette migration

-- 1. Vérifier et supprimer la politique SELECT existante
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;

-- 2. Recréer la politique SELECT pour permettre à TOUT LE MONDE de voir les événements
-- IMPORTANT: Cette politique doit permettre l'accès anonyme (anon) ET authentifié (authenticated)
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Alternative si la première ne fonctionne pas (sans spécifier TO)
-- Si la politique ci-dessus ne fonctionne pas, essayez celle-ci :
-- DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
-- CREATE POLICY "Anyone can view events" ON public.events
--   FOR SELECT 
--   USING (true);

-- Vérification : Exécutez cette requête pour voir si les événements sont accessibles
-- SELECT COUNT(*) FROM public.events;
