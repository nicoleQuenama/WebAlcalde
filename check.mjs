import 'dotenv/config';
import pg from 'pg';
const url = process.env.DATABASE_URL;
console.log('URL host:', url?.split('@')[1]?.split('/')[0]);
const pool = new pg.Pool({ connectionString: url, max: 2, ssl: { rejectUnauthorized: false } });
try {
  const q = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('tables', q.rows);
  const c1 = await pool.query('SELECT count(*)::int as n FROM cms_bloque');
  console.log('cms_bloque count', c1.rows[0]);
  const c2 = await pool.query('SELECT coleccion, count(*)::int as n FROM cms_bloque GROUP BY coleccion ORDER BY coleccion');
  console.log('coleccion counts', c2.rows);
  const h = await pool.query("SELECT bloque_id, LEFT(data::text,120) as preview FROM cms_bloque WHERE coleccion='hito' LIMIT 2");
  console.log('hitos sample', h.rows);
} catch(e){ console.error(e.message, e.stack) }
await pool.end();
