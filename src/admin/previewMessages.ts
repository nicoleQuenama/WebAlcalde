import type { DatosPagina, InitData, SeccionData } from '@type/cms';
import type { EditorContexto } from '@type/cms/editorContext';
import { construirOriginales, feedbackEstado } from './helpers';
import { esCampoMultimedia } from './previewSync';
import { guardarOverrideMedia } from './mediaOverride';

/**
 * Mensajes que la vista previa real del sitio (`Layout.astro`, bloque CMS
 * cuando `window.top !== window.self`) envía al editor, tipados por tipo.
 * Este módulo concentra TANTO los tipos del protocolo como el dispatch de
 * cada mensaje a los módulos del editor (clipboard/views/previewSync/…).
 * El listener del shell (`editorApp`) queda reducido a un `switch`.
 */

// ── Protocolo (tipos de mensaje) ─────────────────────────────────────────

type MensajePagina = { type: 'pagina'; ruta?: string };
type MensajeCampo = { type: 'campo'; dominio: string; clave?: string; campo: string; valor: string };
type MensajeImagen = { type: 'imagen'; dominio?: string; clave?: string; src?: string; originalSrc?: string };
type MensajeSeleccionar = { type: 'seleccionar'; dominio?: string; clave?: string };
type MensajeCopiar = { type: 'copiar'; dominio: string; clave?: string; esSeccion?: boolean };
type MensajeDuplicar = { type: 'duplicar'; dominio: string; clave?: string; esSeccion?: boolean };
type MensajePegarSeccion = { type: 'pegarSeccion'; dominio?: string; clave?: string; posicion?: string; seccionKey?: string };
type MensajePegar = { type: 'pegar'; dominio: string; clave?: string; posicion?: string };
type MensajeReordenar = { type: 'reordenar'; dominio?: string; clave?: string; direccion?: string; orden?: string[]; ordenClaves?: string[] };

export type MensajePreview =
  | MensajePagina
  | MensajeCampo
  | MensajeImagen
  | MensajeSeleccionar
  | MensajeCopiar
  | MensajeDuplicar
  | MensajePegarSeccion
  | MensajePegar
  | MensajeReordenar;

/** Sobre envoltorio que viaja entre la vista previa y el editor. */
export type EventoPreview = { source: 'cms-preview' } & MensajePreview;

/** Dependencias del shell que los handlers necesitan y que no viven en el contexto. */
export interface DependenciasPreview {
  paginas: InitData['paginas'];
  verPagina: HTMLAnchorElement;
}

// ── Refresco de vistas (el modal abierto y el overlay) ───────────────────

function refrescarEstructura(ctx: EditorContexto): void {
  if (!ctx.overlay.hidden) ctx.mostrarEstructura();
}

function refrescarListaSiAbierta(ctx: EditorContexto, sec: SeccionData): void {
  if (!ctx.overlay.hidden && sec.tipo === 'lista') ctx.mostrarLista(sec);
}

/** Reconstruye el mapa dominio → sección de la página actual. */
export function reconstruirDominioIndex(ctx: EditorContexto): void {
  const datos = ctx.cache.get(ctx.paginaActual)!.datos;
  ctx.dominioIndex = new Map(datos.secciones.filter((s) => s.dominio).map((s) => [s.dominio!, s]));
}

// ── Handlers por tipo de mensaje ─────────────────────────────────────────

async function manejarPagina(ctx: EditorContexto, ruta: string, deps: DependenciasPreview): Promise<void> {
  const objetivo = deps.paginas.find((p) => p.ruta === ruta);
  if (!objetivo || objetivo.pagina === ctx.paginaActual) return;
  ctx.paginaActual = objetivo.pagina;
  ctx.cerrarModal();
  deps.verPagina.href = ruta;
  if (!ctx.cache.has(ctx.paginaActual)) {
    const res = await fetch(`/api/admin/init/${ctx.paginaActual}`, { headers: { 'X-Admin-Secret': ctx.secreto } });
    if (!res.ok) return;
    const datos: DatosPagina = await res.json();
    ctx.cache.set(ctx.paginaActual, { datos, originales: construirOriginales(datos) });
  }
  reconstruirDominioIndex(ctx);
}

function manejarCampo(ctx: EditorContexto, msg: MensajeCampo): void {
  ctx.alEditarCampoInline(msg.dominio, msg.clave, msg.campo, msg.valor);
  // Sync de preview para campos multimedia (además del que hace alEditarCampoInline).
  if (esCampoMultimedia(msg.campo)) ctx.syncPreviewMedia(msg.dominio, msg.clave, msg.campo, msg.valor);
}

function manejarImagen(ctx: EditorContexto, msg: MensajeImagen): void {
  if (msg.dominio && msg.src) {
    // Ya manejado por 'campo', solo sincronizar la media de la vista previa.
    ctx.syncPreviewMedia(msg.dominio, msg.clave, 'imagen', msg.src);
  } else if (msg.src && msg.originalSrc) {
    // Override genérico sin dominio: guardar en el dominio virtual media_override.
    guardarOverrideMedia(ctx, msg.originalSrc, msg.src);
  }
}

function manejarCopiar(ctx: EditorContexto, msg: MensajeCopiar): void {
  const sec = ctx.dominioIndex.get(msg.dominio);
  if (!sec) return;
  const clave = msg.clave;
  const esSeccion = msg.esSeccion;
  // Si se pidió copiar sección explícitamente (click derecho sobre sección sin clave).
  if (esSeccion || (!clave && sec.tipo !== 'single')) {
    // Para lista sin clave => copiar la sección completa (no solo un item).
    if (!clave) {
      ctx.copiarSeccion(sec);
      refrescarEstructura(ctx);
      return;
    }
  }
  const src = clave ? sec.items?.find((i) => i.clave === clave)?.data : sec.valor;
  if (!src) {
    // Fallback: si era lista sin items, copiar la sección.
    if (sec.tipo === 'lista' && !clave) {
      ctx.copiarSeccion(sec);
      refrescarEstructura(ctx);
      return;
    }
    return;
  }
  ctx.copiarItem(msg.dominio, src as Record<string, unknown>, sec.campos ?? []);
  // Si estábamos en vista lista, refrescar para mostrar las dropzones activas.
  refrescarListaSiAbierta(ctx, sec);
}

function manejarDuplicar(ctx: EditorContexto, msg: MensajeDuplicar): void {
  const sec = ctx.dominioIndex.get(msg.dominio);
  if (msg.esSeccion || !msg.clave) {
    if (sec && ctx.duplicarSeccion(sec)) refrescarEstructura(ctx);
  } else if (ctx.duplicarItem(msg.dominio, msg.clave)) {
    if (sec && !ctx.overlay.hidden && sec.tipo === 'lista') ctx.mostrarLista(sec);
  }
}

function manejarPegarSeccion(ctx: EditorContexto, msg: MensajePegarSeccion): void {
  let targetKey: string | undefined;
  if (msg.dominio) {
    const sec = ctx.dominioIndex.get(msg.dominio);
    targetKey = sec?.key;
  }
  // Si no hay dominio (click en fondo), pegar al final.
  if (!targetKey) {
    const estado = ctx.cache.get(ctx.paginaActual)!;
    targetKey = estado.datos.ordenLayout[estado.datos.ordenLayout.length - 1];
  }
  if (targetKey && ctx.pegarSeccionDespues(targetKey)) {
    // Forzar refresco de la estructura para mostrar el banner actualizado
    // (abre el modal si estaba cerrado, igual que el comportamiento original).
    ctx.mostrarEstructura();
    feedbackEstado(ctx, `Sección pegada: ${ctx.portapapeles?.label ?? ''}`, 1500);
  }
}

function manejarPegar(ctx: EditorContexto, msg: MensajePegar): void {
  // Si el portapapeles es una sección, redirigir a pegarSeccion.
  if (ctx.portapapeles?.tipo === 'seccion') {
    const sec = ctx.dominioIndex.get(msg.dominio);
    if (sec && ctx.pegarSeccionDespues(sec.key)) {
      refrescarEstructura(ctx);
      feedbackEstado(ctx, `Sección pegada: ${ctx.portapapeles?.label ?? ''}`, 1500);
    }
    return;
  }
  const sec = ctx.dominioIndex.get(msg.dominio);
  if (!sec) return;
  let pos: number;
  if (msg.posicion === 'final' || !msg.clave) pos = sec.items?.length ?? 0;
  else {
    const idx = sec.items?.findIndex((i) => i.clave === msg.clave) ?? -1;
    pos = idx === -1 ? (sec.items?.length ?? 0) : idx + 1;
  }
  if (ctx.pegarEn(msg.dominio, pos)) {
    refrescarListaSiAbierta(ctx, sec);
    // Feedback visual en preview: flash del nuevo item.
    feedbackEstado(ctx, `Pegado: ${ctx.portapapeles?.label ?? ''}`, 1200);
  }
}

function manejarReordenar(ctx: EditorContexto, msg: MensajeReordenar): void {
  if (msg.orden && Array.isArray(msg.orden)) {
    const estado = ctx.cache.get(ctx.paginaActual);
    if (estado) {
      estado.datos.ordenLayout = msg.orden;
      ctx.marcarSucio();
      ctx.syncPreviewOrden();
    }
  } else if (msg.dominio && msg.ordenClaves && Array.isArray(msg.ordenClaves)) {
    const sec = ctx.dominioIndex.get(msg.dominio);
    if (!sec?.items) return;
    const mapa = new Map(sec.items.map((it) => [it.clave, it]));
    const reordenados = msg.ordenClaves
      .map((k) => mapa.get(k))
      .filter((x): x is { clave: string; data: Record<string, unknown> } => Boolean(x));
    for (const it of sec.items) if (!msg.ordenClaves.includes(it.clave)) reordenados.push(it);
    sec.items = reordenados;
    ctx.marcarSucio();
    ctx.syncPreviewOrden(msg.dominio);
  } else if (msg.dominio && msg.clave && msg.direccion) {
    const sec = ctx.dominioIndex.get(msg.dominio);
    if (!sec?.items) return;
    const idx = sec.items.findIndex((i) => i.clave === msg.clave);
    if (idx === -1) return;
    const ni = msg.direccion === 'up' ? idx - 1 : idx + 1;
    if (ni < 0 || ni >= sec.items.length) return;
    [sec.items[idx], sec.items[ni]] = [sec.items[ni], sec.items[idx]];
    ctx.marcarSucio();
    ctx.syncPreviewOrden(msg.dominio);
  }
}

// ── Dispatch ─────────────────────────────────────────────────────────────

export function manejarMensajePreview(ctx: EditorContexto, mensaje: MensajePreview, deps: DependenciasPreview): void {
  switch (mensaje.type) {
    case 'pagina':
      void manejarPagina(ctx, String(mensaje.ruta ?? ''), deps);
      break;
    case 'campo':
      manejarCampo(ctx, mensaje);
      break;
    case 'imagen':
      manejarImagen(ctx, mensaje);
      break;
    case 'seleccionar':
      ctx.seleccionar(mensaje.dominio, mensaje.clave);
      break;
    case 'copiar':
      manejarCopiar(ctx, mensaje);
      break;
    case 'duplicar':
      manejarDuplicar(ctx, mensaje);
      break;
    case 'pegarSeccion':
      manejarPegarSeccion(ctx, mensaje);
      break;
    case 'pegar':
      manejarPegar(ctx, mensaje);
      break;
    case 'reordenar':
      manejarReordenar(ctx, mensaje);
      break;
  }
}