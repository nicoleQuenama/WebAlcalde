const BUCKET =
  'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/Ahora-webp';

/** Arma la URL pública de una imagen `.webp` dentro del bucket. */
const wp = (archivo: string): string => `${BUCKET}/${encodeURIComponent(archivo)}.webp`;

export const SUPABASE_MEDIA = {
  // ── Portada / hero ─────────────────────────────────────────────────
  portada: wp('DJI_0001-Pano'),
  cochaPanoramica: wp('DJI_0001-Pano'),
  logo: wp('LOGO ALCALDE'),

  // ── El alcalde (retratos) ─────────────────────────────────────────
  alcalde: {
    retrato90: wp('DSC_0802'),
    obra90: wp('DSC_0790'),
    vialidad: wp('DSC_0807'),
    alianzas: wp('DSC_0819'),
    retratoHoy: wp('IMG_0643'),
    hitos: wp('6P9A0583'),
  },

  // ── Con la gente ──────────────────────────────────────────────────
  gente: {
    encuentro: wp('6P9A5493'),
    barrios: wp('IMG_2941'),
    distritos: wp('IMG_7166'),
    agua: wp('IMG_1215'),
    salud: wp('IMG_5001'),
    areasVerdes: wp('IMG_1088'),
    espejos: wp('IMG_4043'),
    educacion: wp('IMG_2650'),
    vanguardia: wp('IMG_9792'),
    apoyo: wp('apoyo de la gente al alcalde'),
    permisoViaje: wp('IMG_0455'),
  },

  // Temario del libro (una imagen por subsección)
  temario: {
    puentes: wp('IMG_7166'),
    conectividad: wp('IMG_2941'),
    ciudadJardin90: wp('IMG_1088'),
    hitos: wp('6P9A0583'),
    salud: wp('IMG_5001'),
    agua: wp('IMG_1215'),
    ciudadJardinHoy: wp('6P9A5493'),
    ecologia: wp('DSC_0790'),
    espejos: wp('IMG_4043'),
    educacion: wp('IMG_2650'),
    vialidad: wp('DSC_0807'),
    vanguardia: wp('IMG_9792'),
    alianzas: wp('DSC_0819'),
  },

  // ── Proyectos (tarjetas de /gestion) ──────────────────────────────
  proyectos: {
    playaTurquesa: wp('6P9A0583'),
    lagunaAlalay: wp('DSC_0790'),
    terminal: wp('IMG_7166'),
    permisoViaje: wp('IMG_0455'),
  },

  // ── Historia (línea de tiempo) ────────────────────────────────────
  historia: {
    ciudad: wp('ciudad'),
    alcalde: wp('alcalde'),
  },
};