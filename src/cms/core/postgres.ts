import type { Pool } from 'pg';
import type { AlmacenCMS } from './almacen';
import type { Bloque, BloqueData } from './tipos';

/** Fila de `cms_bloque` tal como la devuelve pg (jsonb ya parseado a objeto). */
type FilaBloque = { coleccion: string; bloqueId: string; orden: number; data: BloqueData };

/**
 * Almacén CMS sobre PostgreSQL. El `Pool` se inyecta por constructor para
 * mantener el core desacoplado del sitio: no importa `@lib/pg` ni `dotenv`.
 * Migración idempotente de la tabla legada `contenido` → `cms_bloque`.
 */
export class AlmacenCMSPostgres implements AlmacenCMS {
  constructor(private readonly pool: Pool) {}

  async asegurarTabla(): Promise<void> {
    // Migración de la tabla legada `contenido` (domino/clave TEXT) a la tabla
    // profesional `cms_bloque` (coleccion/bloque_id + data JSONB). Solo corre
    // si `contenido` todavía existe; después queda como no-op barato.
    await this.pool.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT FROM information_schema.tables WHERE table_name = 'contenido'
        ) THEN
          ALTER TABLE contenido RENAME TO cms_bloque;
          ALTER TABLE cms_bloque RENAME COLUMN dominio TO coleccion;
          ALTER TABLE cms_bloque RENAME COLUMN clave   TO bloque_id;
          ALTER TABLE cms_bloque ALTER COLUMN data TYPE JSONB USING data::jsonb;
          ALTER TABLE cms_bloque ADD COLUMN IF NOT EXISTS creado_en      TIMESTAMPTZ NOT NULL DEFAULT now();
          ALTER TABLE cms_bloque ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now();
        END IF;
      END $$;
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS cms_bloque (
        coleccion      TEXT   NOT NULL,
        bloque_id      TEXT   NOT NULL,
        orden          INTEGER NOT NULL DEFAULT 0,
        data           JSONB   NOT NULL DEFAULT '{}'::jsonb,
        creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (coleccion, bloque_id)
      );
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS cms_bloque_coleccion_orden_idx
        ON cms_bloque (coleccion, orden);
    `);
  }

  async listar(coleccion: string): Promise<Bloque[]> {
    const res = await this.pool.query<FilaBloque>(
      `SELECT coleccion, bloque_id AS "bloqueId", orden, data
         FROM cms_bloque WHERE coleccion = $1 ORDER BY orden`,
      [coleccion],
    );
    return res.rows;
  }

  async contar(coleccion: string): Promise<number> {
    const res = await this.pool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM cms_bloque WHERE coleccion = $1`,
      [coleccion],
    );
    return res.rows[0].n;
  }

  async obtener(coleccion: string, bloqueId: string): Promise<Bloque | undefined> {
    const res = await this.pool.query<FilaBloque>(
      `SELECT coleccion, bloque_id AS "bloqueId", orden, data
         FROM cms_bloque WHERE coleccion = $1 AND bloque_id = $2`,
      [coleccion, bloqueId],
    );
    return res.rows[0];
  }

  async guardar(coleccion: string, bloqueId: string, data: BloqueData, orden?: number): Promise<void> {
    await this.pool.query(
      `INSERT INTO cms_bloque (coleccion, bloque_id, orden, data)
       VALUES ($1, $2, COALESCE($3::int, 0), $4::jsonb)
       ON CONFLICT (coleccion, bloque_id) DO UPDATE SET
         orden = COALESCE($3::int, cms_bloque.orden),
         data  = EXCLUDED.data,
         actualizado_en = now()`,
      [coleccion, bloqueId, orden ?? null, JSON.stringify(data)],
    );
  }

  async eliminar(coleccion: string, bloqueId: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM cms_bloque WHERE coleccion = $1 AND bloque_id = $2`,
      [coleccion, bloqueId],
    );
    return (res.rowCount ?? 0) > 0;
  }

  async reordenar(coleccion: string, ordenPorBloque: Record<string, number>): Promise<void> {
    for (const [bloqueId, orden] of Object.entries(ordenPorBloque)) {
      await this.pool.query(
        `UPDATE cms_bloque SET orden = $3, actualizado_en = now()
          WHERE coleccion = $1 AND bloque_id = $2`,
        [coleccion, bloqueId, orden],
      );
    }
  }
}