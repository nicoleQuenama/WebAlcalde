/**
 * Contenido de la página /gestion.
 * ⚠️ Borrador editorial: revisá cifras, nombres de proyectos y estados antes de publicar.
 * Imágenes de proyectos: dejá los archivos en /public/images/gestion/ (o /public/multimedia/)
 * y actualizá `imagen`.
 */

export const GESTION_HERO = {
  kicker: 'Alcaldía de Cochabamba',
  periodo: 'De los años 90 a la gestión 2021 — 2026',
  titulo: 'Las obras son memorias',
  bajada:
    'El recorrido completo del libro "Cocha, la mejor ciudad de Bolivia": las obras que ' +
    'empezaron a transformar Cochabamba hace más de treinta años y las que hoy la ' +
    'proyectan hacia el futuro. Cada avenida, parque, puente y programa social cuenta ' +
    'una parte de esa historia.',
};

/**
 * Las 3 tarjetas que van después del hero de gestión.
 * Formato de <ValueCards>: el `id` DEBE ser 'bio' | 'mision' | 'vision' (lo usa la animación).
 */
export const PILARES = [
  {
    id: 'bio',
    eyebrow: '01 · Biografía',
    title: 'Biografía',
    body:
      'Manfred Reyes Villa, cochabambino, militar de carrera y varias veces autoridad del valle. ' +
      'Alcalde de la ciudad para el período 2021–2026.',
  },
  {
    id: 'mision',
    eyebrow: '02 · Misión',
    title: 'Misión',
    body:
      'Prestar servicios municipales eficientes y cercanos, con obras que mejoren la vida ' +
      'cotidiana de las y los cochabambinos y una administración transparente de los recursos.',
  },
  {
    id: 'vision',
    eyebrow: '03 · Visión',
    title: 'Visión',
    body:
      'Una Cochabamba conectada, segura y moderna: la ciudad inteligente del corredor central, ' +
      'referente regional en gestión pública y calidad de vida.',
  },
];

export interface Proyecto {
  titulo: string;
  categoria: string;
  descripcion: string;
  estado: 'En ejecución' | 'Concluido' | 'En diseño';
  imagen: string;
}

export const PROYECTOS_TITULO = {
  kicker: 'Proyectos',
  titulo: 'Obras de la gestión',
  bajada: 'Tocá una tarjeta para abrir la galería con todas las imágenes del proyecto.',
};

// ⚠️ PLACEHOLDER: títulos y estados de ejemplo, imágenes temporales de /public/multimedia/.
export const PROYECTOS: Proyecto[] = [
  {
    titulo: 'Playa Turquesa',
    categoria: 'Espacio público',
    descripcion:
      'Nuevo espacio recreativo y de encuentro para las familias, con áreas verdes y equipamiento urbano.',
    estado: 'Concluido',
    imagen: '/multimedia/6P9A0583.jpg',
  },
  {
    titulo: 'Laguna Alalay',
    categoria: 'Medio ambiente',
    descripcion:
      'Recuperación del entorno de la laguna: sendas, forestación y control del deterioro ambiental.',
    estado: 'En ejecución',
    imagen: '/multimedia/DSC_0790.jpg',
  },
  {
    titulo: 'Accesos a la nueva terminal',
    categoria: 'Movilidad',
    descripcion:
      'Obras viales de acceso a la nueva terminal de buses para ordenar el ingreso y salida de la ciudad.',
    estado: 'En ejecución',
    imagen: '/multimedia/IMG_7166.jpg',
  },
  {
    titulo: 'Permiso de viaje digital',
    categoria: 'Ciudad inteligente',
    descripcion:
      'Trámite en línea que reemplaza las filas presenciales para autorizar el viaje de menores.',
    estado: 'Concluido',
    imagen: '/multimedia/IMG_0455.jpg.jpeg',
  },
];
