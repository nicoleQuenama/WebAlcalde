import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';

import {
  crearSesion,
  crearUsuario,
  eliminarSesion,
  obtenerSesion,
  obtenerUsuario,
  renovarSesion,
} from '@lib/db';

/**
 * Autenticación del panel de administración.
 *
 * Diseño (buenas prácticas):
 * - La contraseña nunca viaja ni se guarda en claro: la API recibe el form
 *   y SOLO entonces se compara el hash bcrypt (cost 12).
 * - Usuario/contraseña se entregan desde el entorno (ADMIN_USER/ADMIN_PASSWORD)
 *   y la cuenta se crea automáticamente en el primer acceso. Así no guardamos
 *   la clave en repos ni en la base de datos.
 * - Sesiones opacas: cookie `HttpOnly` + `SameSite=Strict` (el CSRF por cookie
 *   no aplica) + `Max-Age`. Solo se guarda un token aleatorio (32 bytes) en la
 *   cookie; la correspondencia token → usuario vive en la base de datos.
 * - Expiración deslizante (12 h) renovada en cada petición válida.
 * - Mensajes de error genéricos: no revelamos si el usuario existe.
 */

export const NOMBRE_COOKIE = 'cocha_admin';
export const DURACION_SESION_MS = 12 * 60 * 60 * 1000; // 12 horas
const BCRYPT_COST = 12;

const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

/** Hash "señuelo" para los accesos con usuario inexistente (evita timing). */
const PEZONERA_HASH =
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

function credencialesEnv(): { usuario: string; clave: string } | null {
  const usuario = process.env.ADMIN_USER || import.meta.env.ADMIN_USER;
  const clave = process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD;
  if (!usuario || !clave) return null;
  return { usuario, clave };
}

/**
 * Crea (una sola vez) la cuenta del administrador configurada en el entorno.
 * Se llama en cada acceso al panel, pero el INSERT es idempotente y barato.
 */
export async function asegurarAdministrador(): Promise<void> {
  const c = credencialesEnv();
  if (!c) return;
  const existente = await obtenerUsuario(c.usuario);
  if (existente) return;
  if (c.clave.length < 8) {
    console.error('[auth] ADMIN_PASSWORD debe tener al menos 8 caracteres.');
    return;
  }
  const hash = await bcrypt.hash(c.clave, BCRYPT_COST);
  await crearUsuario({ usuario: c.usuario, passHash: hash, creadoEn: new Date().toISOString() });
}

/**
 * Autentica usuario + contraseña. Devuelve el token de sesión (para colocar
 * en una cookie HttpOnly) o `null` si las credenciales no son válidas.
 */
export async function iniciarSesion(
  usuario: string,
  clave: string,
): Promise<string | null> {
  await asegurarAdministrador();

  const u = (usuario ?? '').trim().toLowerCase();
  const c = clave ?? '';
  if (!u || !c) return null;

  const cuenta = await obtenerUsuario(u);
  const hash = cuenta?.passHash ?? PEZONERA_HASH;
  const valida = await bcrypt.compare(c, hash);
  if (!valida || !cuenta) return null;

  const token = randomBytes(32).toString('base64url');
  const ahora = Date.now();
  await crearSesion({
    token,
    usuario: cuenta.usuario,
    creadoEn: new Date(ahora).toISOString(),
    expiraEn: new Date(ahora + DURACION_SESION_MS).toISOString(),
  });
  return token;
}

/**
 * Valida un token de sesión y devuelve el nombre de usuario, renovando la
 * expiración (sesión deslizante). `null` si no existe o venció.
 */
export async function usuarioValido(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const sesion = await obtenerSesion(token);
  if (!sesion) return null;
  if (Date.now() > new Date(sesion.expiraEn).getTime()) return null;
  await renovarSesion(token, new Date(Date.now() + DURACION_SESION_MS).toISOString());
  return sesion.usuario;
}

/** Destruye la sesión (logout). */
export async function cerrarSesion(token: string | null | undefined): Promise<void> {
  if (!token) return;
  await eliminarSesion(token);
}

// ── Cookies ───────────────────────────────────────────────────────────────────

/** Lee el token de sesión desde el header Cookie de la petición. */
export function obtenerTokenDeRequest(request: Request): string | null {
  const cabecera = request.headers.get('cookie');
  if (!cabecera) return null;
  for (const parte of cabecera.split(';')) {
    const eq = parte.indexOf('=');
    if (eq === -1) continue;
    if (parte.slice(0, eq).trim() === NOMBRE_COOKIE) {
      return decodeURIComponent(parte.slice(eq + 1).trim());
    }
  }
  return null;
}

function cookieAtributos(expiraISO: string | null, maxAgeSegundos: number): string {
  const partes = ['HttpOnly', 'SameSite=Strict', 'Path=/', `Max-Age=${maxAgeSegundos}`];
  if (COOKIE_SECURE) partes.push('Secure');
  if (expiraISO) partes.push(`Expires=${expiraISO}`);
  return partes.join('; ');
}

/** Header Set-Cookie que instala la sesión. */
export function setearCookieSesion(token: string, expiraISO: string, maxAgeSegundos = 43200): string {
  return `${NOMBRE_COOKIE}=${encodeURIComponent(token)}; ${cookieAtributos(expiraISO, maxAgeSegundos)}`;
}

/** Header Set-Cookie que elimina la sesión. */
export function limpiarCookieSesion(): string {
  return `${NOMBRE_COOKIE}=; ${cookieAtributos(null, 0)}`;
}