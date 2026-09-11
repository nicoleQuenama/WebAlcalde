import type { Encuadre, AjusteCarrusel } from '@lib/ajusteImagen';
export interface TarjetaImagen {
  id: number | string;
  src: string;
  /** Texto opcional que se muestra sobre la tarjeta y en la galería. */
  titulo?: string;
  /** Dimensiones reales de la foto (para optimizarla sin deformar). */
  w?: number;
  h?: number;
  encuadre?: Encuadre;
  zoomOut?: boolean;
  ajuste?: AjusteCarrusel;
}

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