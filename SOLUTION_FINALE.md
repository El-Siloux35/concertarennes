# Solution finale - Problème de création/modification d'événements

## 🎯 Problème résolu

Les boutons de création et modification d'événements ne fonctionnaient pas avec l'erreur :
```
permission denied for table events
```

## 🔍 Cause du problème

Le problème n'était **PAS** les politiques RLS, mais les **permissions PostgreSQL de base** :
- Les rôles `anon` et `authenticated` (utilisés par Supabase pour les requêtes client) n'avaient pas les permissions `SELECT`, `INSERT`, `UPDATE`, `DELETE` sur la table `events`
- Même avec RLS désactivé, les requêtes échouaient

## ✅ Solution appliquée

### 1. Permissions PostgreSQL de base (GRANT)
```sql
GRANT ALL ON public.events TO anon;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

### 2. Configuration RLS sécurisée
Après avoir appliqué les GRANT, RLS a été réactivé avec les politiques suivantes :

- **SELECT** : Tout le monde peut voir les événements publiés, les utilisateurs voient leurs brouillons, les admins voient tout
- **INSERT** : Les utilisateurs authentifiés peuvent créer leurs propres événements, les admins peuvent créer pour tout le monde
- **UPDATE** : Les propriétaires et admins peuvent modifier
- **DELETE** : Les propriétaires et admins peuvent supprimer

### 3. Corrections du code

**EditEvent.tsx** (ligne 244-262) :
- Remplacé l'appel RPC inexistant `update_event_safe` par une requête `.update()` standard

**CreateEvent.tsx** (lignes 164-190) :
- Amélioré la gestion d'erreur avec messages explicites

## 📁 Fichiers modifiés

- `src/pages/CreateEvent.tsx` - Amélioration gestion d'erreur
- `src/pages/EditEvent.tsx` - Remplacement RPC par UPDATE standard
- `supabase/migrations/20250108140000_enable_rls_with_grants.sql` - Migration finale appliquée

## 🧪 Tests validés

✅ Authentification fonctionnelle
✅ Session active maintenue
✅ INSERT d'événements
✅ UPDATE d'événements
✅ DELETE d'événements
✅ RLS activé et sécurisé

## 🚀 Production

Pour déployer en production, assurez-vous que :
1. La migration `20250108140000_enable_rls_with_grants.sql` est appliquée sur votre base de production
2. Les permissions GRANT sont en place
3. RLS est activé (`rowsecurity = true`)

## 📝 Leçon apprise

Supabase nécessite **DEUX niveaux de permissions** :
1. **Permissions PostgreSQL (GRANT)** : Permettent au rôle d'accéder à la table
2. **Politiques RLS** : Définissent qui peut voir/modifier quelles lignes

Les deux sont nécessaires et indépendants !
