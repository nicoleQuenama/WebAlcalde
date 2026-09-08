/**
 * Historia de Manfred Reyes Villa — línea de tiempo de /sobre.
 *
 * Contenido tomado de la reseña biográfica oficial provista por el equipo
 * ("El Cap. Manfred Reyes Villa Bacigalupi es militar en retiro, político y
 *  empresario…"). Ante cualquier duda de fechas o cargos, esa reseña manda.
 *
 * Los hitos recientes llevan foto real del bucket (ver src/constants/media.ts).
 * Los hitos antiguos van sin `imagen`: la tarjeta muestra un marcador
 * "Foto de archivo" hasta cargar la foto histórica real.
 */
import { MEDIA } from './media';

export type TipoHito = 'historia' | 'reconocimiento';

export interface Hito {
  /** Pestaña a la que pertenece. Por defecto 'historia'. */
  tipo?: TipoHito;
  /** Año o rango: "1955", "1993–2000", "Años 70". */
  anio: string;
  /** Etiqueta corta de etapa: "Origen", "Gestión municipal", "Elección nacional"… */
  etapa: string;
  titulo: string;
  descripcion: string;
  /** Ruta pública de la imagen. Opcional. */
  imagen?: string;
  imagenAlt?: string;
}

export const FILTROS_HITO: { id: TipoHito; label: string }[] = [
  { id: 'historia', label: 'Historia' },
  { id: 'reconocimiento', label: 'Reconocimiento' },
];

export interface IntroHistoria {
  kicker: string;
  titulo: string;
  bajada: string;
}

export const HISTORIA_INTRO: IntroHistoria = {
  kicker: 'Trayectoria',
  titulo: 'Del cuartel a la Alcaldía',
  bajada:
    'El Cap. Manfred Reyes Villa Bacigalupi es militar en retiro, político y empresario. ' +
    'Cochabambino por decisión: ama a su gente, a su tierra y, sobre todo, a Dios. ' +
    'Esta es la línea de tiempo de su vida pública.',
};

export const HISTORIA: Hito[] = [
  {
    anio: '1955',
    etapa: 'Origen',
    titulo: 'Nace en La Paz',
    descripcion:
      'Manfred Reyes Villa Bacigalupi nace en 1955 en la ciudad de La Paz. Con los años ' +
      'se hará cochabambino por decisión. Está casado y tiene 7 hijos, dos de ellas fallecidas.',
  },
  {
    anio: 'Años 60–70',
    etapa: 'Formación',
    titulo: 'Colegio Israelita, La Paz',
    descripcion:
      'Cursa sus estudios escolares en el Colegio Israelita de la ciudad de La Paz.',
  },
  {
    anio: '1973',
    etapa: 'Carrera militar',
    titulo: 'Ingresa al Colegio Militar del Ejército',
    descripcion:
      'Comienza la carrera de las armas en el Colegio Militar del Ejército.',
  },
  {
    anio: '1977',
    etapa: 'Carrera militar',
    titulo: 'Grado de Subteniente',
    descripcion:
      'Egresa del Colegio Militar y obtiene el grado de Subteniente del Ejército.',
  },
  {
    anio: 'Años 80',
    etapa: 'Carrera militar',
    titulo: 'Docencia y agregadurías militares',
    descripcion:
      'Ocupa cargos de importancia: docencia en Asuntos de Especialización Militar y ' +
      'Agregado Militar de la Embajada de Bolivia en Brasil y en Estados Unidos.',
  },
  {
    anio: '1986',
    etapa: 'Vida civil',
    titulo: 'Deja el Ejército con el grado de Capitán',
    descripcion:
      'Por razones personales deja definitivamente la carrera militar con el grado de ' +
      'Capitán de Ejército. Se radica en Estados Unidos, se dedica a la vida civil y ' +
      'familiar y ejerce en su área de formación, Business Management, llegando a ' +
      'Vicepresidente de Crawford International en Silver Spring, Maryland.',
  },
  {
    anio: '1990',
    etapa: 'Regreso',
    titulo: 'Vuelve a Bolivia e inicia su carrera política',
    descripcion:
      'A principios de 1990 regresa a Bolivia y da sus primeros pasos en la política.',
  },
  {
    anio: '1992',
    etapa: 'Gestión municipal',
    titulo: 'Vicepresidente del Concejo Municipal de Cochabamba',
    descripcion:
      'Asume la Vicepresidencia del Concejo Municipal de Cochabamba.',
  },
  {
    anio: '1993–2000',
    etapa: 'Gestión municipal',
    titulo: 'Alcalde de Cochabamba por cuatro periodos consecutivos',
    descripcion:
      'Es burgomaestre de Cochabamba durante cuatro periodos seguidos. En paralelo preside ' +
      'la Asociación de Gobiernos Municipales Autónomos de Bolivia, integra la Unión ' +
      'Internacional de Autoridades Locales (IULA) y representa a la Red Latinoamericana de ' +
      'Asociaciones Municipales ante la WACLAC, con base en Ginebra, Suiza.',
    imagen: MEDIA.historia.prefecto,
    imagenAlt: 'Manfred Reyes Villa',
  },
  {
    anio: '2005',
    etapa: 'Gestión regional',
    titulo: 'Primer Prefecto electo de Cochabamba',
    descripcion:
      'Es el primer Prefecto del departamento de Cochabamba elegido democráticamente por ' +
      'voto directo de la ciudadanía.',
    imagen: MEDIA.historia.regreso2020,
    imagenAlt: 'Manfred Reyes Villa con la gente',
  },
  {
    anio: '2009',
    etapa: 'Elección nacional',
    titulo: 'Segundo lugar en las elecciones presidenciales',
    descripcion:
      'En abril de 2009, en el marco de la nueva Constitución Política del Estado, se ' +
      'presenta a las elecciones presidenciales y obtiene el segundo lugar en la ' +
      'preferencia electoral.',
  },
  {
    anio: '2021',
    etapa: 'Gestión municipal',
    titulo: 'Alcalde de Cochabamba por quinta vez',
    descripcion:
      'Se re-postula a la Alcaldía en las elecciones subnacionales de 2021 representando a ' +
      'la agrupación política SÚMATE y es elegido Alcalde por quinta vez con el 55,63 % de ' +
      'los votos.',
    imagen: MEDIA.historia.alcalde2021,
    imagenAlt: 'Manfred Reyes Villa, alcalde de Cochabamba',
  },
  {
    anio: 'Hoy',
    etapa: 'Compromiso',
    titulo: 'Trabajar por Cochabamba',
    descripcion:
      'Llega a la silla edil como político con experiencia, trayectoria y grandes ideas, ' +
      'con el firme compromiso de trabajar por Cochabamba —desde donde el pueblo se lo ' +
      'permita— siempre con honestidad, firmeza y capacidad.',
    imagen: MEDIA.historia.ciudadInteligente,
    imagenAlt: 'Cochabamba hoy',
  },

  // ── Pestaña "Reconocimiento" ────────────────────────────────────────
  // Distinciones y representaciones internacionales tomadas de la reseña oficial.
  // ⚠️ Revisá instituciones y años exactos antes de publicar.
  {
    tipo: 'reconocimiento',
    anio: '1993–2000',
    etapa: 'Reconocimiento',
    titulo: 'Presidente de la Asociación de Gobiernos Municipales de Bolivia',
    descripcion:
      'Es elegido Presidente de la Asociación de Gobiernos Municipales Autónomos de Bolivia ' +
      'durante su gestión como Alcalde de Cochabamba.',
    imagen: MEDIA.premios[1],
  },
  {
    tipo: 'reconocimiento',
    anio: '1993–2000',
    etapa: 'Reconocimiento',
    titulo: 'Miembro de la Unión Internacional de Autoridades Locales (IULA)',
    descripcion:
      'Integra la IULA y es nombrado representante oficial de la Red Latinoamericana de ' +
      'Asociaciones Municipales ante la WACLAC (World Association of Cities and Local ' +
      'Authorities Coordination), con base en Ginebra, Suiza.',
    imagen: MEDIA.premios[3],
  },
  {
    tipo: 'reconocimiento',
    anio: '2026',
    etapa: 'Reconocimiento',
    titulo: 'Embajador de Ciudades Sostenibles',
    descripcion:
      'Es distinguido como "Embajador de la Organización Mundial Ciudades Sostenibles 2026" ' +
      'en París, Francia.',
    imagen: MEDIA.premios[0],
  },
];
