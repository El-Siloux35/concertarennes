-- ⚠️ ATTENTION : Désactivation temporaire de RLS
-- Cette migration désactive RLS sur la table events
-- UTILISEZ UNIQUEMENT EN DÉVELOPPEMENT ou si vous avez absolument besoin
-- 
-- ⚠️ SÉCURITÉ : Sans RLS, n'importe qui peut modifier/supprimer n'importe quel événement
-- ⚠️ RECOMMANDATION : Ne pas utiliser en production

-- Désactiver RLS sur events
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Note: Pour réactiver RLS plus tard, exécutez :
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- Puis réexécutez la migration 20250108000005_diagnostic_and_fix.sql
