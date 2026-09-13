import { getBloque, getBloques } from './store';

/**
 * Valor efectivo de un dominio de una sola fila (ej. `home_hero`/`principal`):
 * el override en memoria si el admin lo editó, si no, el valor por defecto
 * que ya trae el código.
 */
export function efectivo<T extends Record<string, unknown>>(
  dominio: string,
  clave: string,
  porDefecto: T,
): T {
  const bloque = getBloque(dominio, clave);
  return bloque ? ({ ...porDefecto, ...bloque.data } as T) : porDefecto;
}

/**
 * Lista efectiva de un dominio (ej. `proyecto`, tarjetas institucionales):
 * si el admin guardó algo para ese dominio, se usa esa lista completa
 * (en el orden guardado); si no, la lista por defecto del código.
 */
export function efectivoLista<T extends Record<string, unknown>>(
  dominio: string,
  porDefecto: T[],
): T[] {
  const bloques = getBloques(dominio);
  if (!bloques) return porDefecto;
  return bloques.map((b) => b.data as T);
}

/**
 * Orden efectivo de las secciones "macro" de una página (`home_layout`,
 * `gestion_layout`, `sobre_layout`). Si falta una clave conocida en lo
 * guardado, se agrega al final en vez de desaparecer — un guardado a medias
 * nunca puede borrar una sección de la vista.
 */
export function efectivoOrden(dominio: string, porDefecto: string[]): string[] {
  const bloques = getBloques(dominio);
  if (!bloques) return porDefecto;
  const conocidas = new Set(porDefecto);
  const ordenadas = bloques
    .filter((b) => conocidas.has(b.clave))
    .sort((a, b) => a.orden - b.orden)
    .map((b) => b.clave);
  const faltantes = porDefecto.filter((k) => !ordenadas.includes(k));
  return [...ordenadas, ...faltantes];
}
