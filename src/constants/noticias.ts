import type { NoticiaFeed } from '../types/noticiaFeed';
import { MEDIA } from '@lib/media';

export const NOTICIAS_DB: NoticiaFeed[] = [
  {
    id: 1,
    src: MEDIA.proyectos.playaTurquesa,
    titulo: 'Playa Turquesa: el espacio recreativo favorito de Cochabamba',
    categoria: 'Espacio público',
    fecha: '2026-09-14',
    resumen: 'El Complejo Recreacional Coña Coña se consolida como el destino de recreación y turismo para las familias cochabambinas, con playa artificial, plaza de comidas y amplias áreas verdes.',
  },
  {
    id: 2,
    src: MEDIA.proyectos.lagunaAlalay,
    titulo: 'Recuperación de la Laguna Alalay avanza con fuerza',
    categoria: 'Medio Ambiente',
    fecha: '2026-09-12',
    resumen: 'El proyecto de dragado y recuperación del mayor espejo de agua de la ciudad continúa avanzando, con sendas, forestación y control del deterioro ambiental.',
  },
  {
    id: 3,
    src: MEDIA.proyectos.plazaBanderas,
    titulo: 'Plaza de las Banderas: espacio renovado para la ciudad',
    categoria: 'Espacio público',
    fecha: '2026-09-10',
    resumen: 'El remozado y mejoramiento de la plaza y sus fuentes se enmarca dentro del plan de recuperación de espacios de encuentro ciudadano.',
  },
  {
    id: 4,
    src: MEDIA.proyectos.parqueVial,
    titulo: 'Parque Vial: pulmón verde de Cochabamba',
    categoria: 'Ciudad Jardín',
    fecha: '2026-09-08',
    resumen: 'El parque renovado dentro del Plan Maestro de Forestación representa un hito en la recuperación de áreas verdes de la llajta.',
  },
  {
    id: 5,
    src: MEDIA.temario.salud,
    titulo: 'Avances en salud municipal para nuestra comunidad',
    categoria: 'Salud',
    fecha: '2026-09-05',
    resumen: 'La inversión en infraestructura y equipamiento médico marca la diferencia en la atención a la población de Cochabamba.',
  },
  {
    id: 6,
    src: MEDIA.temario.educacion,
    titulo: 'Educación integral: construyendo el futuro',
    categoria: 'Educación',
    fecha: '2026-09-01',
    resumen: 'La construcción, ampliación y mejoramiento de infraestructuras educativas beneficia a miles de estudiantes con ambientes dignos y modernos.',
  },
  {
    id: 7,
    src: MEDIA.temario.vialidad,
    titulo: 'Cochabamba conectada: infraestructura vial moderna',
    categoria: 'Obras Públicas',
    fecha: '2026-08-28',
    resumen: 'Puentes, distribuidores, pavimento rígido y asfaltos para una ciudad que crece y necesita desplazarse mejor.',
  },
  {
    id: 8,
    src: MEDIA.temario.ecologia,
    titulo: 'Compromiso con el futuro ecológico de la ciudad',
    categoria: 'Medio Ambiente',
    fecha: '2026-08-25',
    resumen: 'Cochabamba avanza hacia un futuro más verde, limpio y sostenible con la protección del medio ambiente como prioridad.',
  },
];

export const CATEGORIAS_NOTICIAS = ['Todas', 'Espacio público', 'Medio Ambiente', 'Salud', 'Educación', 'Obras Públicas', 'Ciudad Jardín'] as const;
