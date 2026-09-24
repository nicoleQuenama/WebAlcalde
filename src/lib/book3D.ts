import {
  ERA_WITH_PORTRAIT,
  GLOBAL_CLASS_BY_NAME,
  PHOTO_INDEX_CONTEXT_NEW_COCHABAMBA,
  PHOTO_INDEX_ERA1_INTRO,
  PHOTO_INDEX_ERA2_PORTRAIT,
  PHOTO_INDEX_PORTRAIT_PRESENTATION,
  PHOTO_INDEX_TODAY,
  PHOTO_INDEX_YESTERDAY,
  RESERVED_PORTRAITS,
  VIDEO_BY_SECTION,
} from '@constants/book/book3D';
import type { BookPages, IMG, Video } from '@type/book3D';
import type { Capitulo } from '@lib/db';

/**
 * Traduce un nombre "bonito" de elemento a la clase concreta que usa el libro:
 * los títulos de portada/páginas son clases globales (el FlipBook los escanea para
 * auto-generar el índice con `TITLE_RE`, por eso deben quedar sin hash); el resto
 * son clases locales del CSS module (`styles[c]`).
 */
export function bookClass(c: string, styles: Record<string, string>): string {
  return GLOBAL_CLASS_BY_NAME[c] ?? styles[c] ?? c;
}

/**
 * Traductor de nombres "bonitos" → clases concretas ya vinculado a un módulo CSS.
 * Cada página del libro lo usa para resolver sus `className` sin repetir el
 * `bookClass(c, styles)` en todos los componentes.
 */
export function createClasses(styles: Record<string, string>): (c: string) => string {
  return (c: string): string => bookClass(c, styles);
}

/**
 * Selector rotativo de fotos de contexto para las páginas de sección. Reparte en
 * orden circular las fotos NO reservadas (los retratos), sin repetir ninguna hasta
 * agotar el ciclo. Devuelve `undefined` cuando no hay fotos y nunca un retrato
 * reservado.
 */
export function createPhotoSelector(
  photos: readonly IMG[],
  reservedPortraits: readonly number[],
): () => IMG | undefined {
  if (!photos.length) return () => undefined;

  const freeIndices = photos.map((_, i) => i).filter((i) => !reservedPortraits.includes(i));
  if (!freeIndices.length) {
    const [photo] = photos;
    return () => photo;
  }

  let cursor = 0;
  return () => photos[freeIndices[cursor++ % freeIndices.length]];
}

/**
 * Fotos clave y selector rotativo para las páginas de apertura del libro (ver
 * `BookPages` en `src/types/book3D.ts`). Centraliza la derivación que vivía dentro
 * del componente `Book` y deja al componente solo con la composición de páginas.
 */
export function deriveBookPages(
  chapters: Capitulo[],
  photos: readonly IMG[],
): BookPages {
  const [presentation, growth, newCochabamba] = chapters;
  return {
    presentationChapter: presentation,
    growthChapter: growth,
    newCochabambaChapter: newCochabamba,
    // Fotos con más presencia del alcalde (retrato). El resto son de contexto.
    presentationPortrait: photos[PHOTO_INDEX_PORTRAIT_PRESENTATION],
    era2Portrait: photos[PHOTO_INDEX_ERA2_PORTRAIT] ?? photos[PHOTO_INDEX_PORTRAIT_PRESENTATION],
    era1IntroPhoto: photos[PHOTO_INDEX_ERA1_INTRO],
    newCochabambaContextPhoto: photos[PHOTO_INDEX_CONTEXT_NEW_COCHABAMBA],
    yesterdayPhoto: photos[PHOTO_INDEX_YESTERDAY],
    todayPhoto: photos[PHOTO_INDEX_TODAY],
    // Reparte el resto de fotos circularmente sin repetir los retratos ya usados.
    nextPhoto: createPhotoSelector(photos, RESERVED_PORTRAITS),
  };
}

/** Foto de apertura de una era: retrato propio para la era con retrato, contexto para la otra. */
export function eraIntroPhoto(
  eraId: string,
  era2Portrait: IMG | undefined,
  era1IntroPhoto: IMG | undefined,
): IMG | undefined {
  return eraId === ERA_WITH_PORTRAIT ? era2Portrait : era1IntroPhoto;
}

/** Video asignado a una sección por su `id` de temario (posiciones de `MEDIA.libro.videos`). */
export function sectionVideo(sectionId: string, videos: readonly Video[]): Video | undefined {
  const idx = VIDEO_BY_SECTION[sectionId];
  return idx != null ? videos[idx] : undefined;
}