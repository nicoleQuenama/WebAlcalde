import type { APIRoute } from 'astro';
import { guardarMensaje, type TipoBuzon } from '@lib/db';
import { detectarPalabraInapropiada } from '@lib/buzon/palabras';

// Ruta dinámica (solo el servidor puede recibir POST).
export const prerender = false;

const TIPOS: readonly TipoBuzon[] = ['sugerencia', 'felicitacion'];

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// ── Anti-spam mínimo: 2 segundos entre envíos y máx. 10 por hora por IP ──────
// Suficiente para bots casuales y dobles clics; si se quiere algo más firme,
// habría que ir a una cola / sesión real.
const HORA_MS = 60 * 60 * 1000;
const limitePorIp = new Map<string, number[]>();

function admitirEnvio(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (limitePorIp.get(ip) ?? []).filter((t) => ahora - t < HORA_MS);
  if (recientes.length >= 10) return false;
  if (recientes.length > 0 && ahora - recientes[recientes.length - 1] < 2000) return false;
  recientes.push(ahora);
  limitePorIp.set(ip, recientes);
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!admitirEnvio(ip)) {
    return json(429, { ok: false, error: 'Demasiados envíos. Espere unos minutos e intente de nuevo.' });
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: 'Formato de solicitud inválido.' });
  }

  // Campo trampa para bots: nunca ve el formulario, pero si viene lleno es un bot.
  // Le respondemos "éxito" sin guardar nada para no delatar el truco.
  if (typeof cuerpo.web === 'string' && cuerpo.web.trim() !== '') {
    return json(200, { ok: true });
  }

  const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim() : '';
  const tipo = typeof cuerpo.tipo === 'string' ? cuerpo.tipo : '';
  const mensaje = typeof cuerpo.mensaje === 'string' ? cuerpo.mensaje.trim() : '';

  if (nombre.length < 2 || nombre.length > 80) {
    return json(400, { ok: false, error: 'Ingrese su nombre (entre 2 y 80 caracteres).' });
  }
  if (!(TIPOS as readonly string[]).includes(tipo)) {
    return json(400, { ok: false, error: 'Elegí un tipo de mensaje válido.' });
  }
  if (mensaje.length < 5 || mensaje.length > 1000) {
    return json(400, { ok: false, error: 'El mensaje debe tener entre 5 y 1000 caracteres.' });
  }

  // Filtro de lenguaje ANTES de guardar: el servidor es siempre la autoridad.
  const palabraProhibida =
    detectarPalabraInapropiada(nombre) ?? detectarPalabraInapropiada(mensaje);
  if (palabraProhibida) {
    return json(400, {
      ok: false,
      error:
        'Su mensaje contiene lenguaje que no se permite. Ajuste el texto para poder enviarlo.',
      palabra: palabraProhibida,
    });
  }

  try {
    await guardarMensaje({ nombre, tipo: tipo as TipoBuzon, mensaje });
  } catch {
    return json(500, { ok: false, error: 'No se pudo guardar el mensaje. Intente de nuevo.' });
  }

  return json(200, { ok: true });
};