-- Migration complète pour fixer TOUTES les permissions GRANT
-- À exécuter dans Supabase SQL Editor

-- 1. Permissions sur la table events (déjà fait normalement)
GRANT ALL ON public.events TO anon;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

-- 2. Permissions sur la table profiles (MANQUANT !)
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3. Permissions sur la table user_roles
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4. Permissions sur toutes les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. Permissions sur le bucket de storage "avatars"
-- Note: Les permissions de storage se gèrent différemment, via les Storage Policies

-- 6. Permissions sur le bucket de storage "event-images"
-- Note: Les permissions de storage se gèrent différemment, via les Storage Policies

-- Vérification des permissions
SELECT
  schemaname,
  tablename,
  array_agg(DISTINCT privilege_type) as privileges
FROM information_schema.table_privileges
WHERE schemaname = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY schemaname, tablename
ORDER BY tablename;
