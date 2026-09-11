
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { MEDIA } from './media';
import type { Encuadre, AjusteCarrusel } from './ajusteImagen';

// ── Tipos del contenido editorial ────────────────────────────────────────────

/** Una obra / hito puntual dentro de una subsección. */
export interface Obra {
  nombre: string;
  /** Año o rango si el temario lo indica ("1993", "2004"). */
  anio?: string;
  /** Aclaración corta opcional (1 frase). */
  detalle?: string;
  /** El temario la acompaña con un QR de video. */
  video?: boolean;
}

/** Subsección temática (un título del temario con su bajada y su lista de obras). */
export interface SeccionTemario {
  /** Slug para anclas: /gestion#<id> */
  id: string;
  titulo: string;
  /** Párrafo introductorio del temario. */
  bajada?: string;
  obras: Obra[];
  imagen?: string;
  imagenAlt?: string;

  imagenW?: number;
  imagenH?: number;
  encuadre?: Encuadre;
  ajuste?: AjusteCarrusel;
}

/** Bloque de nivel superior del relato (un capítulo del libro). */
export interface Capitulo {
  id: string;
  /** Etiqueta corta ("Apertura", "Antes de esta gestión"…). */
  eyebrow: string;
  titulo: string;
  bajada: string;
}

/** Una "era" de obras: capítulo + sus subsecciones. */
export interface EraTemario extends Capitulo {
  secciones: SeccionTemario[];
}

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
  /** Dimensiones reales de la foto (para optimizarla sin deformar). */
  imagenW?: number;
  imagenH?: number;
  /** Encuadre por foto (misma lógica que las cards del hero, ver ajusteImagen). */
  encuadre?: Encuadre;
  zoomOut?: boolean;
}

export interface IntroHistoria {
  kicker: string;
  titulo: string;
  bajada: string;
}

// ── Seed: apertura del libro (capítulos sin lista de obras) ─────────────────

/** "Presentación del alcalde" — relato emotivo + foto en traje formal. */
const PRESENTACION: Capitulo = {
  id: 'presentacion',
  eyebrow: 'Presentación del alcalde',
  titulo: 'Manfred Reyes Villa',
  bajada:
    'Esta es una historia a través de fotografias de una ciudad, ' +
    'contada a través de sus obras: las que hace más de treinta años empezaron a ' +
    'cambiarle la cara a Cochabamba y las que hoy la proyectan hacia el futuro.',
};

/** "Cómo ha crecido Cochabamba: de una ciudad de ayer a una que mira al futuro". */
const CRECIMIENTO: Capitulo = {
  id: 'crecimiento',
  eyebrow: 'De una ciudad de ayer a una ciudad que mira al futuro',
  titulo: 'Cómo ha crecido Cochabamba',
  bajada:
    'Las fotografías cuentan aquello que muchas veces las palabras no pueden explicar: ' +
    'el paso del tiempo y la transformación de una ciudad. Cochabamba conserva en sus ' +
    'calles, plazas, barrios y edificios la memoria de lo que fue, pero también muestra, ' +
    'en cada avenida y espacio renovado, el impulso de una ciudad que comenzó a ' +
    'proyectarse hacia el futuro.',
};

/** "El inicio de una nueva Cochabamba" — visión moderna y planificación urbana. */
const NUEVA_COCHABAMBA: Capitulo = {
  id: 'nueva-cochabamba',
  eyebrow: 'Visión moderna de ciudad y planificación urbana',
  titulo: 'El inicio de una nueva Cochabamba',
  bajada:
    'Con la llegada de una nueva etapa de gestión municipal, Cochabamba comenzó a ' +
    'plantearse un desafío distinto: dejar de responder únicamente a las necesidades ' +
    'del presente y empezar a planificar la ciudad que sus habitantes necesitarían ' +
    'en el futuro.',
};

// ── Seed: hero de gestión, pilares, proyectos ────────────────────────────────

const GESTION_HERO = {
  kicker: 'Alcaldía de Cochabamba',
  periodo: 'De los años 90 a la gestión 2021 — 2026',
  titulo: 'Las obras son memorias',
  bajada:
    'El recorrido completo del libro "Cocha, la mejor ciudad de Bolivia": las obras que ' +
    'empezaron a transformar Cochabamba hace más de treinta años y las que hoy la ' +
    'proyectan hacia el futuro. Cada avenida, parque, puente y programa social cuenta ' +
    'una parte de esa historia.',
};

const PROYECTOS_TITULO = {
  kicker: 'Proyectos',
  titulo: 'Obras de la gestión',
  bajada: 'Tocá una tarjeta para abrir la galería con todas las imágenes del proyecto.',
};

// ⚠️ Revisá estados y descripciones antes de publicar. Las 4 obras tienen foto
//    real del bucket (imagenes/cocha-antes-y-ahora): son proyectos del temario.
const PROYECTOS: Proyecto[] = [
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

// ── Seed: historia (intro, filtros y línea de tiempo) ────────────────────────

const FILTROS_HITO: { id: TipoHito; label: string }[] = [
  { id: 'historia', label: 'Historia' },
  { id: 'reconocimiento', label: 'Reconocimiento' },
];

const HISTORIA_INTRO: IntroHistoria = {
  kicker: '',
  titulo: 'Trayectoria',
  bajada:
    'El Cap. Manfred Reyes Villa Bacigalupi es militar en retiro, político y empresario. ' +
    'Cochabambino por decisión: ama a su gente, a su tierra y, sobre todo, a Dios. ' +
    'Esta es la línea de tiempo de su vida pública.',
};

// ── Seed: las dos eras de obras y la línea de tiempo de hitos ────────────────
// (Definidas al final del archivo para que este módulo siga siendo legible;
//  `sembrar()` sólo las usa en tiempo de ejecución, nunca durante el eval.)

const ERAS: EraTemario[] = [
  // ── ERA 1 — "LAS OBRAS SON MEMORIAS" (años 90, antes de esta gestión) ──
  {
    id: 'memorias',
    eyebrow: 'Antes de esta gestión · años 90',
    titulo: 'Las obras son memorias',
    bajada:
      'La transformación de Cochabamba durante los años 90 no puede entenderse únicamente ' +
      'a través de una lista de obras. Cada avenida, parque, puente, plaza y programa social ' +
      'representa una parte de la historia de una ciudad que comenzaba a mirar más allá de ' +
      'su presente. Cada proyecto refleja una época en la que Cochabamba comenzó a imaginarse ' +
      'como una ciudad moderna, integrada y con vocación de futuro.',
    secciones: [
      {
        id: 'puentes',
        titulo: 'Pioneros en pasos a desnivel y puentes',
        imagen: MEDIA.temario['puentes'],
        imagenAlt: 'Infraestructura vial de Cochabamba',
        bajada:
          'Cochabamba fue pionera en Bolivia en la implementación de pasos a desnivel y ' +
          'puentes para ordenar el tránsito y conectar la ciudad con su periferia.',
        obras: [
          { nombre: 'Puente Cala Cala', anio: '1993', video: true },
          { nombre: 'Puente Los Andes', anio: '1993', detalle: 'Entre las serranías de Cerro Verde y San Miguel.' },
          { nombre: 'Puente Kyllmann', anio: '1994' },
          { nombre: 'Viaducto', anio: '1996' },
          { nombre: 'Puente Antezana', anio: '1996' },
          { nombre: 'Puente Muyurina', anio: '2004' },
        ],
      },
      {
        id: 'conectividad',
        titulo: 'La conectividad: motor del crecimiento urbano',
        imagen: MEDIA.temario['conectividad'],
        imagenAlt: 'Avenidas de Cochabamba',
        bajada:
          'Asfalto y pavimento rígido en las avenidas estructurantes que ordenaron la ' +
          'expansión de la ciudad.',
        obras: [
          { nombre: 'Av. Suecia' },
          { nombre: 'Av. Cap. Ustariz' },
          { nombre: "Av. D'Orbigni" },
          { nombre: 'Av. Melchor Pérez' },
          { nombre: 'Av. Independencia' },
          { nombre: 'Av. Petrolera' },
          { nombre: 'Av. Gabriel René Moreno' },
          { nombre: 'Av. Beijing' },
        ],
      },
      {
        id: 'ciudad-jardin-90',
        titulo: 'Ciudad Jardín: áreas verdes y parques',
        imagen: MEDIA.temario['ciudad-jardin-90'],
        imagenAlt: 'Parques y plazas de Cochabamba',
        bajada:
          'Parques y plazas que consolidaron la identidad de Cochabamba como Ciudad Jardín ' +
          'y de la Eterna Primavera.',
        obras: [
          { nombre: 'Parque de Educación Vial' },
          { nombre: 'Parque del Niño' },
          { nombre: 'Parque Mariscal Santa Cruz', anio: '1998' },
          { nombre: 'Parque Kanata' },
          { nombre: 'Parque San Pedro' },
          { nombre: 'Plaza 14 de Septiembre' },
          { nombre: 'Plaza Colón' },
          { nombre: 'Plaza Recoleta' },
          { nombre: 'Plaza Quintanilla' },
          { nombre: 'Plaza de las Banderas' },
        ],
      },
      {
        id: 'hitos-90',
        titulo: 'Hitos que marcaron época',
        imagen: MEDIA.temario['hitos-90'],
        imagenAlt: 'Manfred Reyes Villa',
        bajada:
          'Programas y obras con los que Cochabamba se adelantó al resto del país.',
        obras: [
          {
            nombre: 'Desayuno Escolar',
            anio: '1994',
            detalle:
              'Pionera en Bolivia; luego se instituyó a nivel nacional en beneficio de miles de estudiantes.',
            video: true,
          },
          { nombre: 'Iluminación: cambio de luces de mercurio a sodio', anio: '1994' },
          { nombre: 'Misicuni', detalle: 'El sueño del agua que Cochabamba no dejó de perseguir.' },
          {
            nombre: 'Defensorías Municipales de la Niñez y Adolescencia',
            anio: '1997',
            detalle: 'Cochabamba fue identificada como pionera en este proceso.',
          },
          {
            nombre: 'Cristo de la Concordia',
            anio: '1994',
            detalle: 'Un símbolo que se convirtió en el rostro de Cochabamba.',
            video: true,
          },
          { nombre: 'Primer Teleférico de Bolivia', anio: '1999', video: true },
          {
            nombre: 'Día del Peatón y del Ciclista / Ciclovía',
            anio: '1999',
            detalle: 'Iniciativa impulsada por Manfred Reyes Villa.',
            video: true,
          },
        ],
      },
    ],
  },
  // ── ERA 2 — "CUANDO UNA CIUDAD VUELVE A SOÑAR EN GRANDE" (gestión 2021–2026) ──
  {
    id: 'sonar-en-grande',
    eyebrow: 'Gestión 2021 — 2026',
    titulo: 'Cuando una ciudad vuelve a soñar en grande',
    bajada:
      'En 2021, Cochabamba inició una nueva etapa de transformación urbana y social. La ' +
      'experiencia acumulada y una visión de ciudad moderna volvieron a encontrarse con las ' +
      'necesidades de una población que exigía soluciones concretas. Agua, salud, educación, ' +
      'movilidad, medio ambiente, cultura, tecnología, deporte y desarrollo productivo se ' +
      'convirtieron en parte de una agenda municipal orientada a recuperar espacios, ' +
      'modernizar servicios y llevar obras a los distintos distritos.',
    secciones: [
      {
        id: 'salud',
        titulo: 'Salud de calidad',
        imagen: MEDIA.temario['salud'],
        imagenAlt: 'Atención a la comunidad',
        bajada:
          'La emergencia sanitaria dejó una enseñanza: la infraestructura y el equipamiento ' +
          'médico pueden marcar la diferencia entre la vida y la muerte. Fortalecer el sistema ' +
          'de salud fue primordial.',
        obras: [
          {
            nombre: 'Primera Planta Criogénica Municipal de Oxígeno',
            detalle: 'Ubicada en el Hospital del Norte.',
            video: true,
          },
          { nombre: 'Unidades de Terapia Intensiva (UTI)', detalle: 'Hospital del Norte y Hospital del Sud.' },
          { nombre: 'Red Municipal de Ambulancias', detalle: 'Línea gratuita 162.' },
          {
            nombre: 'Equipamiento hospitalario',
            detalle:
              'Tomógrafo y Neonatología (Hospital Cochabamba), Torre Laparoscópica (Hospital del Sud), Mamógrafo (Hospital del Norte).',
          },
          { nombre: 'Fichaje Virtual — INNOVA' },
          { nombre: 'Salud Sobre Ruedas', detalle: 'Atención médica gratuita.' },
          { nombre: 'Campañas de cirugías gratuitas de manos y pies "Manitos Arriba"' },
          { nombre: 'Centro de Salud Ambulatorio "Gloria" — D.9' },
          { nombre: 'Centro de Salud Integral Villa Israel — D.9' },
          {
            nombre:
              'Clínica veterinaria y Centro Municipal de Rehabilitación y Adiestramiento Canino',
            detalle: 'Zona Chimba.',
          },
        ],
      },
      {
        id: 'agua',
        titulo: 'Cobertura de agua potable: deuda social',
        imagen: MEDIA.temario['agua'],
        imagenAlt: 'Servicios básicos para los barrios',
        bajada:
          'Garantizar agua significa garantizar salud, dignidad y oportunidades. La ampliación ' +
          'de redes, sistemas de abastecimiento, colectores y proyectos de saneamiento se ' +
          'convirtió en uno de los principales desafíos de la gestión municipal.',
        obras: [
          {
            nombre: 'Planta de Tratamiento de Aguas Residuales de Albarrancho',
            detalle: 'La primera de Bolivia y una de las más grandes de Latinoamérica.',
            video: true,
          },
          { nombre: 'Renovación del sistema de agua potable del centro de la ciudad' },
          { nombre: 'Cobertura del 96 % de agua potable' },
          {
            nombre:
              'Ampliaciones y renovaciones de servicios básicos (agua potable y alcantarillado sanitario)',
          },
          { nombre: 'Emisario Sud Este' },
          { nombre: 'Hidrantes' },
          { nombre: 'Colector Av. 6 de Agosto' },
          { nombre: 'Colector Av. Ayacucho' },
        ],
      },
      {
        id: 'ciudad-jardin-hoy',
        titulo: 'Cochabamba, Ciudad Jardín: recreación y encuentro',
        imagen: MEDIA.temario['ciudad-jardin-hoy'],
        imagenAlt: 'Espacios de encuentro',
        bajada:
          'La Ciudad Jardín y de la Eterna Primavera renueva su esencia con plazas, parques y ' +
          'espacios llenos de color y vegetación, con el Plan Maestro de Forestación y ' +
          'Reforestación Municipal, Bosques Urbanos y Arborización.',
        obras: [
          {
            nombre: 'Parque de la Integración — D.9, zona sur',
            detalle: 'Atractivo recreacional con piscina, plaza de comidas y juegos.',
            video: true,
          },
          { nombre: 'Plaza Julio León Prado — D.10', video: true },
          { nombre: 'Prado Av. Humberto Asín' },
          { nombre: 'La "Casa de Piedra"', detalle: 'Un nuevo paraje turístico en la llajta.' },
          { nombre: 'Jardineras centrales y áreas verdes', detalle: 'Emoticones, mariposas y pavos.' },
          {
            nombre: 'Parques',
            detalle:
              'Familia, Vial, El Pulpo, Autonomía, Bicentenario, Oblitas, Kanata, Mariscal Santa Cruz.',
          },
          {
            nombre: 'Bosques urbanos',
            detalle:
              'Fidel Anze, Lincoln, Excombatientes, Demetrio Canelas, Esferas Florales.',
            video: true,
          },
          {
            nombre: 'Remozado y mejoramiento de fuentes',
            detalle: 'Plaza de las Banderas y Recoleta.',
            video: true,
          },
        ],
      },
      {
        id: 'ecologia',
        titulo: 'Un compromiso con el futuro ecológico',
        imagen: MEDIA.temario['ecologia'],
        imagenAlt: 'Manfred Reyes Villa en una obra',
        bajada:
          'La llajta avanza hacia un futuro más verde, limpio y sostenible. La protección del ' +
          'medio ambiente se ha convertido en un compromiso con las presentes y futuras ' +
          'generaciones: recuperar áreas naturales, mejorar la calidad del aire, promover una ' +
          'movilidad sostenible y fortalecer la conciencia ambiental — Cocha, Ciudad Sostenible.',
        obras: [
          { nombre: 'Cierre definitivo de ladrilleras' },
          {
            nombre: 'Plan Maestro de Ciclovías',
            detalle: 'Puente metálico, puentes cajón y micropavimento rojo.',
            video: true,
          },
          { nombre: 'Centro de Inspección Vehicular Ambiental (CIVAM)' },
          { nombre: 'Centro de Educación Ambiental Municipal (CEAM)' },
          {
            nombre: 'Rompiendo Aceras',
            detalle:
              'Arborización urbana: romper el cemento de las veredas del centro histórico y plantar árboles.',
          },
          {
            nombre:
              'Manfred Reyes Villa, "Embajador de la Organización Mundial Ciudades Sostenibles 2026"',
            detalle: 'París, Francia.',
          },
        ],
      },
      {
        id: 'espejos-de-agua',
        titulo: 'Nuestros espejos de agua',
        imagen: MEDIA.temario['espejos-de-agua'],
        imagenAlt: 'Laguna Alalay',
        bajada:
          'Cochabamba vuelve a mirar hacia sus espejos de agua como espacios de vida, encuentro ' +
          'y recreación. La recuperación de la Laguna Alalay y Coña Coña fue uno de los grandes ' +
          'desafíos ambientales de la ciudad.',
        obras: [
          { nombre: 'Dragado y recuperación de la Laguna Alalay', video: true },
          {
            nombre: 'Complejo Recreacional Coña Coña — D.4',
            detalle: 'Espacio público de recreación y turismo con playa artificial.',
            video: true,
          },
        ],
      },
      {
        id: 'educacion',
        titulo: 'Educación integral',
        imagen: MEDIA.temario['educacion'],
        imagenAlt: 'Estudiantes de Cochabamba',
        bajada:
          'El gobierno municipal ha destinado importantes esfuerzos a la construcción, ' +
          'ampliación y mejoramiento de infraestructuras educativas, beneficiando a miles de ' +
          'estudiantes con ambientes dignos, modernos y adecuados para aprender.',
        obras: [
          {
            nombre: 'Construcción de nuevas infraestructuras educativas',
            detalle:
              'U.E. Buenas Nuevas A-B (D.6), Innova Belén (D.15), San Pedro Secundaria (D.9), René Barrientos "B" (D.8), San Pedrito Inicial y Primaria (D.9), Oscar Rojas Caballero (D.5), Club de Leones (D.2), Taquiña A-B (D.13), 27 de Mayo (D.10), Genoveva Ríos (D.2), Ángel Honorato Salazar (D.5), Bolivia "B" (D.9).',
            video: true,
          },
          { nombre: 'Ampliación y mejoramiento de infraestructuras educativas' },
          { nombre: 'Alimentación Complementaria Escolar', detalle: 'Desde el primer día de clases.' },
          { nombre: 'Entrega de mobiliario educativo' },
          {
            nombre: 'Internet gratuito para unidades educativas',
            detalle: '500 km de fibra óptica propia.',
          },
        ],
      },
      {
        id: 'vialidad',
        titulo: 'Cochabamba conectada: infraestructura vial para una ciudad que avanza',
        imagen: MEDIA.temario['vialidad'],
        imagenAlt: 'Manfred Reyes Villa',
        bajada:
          'La infraestructura vial volvió a ocupar un lugar central en la transformación de ' +
          'Cochabamba. Puentes, distribuidores, pavimento rígido, asfaltos, recarpetados y ' +
          'nuevas conexiones para una ciudad que crece y necesita desplazarse mejor.',
        obras: [
          { nombre: 'Distribuidor Quintanilla' },
          { nombre: 'Distribuidor Av. Perú y Av. Blanco Galindo', video: true },
          {
            nombre:
              'Reposición de la plataforma del "Puente caído" — Av. 6 de Agosto e Independencia',
          },
          { nombre: 'Pavimento rígido Av. París — D.8' },
          { nombre: 'Pavimento rígido Av. Pisiga — D.14' },
          { nombre: 'Pavimento rígido Av. Segunda Circunvalación' },
          { nombre: 'Pavimento rígido Av. Humberto Asín — D.8' },
          { nombre: 'Pavimento rígido Av. Costanera del Sur — D.9' },
          { nombre: 'Pavimento rígido Av. Segunda — D.3' },
          { nombre: 'Pavimento rígido Av. de la Integración — D.9' },
          { nombre: 'Micropavimento' },
          { nombre: 'Asfalto Av. Circunvalación Oeste — Parque Bicentenario' },
          {
            nombre: 'Recarpetado de avenidas estructurantes',
            detalle: 'Villarroel, Santa Cruz, Juana Azurduy, Pando.',
          },
          { nombre: 'Reconfiguración de la rotonda Muyurina — D.11' },
          {
            nombre: 'Túnel de la Integración',
            detalle: 'Entre Cercado (D.7) y Sacaba.',
            video: true,
          },
          { nombre: 'Instalación de postes dodecágonos en las principales avenidas' },
        ],
      },
      {
        id: 'vanguardia',
        titulo: 'Cochabamba a la vanguardia del progreso',
        imagen: MEDIA.temario['vanguardia'],
        imagenAlt: 'Servicios modernos para la ciudad',
        bajada:
          'La ciudad avanza con soluciones innovadoras que mejoran la vida cotidiana, recuperan ' +
          'y hacen más accesibles los espacios públicos, optimizan los servicios y fortalecen ' +
          'su infraestructura.',
        obras: [
          {
            nombre: 'Contenedores soterrados',
            detalle: 'Sistema moderno de recolección de basura bajo tierra, obra pionera en Bolivia.',
          },
          { nombre: 'Cambio de aceras inclusivas en el Casco Viejo' },
          { nombre: 'Renovación del alumbrado público a tecnología LED' },
          { nombre: 'Construcción del Edificio Municipal — D.10', video: true },
          {
            nombre: 'Accesos a la nueva Terminal de Buses',
            detalle: 'D.5 y D.9.',
            video: true,
          },
        ],
      },
      {
        id: 'alianzas',
        titulo: 'Pioneros en alianzas público-privadas',
        imagen: MEDIA.temario['alianzas'],
        imagenAlt: 'Manfred Reyes Villa',
        bajada:
          'Cuando las ideas se suman, el desarrollo multiplica su fuerza. El municipio abre ' +
          'nuevas oportunidades a través de alianzas que unen la visión pública con la ' +
          'iniciativa privada. La transformación de la FEXCO y nuevos escenarios reflejan una ' +
          'nueva forma de impulsar infraestructura y generar oportunidades para la ciudad.',
        obras: [
          {
            nombre: 'Feria Exposición Internacional de Cochabamba (FEXCO)',
            detalle:
              'Pórtico de acceso principal, Pabellón Kanata, Pabellón del Emprendedor y Artesanos.',
          },
          { nombre: 'Ampliación de la Plaza de Comidas', video: true },
          { nombre: 'Fexco Arena', video: true },
          { nombre: 'Auditorio Fexco', video: true },
          { nombre: 'Karting' },
          { nombre: 'Construcción del Complejo Deportivo de Pádel (APP)' },
          { nombre: 'Iluminación del camino al Cristo de la Concordia' },
          { nombre: 'Jardín Botánico — destino nacional' },
          { nombre: 'Café de experiencia Casona Santiváñez' },
          { nombre: 'Café de experiencia Teatro Achá' },
          { nombre: 'Restaurante temático Casona Mayorazgo' },
          { nombre: 'Restaurante Casa de Piedra' },
          { nombre: 'Tirolesa en la serranía de San Pedro' },
          {
            nombre: 'Parque de Diversiones Fexco',
            detalle: 'Montaña rusa y juegos mecánicos.',
          },
          { nombre: 'Hotel para mascotas y horno crematorio' },
        ],
      },
    ],
  },
];

const HISTORIA: Hito[] = [
  {
    anio: '1955',
    etapa: 'Origen',
    titulo: 'Nace en La Paz',
    descripcion:
      'Manfred Armando Antonio Reyes Villa Bacigalupi nace el 19 de abril de 1955 en la ciudad de La Paz. Con los años ' +
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
    imagenW: 2832,
    imagenH: 3826,
    encuadre: 'rostro',
    zoomOut: true,
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
    imagenW: 5777,
    imagenH: 3578,
    encuadre: 'centro',
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
    imagenW: 2549,
    imagenH: 3568,
    encuadre: 'rostro',
    zoomOut: true,
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
    imagenW: 4000,
    imagenH: 3000,
    encuadre: 'centro',
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
    imagenW: 1980,
    imagenH: 2641,
    encuadre: 'centro',
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
    imagenW: 4284,
    imagenH: 3416,
    encuadre: 'centro',
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
    imagenW: 1032,
    imagenH: 1207,
    encuadre: 'rostro',
    zoomOut: true,
  },
];

// ── Persistencia (SQLite) ────────────────────────────────────────────────────

const DB_PATH = join(process.cwd(), 'data', 'webalcalde.db');
const DB_DIR = dirname(DB_PATH);

let _db: DatabaseSync | null = null;

function open(): DatabaseSync {
  if (_db) return _db;
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS contenido (
      dominio TEXT NOT NULL,
      clave   TEXT NOT NULL,
      orden   INTEGER NOT NULL DEFAULT 0,
      data    TEXT NOT NULL,
      PRIMARY KEY (dominio, clave)
    );
  `);
  _db = db;
  return db;
}

type Mapa = Record<string, unknown>;

function guardar(dominio: string, clave: string, data: Mapa, orden = 0): void {
  const db = open();
  db.prepare(
    `INSERT INTO contenido (dominio, clave, orden, data)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(dominio, clave) DO UPDATE SET
       orden = excluded.orden,
       data  = excluded.data`,
  ).run(dominio, clave, orden, JSON.stringify(data));
}

function leer(dominio: string): { clave: string; data: Mapa; orden: number }[] {
  const db = open();
  const rows = db
    .prepare(`SELECT clave, orden, data FROM contenido WHERE dominio = ? ORDER BY orden`)
    .all(dominio) as { clave: string; orden: number; data: string }[];
  return rows.map((r) => ({ clave: r.clave, orden: r.orden, data: JSON.parse(r.data) as Mapa }));
}

function estaVacio(dominio: string): boolean {
  const db = open();
  const r = db
    .prepare(`SELECT COUNT(*) AS n FROM contenido WHERE dominio = ?`)
    .get(dominio) as { n: number };
  return r.n === 0;
}

// ── Siembra desde el seed de este archivo ────────────────────────────────────

function sembrar(): void {
  const db = open();

  // Capítulos de apertura
  if (estaVacio('capitulo')) {
    [PRESENTACION, CRECIMIENTO, NUEVA_COCHABAMBA].forEach((cap: Capitulo, i: number) =>
      guardar('capitulo', cap.id, cap as unknown as Mapa, i),
    );
  }

  // Eras + sus subsecciones. Guardamos en cada sección su metadata de imagen
  // (dims/encuadre) resuelta desde MEDIA.temarioDims para no depender de ella
  // en los componentes.
  if (estaVacio('era')) {
    ERAS.forEach((era: EraTemario, ei: number) => {
      guardar(
        'era',
        era.id,
        {
          id: era.id,
          eyebrow: era.eyebrow,
          titulo: era.titulo,
          bajada: era.bajada,
        },
        ei,
      );
      era.secciones.forEach((sec: SeccionTemario, si: number) => {
        const dims = MEDIA.temarioDims[sec.id] as
          | (Mapa & { w?: number; h?: number; encuadre?: string; ajuste?: Mapa })
          | undefined;
        guardar(
          'seccion',
          sec.id,
          {
            id: sec.id,
            eraId: era.id,
            titulo: sec.titulo,
            bajada: sec.bajada,
            imagen: sec.imagen,
            imagenAlt: sec.imagenAlt,
            imagenW: dims?.w,
            imagenH: dims?.h,
            encuadre: dims?.encuadre,
            ajuste: dims?.ajuste,
            obras: sec.obras as unknown as Obra[],
          },
          si,
        );
      });
    });
  }

  // Hero de gestión
  if (estaVacio('gestion_hero')) {
    guardar('gestion_hero', 'principal', GESTION_HERO as unknown as Mapa, 0);
  }

  // Título de la sección de proyectos + lista de proyectos
  if (estaVacio('proyectos_titulo')) {
    guardar('proyectos_titulo', 'principal', PROYECTOS_TITULO as unknown as Mapa, 0);
  }
  if (estaVacio('proyecto')) {
    PROYECTOS.forEach((p: Proyecto, i: number) => guardar('proyecto', String(i), p as unknown as Mapa, i));
  }

  // Historia: intro + filtros + hitos
  if (estaVacio('historia_intro')) {
    guardar('historia_intro', 'principal', HISTORIA_INTRO as unknown as Mapa, 0);
  }
  if (estaVacio('filtro')) {
    FILTROS_HITO.forEach((f, i) => guardar('filtro', f.id, f as unknown as Mapa, i));
  }
  if (estaVacio('hito')) {
    HISTORIA.forEach((h: Hito, i: number) => guardar('hito', `${i}`, h as unknown as Mapa, i));
  }

  void db;
}

// ── API pública ──────────────────────────────────────────────────────────────

function asegurarSembrada(): void {
  open();
  if (estaVacio('capitulo') || estaVacio('era') || estaVacio('hito')) {
    sembrar();
  }
}

export function getCapitulos(): Capitulo[] {
  asegurarSembrada();
  return leer('capitulo').map((r) => r.data as unknown as Capitulo);
}

export function getEras(): EraTemario[] {
  asegurarSembrada();
  const eras = leer('era').map((r) => r.data as unknown as Capitulo);
  const secciones = leer('seccion').map((r) =>
    r.data as unknown as SeccionTemario & { eraId: string },
  );

  return eras.map((era) => ({
    ...era,
    secciones: secciones.filter((s) => s.eraId === era.id),
  })) as EraTemario[];
}

export function getGestionHero() {
  asegurarSembrada();
  const [row] = leer('gestion_hero');
  return row?.data as unknown as typeof GESTION_HERO;
}

export function getProyectosTitulo() {
  asegurarSembrada();
  const [row] = leer('proyectos_titulo');
  return row?.data as unknown as typeof PROYECTOS_TITULO;
}

export function getProyectos(): Proyecto[] {
  asegurarSembrada();
  return leer('proyecto').map((r) => r.data as unknown as Proyecto);
}

export function getHistoriaIntro() {
  asegurarSembrada();
  const [row] = leer('historia_intro');
  return row?.data as unknown as typeof HISTORIA_INTRO;
}

export function getFiltrosHito() {
  asegurarSembrada();
  return leer('filtro').map((r) => r.data as unknown as (typeof FILTROS_HITO)[number]);
}

export function getHitos(): Hito[] {
  asegurarSembrada();
  return leer('hito').map((r) => r.data as unknown as Hito);
}