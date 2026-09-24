import { getServicioCMS, type ServicioCMS } from '@cms';
import { crearContextoSitio, PAGINAS, paginaPorId } from './campos';
import type { ContextoSitio, PaginaConfig, SeccionConfig } from './campos';

/**
 * Contenido de una sección listo para el editor: valor único (fila) o ítems
 * (lista). `SeccionConfig` declara la FORMA; `SeccionData` agrega el VALOR
 * efectivo (default + override del almacén).
 */
export interface SeccionData extends SeccionConfig {
  /** Colección del almacén para esta sección (`fuente.coleccion`), materializada para que el editor y el DOM `data-cms-dominio` la usen. */
  dominio?: string;
  valor?: Record<string, unknown>;
  items?: { clave: string; data: Record<string, unknown> }[];
}

export interface DatosPagina {
  pagina: PaginaConfig;
  ordenLayout: string[];
  secciones: SeccionData[];
}

/** Clave estable de un ítem para la UI: su `id` si lo trae, si no su índice. */
function claveDeItem(data: Record<string, unknown>, indice: number): string {
  const id = data['id'];
  return typeof id === 'string' && id.length > 0 ? id : String(indice);
}

/**
 * Materializa UNA sección a partir de su `fuente` declarada. Es el único punto
 * donde se cruzan defaults del sitio (vía `ContextoSitio`) con el almacén del
 * servicio CMS — sin ramas por página.
 */
async function resolverSeccion(
  seccion: SeccionConfig,
  ctx: ContextoSitio,
  svc: ServicioCMS,
): Promise<SeccionData> {
  const { fuente } = seccion;

  if (fuente.tipo === 'fila') {
    const porDefecto = await fuente.porDefecto(ctx);
    return {
      ...seccion,
      dominio: fuente.coleccion,
      valor: await svc.efectivo(fuente.coleccion, fuente.clave, porDefecto),
    };
  }

  if (fuente.tipo === 'lista') {
    const porDefecto = await fuente.porDefecto(ctx);
    const items = (await svc.efectivoLista(fuente.coleccion, porDefecto)).map((data, i) => ({
      clave: claveDeItem(data, i),
      data,
    }));
    return { ...seccion, dominio: fuente.coleccion, items };
  }

  return { ...seccion };
}

/**
 * Contenido editable completo de una página: config + layout efectivo +
 * todas las secciones resueltas. Usado por `/admin/[secret]` y por
 * `/api/admin/init/[pagina]`.
 */
export async function calcularDatosPagina(paginaId: string): Promise<DatosPagina | undefined> {
  const pagina = paginaPorId(paginaId);
  if (!pagina) return undefined;

  const ctx = crearContextoSitio();
  const svc = getServicioCMS();
  const secciones = await Promise.all(pagina.secciones.map((s) => resolverSeccion(s, ctx, svc)));
  const ordenLayout = await svc.efectivoOrden(pagina.layoutDominio, pagina.layoutPorDefecto);

  return { pagina, ordenLayout, secciones };
}

/** Todas las páginas editables con su ruta real — para detectar a dónde navegó el iframe. */
export const PAGINAS_CON_RUTA = PAGINAS.map((p) => ({ pagina: p.pagina, titulo: p.titulo, ruta: p.ruta }));