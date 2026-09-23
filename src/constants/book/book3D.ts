import { DEFAULT_FLIPBOOK_META } from '@lib/cms/defaults';
import type { BookMeta } from '@types/book3D';

/**
 * Metadatos por defecto del libro. ÚNICA fuente de verdad: los valores se toman de
 * `DEFAULT_FLIPBOOK_META` (en `src/lib/cms/defaults.ts`) para no desincronizarse con el CMS.
 */
export const DEFAULT_META: Required<BookMeta> = {
  coverBadge: DEFAULT_FLIPBOOK_META.coverBadge,
  coverTitle: DEFAULT_FLIPBOOK_META.coverTitle,
  coverSubtitle: DEFAULT_FLIPBOOK_META.coverSubtitle,
  backTitle: DEFAULT_FLIPBOOK_META.backTitle,
  backText: DEFAULT_FLIPBOOK_META.backText,
  antesDespuesCaption: DEFAULT_FLIPBOOK_META.antesDespuesCaption,
};

/**
 * Variantes de la animación de entrada del contenido por página (`data-reveal`).
 * Lo consumen `Book.module.css` (transiciones) y el FlipBook (escala el retardo
 * del `--delay` por elemento). `BASE` se renderiza como atributo vacío
 * (`data-reveal=""`), que es lo mismo que el `data-reveal` sin valor original.
 * Los VALORES (`left`/`right`/`zoom`) son claves CSS de `<Book.module.css>` y
 * no deben traducirse; solo cambia el nombre interno de la constante.
 */
export const REVEAL_EFFECT = {
  /** Entrada por defecto: sube sin desplazarse. */
  BASE: '',
  /** Entra deslizándose desde la izquierda. */
  LEFT: 'left',
  /** Entra deslizándose desde la derecha. */
  RIGHT: 'right',
  /** Aparece escalando desde 0.92. */
  ZOOM: 'zoom',
} as const;

/**
 * Qué video de `MEDIA.libro.videos` ilustra cada subsección del temario. La
 * clave es el `id` de la sección en `db.ts` (`src/lib/media.ts` define la misma
 * relación en `MEDIA.temario`); el valor, la posición dentro del array
 * `MEDIA.libro.videos`, cuyo orden es: 0 playa, 1 laguna, 2 terminal de buses,
 * 3 fexco, 4 market, 5 clínica veterinaria, 6 permiso de viaje.
 */
export const VIDEO_BY_SECTION: Record<string, number> = {
  'espejos-de-agua': 1, // videos[1] = "Laguna Alalay"
  vialidad: 2, // videos[2] = "Accesos a la nueva terminal de buses"
  alianzas: 3, // videos[3] = "FEXCO Arena"
  vanguardia: 4, // videos[4] = "Cocha Market"
  // Nota: videos[6] = "Permiso de Viaje Digital" (el de la "Clínica
  // Veterinaria Municipal" es el índice 5). Se conserva el valor original:
  // este refactor no cambia comportamiento; queda pendiente verificar qué
  // video debe acompañar a la sección `salud`.
  salud: 6,
};

/** Id de la era que abre con retrato del alcalde (la era 2021–2026). */
export const ERA_WITH_PORTRAIT = 'sonar-en-grande';

/** Caja máxima de obras visibles en la lista de una página del libro. */
export const VISIBLE_WORKS_LIMIT = 5;

/** Texto de la fila que resume las obras que no entraron en la página. */
export const REMAINING_WORKS_TEXT = (n: number): string =>
  `y ${n} obras más — el detalle completo está en la web`;

/** Icono del botón de reproducción de video (triángulo Unicode, sin librerías de íconos). */
export const PLAY_ICON = '▶';

/** Texto alternativo de la imagen de portada del libro. */
export const COVER_ALT = 'Cocha, la mejor ciudad de Bolivia';
/** Texto alternativo de la foto "Cochabamba de ayer" (strip antes/después). */
export const YESTERDAY_CITY_ALT = 'Cochabamba de ayer';
/** Texto alternativo de la foto "Cochabamba hoy" (strip antes/después). */
export const TODAY_CITY_ALT = 'Cochabamba hoy';

// ── Índices de `MEDIA.libro.fotos` (ver src/lib/media.ts) ───────────────────
/** Foto 0 · retrato de presentación del alcalde. */
export const PHOTO_INDEX_PORTRAIT_PRESENTATION = 0;
/** Foto 1 · "Cochabamba de ayer" (strip antes/después). */
export const PHOTO_INDEX_YESTERDAY = 1;
/** Foto 2 · "Cochabamba hoy" (strip antes/después). */
export const PHOTO_INDEX_TODAY = 2;
/** Foto 3 · contexto de "Una nueva Cochabamba" (alcalde con escolares). */
export const PHOTO_INDEX_CONTEXT_NEW_COCHABAMBA = 3;
/** Foto 4 · intro de la primera era (alcalde en un acto). */
export const PHOTO_INDEX_ERA1_INTRO = 4;
/** Foto 5 · retrato de la era "soñar en grande". */
export const PHOTO_INDEX_ERA2_PORTRAIT = 5;

/** Retratos reservados que el selector rotativo no debe repetir. */
export const RESERVED_PORTRAITS: readonly number[] = [
  PHOTO_INDEX_PORTRAIT_PRESENTATION,
  PHOTO_INDEX_ERA2_PORTRAIT,
];

/**
 * Nombres "bonitos" de portada que el FlipBook detecta en el `className` para
 * auto-generar el índice (`TITLE_RE` en `src/lib/flipBook.ts`): deben quedar sin hash.
 */
export const GLOBAL_CLASS_BY_NAME: Record<string, string> = {
  coverTitle: 'cover-title',
  pageTitle: 'page-title',
  backTitle: 'back-title',
};