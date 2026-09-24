/**
 * Núcleo del servicio CMS — paquete extraíble (CERO imports del sitio).
 * Si mañana se extrae como librería, este barrel es lo que se exporta.
 */
export type { AlmacenCMS } from './almacen';
export { AlmacenCMSMemoria } from './memoria';
export { AlmacenCMSPostgres } from './postgres';
export { crearServicioCMS, type ServicioCMS } from './servicio';
export type {
  Bloque,
  BloqueData,
  EspecificacionBloque,
} from './tipos';