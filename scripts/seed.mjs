import 'dotenv/config';
import pg from 'pg';
const url = process.env.DATABASE_URL;
if (!url) { console.error('Falta DATABASE_URL'); process.exit(1); }
const needsSSL = /supabase\.co/.test(url) || /sslmode=require/.test(url);
const pool = new pg.Pool({ connectionString: url, max: 5, ...(needsSSL ? { ssl:{ rejectUnauthorized:false } } : {}) });
console.log('[seed] Conectando a', url.split('@')[1]?.split('/')[0]);
await pool.query(`CREATE TABLE IF NOT EXISTS contenido (dominio TEXT NOT NULL, clave TEXT NOT NULL, orden INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL, PRIMARY KEY (dominio, clave));`);
await pool.query(`CREATE TABLE IF NOT EXISTS buzon (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, tipo TEXT NOT NULL, mensaje TEXT NOT NULL, creado_en TEXT NOT NULL);`);
await pool.query(`CREATE TABLE IF NOT EXISTS usuario (usuario TEXT PRIMARY KEY, pass_hash TEXT NOT NULL, creado_en TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sesion (token TEXT PRIMARY KEY, usuario TEXT NOT NULL, creado_en TEXT NOT NULL, expira_en TEXT NOT NULL);`);
console.log('[seed] Tablas aseguradas. Ahora el contenido se siembra automáticamente al hacer el primer request (GET /) o al levantar astro dev.');
console.log('[seed] Para forzar sembrado completo sin levantar el server, hacé: curl http://localhost:4321/');
const c = await pool.query('SELECT count(*)::int as n FROM contenido');
console.log(`[seed] contenido filas actuales: ${c.rows[0].n}`);
if (c.rows[0].n === 0) console.log('[seed] Está vacío — al levantar `npm run dev` + abrir http://localhost:4321 se sembrará solo.');
await pool.end();
