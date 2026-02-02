# Déployer la suppression de compte

L'app utilise le projet Supabase : **pfvfssqlcfodwbsbiciu**

- **« Failed to send a request »** : la fonction n'est pas déployée
- **« Edge Function returned a non-2xx status code »** : la fonction tourne mais renvoie une erreur. Redéployez avec le code mis à jour (JWT explicite + messages d'erreur détaillés)

## Option 1 : Via le Dashboard Supabase

1. Ouvrez : https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/functions

2. Cliquez **Create a new function**

3. Nom de la fonction : `delete-account`

4. Collez le contenu du fichier `supabase/functions/delete-account/index.ts`

5. Cliquez **Deploy**

## Option 2 : Via le CLI Supabase

```bash
# 1. Lier le projet correct
npx supabase link --project-ref pfvfssqlcfodwbsbiciu

# 2. Déployer la fonction
npx supabase functions deploy delete-account
```

## Vérification

Après déploiement, réessayez « Supprimer mon compte » depuis la page profil.
