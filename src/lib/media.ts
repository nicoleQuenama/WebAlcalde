/**
 * media.ts — Única fuente de verdad de las imágenes y videos del sitio.
 *
 * Todo vive en el bucket público `media` de Supabase
 * (proyecto fsuxvbuupswucnsvrdce), organizado así:
 *
 *   imagenes/raiz/                     → retratos del alcalde + fotos con la gente
 *   imagenes/recursos-graficos-home/   → tomas aéreas / recursos gráficos del home
 *   imagenes/cocha-antes-y-ahora/      → fotos "antes" (históricas)
 *   imagenes/cocha-antes-y-ahora/ahora/→ fotos "ahora" (mismos lugares hoy)
 *   imagenes/premios-manfred/          → reconocimientos y actos oficiales
 *   videos/                            → 01..07 de obras + Biografia.mp4
 *
 * Los componentes NO deben construir rutas a mano: importan `MEDIA` de acá.
 * (Antes vivía en src/constants/media.ts; ahora vive junto a la capa de datos.)
 */
import type { Encuadre, AjusteCarrusel } from './ajusteImagen';

const BASE =
  'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media';

/** URL pública de un archivo del bucket (codifica espacios, tildes, paréntesis…). */
const file = (path: string): string => encodeURI(`${BASE}/${path}`);

// Helpers por carpeta. `raiz` y `home` siempre son `.webp`; el resto lleva el
// nombre completo porque conservan la extensión original antes del `.webp`.
const raiz = (nombre: string) => file(`imagenes/raiz/${nombre}.webp`);
const home = (nombre: string) => file(`imagenes/recursos-graficos-home/${nombre}.webp`);
const antes = (archivo: string) => file(`imagenes/cocha-antes-y-ahora/${archivo}`);
const ahora = (archivo: string) => file(`imagenes/cocha-antes-y-ahora/ahora/${archivo}`);
const premio = (archivo: string) => file(`imagenes/premios-manfred/${archivo}`);
const video = (archivo: string) => file(`videos/${archivo}`);

export interface FotoMedia {
  src: string;
  alt: string;
  /** Dimensiones reales de la foto (para optimizarla sin deformar). */
  w?: number;
  h?: number;
  /** Encuadre por foto (misma lógica que las cards del hero, ver ajusteImagen). */
  encuadre?: Encuadre;
  zoomOut?: boolean;
  ajuste?: AjusteCarrusel;
}

/** Solo dimensiones + encuadre (para imágenes que ya vienen armadas como string). */
export interface FotoEncaje {
  w: number;
  h: number;
  encuadre?: Encuadre;
  zoomOut?: boolean;
  ajuste?: AjusteCarrusel;
}

export interface ParAntesDespues {
  titulo: string;
  antes: string;
  despues: string;
  /**
   * Altura explícita (px) para la imagen "después" al optimizarla.
   * Evita depender de `inferSize` en webps remotos (Astro algunos los lee
   * mal, p. ej. 6P9A2287.webp lee como vertical cuando es horizontal) y el
   * fallo transitorio "failed to fetch remote image dimensions".
   */
  despuesHeight?: number;
  afterFit?: string;
  afterPosition?: string;
  afterScale?: number;
}

export const MEDIA = {
  // ── Identidad ─────────────────────────────────────────────────────
  logo: raiz('LOGO ALCALDE'),
  logoFirma: home('logo firma MRVai_Mesa de trabajo 1'),
  /** Portada del libro digital (queda local: no está en el bucket). */
  portadaLibro: '/cocha.jpg',

  // ── Hero (home y /sobre) ──────────────────────────────────────────
  hero: {
    /** Panorámica desenfocada de fondo. */
    panoramica: ahora('DJI_0001-Pano.webp'),
    /**
     * Carrusel de tarjetas grandes (formato vertical). Sólo fotos donde el
     * alcalde se ve claro y de cerca: el recorte vertical nunca le corta el rostro.
     */
    carrusel: [
      { id: 'gente-1', src: raiz('DSC_0802'), titulo: 'Manfred Reyes Villa', w: 2549, h: 3568, encuadre: 'rostro', zoomOut: true },
      { id: 'gente-2', src: raiz('IMG_2941'), titulo: 'Cerca de la gente', w: 12480, h: 8320, ajuste: { objectFit: 'cover', objectPosition: '46% 40%', scale: 1.18 } },
      { id: 'gente-3', src: raiz('DSC_0807'), titulo: 'Alcalde de Cochabamba', w: 2832, h: 3826, encuadre: 'rostro', zoomOut: true },
      { id: 'gente-4', src: premio('01 ALCALDE FRANCIA OK.webp'), titulo: 'Reconocimiento internacional', w: 1032, h: 1207, encuadre: 'rostro', zoomOut: true },
    ],
  },

  // ── Video de biografía (home, debajo del hero) ────────────────────
  biografia: {
    video: video('Biografia.mp4'),
    poster: raiz('DSC_0802'),
  },

  // ── Comparador antes / después (home) ─────────────────────────────
  // ⚠️ Los pares 3 y 4 son una asociación tentativa: revisar contra las fotos.
  antesDespues: [
    {
      titulo: 'Coña Coña — Playa Turquesa',
      antes: antes('1_cona_cona_antes.jpg.webp'),
      despues: ahora('6P9A2287.webp'),
      afterFit: 'cover',
      afterPosition: '49.8886431283711% 5.852502603736161%',
      afterScale: 1.17,
      // 6P9A2287.webp es 5472×3648 (horizontal) pero Astro la lee como vertical
      // (1200×3648). Forzamos alto 800 al optimizarla para que conserve el formato.
      despuesHeight: 800,
    },
    {
      titulo: 'Laguna Alalay',
      antes: antes(
        'Laguna_Alalay..._la_antigua_Loma_del_Burro_final_avenida_6_de_Agosto_y_el_actual_Circuito_Bolivia_en_1917._(2).jfif.webp',
      ),
      despues: ahora(
        'Laguna_Alalay_el_proyecto_de_recuperacion_ambiental_mas_grande_del_pais.jpg.webp',
      ),
      // 2048×1280 (horizontal): alto real a 1200px de ancho.
      despuesHeight: 750,
    },
    {
      titulo: 'Plaza de las Banderas',
      antes: antes('trabajos_plaza_de_las_banderas_931.webp'),
      despues: ahora('IMG_5929.webp'),
      // 6240×4160: alto real a 1200px (evita el sliver de inferSize en webp remotos).
      despuesHeight: 800,
    },
    {
      titulo: 'Parque Vial',
      antes: antes('parque_vial.webp'),
      despues: ahora('DJI_0169.webp'),
      // 4000×3000: alto real a 1200px de ancho.
      despuesHeight: 900,
    },
  ] satisfies ParAntesDespues[],

  // ── Libro digital (Book.tsx reparte estas fotos entre las páginas) ─
  libro: {
    fotos: [
      { src: raiz('DSC_0802'), alt: 'Manfred Reyes Villa', w: 2549, h: 3568, encuadre: 'rostro', zoomOut: true }, // 0 · retrato de presentación
      { src: antes('6P9A8685.webp'), alt: 'Cochabamba de ayer', w: 4265, h: 2707, encuadre: 'centro' }, // 1 · antes (strip "cómo creció")
      { src: ahora('DJI_0001-Pano.webp'), alt: 'Cochabamba hoy', w: 5570, h: 3481, encuadre: 'centro' }, // 2 · ahora
      { src: raiz('IMG_2941'), alt: 'El alcalde con escolares', w: 12480, h: 8320, ajuste: { objectFit: 'cover', objectPosition: '46% 40%', scale: 1.18 } }, // 3
      { src: raiz('6P9A0583'), alt: 'El alcalde en un acto de la ciudad', w: 4388, h: 3574, encuadre: 'centro' }, // 4 · intro era 1
      { src: raiz('DSC_0790'), alt: 'El alcalde en una obra', w: 2511, h: 3444, encuadre: 'rostro', zoomOut: true }, // 5 · retrato era 2
      { src: raiz('IMG_1088'), alt: 'Cerca de los vecinos', w: 2112, h: 2795, encuadre: 'rostro', zoomOut: true }, // 6
      { src: raiz('apoyo de la gente al alcalde'), alt: 'La gente con el alcalde', w: 5777, h: 3578, encuadre: 'centro' }, // 7
    ] satisfies FotoMedia[],
    /** Orden que espera Book.tsx: playa, laguna, terminal, fexco, market, vet, permiso. */
    videos: [
      { src: video('01_PLAYA_TURQUESA.mp4'), alt: 'Playa Turquesa' },
      { src: video('02_LAGUNA_ALALAY.mp4'), alt: 'Laguna Alalay' },
      { src: video('03_ACCESOS_NUEVA_TERMINAL_DE_BUSES.mp4'), alt: 'Accesos a la nueva terminal de buses' },
      { src: video('04_FEXCO_ARENA.mp4'), alt: 'FEXCO Arena' },
      { src: video('06_COCHA_MARKET.mp4'), alt: 'Cocha Market' },
      { src: video('07_CLINICA_VETERINARIA_MUNICIPAL.mp4'), alt: 'Clínica Veterinaria Municipal' },
      { src: video('05_PERMISO_DE_VIAJE_DIGITAL.mp4'), alt: 'Permiso de Viaje Digital' },
    ] satisfies FotoMedia[],
  },

  // ── Proyectos (carrusel de /gestion#proyectos) ───────────────────
  // Sólo proyectos con foto real en el bucket (cocha-antes-y-ahora).
  proyectos: {
    playaTurquesa: ahora('playa_turquesa_cona_cona.jfif.webp'),
    lagunaAlalay: ahora(
      'Laguna_Alalay_el_proyecto_de_recuperacion_ambiental_mas_grande_del_pais.jpg.webp',
    ),
    plazaBanderas: antes('trabajos_plaza_de_las_banderas_931.webp'),
    parqueVial: antes('parque_vial.webp'),
  },

  // ── Imagen por subsección del temario (/gestion y libro) ──────────
  // Clave = `id` de la subsección en db.ts (seed del temario).
  temario: {
    puentes: home('DJI_0187'), // aérea de la ciudad / infraestructura
    conectividad: ahora('IMG_5929.webp'), // avenidas de la ciudad hoy
    'ciudad-jardin-90': antes('parque_vial.webp'), // un parque
    'hitos-90': raiz('6P9A0583'), // acto cívico con el alcalde
    salud: raiz('apoyo de la gente al alcalde'), // el alcalde con la gente
    agua: raiz('DSC_0790'), // el alcalde en obra
    'ciudad-jardin-hoy': antes('trabajos_plaza_de_las_banderas_931.webp'), // plaza renovada
    ecologia: ahora(
      'Laguna_Alalay_el_proyecto_de_recuperacion_ambiental_mas_grande_del_pais.jpg.webp',
    ),
    'espejos-de-agua': ahora('playa_turquesa_cona_cona.jfif.webp'),
    educacion: raiz('IMG_2941'), // el alcalde con escolares
    vialidad: ahora('DJI_0169.webp'), // aérea de la ciudad / vialidad
    vanguardia: home('DJI_20260315233117_0043_D_CORSO2026'), // aérea de la ciudad
    alianzas: premio('01 ALCALDE FRANCIA OK.webp'), // distinción internacional (París)
  } as Record<string, string>,

  /**
   * Dimensiones reales y encuadre por subsección del temario.
   * Clave = `id` de la subsección (misma que `MEDIA.temario`).
   * Misma lógica que las cards del hero (ver ajusteImagen).
   */
  temarioDims: {
    puentes: { w: 4000, h: 3000, encuadre: 'centro' },
    conectividad: { w: 6240, h: 4160, encuadre: 'centro' },
    'ciudad-jardin-90': { w: 4378, h: 3014, encuadre: 'centro' },
    'hitos-90': { w: 4388, h: 3574, encuadre: 'centro' },
    salud: { w: 5777, h: 3578, encuadre: 'centro' },
    agua: {
      w: 2511,
      h: 3444,
      ajuste: { objectFit: 'cover', objectPosition: '50% 10%' },
    },
    'ciudad-jardin-hoy': { w: 3122, h: 1939, encuadre: 'centro' },
    ecologia: { w: 2048, h: 1280, encuadre: 'centro' },
    'espejos-de-agua': { w: 1600, h: 1600, encuadre: 'centro' },
    educacion: {
      w: 12480,
      h: 8320,
      ajuste: { objectFit: 'cover', objectPosition: '46% 40%', scale: 1.18 },
    },
    vialidad: { w: 4000, h: 3000, encuadre: 'centro' },
    vanguardia: { w: 8192, h: 6144, encuadre: 'centro' },
    alianzas: { w: 1032, h: 1207, encuadre: 'rostro', zoomOut: true },
  } as Record<string, FotoEncaje>,

  // ── Reconocimientos (pestaña "Reconocimiento" de la línea de tiempo) ─
  premios: [
    premio('01 ALCALDE FRANCIA OK.webp'),
    premio('IMG_8681.JPG.webp'),
    premio('IMG_8694.webp'),
    premio('IMG_8708.webp'),
    premio('IMG_8717.webp'),
    premio('480695433_1190684485949460_3538349140350047919_n.jpg.webp'),
    premio('481212888_1190684419282800_2460303940024493103_n.jpg.webp'),
    premio('481666493_1194378768913365_510148177602297366_n.jpg.webp'),
    premio('483432485_1196960938655148_9214361404396313873_n.jpg.webp'),
    premio('632658652_1476789234005649_799437477301930877_n.jpg.webp'),
    premio('778967012_4515158455421443_1166667027159226541_n.jfif.webp'),
    premio('780748679_1533102162196461_3375322350896480518_n.jpg.webp'),
    premio('20210114_113124 (1).jpg.webp'),
    premio('20210114_143933.jpg.webp'),
    premio('20210115_171725.jpg.webp'),
  ],

  // ── Línea de tiempo (/sobre) — solo hitos con foto disponible ──────
  historia: {
    /** 1993–2000 · alcalde por cuatro periodos */
    prefecto: raiz('DSC_0807'),
    /** 2005 · primer prefecto electo */
    regreso2020: raiz('apoyo de la gente al alcalde'),
    /** 2021 · alcalde por quinta vez */
    alcalde2021: raiz('DSC_0802'),
    /** hoy · trabajar por Cochabamba */
    ciudadInteligente: home('DJI_0187'),
  },
};

export default MEDIA;