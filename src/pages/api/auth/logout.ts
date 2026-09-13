import type { APIRoute } from 'astro';

import { cerrarSesion, limpiarCookieSesion, obtenerTokenDeRequest } from '@lib/auth';

/**
 * POST /api/auth/logout
 * Destruye la sesión en la DB y borra la cookie. Solo POST (evita CSRF-logout
 * por <img>/<link>); un GET se responde 405.
 */
export const prerender = false;

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export const POST: APIRoute = async ({ request }) => {
  const token = obtenerTokenDeRequest(request);
  await cerrarSesion(token);

  const tipo = request.headers.get('content-type') ?? '';
  if (tipo.includes('json')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...NO_STORE, 'Set-Cookie': limpiarCookieSesion() },
    });
  }
  return new Response(null, {
    status: 303,
    headers: { Location: '/admin/login', ...NO_STORE, 'Set-Cookie': limpiarCookieSesion() },
  });
};

export const GET: APIRoute = async () =>
  new Response(null, {
    status: 405,
    headers: { Allow: 'POST', ...NO_STORE },
  });