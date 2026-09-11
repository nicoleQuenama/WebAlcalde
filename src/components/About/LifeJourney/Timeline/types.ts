
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