/**
 * TEMARIO DEL LIBRO — "Cocha, la mejor ciudad de Bolivia"
 * ----------------------------------------------------------------------------
 * Única fuente de verdad de la estructura editorial. La consumen:
 *   - /gestion  (páginas de obras, dos eras completas)
 *   - el home   (índice "La estructura del libro" + intro)
 *   - el FlipBook (Book.tsx) para que el libro digital siga el mismo orden.
 *
 * Los textos salen del documento
 *   public/images/TEMARIO COCHA LA MEJOR CIUDAD DE BOLIVIA.docx
 * Corregí tildes y unifiqué mayúsculas; el contenido es el del temario.
 *
 * ⚠️ Donde el temario dice "(QR VIDEO)" se marca la obra con `video: true`
 *    para poder mostrar un distintivo (más adelante se enlazará el video real).
 */
import { MEDIA } from './media';

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
  /**
   * Imagen ilustrativa de la subsección (columna lateral en /gestion).
   * ⚠️ Por ahora son fotos de referencia; se reemplazan por las del proyecto.
   */
  imagen?: string;
  imagenAlt?: string;
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

/* ────────────────────────────────────────────────────────────────────────────
   APERTURA DEL LIBRO (capítulos sin lista de obras)
   ──────────────────────────────────────────────────────────────────────────── */

/** "Presentación del alcalde" — relato emotivo + foto en traje formal. */
export const PRESENTACION: Capitulo = {
  id: 'presentacion',
  eyebrow: 'Presentación del alcalde',
  titulo: 'Manfred Reyes Villa',
  bajada:
    'Cochabambino, hombre de gestión y de calle. Esta es la historia de una ciudad ' +
    'contada a través de sus obras: las que hace más de treinta años empezaron a ' +
    'cambiarle la cara a Cochabamba y las que hoy la proyectan hacia el futuro.',
};

/** "Cómo ha crecido Cochabamba: de una ciudad de ayer a una que mira al futuro". */
export const CRECIMIENTO: Capitulo = {
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
export const NUEVA_COCHABAMBA: Capitulo = {
  id: 'nueva-cochabamba',
  eyebrow: 'Visión moderna de ciudad y planificación urbana',
  titulo: 'El inicio de una nueva Cochabamba',
  bajada:
    'Con la llegada de una nueva etapa de gestión municipal, Cochabamba comenzó a ' +
    'plantearse un desafío distinto: dejar de responder únicamente a las necesidades ' +
    'del presente y empezar a planificar la ciudad que sus habitantes necesitarían ' +
    'en el futuro.',
};

/* ────────────────────────────────────────────────────────────────────────────
   ERA 1 — "LAS OBRAS SON MEMORIAS" (años 90, antes de esta gestión)
   ──────────────────────────────────────────────────────────────────────────── */

const MEMORIAS: EraTemario = {
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
        {
          nombre: 'Puente Los Andes',
          anio: '1993',
          detalle: 'Entre las serranías de Cerro Verde y San Miguel.',
        },
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
        {
          nombre: 'Iluminación: cambio de luces de mercurio a sodio',
          anio: '1994',
        },
        {
          nombre: 'Misicuni',
          detalle: 'El sueño del agua que Cochabamba no dejó de perseguir.',
        },
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
};

/* ────────────────────────────────────────────────────────────────────────────
   ERA 2 — "CUANDO UNA CIUDAD VUELVE A SOÑAR EN GRANDE" (gestión 2021 — 2026)
   ──────────────────────────────────────────────────────────────────────────── */

const SONAR_EN_GRANDE: EraTemario = {
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
        {
          nombre: 'Unidades de Terapia Intensiva (UTI)',
          detalle: 'Hospital del Norte y Hospital del Sud.',
        },
        {
          nombre: 'Red Municipal de Ambulancias',
          detalle: 'Línea gratuita 162.',
        },
        {
          nombre: 'Equipamiento hospitalario',
          detalle:
            'Tomógrafo y Neonatología (Hospital Cochabamba), Torre Laparoscópica (Hospital del Sud), Mamógrafo (Hospital del Norte).',
        },
        { nombre: 'Fichaje Virtual — INNOVA' },
        {
          nombre: 'Salud Sobre Ruedas',
          detalle: 'Atención médica gratuita.',
        },
        {
          nombre: 'Campañas de cirugías gratuitas de manos y pies "Manitos Arriba"',
        },
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
          detalle:
            'La primera de Bolivia y una de las más grandes de Latinoamérica.',
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
          detalle:
            'Atractivo recreacional con piscina, plaza de comidas y juegos.',
          video: true,
        },
        { nombre: 'Plaza Julio León Prado — D.10', video: true },
        { nombre: 'Prado Av. Humberto Asín' },
        {
          nombre: 'La "Casa de Piedra"',
          detalle: 'Un nuevo paraje turístico en la llajta.',
        },
        {
          nombre: 'Jardineras centrales y áreas verdes',
          detalle: 'Emoticones, mariposas y pavos.',
        },
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
          detalle:
            'Espacio público de recreación y turismo con playa artificial.',
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
        {
          nombre: 'Alimentación Complementaria Escolar',
          detalle: 'Desde el primer día de clases.',
        },
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
        {
          nombre: 'Distribuidor Av. Perú y Av. Blanco Galindo',
          video: true,
        },
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
          detalle:
            'Sistema moderno de recolección de basura bajo tierra, obra pionera en Bolivia.',
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
};

/** Las dos eras de obras, en orden de lectura del libro. */
export const ERAS: EraTemario[] = [MEMORIAS, SONAR_EN_GRANDE];

/** Aplana todas las subsecciones (útil para índices del home). */
export const TODAS_LAS_SECCIONES: (SeccionTemario & { eraId: string; eraTitulo: string })[] =
  ERAS.flatMap((era) =>
    era.secciones.map((sec) => ({ ...sec, eraId: era.id, eraTitulo: era.titulo })),
  );
