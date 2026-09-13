import type { APIRoute } from 'astro';
import { eliminarMensaje } from '@lib/db';
import { obtenerTokenDeRequest, usuarioValido } from '@lib/auth';

/**
 * Elimina un mensaje del buzón ciudadano por id. Doble verificación (igual
 * que el resto de endpoints admin): header X-Admin-Secret contra
 * ADMIN_SECRET_PATH + sesión de administrador válida (cookie HttpOnly).
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

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return json({ error: 'no autorizado' }, 401);
  if (!(await conSesion(request))) return json({ error: 'sesión inválida' }, 401);
  const id = params.id;
  if (!id || typeof id !== 'string') {
    return json({ error: 'id inválido: se espera el id del mensaje en la URL' }, 400);
  }
  const existia = await eliminarMensaje(id);
  return json({ ok: existia, id });
};