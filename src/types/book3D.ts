import type { ReactNode } from 'react';
import type { Capitulo, EraTemario } from '@lib/db';

/** Foto simple para las páginas del libro (portada, contexto y retratos). */
export interface IMG {
  src: string;
  alt: string;
}

/** Video del temario insertado en una página del libro. */
export interface Video {
  src: string;
  alt: string;
}

/** Textos editables de portada/contraportada (CMS beta) — si faltan, usa DEFAULT_META. */
export interface BookMeta {
  coverBadge?: string;
  coverTitle?: string;
  coverSubtitle?: string;
  backTitle?: string;
  backText?: string;
  antesDespuesCaption?: string;
}

/**
 * Fotos clave y selector rotativo derivados para las páginas de apertura del
 * libro. Centraliza la derivación que vivía dentro del componente `Book`
 * (índices de `MEDIA.libro.fotos`, ver `src/lib/media.ts`).
 */
export interface BookPages {
  presentationChapter: Capitulo;
  growthChapter: Capitulo;
  newCochabambaChapter: Capitulo;
  presentationPortrait?: IMG;
  era2Portrait: IMG | undefined;
  era1IntroPhoto?: IMG;
  newCochabambaContextPhoto?: IMG;
  yesterdayPhoto?: IMG;
  todayPhoto?: IMG;
  nextPhoto: () => IMG | undefined;
}

/** Props del componente `Book` (páginas interiores del FlipBook 3D). */
export interface BookProps {
  /** Imagen de portada. */
  coverImage: string;
  /** Capítulos de apertura (presentación, crecimiento, nueva Cochabamba). */
  chapters: Capitulo[];
  /** Las dos eras de obras completas (años 90 y 2021–2026). */
  eras: EraTemario[];
  /** Fotos disponibles para ilustrar páginas (alcalde + gente). */
  photos: IMG[];
  /** Videos en orden del temario: playa, laguna, terminal, fexco, market, vet, permiso. */
  videos: Video[];
  /** Textos editables de portada/contraportada (CMS beta) — sin valor, usa los de siempre. */
  meta?: BookMeta;
  children?: ReactNode;
}