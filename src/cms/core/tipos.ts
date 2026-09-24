/**
 * Tipos del núcleo CMS. CERO dependencias del sitio: este paquete (`core/`)
 * se puede extraer como librería tal cual está. Los nombres usan el vocabulario
 * genérico de CMS: `coleccion` (antes "dominio") y `bloqueId` (antes "clave").
 */

/** Data opaca de un bloque (lo que sea que guarde cada colección). */
export type BloqueData = Record<string, unknown>;

/** Fila persistida de un CMS: un bloque dentro de una colección. */
export interface Bloque {
  coleccion: string;
  bloqueId: string;
  orden: number;
  data: BloqueData;
}

/** Especificación declarativa de un bloque por defecto (seed/defaults). */
export interface EspecificacionBloque {
  clave: string;
  data: BloqueData;
  orden: number;
}