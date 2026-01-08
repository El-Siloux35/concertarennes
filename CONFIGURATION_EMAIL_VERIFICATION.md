# Configuration de la vérification d'email Supabase

## 🎯 Fonctionnalités ajoutées

✅ Vérification d'email obligatoire à l'inscription
✅ Connexion automatique après clic sur le lien de confirmation
✅ Redirection vers `/home` après confirmation
✅ Messages clairs pour l'utilisateur
✅ Gestion des cas avec/sans confirmation d'email

## ⚙️ Configuration Supabase (OBLIGATOIRE)

### Étape 1 : Activer la confirmation d'email

1. **Allez sur** : https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/auth/providers
2. **Cliquez sur "Email" dans la liste des providers**
3. **Activez "Confirm email"** (toggle à ON)
4. **Cliquez sur "Save"**

### Étape 2 : Vérifier l'URL de redirection

1. **Allez sur** : https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/auth/url-configuration
2. **Dans "Redirect URLs"**, ajoutez vos URLs autorisées :
   ```
   http://localhost:8081/home
   http://localhost:5173/home
   https://votre-domaine-vercel.vercel.app/home
   https://votre-domaine-production.com/home
   ```
3. **Cliquez sur "Save"**

### Étape 3 : Personnaliser l'email de confirmation (optionnel)

1. **Allez sur** : https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/auth/templates
2. **Cliquez sur "Confirm signup"**
3. **Personnalisez le template** :

```html
<h2>Confirmez votre compte Concert Rennes</h2>

<p>Bonjour {{ .Data.pseudo }} !</p>

<p>Merci de vous être inscrit sur Concert Rennes. Cliquez sur le lien ci-dessous pour confirmer votre email et accéder à votre compte :</p>

<p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>

<p>Vous serez automatiquement connecté après avoir cliqué sur ce lien.</p>

<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>

<p>À bientôt sur Concert Rennes ! 🎵</p>
```

4. **Cliquez sur "Save"**

## 🔧 Modifications du code (DÉJÀ FAIT)

### Fichiers modifiés :

**`src/pages/Auth.tsx`** :
- ✅ Ajout de `useEffect` pour écouter les événements d'authentification
- ✅ Connexion automatique après confirmation d'email
- ✅ Message "Vérifiez votre email" après inscription
- ✅ Redirection vers `/home` après confirmation
- ✅ Gestion des cas avec/sans confirmation

## 🧪 Test du flow complet

### Test en local :

1. **Créez un nouveau compte** avec un email réel
2. **Vérifiez que vous voyez le message** : "Vérifiez votre email pour confirmer votre compte"
3. **Allez dans votre boîte mail** et ouvrez l'email de Supabase
4. **Cliquez sur le lien de confirmation**
5. **Vous devriez être redirigé vers** `/home` et **connecté automatiquement**
6. **Vérifiez que vous êtes bien connecté** (allez sur `/compte`)

### Si ça ne fonctionne pas :

**Problème : "Email link is invalid or has expired"**
- Solution : Vérifiez que l'URL de redirection est bien configurée dans Supabase

**Problème : Pas d'email reçu**
- Solution : Vérifiez vos spams
- Solution : Vérifiez que "Confirm email" est bien activé dans Supabase

**Problème : Pas de connexion automatique**
- Solution : Vérifiez que `emailRedirectTo` pointe vers `/home`
- Solution : Vérifiez que le `useEffect` dans `Auth.tsx` écoute bien `SIGNED_IN`

## 🚀 Déploiement en production

**N'oubliez pas d'ajouter vos URLs de production** dans les "Redirect URLs" de Supabase :
- `https://votre-domaine.com/home`
- `https://votre-domaine.vercel.app/home`

## 📧 Configuration email (SMTP - Optionnel)

Par défaut, Supabase utilise son propre serveur d'email (limité à 3 emails/heure en développement).

Pour la production, configurez votre propre SMTP :
1. **Auth** → **Settings** → **SMTP Settings**
2. Configurez avec SendGrid, Mailgun, Amazon SES, etc.

## ✅ Checklist finale

- [ ] "Confirm email" activé dans Supabase
- [ ] URLs de redirection ajoutées dans Supabase
- [ ] Email template personnalisé (optionnel)
- [ ] Test de création de compte effectué
- [ ] Email de confirmation reçu
- [ ] Connexion automatique après clic sur le lien
- [ ] Redirection vers `/home` fonctionnelle
