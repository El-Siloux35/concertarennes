/**
 * Generate optimized image URL for Supabase Storage
 * Uses Supabase Image Transformation when available
 */

type ImageSize = 'thumbnail' | 'card' | 'detail' | 'full';

const IMAGE_SIZES: Record<ImageSize, { width: number; height: number }> = {
  thumbnail: { width: 200, height: 200 },
  card: { width: 400, height: 300 },
  detail: { width: 800, height: 600 },
  full: { width: 1200, height: 900 },
};

export function getOptimizedImageUrl(
  url: string | null | undefined,
  size: ImageSize = 'card',
  options?: { resize?: 'cover' | 'contain' }
): string | undefined {
  if (!url) return undefined;

  // Check if it's a Supabase storage URL
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const renderUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    const resize = options?.resize ?? 'cover';
    const { width, height } = IMAGE_SIZES[size];
    return `${renderUrl}?width=${width}&height=${height}&resize=${resize}&quality=75`;
  }

  return url;
}

/**
 * Generate srcset for responsive images
 */
export function getImageSrcSet(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const renderUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );

    return [
      `${renderUrl}?width=400&quality=75 400w`,
      `${renderUrl}?width=800&quality=75 800w`,
      `${renderUrl}?width=1200&quality=75 1200w`,
    ].join(', ');
  }

  return undefined;
}
