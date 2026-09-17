/**
 * Generate optimized image URL for Supabase Storage
 * Uses Supabase Image Transformation when available
 *
 * Les transformations d'image (/render/image/) sont une fonctionnalité payante
 * de Supabase : sur un projet sans cette option, l'endpoint répond 403
 * FeatureNotEnabled et aucune image ne s'affiche. On ne les utilise donc que si
 * VITE_SUPABASE_IMAGE_TRANSFORM=true, sinon on sert l'image d'origine.
 */

type ImageSize = 'thumbnail' | 'card' | 'detail' | 'full';

const IMAGE_SIZES: Record<ImageSize, { width: number; height: number }> = {
  thumbnail: { width: 200, height: 200 },
  card: { width: 400, height: 300 },
  detail: { width: 800, height: 600 },
  full: { width: 1200, height: 900 },
};

const PUBLIC_OBJECT_PATH = '/storage/v1/object/public/';
const RENDER_IMAGE_PATH = '/storage/v1/render/image/public/';

const TRANSFORM_ENABLED =
  import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORM === 'true';

function canTransform(url: string): boolean {
  return (
    TRANSFORM_ENABLED &&
    url.includes('supabase.co') &&
    url.includes(PUBLIC_OBJECT_PATH)
  );
}

export function getOptimizedImageUrl(
  url: string | null | undefined,
  size: ImageSize = 'card',
  options?: { resize?: 'cover' | 'contain' }
): string | undefined {
  if (!url) return undefined;

  if (canTransform(url)) {
    const renderUrl = url.replace(PUBLIC_OBJECT_PATH, RENDER_IMAGE_PATH);
    const resize = options?.resize ?? 'cover';
    const { width, height } = IMAGE_SIZES[size];
    return `${renderUrl}?width=${width}&height=${height}&resize=${resize}&quality=75`;
  }

  return url;
}

/**
 * Generate srcset for responsive images
 */
export function getImageSrcSet(
  url: string | null | undefined
): string | undefined {
  if (!url) return undefined;

  if (!canTransform(url)) return undefined;

  const renderUrl = url.replace(PUBLIC_OBJECT_PATH, RENDER_IMAGE_PATH);

  return [
    `${renderUrl}?width=400&quality=75 400w`,
    `${renderUrl}?width=800&quality=75 800w`,
    `${renderUrl}?width=1200&quality=75 1200w`,
  ].join(', ');
}
