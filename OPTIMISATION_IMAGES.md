# Optimisation des images uploadées

## Ce qui est en place

### 1. Redimensionnement côté client (avant upload)

**Événements** (`CreateEvent`, `EditEvent`) :
- Max 1200×1200 px, qualité JPEG 0.8
- Réduction automatique tout en conservant le ratio

**Avatars** (`Compte`) :
- Max 400×400 px, qualité JPEG 0.85
- Fichiers plus légers pour les photos de profil

### 2. Affichage optimisé (après stockage)

- **Supabase Image Transformation** (désactivé par défaut) : `getOptimizedImageUrl()` génère des URLs avec `width`, `height`, `resize`, `quality`
- **srcset** : `getImageSrcSet()` pour le responsive (400w, 800w, 1200w)
- **Lazy loading** : `loading="lazy"` sur les images des cards et du détail

> ⚠️ Les transformations d'image (`/storage/v1/render/image/...`) sont une **option payante Supabase**.
> Sur un projet qui ne l'a pas, l'endpoint renvoie `403 FeatureNotEnabled` et **aucune image ne s'affiche**.
> Elles sont donc désactivées par défaut : `getOptimizedImageUrl()` renvoie l'URL d'origine et
> `getImageSrcSet()` renvoie `undefined`.
>
> Pour les réactiver (une fois l'option active côté Supabase), définir la variable d'env
> (en local dans `.env`, et sur Vercel dans les Environment Variables) :
>
> ```
> VITE_SUPABASE_IMAGE_TRANSFORM=true
> ```

## Pistes supplémentaires (optionnel)

### Limite de taille côté client

```tsx
// Dans handleImageChange, avant setImageFile :
const MAX_MB = 5;
if (file.size > MAX_MB * 1024 * 1024) {
  toast({ title: "Fichier trop volumineux", description: `Max ${MAX_MB} Mo`, variant: "destructive" });
  return;
}
```

### Edge Function Supabase (post-processing)

Traiter les images après upload via une Edge Function qui :
1. Reçoit l’événement d’upload (Storage webhook)
2. Redimensionne/compresse avec Sharp (Deno)
3. Remplace le fichier original par la version optimisée

Utile si tu veux garantir une qualité constante même avec des clients qui ne redimensionnent pas.

### Politique de taille Supabase

Dans le Dashboard Supabase → Storage → Policies, tu peux définir une limite de taille par fichier pour éviter les uploads trop lourds.
