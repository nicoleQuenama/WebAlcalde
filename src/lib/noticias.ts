import { MEDIA } from './media';
import type { Noticia } from '@types/noticias';

export const NOTICIAS_CATEGORIAS: Noticia['categoria'][] = [
  'Gestión',
  'Cultura',
  'Obras',
  'Comunidad',
  'Medio Ambiente',
];

/**
 * Datos mock para la sección Noticias.
 * Reutiliza imágenes existentes de MEDIA (Supabase) para no romper deploy.
 * Cuando exista CMS / DB, reemplazar por fetch real.
 */
export const NOTICIAS: Noticia[] = [
  {
    slug: 'hechos-que-marcan-la-ciudad',
    titulo: 'Hechos que marcan la historia de la ciudad',
    resumen: 'Proyectos que transformaron barrios y mejoraron la calidad de vida de las familias cochabambinas.',
    contenido:
      'La gestión municipal impulsó una serie de proyectos estructurales que cambiaron el rostro de Cochabamba. Desde la recuperación de espacios públicos hasta la modernización de servicios, cada obra responde a una planificación que pone a la gente en el centro.',
    categoria: 'Gestión',
    fecha: '2026-03-10',
    imagen: MEDIA.hero.carrusel[0]?.src ?? MEDIA.temario['puentes'],
    imagenAlt: 'Alcalde en acto oficial',
    destacada: true,
  },
  {
    slug: 'programas-para-las-familias',
    titulo: 'Programas que fortalecen a las familias',
    resumen: 'Iniciativas sociales y educativas que llegan a cada distrito con atención directa.',
    contenido:
      'Los programas municipales priorizan la niñez, la salud y la educación. Alimentación complementaria, mobiliario escolar y conectividad gratuita son parte de una política integral.',
    categoria: 'Comunidad',
    fecha: '2026-03-08',
    imagen: MEDIA.temario['educacion'],
    imagenAlt: 'Alcalde con escolares',
  },
  {
    slug: 'canciones-que-inspiran',
    titulo: 'Canciones que inspiran a Cochabamba',
    resumen: 'Música, mensajes y fe en cada emisión cultural de la ciudad.',
    contenido:
      'La agenda cultural celebra la identidad cochabambina con música en vivo, mensajes de unidad y espacios de fe que reúnen a la comunidad.',
    categoria: 'Cultura',
    fecha: '2026-03-05',
    imagen: MEDIA.temario['alianzas'],
    imagenAlt: 'Evento cultural con artista en escenario',
  },
  {
    slug: 'radio-municipal-nuevas-vocaciones',
    titulo: 'Radio municipal: nuevas vocaciones al aire',
    resumen: 'La emisora municipal renueva su programación con voces jóvenes y contenido local.',
    contenido:
      'Con una parrilla renovada, la radio municipal abre espacio a productores locales, fortaleciendo la comunicación comunitaria y la participación ciudadana.',
    categoria: 'Cultura',
    fecha: '2026-03-03',
    imagen: MEDIA.historia.regreso2020,
    imagenAlt: 'Locutora en cabina de radio',
  },
  {
    slug: 'proyectos-que-transforman-distritos',
    titulo: 'Proyectos que transforman los distritos',
    resumen: 'Obras de conectividad, áreas verdes y servicios que llegan a los 15 distritos.',
    contenido:
      'La inversión en infraestructura vial, parques y servicios básicos avanza de forma simultánea en norte, sur y centro, cerrando brechas históricas.',
    categoria: 'Obras',
    fecha: '2026-02-28',
    imagen: MEDIA.temario['vialidad'],
    imagenAlt: 'Vista aérea de avenida renovada',
  },
  {
    slug: 'recuperacion-laguna-alalay',
    titulo: 'Avance en la recuperación de la Laguna Alalay',
    resumen: 'Dragado, forestación y nuevos senderos para el pulmón verde de la ciudad.',
    contenido:
      'El proyecto ambiental más grande del municipio muestra avances visibles: espejo de agua recuperado, ciclovías y control ambiental permanente.',
    categoria: 'Medio Ambiente',
    fecha: '2026-02-20',
    imagen: MEDIA.proyectos.lagunaAlalay,
    imagenAlt: 'Laguna Alalay recuperada',
  },
  {
    slug: 'playa-turquesa-cona-cona',
    titulo: 'Playa Turquesa abre temporada con récord de visitantes',
    resumen: 'El complejo Coña Coña se consolida como destino familiar y turístico.',
    contenido:
      'Con playa artificial, áreas verdes y gastronomía local, el complejo recibe a miles de familias cada fin de semana.',
    categoria: 'Obras',
    fecha: '2026-02-15',
    imagen: MEDIA.proyectos.playaTurquesa,
    imagenAlt: 'Playa Turquesa Coña Coña',
  },
  {
    slug: 'bosques-urbanos-nuevas-areas-verdes',
    titulo: 'Nuevos bosques urbanos para la Ciudad Jardín',
    resumen: 'Plan de forestación suma hectáreas verdes y mejora la calidad del aire.',
    contenido:
      'Bosques urbanos en distintos distritos incorporan especies nativas y senderos peatonales, reforzando el concepto de Ciudad Jardín.',
    categoria: 'Medio Ambiente',
    fecha: '2026-02-10',
    imagen: MEDIA.temario['ciudad-jardin-hoy'],
    imagenAlt: 'Parque urbano con áreas verdes',
  },
];

export function getNoticias(): Noticia[] {
  return [...NOTICIAS].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

export function getNoticiasDestacadas(limit = 5): Noticia[] {
  return getNoticias().slice(0, limit);
}

export function getNoticiaBySlug(slug: string): Noticia | undefined {
  return NOTICIAS.find((n) => n.slug === slug);
}

export function getNoticiasByCategoria(categoria: string): Noticia[] {
  if (!categoria || categoria === 'Todas') return getNoticias();
  return getNoticias().filter((n) => n.categoria === categoria);
}

export function formatFecha(fechaISO: string): string {
  return new Date(fechaISO).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
