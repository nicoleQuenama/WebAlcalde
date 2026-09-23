import type { EditorContexto } from '@types/cms/editorContext';
import { COLOR_ACCENT } from '@constants/admin/editorColors';
import {
  aplicarOrdenLayout,
  crearFantasmasSeccion,
  hacerScrollAlPegado,
  hijosConDominio,
  reordenarItemsDominio,
  seccionesFaltantes,
} from './previewSyncOrden';

/**
 * Sincronización entre el estado del editor y el iframe de vista previa:
 * postMessage del portapapeles, refresco de textos/medios y orquestación del
 * reordenamiento del DOM real de la página según el orden guardado.
 * La mutación del DOM (fantasmas + `style.order` + ítems) vive en
 * `./previewSyncOrden`.
 */

const CAMPOS_IMG_BLOQUE = new Set(['imagen', 'coverImage', 'src']);
const CAMPOS_IMG_SECCION = new Set(['imagen', 'coverImage']);
const CAMPOS_VIDEO = new Set(['video', 'src']);
const CAMPOS_MULTIMEDIA = new Set([...CAMPOS_IMG_BLOQUE, ...CAMPOS_VIDEO, 'poster']);

function esCampoMultimedia(campo: string): boolean {
  return CAMPOS_MULTIMEDIA.has(campo);
}

export function syncPortapapelesPreview(ctx: EditorContexto): void {
  try {
    ctx.iframe.contentWindow?.postMessage(
      {
        source: 'cms-editor',
        type: 'clipboard',
        payload: ctx.portapapeles
          ? { dominio: ctx.portapapeles.dominio, label: ctx.portapapeles.label, tipo: ctx.portapapeles.tipo, seccionKey: ctx.portapapeles.seccionKey }
          : null,
      },
      '*',
    );
  } catch {}
  repintarEstructuraSiCorresponde(ctx);
}

/** Si el modal Estructura está abierto y hay una sección copiada, lo repinta para mostrar las zonas de pegado. */
function repintarEstructuraSiCorresponde(ctx: EditorContexto): void {
  try {
    if (ctx.overlay.hidden || !ctx.modal.querySelector('.cms-estructura-lista')) return;
    const estado = ctx.cache.get(ctx.paginaActual);
    if (estado && ctx.portapapeles?.tipo === 'seccion') ctx.mostrarEstructura();
  } catch {}
}

export function syncPreviewOrden(ctx: EditorContexto, dominioAfectado?: string): void {
  try {
    const estado = ctx.cache.get(ctx.paginaActual);
    if (!estado) return;
    ctx.iframe.contentWindow?.postMessage(
      {
        source: 'cms-editor',
        type: 'cms-sync',
        ordenLayout: estado.datos.ordenLayout,
        dominio: dominioAfectado,
        ordenClaves: dominioAfectado ? (ctx.dominioIndex.get(dominioAfectado)?.items?.map((i) => i.clave) ?? null) : null,
        nuevoDominio: null,
        nuevoKey: null,
      },
      '*',
    );
    // Fallback directo si es same-origin y iframe cargado
    const doc = ctx.iframe.contentDocument;
    if (!doc) return;
    const containers = Array.from(doc.querySelectorAll<HTMLElement>('div[style*="flex-direction:column"], main[style*="display:flex"]'));
    containers.forEach((container) => {
      const hijos = hijosConDominio(container);
      if (hijos.length === 0) return;
      const faltantesKeys = seccionesFaltantes(estado.datos, hijos);
      crearFantasmasSeccion(faltantesKeys, container, estado.datos, hijos);
      const domToEl = aplicarOrdenLayout(container, estado.datos);
      hacerScrollAlPegado(faltantesKeys, estado.datos, domToEl, container);
    });
    if (dominioAfectado) {
      const sec = ctx.dominioIndex.get(dominioAfectado);
      if (sec?.items) reordenarItemsDominio(doc, dominioAfectado, sec);
    }
  } catch {}
}

export function syncPreviewMedia(ctx: EditorContexto, dominio: string, clave: string | undefined, campo: string, valor: string): void {
  try {
    const doc = ctx.iframe.contentDocument;
    if (!doc) return;
    if (clave) {
      const el = doc.querySelector<HTMLElement>(`[data-cms-dominio="${dominio}"][data-cms-clave="${clave}"]`);
      if (!el) return;
      const img = el.querySelector<HTMLImageElement>('img');
      const vid = el.querySelector<HTMLVideoElement>('video');
      if (img && CAMPOS_IMG_BLOQUE.has(campo)) img.src = valor;
      if (vid && CAMPOS_VIDEO.has(campo)) vid.src = valor;
      // también data-url (libro)
      el.querySelectorAll<HTMLElement>('[data-url]').forEach((n) => (n.dataset.url = valor));
      el.style.outline = `3px solid ${COLOR_ACCENT}`;
      setTimeout(() => (el.style.outline = ''), 800);
    } else if (dominio) {
      const sec = doc.querySelector<HTMLElement>(`[data-cms-dominio="${dominio}"]`);
      if (!sec) return;
      const img = sec.querySelector<HTMLImageElement>('img');
      if (img && CAMPOS_IMG_SECCION.has(campo)) img.src = valor;
      if (campo === 'imagen' && sec.style.backgroundImage) sec.style.backgroundImage = `url('${valor}')`;
    }
  } catch {}
}

export function alEditarCampoInline(ctx: EditorContexto, dominio: string, clave: string | undefined, campo: string, valor: string): void {
  const sec = ctx.dominioIndex.get(dominio);
  if (!sec) return;
  const destino = clave ? sec.items?.find((i) => i.clave === clave)?.data : sec.valor;
  if (!destino) return;
  destino[campo] = valor;
  ctx.marcarSucio();
  if (esCampoMultimedia(campo)) syncPreviewMedia(ctx, dominio, clave, campo, valor);
}