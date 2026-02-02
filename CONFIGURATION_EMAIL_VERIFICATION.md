# Configuration de la vérification d'email Supabase

## 🎯 Fonctionnalités

✅ Vérification d'email obligatoire à l'inscription par **code à 8 chiffres**
✅ L'utilisateur reçoit un email avec un code, le colle ou le saisit dans l'app
✅ Vérification automatique dès que 8 chiffres sont saisis (pas de bouton Valider)
✅ Connexion automatique + redirection vers `/home` avec toast "Connexion réussie"

## ⚙️ Configuration Supabase (OBLIGATOIRE)

### Étape 1 : Activer la confirmation d'email

1. **Allez sur** : https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/auth/providers
2. **Cliquez sur "Email" dans la liste des providers**
3. **Activez "Confirm email"** (toggle à ON)
4. **Cliquez sur "Save"**

### Étape 2 : Vérifier l'URL de redirection (optionnel pour OTP)

Avec le flux OTP (code à 6 chiffres), la redirection n'est plus utilisée. Vous pouvez conserver les URLs au cas où.

### Étape 3 : Template email avec CODE À 6 CHIFFRES (OBLIGATOIRE)

L'app utilise un code OTP à 8 chiffres (longueur par défaut Supabase), pas un lien. Le template doit inclure `{{ .Token }}`.

1. **Allez sur** : https://supabase.com/dashboard/project/pfvfssqlcfodwbsbiciu/auth/templates
2. **Cliquez sur "Confirm signup"**
3. **Remplacez le template par** (avec `{{ .Token }}` pour le code) :

```html
<h2>Vérifiez votre compte - L'agenda du 35</h2>

<p>Bonjour {{ .Data.pseudo }} !</p>

<p>Votre code de vérification (8 chiffres) :</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>

<p>Copiez ce code dans l'application pour confirmer votre inscription.</p>

<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>

<p>À bientôt ! 🎵</p>
```

4. **Cliquez sur "Save"**

> **Important** : `{{ .Token }}` envoie un code (8 chiffres par défaut). Ne pas utiliser `{{ .ConfirmationURL }}`.

### Variables disponibles pour personnaliser le template

| Variable | Description |
|----------|-------------|
| `{{ .Token }}` | Code OTP à 8 chiffres (pour vérification) |
| `{{ .ConfirmationURL }}` | Lien de confirmation (magic link) |
| `{{ .Email }}` | Email du destinataire |
| `{{ .SiteURL }}` | URL du site (configurée dans Supabase) |
| `{{ .Data.pseudo }}` | Pseudo (metadata passée à `signUp`) |
| `{{ .Data.xxx }}` | Tout champ dans `options.data` au signUp |

**Exemple avec pseudo :**
```html
<p>Bonjour {{ .Data.pseudo }} !</p>
<p>Votre code : {{ .Token }}</p>
```

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
