import type { AlmacenCMS } from './almacen';
import type { Bloque, BloqueData } from './tipos';

/**
 * Servicio CMS de alto nivel (API de alto nivel que usa el sitio y el editor).
 * Todo async: la implementación de concreto (PG, memoria) vive detrás de
 * `AlmacenCMS`. Porta la semántica exacta de `efectivo/efectivoLista/efectivoOrden`,
 * pero contra el almacén real.
 */
export interface ServicioCMS {
  asegurarTabla(): Promise<void>;
  listar(coleccion: string): Promise<Bloque[]>;
  contar(coleccion: string): Promise<number>;
  /** Fila única: merge {...porDefecto, ...data} si existe; si no, porDefecto. */
  efectivo<T>(coleccion: string, clave: string, porDefecto: T): Promise<T>;
  /** Lista: si no hay filas, porDefecto; si hay, las filas en su orden. */
  efectivoLista<T>(coleccion: string, porDefecto: T[]): Promise<T[]>;
  /** Orden de claves "macro" (layouts): claves guardadas ordenadas + faltantes al final. */
  efectivoOrden(coleccion: string, porDefecto: string[]): Promise<string[]>;
  guardar(coleccion: string, clave: string, data: BloqueData, orden?: number): Promise<void>;
  eliminar(coleccion: string, clave: string): Promise<boolean>;
  reordenar(coleccion: string, ordenPorBloque: Record<string, number>): Promise<void>;
}

export function crearServicioCMS(almacen: AlmacenCMS): ServicioCMS {
  return {
    async asegurarTabla(): Promise<void> {
      await almacen.asegurarTabla();
    },

    async listar(coleccion: string): Promise<Bloque[]> {
      return almacen.listar(coleccion);
    },

    async contar(coleccion: string): Promise<number> {
      return almacen.contar(coleccion);
    },

    async efectivo<T>(coleccion: string, clave: string, porDefecto: T): Promise<T> {
      const bloque = await almacen.obtener(coleccion, clave);
      if (!bloque) return porDefecto;
      return { ...(porDefecto as object), ...(bloque.data as object) } as T;
    },

    async efectivoLista<T>(coleccion: string, porDefecto: T[]): Promise<T[]> {
      const bloques = await almacen.listar(coleccion);
      if (bloques.length === 0) return porDefecto;
      return bloques.map((b) => b.data as unknown as T);
    },

    async efectivoOrden(coleccion: string, porDefecto: string[]): Promise<string[]> {
      const bloques = await almacen.listar(coleccion);
      if (bloques.length === 0) return porDefecto;
      const conocidas = new Set(porDefecto);
      const ordenadas = bloques
        .filter((b) => conocidas.has(b.bloqueId))
        .sort((a, b) => a.orden - b.orden)
        .map((b) => b.bloqueId);
      const faltantes = porDefecto.filter((k) => !ordenadas.includes(k));
      return [...ordenadas, ...faltantes];
    },

    async guardar(coleccion: string, clave: string, data: BloqueData, orden?: number): Promise<void> {
      await almacen.guardar(coleccion, clave, data, orden);
    },

    async eliminar(coleccion: string, clave: string): Promise<boolean> {
      return almacen.eliminar(coleccion, clave);
    },

    async reordenar(coleccion: string, ordenPorBloque: Record<string, number>): Promise<void> {
      await almacen.reordenar(coleccion, ordenPorBloque);
    },
  };
}