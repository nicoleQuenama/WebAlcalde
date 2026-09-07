/**
 * Contenido de las secciones de la home (debajo del hero + libro).
 * ⚠️ Textos y cifras son borrador: ajustá con datos reales antes de publicar.
 */

export interface Eje {
  /** Ícono: nombre de un set corto que dibuja LineaEjes.astro (route, shield, chip, tree). */
  icono: 'ruta' | 'escudo' | 'chip' | 'arbol';
  titulo: string;
  descripcion: string;
}

export const EJES_TITULO = {
  kicker: 'Ejes de gestión',
  titulo: 'Cuatro frentes de trabajo',
  bajada:
    'La gestión 2021–2026 se ordena en torno a cuatro ejes que se cruzan en cada obra ' +
    'y en cada servicio de la ciudad.',
};

export const EJES: Eje[] = [
  {
    icono: 'ruta',
    titulo: 'Movilidad y transporte',
    descripcion:
      'Vías, drenaje y ordenamiento del tránsito para conectar los distritos y acortar los tiempos de viaje.',
  },
  {
    icono: 'escudo',
    titulo: 'Seguridad ciudadana',
    descripcion:
      'Iluminación, cámaras y coordinación con la Policía para recuperar espacios y bajar la sensación de inseguridad.',
  },
  {
    icono: 'chip',
    titulo: 'Ciudad inteligente',
    descripcion:
      'Trámites en línea, datos abiertos y tecnología aplicada a los servicios municipales del día a día.',
  },
  {
    icono: 'arbol',
    titulo: 'Espacios públicos',
    descripcion:
      'Parques, plazas y áreas verdes recuperadas como lugares de encuentro para los barrios.',
  },
];

export interface AccesoExplora {
  titulo: string;
  descripcion: string;
  href: string;
  etiqueta: string;
}

export const EXPLORA_TITULO = {
  kicker: 'Explorá',
  titulo: 'Tres formas de conocer la gestión',
};

export const EXPLORA: AccesoExplora[] = [
  {
    etiqueta: 'Sobre',
    titulo: 'Su historia',
    descripcion: 'La trayectoria de Manfred Reyes Villa, de la vida militar a la Alcaldía, en una línea de tiempo.',
    href: '/sobre',
  },
  {
    etiqueta: 'Gestión',
    titulo: 'Los proyectos',
    descripcion: 'Obras y programas de la gestión 2021–2026, con fotos y el detalle de cada intervención.',
    href: '/gestion',
  },
  {
    etiqueta: 'Noticias',
    titulo: 'La actualidad',
    descripcion: 'Anuncios, actividades y novedades de la Alcaldía, actualizados de forma permanente.',
    href: '/noticias',
  },
];
