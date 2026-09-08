/**
 * Contenido de la página /gestion.
 * ⚠️ Borrador editorial: revisá cifras, nombres de proyectos y estados antes de publicar.
 * Las imágenes salen del bucket de Supabase (ver src/constants/media.ts).
 */
import { MEDIA } from './media';
import type { Encuadre } from '../lib/ajusteImagen';

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
      'Manfred Armando Antonio Reyes Villa Bacigalupi , militar de carrera y varias veces autoridad del valle. ' +
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
  /** Dimensiones reales de la foto (para optimizarla sin deformarla). */
  w: number;
  h: number;
  /** Encuadre de la card (misma lógica que el hero, ver ajusteImagen). */
  encuadre?: Encuadre;
}

export const PROYECTOS_TITULO = {
  kicker: 'Proyectos',
  titulo: 'Obras de la gestión',
  bajada: 'Tocá una tarjeta para abrir la galería con todas las imágenes del proyecto.',
};

// ⚠️ Revisá estados y descripciones antes de publicar. Las 4 obras tienen foto
//    real del bucket (imagenes/cocha-antes-y-ahora): son proyectos del temario.
export const PROYECTOS: Proyecto[] = [
  {
    titulo: 'Complejo Recreacional Coña Coña — Playa Turquesa',
    categoria: 'Espacio público',
    descripcion:
      'Espacio recreativo y de turismo para las familias, con playa artificial, plaza de comidas y áreas verdes.',
    estado: 'Concluido',
    imagen: MEDIA.proyectos.playaTurquesa,
    w: 1600,
    h: 1600,
  },
  {
    titulo: 'Recuperación de la Laguna Alalay',
    categoria: 'Medio ambiente',
    descripcion:
      'Dragado y recuperación del mayor espejo de agua de la ciudad: sendas, forestación y control del deterioro ambiental.',
    estado: 'En ejecución',
    imagen: MEDIA.proyectos.lagunaAlalay,
    w: 2048,
    h: 1280,
  },
  {
    titulo: 'Plaza de las Banderas',
    categoria: 'Espacio público',
    descripcion:
      'Remozado y mejoramiento de la plaza y sus fuentes, dentro del plan de recuperación de espacios de encuentro.',
    estado: 'Concluido',
    imagen: MEDIA.proyectos.plazaBanderas,
    w: 3122,
    h: 1939,
  },
  {
    titulo: 'Parque Vial',
    categoria: 'Ciudad Jardín',
    descripcion:
      'Parque renovado dentro del Plan Maestro de Forestación y de recuperación de áreas verdes de la llajta.',
    estado: 'Concluido',
    imagen: MEDIA.proyectos.parqueVial,
    w: 4378,
    h: 3014,
  },
];
