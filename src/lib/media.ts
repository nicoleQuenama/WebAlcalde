import type { Encuadre, AjusteCarrusel } from './ajusteImagen';
import type { TarjetaImagen } from '@components/global/Hero/types';

const BASE =
  'https://xfkfvabjxgfwjktaxhcs.supabase.co/storage/v1/object/public/media';

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
const alcalde = (nombre: string) => encodeURI(`/alcalde/${nombre}`);
const proyAntes = (archivo: string) => encodeURI(`/proyectos/antes/${archivo}`);
const proy = (archivo: string) => encodeURI(`/proyectos/${archivo}`);
const awards = (archivo: string) => encodeURI(`/premios/${archivo}`)

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
  /** Dimensiones reales del "antes" cuando se conocen (evita `inferSize` en remotos). */
  antesWidth?: number;
  antesHeight?: number;
  despuesHeight?: number;
  afterFit?: 'cover' | 'contain' | 'fill' | 'none';
  afterPosition?: string;
  afterScale?: number;
}

export const MEDIA = {
  // ── Identidad ─────────────────────────────────────────────────────
  logo: '/LOGO ALCALDE.png',
  logoFirma: home('logo firma MRVai_Mesa de trabajo 1'),
  portadaLibro: '/cocha.jpg',

  // ── Hero ─────────────────────────────────────────────────────────
  hero: {
    // ── Home (/) ──
    home: {
      /** Panorámica desenfocada de fondo (fallback). */
      panoramica: ahora('DJI_0001-Pano.webp'),
      /** Fotos a pantalla completa del carrusel de fondo del hero. */
      fondo: [
        { src: alcalde('señora.webp'), w: 1920, h: 1080 },
        { src: alcalde('colegio.webp'), w: 1920, h: 1080 },
        { src: alcalde('perrito.webp'), w: 1920, h: 1080 },
        { src: alcalde('niños.webp'), w: 1920, h: 1080 },
      ],
    } satisfies {
      panoramica: string;
      fondo: { src: string; w: number; h: number }[];
    },

    // ── Sobre (/sobre) ──
    sobre: {
      /** Panorámica desenfocada de fondo. */
      panoramica: ahora('DJI_0001-Pano.webp'),
      carrusel: [
        { id: 'gente-1', src: alcalde('señora.webp'), titulo: 'Manfred Reyes Villa', w: 2549, h: 3568, encuadre: 'rostro', zoomOut: true },
        { id: 'gente-2', src: alcalde('colegio.webp'), titulo: 'Cerca de la gente', w: 12480, h: 8320, ajuste: { objectFit: 'cover', objectPosition: '46% 40%', scale: 1.18 } },
        { id: 'gente-3', src: alcalde('perrito.webp'), titulo: 'Alcalde de Cochabamba', w: 2832, h: 3826, encuadre: 'rostro', zoomOut: true },
        { id: 'gente-4', src: alcalde('niños.webp'), titulo: 'Reconocimiento internacional', w: 1032, h: 1207, encuadre: 'rostro', zoomOut: true },
      ] satisfies TarjetaImagen[],
    },
  },

  // ── Video de biografía (home, debajo del hero) ────────────────────
  biografia: {
    video: video('Biografia.mp4'),
    poster: alcalde('señora.webp'),
  },

  // ── Comparador antes / después (home) ─────────────────────────────
  // Los pares 3 y 4 son una asociación tentativa: revisar contra las fotos.
  antesDespues: [
    {
      titulo: 'Coña Coña — Playa Turquesa',
      antes: proyAntes('coñaAntes.jpeg'),
      despues: proy('playaTurquesa.JPG'),
      afterFit: 'cover',
      afterPosition: '49.8886431283711% 5.852502603736161%',
      afterScale: 1.17,
      // 6P9A2287.webp es 5472×3648 (horizontal) pero Astro la lee como vertical
      // (1200×3648). Forzamos alto 800 al optimizarla para que conserve el formato.
      despuesHeight: 800,
    },
    {
      titulo: 'Laguna Alalay',
      antes: proyAntes(
        'lalayAntes.jpeg',
      ),
      despues: proy(
        'lagunaAlalay.jpeg',
      ),
      // 2048×1280 (horizontal): alto real a 1200px de ancho.
      despuesHeight: 750,
    },
    {
      titulo: 'Plaza de las Banderas',
      antes: proyAntes('noseAntes.jpg'),
      despues: proy('plazaBanderas.jpg'),
      // Mismo archivo que temarioDims['ciudad-jardin-hoy'] (placas 3122×1939).
      antesWidth: 3122,
      antesHeight: 1939,
      // 6240×4160: alto real a 1200px (evita el sliver de inferSize en webp remotos).
      despuesHeight: 800,
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
    awards('premio1.JPG'),
    awards('premio2.JPG'),
    awards('premio3.jpeg')
  ],

  // ── Línea de tiempo (/sobre) — solo hitos con foto disponible ──────
  historia: {
    /** 1993–2000 · alcalde por cuatro periodos */
    prefecto: alcalde('policia.jpeg'),
    /** 2005 · primer prefecto electo */
    regreso2020: alcalde('alcalde.jpg'),
    /** 2021 · alcalde por quinta vez */
    alcalde2021: alcalde('cinta.jpg'),
    /** hoy · trabajar por Cochabamba */
    ciudadInteligente: alcalde('señora.webp'),
  },
};

export default MEDIA;