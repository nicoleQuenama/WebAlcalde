export type NoticiasCategoria = 'Gestión' | 'Cultura' | 'Obras' | 'Comunidad' | 'Medio Ambiente';

export interface Noticia {
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string;
  categoria: NoticiasCategoria;
  fecha: string; // ISO date
  imagen: string;
  imagenAlt: string;
  autor?: string;
  destacada?: boolean;
}

export interface NoticiasHeroProps {
  titulo: string;
  subtitulo?: string;
  ctaLabel: string;
  ctaHref: string;
  imagenSrc: string;
  imagenAlt: string;
}

export interface NoticiasCardProps {
  noticia: Noticia;
  eager?: boolean;
}
