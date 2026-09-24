import type { Bloque, BloqueData } from './tipos';

/**
 * Interfaz del storage CMS (el "adaptador"). Hoy la implementa Postgres;
 * mañana cualquier backend (S3, Dynamo, un service externo) con la misma
 * semántica: colección → bloques ordenados por `orden`, PK (coleccion, bloqueId).
 */
export interface AlmacenCMS {
  /** Migración idempotente + creación de la tabla. */
  asegurarTabla(): Promise<void>;
  /** Todos los bloques de una colección, ordenados por `orden`. */
  listar(coleccion: string): Promise<Bloque[]>;
  /** Cantidad de bloques de una colección. */
  contar(coleccion: string): Promise<number>;
  /** Un bloque puntual, o `undefined` si no existe. */
  obtener(coleccion: string, bloqueId: string): Promise<Bloque | undefined>;
  /** Upsert de un bloque (crea o reemplaza la fila). Sin `orden` se conserva el existente (o va al final). */
  guardar(coleccion: string, bloqueId: string, data: BloqueData, orden?: number): Promise<void>;
  /** Elimina un bloque. `true` si existía. */
  eliminar(coleccion: string, bloqueId: string): Promise<boolean>;
  /** Actualiza solo las claves presentes de `ordenPorBloque` (guardado parcial). */
  reordenar(coleccion: string, ordenPorBloque: Record<string, number>): Promise<void>;
}