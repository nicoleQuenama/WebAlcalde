import type { AlmacenCMS } from './almacen';
import type { Bloque, BloqueData } from './tipos';

/**
 * Almacén CMS en memoria (fondo de reserva / tests del core, sin Postgres).
 * Sirve para correr el core con la misma semántica que el almacén PG. La data
 * NO se clona: se guardan/leen las mismas referencias.
 */
export class AlmacenCMSMemoria implements AlmacenCMS {
  private readonly store = new Map<string, Map<string, Bloque>>();

  private coleccionMapa(coleccion: string): Map<string, Bloque> {
    let mapa = this.store.get(coleccion);
    if (!mapa) {
      mapa = new Map();
      this.store.set(coleccion, mapa);
    }
    return mapa;
  }

  async asegurarTabla(): Promise<void> {
    // Sin tabla física en memoria: no-op.
  }

  async listar(coleccion: string): Promise<Bloque[]> {
    const mapa = this.store.get(coleccion);
    if (!mapa || mapa.size === 0) return [];
    return Array.from(mapa.values()).sort((a, b) => a.orden - b.orden);
  }

  async contar(coleccion: string): Promise<number> {
    return this.store.get(coleccion)?.size ?? 0;
  }

  async obtener(coleccion: string, bloqueId: string): Promise<Bloque | undefined> {
    return this.store.get(coleccion)?.get(bloqueId);
  }

  async guardar(
    coleccion: string,
    bloqueId: string,
    data: BloqueData,
    orden?: number,
  ): Promise<void> {
    const mapa = this.coleccionMapa(coleccion);
    const existente = mapa.get(bloqueId);
    const bloque: Bloque = {
      coleccion,
      bloqueId,
      data,
      // Sin `orden` explícito se respeta el existente (o el próximo índice).
      orden: orden ?? existente?.orden ?? mapa.size,
    };
    mapa.set(bloqueId, bloque);
  }

  async eliminar(coleccion: string, bloqueId: string): Promise<boolean> {
    return this.store.get(coleccion)?.delete(bloqueId) ?? false;
  }

  async reordenar(coleccion: string, ordenPorBloque: Record<string, number>): Promise<void> {
    const mapa = this.coleccionMapa(coleccion);
    for (const [bloqueId, orden] of Object.entries(ordenPorBloque)) {
      const bloque = mapa.get(bloqueId);
      if (bloque) bloque.orden = orden;
    }
  }
}