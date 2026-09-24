import 'dotenv/config';
import { Pool } from 'pg';

/**
 * Pool Postgres compartido (auth/buzón + CMS). Un único pool por proceso:
 * `buzon`/`sesion` en `src/lib/db.ts` y `cms_bloque` en `src/cms/core` usan
 * la misma conexión; SSL automático para Supabase.
 */

export const DATABASE_URL: string | undefined =
  import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

let _pool: Pool | null = null;

/** Pool compartido (auth/buzón + CMS). SSL automático para Supabase. */
export function obtenerPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error('[pg] Falta DATABASE_URL en el entorno.');
  }
  if (!_pool) {
    const needsSSL =
      /supabase\.co/.test(DATABASE_URL) || /sslmode=require/.test(DATABASE_URL);
    _pool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      ...(needsSSL ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }
  return _pool;
}