/**
 * Tipos de la isla `ProyectosVisor` (/gestion#proyectos). El agrupado final
 * (categorías → obras) se arma en SSR desde `gestion.astro`, no acá.
 */

export interface VisorMedia {
  tipo: 'foto' | 'video';
  /** Foto optimizada (webp) o mp4 raw en el caso de video. */
  src: string;
  /** Thumb optimizada (foto o poster del video). */
  thumb: string;
  /** Poster del video (cuando `tipo === 'video'`). */
  poster?: string;
  alt?: string;
}

export interface VisorObra {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado?: string;
  /** Imagen pre-optimizada (webp). Ausente = placeholder sin <img>. */
  imagenSrc?: string;
  objectPosition?: string;
  /** Assets reales de la obra para la mini galería (vacío si no hay). */
  media: VisorMedia[];
}

export interface VisorCategoria {
  id: string;
  label: string;
  obras: VisorObra[];
}

export interface ProyectosVisorProps {
  categorias: VisorCategoria[];
}