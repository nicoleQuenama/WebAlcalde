export interface Noticia {
  id: number | string;
  src: string;
  titulo: string;
}

export interface NewCardProps {
  noticias: Noticia[];
}
