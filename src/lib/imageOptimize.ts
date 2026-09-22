import { getImage } from 'astro:assets';

/** Ancho fijo del comparador antes/después (también para calcular altos proporcionales). */
export const COMPARADOR_ANCHO = 1200;

/**
 * Envuelve `getImage` con degradación controlada: si el fetch/optimización del
 * remoto falla (bucket fuera de cuota, timeouts…), NO tumba el render SSR,
 * devuelve el `src` original y loguea un warning.
 */
const conFallback = async (
  src: string,
  optimizar: () => Promise<{ src: string }>,
): Promise<string> => {
  try {
    const result = await optimizar();
    return result.src;
  } catch (error) {
    console.warn(
      `[imageOptimize] No se pudo optimizar la imagen, se usa el original: ${src}`,
      error,
    );
    return src;
  }
};

export const getOptimizedImageSrc = async (
  src: string,
  width: number,
  w?: number,
  h?: number,
  quality?: number,
): Promise<string> => {
  const height = w && h ? Math.max(1, Math.round((width * h) / w)) : undefined;
  return conFallback(src, () =>
    getImage({
      src,
      width,
      ...(height ? { height } : {}),
      ...(quality ? { quality } : {}),
      fit: 'cover',
      format: 'webp',
    }),
  );
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
  return conFallback(src, () =>
    getImage({
      src,
      width,
      height,
      ...(quality ? { quality } : {}),
      format: 'webp',
    }),
  );
};

/**
 * Imagen del comparador antes/después: siempre con alto explícito — nunca
 * `inferSize` sobre remotos (fetcheo de dimensiones frágil, ver REFACTOR.md §2.3).
 * Sin alto conocido no se optimiza: se devuelve el original sin tocar.
 */
export const getComparadorImageSrc = async (src: string, height?: number): Promise<string> => {
  if (!height) {
    console.warn(
      `[imageOptimize] Comparador sin alto conocido, se usa el original sin optimizar: ${src}`,
    );
    return src;
  }
  return conFallback(src, () =>
    getImage({
      src,
      width: COMPARADOR_ANCHO,
      height,
      format: 'webp',
    }),
  );
};
