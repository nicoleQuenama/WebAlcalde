import type { APIRoute } from 'astro';
import { getBloques, setBloque, eliminarBloque, reordenar } from '@lib/cms/store';

/**
 * CRUD "mock" del CMS: escribe en el store en memoria (src/lib/cms/store.ts),
 * nunca en la DB real (src/lib/db.ts). Simula un guardado sin persistir a
 * disco — se pierde al reiniciar el servidor, a propósito.
 *
 * Sin autenticación real todavía: solo exige que el header X-Admin-Secret
 * coincida con la misma variable de entorno que protege la ruta /admin/[secret].
 */

function autorizado(request: Request): boolean {
  const secreto = import.meta.env.ADMIN_SECRET_PATH;
  if (!secreto) return false;
  return request.headers.get('x-admin-secret') === secreto;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  const dominio = params.dominio!;
  return json({ dominio, bloques: getBloques(dominio) ?? [] });
};

export const POST: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  const dominio = params.dominio!;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.clave !== 'string' || typeof body.data !== 'object') {
    return json({ error: 'body inválido: se espera { clave, data, orden? }' }, 400);
  }
  const bloque = setBloque(dominio, body.clave, body.data, body.orden);
  return json({ ok: true, bloque });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  const dominio = params.dominio!;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.clave !== 'string') {
    return json({ error: 'body inválido: se espera { clave }' }, 400);
  }
  const existia = eliminarBloque(dominio, body.clave);
  return json({ ok: existia });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  const dominio = params.dominio!;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.orden !== 'object') {
    return json({ error: 'body inválido: se espera { orden: Record<clave, numero> }' }, 400);
  }
  reordenar(dominio, body.orden);
  return json({ ok: true });
};
