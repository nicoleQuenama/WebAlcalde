import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

export interface PlacaDolly {
  /** Identificador estable para las key de React (ej. "historia-0"). */
  id: string;
  anio: string;
  etapa: string;
  titulo: string;
  descripcion: string;
  /** URL optimizada (webp) de la foto del hito. */
  imagen: string;
  alt: string;
  /** Encuadre por foto (misma lógica que el carrusel, ver ajusteImagen). */
  objectPosition: string;
}

export interface TabDolly {
  id: string;
  label: string;
  placas: PlacaDolly[];
  /** Imágenes a tamaño real para el modal de ampliar. */
  galeria: { src: string; titulo?: string }[];
}

/** Nodos del escenario 3D que la cámara muta por frame (sin re-renders). */
export interface DollyRefs {
  escenario: RefObject<HTMLDivElement | null>;
  placas: RefObject<(HTMLDivElement | null)[]>;
  relleno: RefObject<HTMLDivElement | null>;
  pulgar: RefObject<HTMLDivElement | null>;
  info: RefObject<HTMLDivElement | null>;
}

/** API del carrusel móvil expuesta por useTimelineMovil. */
export interface CarruselMovil {
  indice: number;
  pista: RefObject<HTMLDivElement | null>;
  barra: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onTapDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onTapUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onTapCancel: () => void;
}