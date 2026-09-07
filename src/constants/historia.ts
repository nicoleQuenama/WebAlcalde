/**
 * Historia de Manfred Reyes Villa — datos de referencia para la línea de tiempo del home.
 *
 * ⚠️ IMPORTANTE: esto es un BORRADOR EDITORIAL. Revisá y ajustá fechas, cargos,
 *    nombres de alianzas y cifras con fuentes oficiales antes de publicar.
 *
 * ⚠️ Las `imagen` de abajo son PLACEHOLDER (fotos que ya existían en el proyecto).
 *    Reemplazá cada una por la foto real del hito: poné los archivos en
 *    /public/images/historia/ y cambiá la ruta (ej: "/images/historia/2002.jpg").
 *    Si dejás `imagen` vacío, esa tarjeta muestra un marcador y NO abre la galería.
 */

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
  /** Ruta pública de la imagen, ej: "/images/historia/1993-alcaldia.jpg". Opcional. */
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

// Fotos temporales para poder ver la galería funcionando. Borralas al cargar las reales.
const PH_A = '/images/ciudad.jpg';
const PH_B = '/images/alcalde.webp';

export const HISTORIA_INTRO: IntroHistoria = {
  kicker: 'Trayectoria',
  titulo: 'Del cuartel a la Alcaldía',
  bajada:
    'Militar de carrera, fundador de un partido con raíz cochabambina y varias veces ' +
    'autoridad del valle. Esta es la línea de tiempo de la vida pública de Manfred Reyes Villa.',
};

export const HISTORIA: Hito[] = [
  {
    anio: '1955',
    etapa: 'Origen',
    titulo: 'Nace en Cochabamba',
    descripcion:
      'Manfred Armando Antonio Reyes Villa nace el 18 de agosto de 1955 en la ciudad de ' +
      'Cochabamba, en el centro del valle. Su vida quedará ligada a esta ciudad.',
    imagen: PH_A,
  },
  {
    anio: 'Años 70–80',
    etapa: 'Formación',
    titulo: 'Carrera militar',
    descripcion:
      'Se forma en el Colegio Militar del Ejército y sigue la carrera de las armas. El grado ' +
      'de capitán le quedará como apodo —“el Capitán”— para toda su vida política.',
    imagen: PH_B,
  },
  {
    anio: '1993',
    etapa: 'Gestión municipal',
    titulo: 'Primera vez alcalde',
    descripcion:
      'Llega por primera vez a la Alcaldía de Cochabamba. Empieza una etapa de obra urbana ' +
      '—avenidas, mercados, áreas verdes— que marcará su forma de hacer política.',
    imagen: PH_A,
  },
  {
    anio: '1996',
    etapa: 'Política',
    titulo: 'Funda Nueva Fuerza Republicana',
    descripcion:
      'Crea la NFR, un partido de fuerte arraigo en el valle cochabambino que lo proyecta ' +
      'desde el municipio hacia la escena nacional.',
    imagen: PH_B,
  },
  {
    anio: '1993–2000',
    etapa: 'Gestión municipal',
    titulo: 'Los años de la comuna',
    descripcion:
      'Reelegido al frente del municipio, acompaña la expansión acelerada de la ciudad: ' +
      'vialidad, alumbrado y espacio público en una Cochabamba que crecía sin pausa.',
    imagen: PH_A,
  },
  {
    anio: '2002',
    etapa: 'Elección nacional',
    titulo: 'Casi presidente',
    descripcion:
      'Se postula a la Presidencia por la NFR y termina tercero, a un puñado de votos del ' +
      'segundo lugar, en una de las elecciones más cerradas de la democracia boliviana.',
    imagen: PH_B,
  },
  {
    anio: '2006',
    etapa: 'Gestión regional',
    titulo: 'Prefecto de Cochabamba',
    descripcion:
      'Tras ganar la primera elección directa de prefectos (2005), asume el gobierno del ' +
      'departamento de Cochabamba.',
    imagen: PH_A,
  },
  {
    anio: '2008',
    etapa: 'Elección nacional',
    titulo: 'El referéndum revocatorio',
    descripcion:
      'El revocatorio nacional alcanza a prefectos y presidente. Reyes Villa no supera la ' +
      'consulta y deja la Prefectura.',
    imagen: PH_B,
  },
  {
    anio: '2009',
    etapa: 'Elección nacional',
    titulo: 'Segunda candidatura presidencial',
    descripcion:
      'Vuelve a competir por la Presidencia, esta vez dentro de la alianza Plan Progreso ' +
      'para Bolivia – Convergencia Nacional.',
    imagen: PH_A,
  },
  {
    anio: '2010–2019',
    etapa: 'Fuera del país',
    titulo: 'Una década en el exterior',
    descripcion:
      'Pasa varios años fuera de Bolivia. Su figura se mantiene, aun a la distancia, como ' +
      'referente de la oposición en Cochabamba.',
    imagen: PH_B,
  },
  {
    anio: '2020',
    etapa: 'Regreso',
    titulo: 'Vuelta a la ciudad',
    descripcion:
      'Regresa a Cochabamba y reorganiza su proyecto político local de cara a las ' +
      'elecciones subnacionales.',
    imagen: PH_A,
  },
  {
    anio: '2021',
    etapa: 'Gestión municipal',
    titulo: 'De nuevo alcalde',
    descripcion:
      'Gana las elecciones subnacionales y asume la Alcaldía de Cochabamba para la gestión ' +
      '2021–2026, más de veinte años después de su primer paso por la comuna.',
    imagen: PH_B,
  },
  {
    anio: '2021–2026',
    etapa: 'Gestión actual',
    titulo: 'La ciudad inteligente',
    descripcion:
      'La gestión gira en torno a la movilidad, la infraestructura y la modernización de ' +
      'servicios, bajo la idea de una Cochabamba más conectada y eficiente.',
    imagen: PH_A,
  },

  // ── Pestaña "Reconocimiento" ────────────────────────────────────────
  // ⚠️ PLACEHOLDERS. Reemplazá por reconocimientos reales (institución, motivo, año)
  //    y sacá los que no correspondan. Cada uno lleva `tipo: 'reconocimiento'`.
  {
    tipo: 'reconocimiento',
    anio: '—',
    etapa: 'Reconocimiento',
    titulo: 'Reconocimiento 1 — completar',
    descripcion:
      'Cargá acá el reconocimiento: institución que lo otorga, motivo y año. ' +
      'Ejemplo: distinción por gestión municipal, hermanamiento de ciudades, condecoración.',
  },
  {
    tipo: 'reconocimiento',
    anio: '—',
    etapa: 'Reconocimiento',
    titulo: 'Reconocimiento 2 — completar',
    descripcion: 'Institución, motivo y año del reconocimiento.',
  },
  {
    tipo: 'reconocimiento',
    anio: '—',
    etapa: 'Reconocimiento',
    titulo: 'Reconocimiento 3 — completar',
    descripcion: 'Institución, motivo y año del reconocimiento.',
  },
];
