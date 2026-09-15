import 'dotenv/config';
import pg from 'pg';
const url = process.env.DATABASE_URL;
console.log('URL host:', url?.split('@')[1]?.split('/')[0]);
const pool = new pg.Pool({ connectionString: url, max: 2, ssl: { rejectUnauthorized: false } });
try {
  const q = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('tables', q.rows);
  const c1 = await pool.query('SELECT count(*)::int as n FROM contenido');
  console.log('contenido count', c1.rows[0]);
  const c2 = await pool.query('SELECT dominio, count(*)::int as n FROM contenido GROUP BY dominio ORDER BY dominio');
  console.log('dominio counts', c2.rows);
  const h = await pool.query("SELECT clave, LEFT(data,120) as preview FROM contenido WHERE dominio='hito' LIMIT 2");
  console.log('hitos sample', h.rows);
} catch(e){ console.error(e.message, e.stack) }
await pool.end();
