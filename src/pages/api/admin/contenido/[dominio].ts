import type { APIRoute } from 'astro';
import { getServicioCMS } from '@cms';
import { obtenerTokenDeRequest, usuarioValido } from '@lib/auth';

/**
 * CRUD del CMS sobre PostgreSQL (`cms_bloque` vía `getServicioCMS`):
 * escribe en la tabla real del sitio, igual que la siembra de `src/lib/db.ts`.
 * Las colecciones se guardan por su `dominio` (el mismo que identifica
 * `data-cms-dominio` en el DOM y que declaran las `fuente.coleccion`).
 *
 * Doble verificación: exige el header X-Admin-Secret (que coincide con la
 * variable de entorno que protege la ruta /admin/[secret]) Y una sesión de
 * administrador válida (cookie HttpOnly), para que el header por sí solo no
 * baste si se filtra.
 */

function autorizado(request: Request): boolean {
  const secreto = import.meta.env.ADMIN_SECRET_PATH;
  if (!secreto) return false;
  return request.headers.get('x-admin-secret') === secreto;
}

async function conSesion(request: Request): Promise<boolean> {
  return (await usuarioValido(obtenerTokenDeRequest(request))) !== null;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  if (!(await conSesion(request))) return json({ error: 'sesión inválida' }, 401);
  const dominio = params.dominio!;
  const bloques = (await getServicioCMS().listar(dominio)).map((b) => ({
    clave: b.bloqueId,
    orden: b.orden,
    data: b.data,
  }));
  return json({ dominio, bloques });
};

export const POST: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  if (!(await conSesion(request))) return json({ error: 'sesión inválida' }, 401);
  const dominio = params.dominio!;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.clave !== 'string' || typeof body.data !== 'object') {
    return json({ error: 'body inválido: se espera { clave, data, orden? }' }, 400);
  }
  const orden = typeof body.orden === 'number' ? body.orden : 0;
  await getServicioCMS().guardar(dominio, body.clave, body.data, orden);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  if (!(await conSesion(request))) return json({ error: 'sesión inválida' }, 401);
  const dominio = params.dominio!;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.clave !== 'string') {
    return json({ error: 'body inválido: se espera { clave }' }, 400);
  }
  const existia = await getServicioCMS().eliminar(dominio, body.clave);
  return json({ ok: existia });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  if (!(await conSesion(request))) return json({ error: 'sesión inválida' }, 401);
  const dominio = params.dominio!;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.orden !== 'object') {
    return json({ error: 'body inválido: se espera { orden: Record<clave, numero> }' }, 400);
  }
  await getServicioCMS().reordenar(dominio, body.orden);
  return json({ ok: true });
};