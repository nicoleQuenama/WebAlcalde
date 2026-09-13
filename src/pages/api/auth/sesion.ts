import type { APIRoute } from 'astro';

import { obtenerTokenDeRequest, usuarioValido } from '@lib/auth';

/**
 * GET /api/auth/sesion
 * Devuelve el estado de la sesión actual (según la cookie). No expone nada
 * sensible: solo `autenticado` y `usuario`.
 */
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const token = obtenerTokenDeRequest(request);
  const usuario = await usuarioValido(token);
  return new Response(
    JSON.stringify({ autenticado: usuario !== null, usuario }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
};