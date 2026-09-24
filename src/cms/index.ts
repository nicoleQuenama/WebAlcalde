import { obtenerPool } from '@lib/pg';
import { AlmacenCMSPostgres } from './core/postgres';
import { crearServicioCMS, type ServicioCMS } from './core/servicio';

/**
 * Raíz de composición (composition root) del CMS: el ÚNICO archivo de
 * `src/cms/` que importa del sitio (`@lib/pg`). `core/**` queda 100% extraíble.
 */
let _servicio: ServicioCMS | null = null;

/** Singleton del servicio CMS del sitio (inyecta el pool compartido en el adaptador PG). */
export function getServicioCMS(): ServicioCMS {
  if (!_servicio) _servicio = crearServicioCMS(new AlmacenCMSPostgres(obtenerPool()));
  return _servicio;
}

export * from './core/index';