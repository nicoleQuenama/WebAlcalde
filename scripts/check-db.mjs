import 'dotenv/config';
import pg from 'pg';
const url = process.env.DATABASE_URL || import.meta.env?.DATABASE_URL;
if (!url) {
  console.error('[check-db] Falta DATABASE_URL en .env');
  process.exit(1);
}
console.log('[check-db] Conectando a', url.split('@')[1]?.split('/')[0]);
const pool = new pg.Pool({ connectionString: url, max: 2, ssl: { rejectUnauthorized: false } });
try {
  const t = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('Tablas:', t.rows.map(r=>r.table_name).join(', ') || '(ninguna)');
  for (const tbl of ['cms_bloque','buzon','usuario','sesion']) {
    try {
      const c = await pool.query(`SELECT count(*)::int as n FROM ${tbl}`);
      console.log(`  ${tbl}: ${c.rows[0].n} filas`);
    } catch(e){ console.log(`  ${tbl}: no existe (${e.message})`) }
  }
  const cols = await pool.query("SELECT coleccion, count(*)::int as n FROM cms_bloque GROUP BY coleccion ORDER BY coleccion");
  console.log('Colecciones cms_bloque:', cols.rows);
} catch(e){ console.error(e); } finally { await pool.end(); }