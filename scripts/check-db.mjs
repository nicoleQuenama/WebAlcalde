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
  for (const tbl of ['contenido','buzon','usuario','sesion']) {
    try {
      const c = await pool.query(`SELECT count(*)::int as n FROM ${tbl}`);
      console.log(`  ${tbl}: ${c.rows[0].n} filas`);
    } catch(e){ console.log(`  ${tbl}: no existe (${e.message})`) }
  }
  const doms = await pool.query("SELECT dominio, count(*)::int as n FROM contenido GROUP BY dominio ORDER BY dominio");
  console.log('Dominios contenido:', doms.rows);
} catch(e){ console.error(e); } finally { await pool.end(); }
