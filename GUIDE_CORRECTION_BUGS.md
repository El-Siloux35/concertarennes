# Guide de correction des bugs

## 🔴 Problèmes identifiés

1. ❌ Modifier le username ne fonctionne pas
2. ❌ Uploader une photo de profil ne fonctionne pas
3. ❌ Supprimer un compte ne fonctionne pas
4. ❌ Supprimer un événement publié ne fonctionne pas
5. ⚠️ Page blanche lors de navigation (PWA)

## 🎯 Cause principale : Permissions manquantes

Comme ce matin avec la table `events`, les tables `profiles` et les buckets Storage (`avatars`, `event-images`) n'ont **pas les permissions GRANT** nécessaires !

---

## 🔧 Solution : Exécuter les migrations SQL

### Étape 1 : Fixer les permissions sur les tables

**Allez sur** : https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/sql/new

**Copiez et exécutez ce SQL** :

```sql
-- Permissions sur la table profiles (LE PROBLÈME PRINCIPAL !)
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Permissions sur la table user_roles
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Permissions sur toutes les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
```

### Étape 2 : Fixer les Storage Policies

**Dans le même SQL Editor, exécutez aussi** :

```sql
-- ============================================
-- BUCKET: avatars (photos de profil)
-- ============================================

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Créer nouvelles politiques
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- BUCKET: event-images (images d'événements)
-- ============================================

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their event images" ON storage.objects;

-- Créer nouvelles politiques
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND (storage.foldername(name))[1] = 'events'
);

CREATE POLICY "Users can update their event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

CREATE POLICY "Users can delete their event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
```

---

## 📋 Checklist de test après corrections

Après avoir exécuté les 2 migrations SQL :

### Tests à faire :

1. **Modifier le username** :
   - [ ] Allez sur `/compte`
   - [ ] Cliquez sur le crayon à côté du pseudo
   - [ ] Changez le pseudo
   - [ ] Cliquez sur la coche ✓
   - [ ] Vérifiez que ça s'enregistre

2. **Uploader une photo de profil** :
   - [ ] Cliquez sur l'icône caméra sur l'avatar
   - [ ] Sélectionnez une image
   - [ ] Vérifiez que l'image s'affiche

3. **Supprimer un événement** :
   - [ ] Allez sur `/compte`
   - [ ] Cliquez sur la poubelle d'un événement
   - [ ] Confirmez
   - [ ] Vérifiez que l'événement disparaît

4. **Supprimer le compte** :
   - [ ] En bas de `/compte`, cliquez sur "Supprimer mon compte"
   - [ ] Confirmez
   - [ ] **Note** : Pour que ça marche, il faut déployer l'Edge Function (voir ci-dessous)

---

## 🚀 Pour la suppression de compte (Edge Function)

La suppression de compte nécessite une Edge Function déployée. Deux options :

### Option A : Déployer l'Edge Function (COMPLET)

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier le projet
supabase link --project-ref pfvfssqlcfodwbsbiciu

# Déployer la fonction
supabase functions deploy delete-account
```

### Option B : Alternative temporaire (SIMPLE)

Je peux modifier le code pour que le bouton supprime seulement les données (profil + événements) mais garde le compte auth. L'utilisateur pourra ensuite se déconnecter manuellement.

---

## 🌐 Problème de page blanche (PWA)

Pour le problème de navigation PWA, je vais analyser :
- Le service worker
- La configuration du manifest
- Les routes React Router

**Après avoir fixé les permissions, dites-moi si le problème de page blanche persiste et je l'investiguerai.**

---

## ✅ Ordre d'exécution

1. **Exécutez l'Étape 1** (permissions tables)
2. **Exécutez l'Étape 2** (storage policies)
3. **Testez les fonctionnalités**
4. **Dites-moi ce qui fonctionne/ne fonctionne pas**
5. **On s'occupera ensuite de la suppression de compte et de la PWA**
