import type { APIRoute } from 'astro';
import { calcularDatosPagina } from '@lib/cms/datosPagina';

/**
 * Datos editables de UNA página, para cuando el admin navega DENTRO del
 * iframe (usando la navegación real del sitio) a otra página distinta de
 * la que cargó el editor al abrir `/admin/[secret]`. Sin esto, el panel de
 * edición se quedaría mostrando los campos de la página vieja.
 */

function autorizado(request: Request): boolean {
  const secreto = import.meta.env.ADMIN_SECRET_PATH;
  if (!secreto) return false;
  return request.headers.get('x-admin-secret') === secreto;
}

export const GET: APIRoute = async ({ params, request }) => {
  if (!autorizado(request)) return new Response(JSON.stringify({ error: 'no autorizado' }), { status: 401 });
  const datos = calcularDatosPagina(params.pagina!);
  if (!datos) return new Response(JSON.stringify({ error: 'página desconocida' }), { status: 404 });
  return new Response(JSON.stringify(datos), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
