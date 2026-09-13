/**
 * Store en memoria del CMS (beta). NO toca `src/lib/db.ts` / SQLite a propósito:
 * esto es una capa de "overrides" que simula un guardado real mientras se
 * prueba el editor. Vive mientras el proceso de Node esté corriendo; se
 * pierde al reiniciar el servidor.
 */

export interface Bloque {
  clave: string;
  orden: number;
  data: Record<string, unknown>;
}

// dominio -> clave -> bloque
const store = new Map<string, Map<string, Bloque>>();

function dominioMapa(dominio: string): Map<string, Bloque> {
  let mapa = store.get(dominio);
  if (!mapa) {
    mapa = new Map();
    store.set(dominio, mapa);
  }
  return mapa;
}

/** Todas las filas guardadas para un dominio, ordenadas por `orden`. `undefined` si nunca se tocó. */
export function getBloques(dominio: string): Bloque[] | undefined {
  const mapa = store.get(dominio);
  if (!mapa || mapa.size === 0) return undefined;
  return Array.from(mapa.values()).sort((a, b) => a.orden - b.orden);
}

/** Una fila puntual (para dominios de una sola clave, ej. `home_hero`/`principal`). */
export function getBloque(dominio: string, clave: string): Bloque | undefined {
  return store.get(dominio)?.get(clave);
}

export function setBloque(
  dominio: string,
  clave: string,
  data: Record<string, unknown>,
  orden?: number,
): Bloque {
  const mapa = dominioMapa(dominio);
  const existente = mapa.get(clave);
  const bloque: Bloque = {
    clave,
    data,
    orden: orden ?? existente?.orden ?? mapa.size,
  };
  mapa.set(clave, bloque);
  return bloque;
}

export function eliminarBloque(dominio: string, clave: string): boolean {
  return store.get(dominio)?.delete(clave) ?? false;
}

export function reordenar(dominio: string, ordenPorClave: Record<string, number>): void {
  const mapa = dominioMapa(dominio);
  for (const [clave, orden] of Object.entries(ordenPorClave)) {
    const bloque = mapa.get(clave);
    if (bloque) bloque.orden = orden;
  }
}

/** Vacía todo el store (solo para debug/pruebas manuales, no se usa en runtime). */
export function limpiarTodo(): void {
  store.clear();
}
