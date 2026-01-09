-- Migration complète pour fixer TOUTES les permissions GRANT
-- Version corrigée - À exécuter dans Supabase SQL Editor

-- 1. Permissions sur la table events (déjà fait normalement)
GRANT ALL ON public.events TO anon;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

-- 2. Permissions sur la table profiles (MANQUANT - LE PLUS IMPORTANT !)
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

-- Succès ! Les permissions sont maintenant configurées.
