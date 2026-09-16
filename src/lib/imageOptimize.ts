import { getImage } from 'astro:assets';

export const getOptimizedImageSrc = async (
  src: string,
  width: number,
  w?: number,
  h?: number,
  quality?: number,
): Promise<string> => {
  const height = w && h ? Math.max(1, Math.round((width * h) / w)) : undefined;
  const result = await getImage({
    src,
    width,
    ...(height ? { height } : {}),
    ...(quality ? { quality } : {}),
    fit: 'cover',
    format: 'webp',
  });
  return result.src;
};

export const getHeroImageSrc = async (src: string): Promise<string> =>
  getOptimizedImageSrc(src, 900);

export const getBookImageSrc = async (src: string, w?: number, h?: number): Promise<string> =>
  getOptimizedImageSrc(src, 700, w, h);

export const getCarouselImageSrc = async (src: string, w?: number, h?: number): Promise<string> =>
  getOptimizedImageSrc(src, 900, w, h);

/** Ancho y alto exactos, sin `fit` (para fondos/posters cuyo alto ya viene calculado con la proporción real). */
export const getExactSizeImageSrc = async (
  src: string,
  width: number,
  height: number,
  quality?: number,
): Promise<string> => {
  const result = await getImage({
    src,
    width,
    height,
    ...(quality ? { quality } : {}),
    format: 'webp',
  });
  return result.src;
};

/** Imagen del comparador antes/después: alto explícito si se conoce, si no lo infiere de la fuente. */
export const getComparadorImageSrc = async (src: string, height?: number): Promise<string> => {
  const result = await getImage({
    src,
    width: 1200,
    inferSize: !height,
    ...(height ? { height } : {}),
    format: 'webp',
  });
  return result.src;
};
