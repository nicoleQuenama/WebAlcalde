import type { APIRoute } from 'astro';

import {
  DURACION_SESION_MS,
  iniciarSesion,
  setearCookieSesion,
} from '@lib/auth';

/**
 * POST /api/auth/login
 *
 * Recibe { usuario, contraseña } (JSON o form). Guarda una sesión en la DB y
 * devuelve la cookie HttpOnly de sesión. En caso de éxito redirige a /admin.
 *
 * Seguridad:
 * - Errores genéricos (no revela si el usuario existe).
 * - Rate-limit por IP: 5 fallos / 15 min → bloqueo temporal.
 * - Freno mínimo de 400 ms entre intentos del mismo origen.
 */
export const prerender = false;

const LIMITE_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000; // 15 minutos
const FRENO_MS = 400;

// Registro de fallos por IP (en memoria, volátil y suficiente en proxy simple).
const fallos = new Map<string, { n: number; primerFallo: number }>();

function ipDe(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    'local'
  );
}

function esJson(request: Request): boolean {
  return (request.headers.get('content-type') ?? '').includes('json');
}

function redirigir(error: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/admin/login?error=${error}`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

async function cuerpoDe(request: Request): Promise<{ usuario: string; clave: string }> {
  const tipo = request.headers.get('content-type') ?? '';
  if (tipo.includes('application/json')) {
    const body = await request.json().catch(() => null);
    return { usuario: String(body?.usuario ?? ''), clave: String(body?.contraseña ?? '') };
  }
  const form = await request.formData();
  return {
    usuario: String(form.get('usuario') ?? ''),
    clave: String(form.get('contraseña') ?? ''),
  };
}

export const POST: APIRoute = async ({ request }) => {
  const respuestaBase: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  const ip = ipDe(request);
  const ahora = Date.now();
  const registro = fallos.get(ip);
  if (registro) {
    if (ahora - registro.primerFallo > VENTANA_MS) {
      fallos.delete(ip); // ventana expirada, se reinicia
    } else if (registro.n >= LIMITE_INTENTOS) {
      if (esJson(request)) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.' }),
          { status: 429, headers: respuestaBase },
        );
      }
      return redirigir('bloqueado');
    }
  }

  // Freno mínimo entre intentos de la misma IP.
  await new Promise((r) => setTimeout(r, FRENO_MS));

  const { usuario, clave } = await cuerpoDe(request);

  // Rechazo temprano a campos vacíos (mismo mensaje genérico).
  if (!usuario.trim() || !clave) {
    if (esJson(request)) {
      return new Response(JSON.stringify({ ok: false, error: 'Completa usuario y contraseña.' }), {
        status: 400,
        headers: respuestaBase,
      });
    }
    return redirigir('vacio');
  }

  const token = await iniciarSesion(usuario, clave);

  if (!token) {
    const f = fallos.get(ip) ?? { n: 0, primerFallo: ahora };
    fallos.set(ip, { n: f.n < LIMITE_INTENTOS ? f.n + 1 : f.n, primerFallo: f.primerFallo });
    if (esJson(request)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Usuario o contraseña incorrectos.' }),
        { status: 401, headers: respuestaBase },
      );
    }
    return redirigir('credenciales');
  }

  // Éxito: si había fallos previos, se reinicia el contador.
  fallos.delete(ip);

  const expiraEn = new Date(ahora + DURACION_SESION_MS);
  const cookie = setearCookieSesion(token, expiraEn.toISOString());

  if (esJson(request)) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...respuestaBase, 'Set-Cookie': cookie },
    });
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/admin',
      'Set-Cookie': cookie,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
};