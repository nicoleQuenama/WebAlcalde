import type { Encuadre, AjusteCarrusel } from '@lib/ajusteImagen';
/**
 * Imagen del carrusel del hero, misma foto con opciones de
 * encuadre/zoom. Ver `src/lib/ajusteImagen.ts`.
 */
export interface TarjetaImagen {
  id: number | string;
  src: string;
  /** Texto opcional que se muestra sobre la tarjeta y en la galería. */
  titulo?: string;
  /** Dimensiones reales de la foto (para optimizarla sin deformar). */
  w?: number;
  h?: number;
  encuadre?: Encuadre;
  /**
   * Zoom out en la card: alarga la zona visible (menos recorte arriba/abajo).
   * Solo aplica a la card, NO al modal.
   */
  zoomOut?: boolean;
  /**
   * Valores EXACTOS de ajuste por imagen (tal como los copias del playground).
   * Tienen prioridad sobre `encuadre`/`zoomOut`.
   * Ejemplo: { objectFit: 'cover', objectPosition: '46% 40%', scale: 1.18 }
   */
  ajuste?: AjusteCarrusel;
}

/**
 * Props del componente Hero.astro (wrapper reutilizable).
 */
export interface HeroProps {
  /** URL de la imagen panorámica de fondo (ya optimizada en build). */
  fondoSrc: string;
  /** Texto eyebrow (ej: "Cocha, la mejor ciudad de Bolivia"). */
  eyebrow: string;
  /** Título principal (h1). */
  titulo: string;
  /** Subtítulo opcional debajo del título. */
  subtitulo?: string;
  /** Quote/frase opcional con estilo italic y borde accent. */
  quote?: string;
}

/* manejar uno solo*/