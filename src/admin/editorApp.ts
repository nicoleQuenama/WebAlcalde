import type { EstadoPagina, InitData, SeccionData } from '@type/cms';
import type { EditorContexto } from '@type/cms/editorContext';
import { construirOriginales } from './helpers';
import {
  actualizarBarraPortapapeles,
  copiarItem,
  copiarSeccion,
  duplicarItem,
  duplicarSeccion,
  pegarEn,
  pegarSeccion,
  pegarSeccionDespues,
} from './clipboard';
import {
  alEditarCampoInline,
  syncPortapapelesPreview,
  syncPreviewMedia,
  syncPreviewOrden,
} from './previewSync';
import {
  cerrarModal,
  crearHeaderModal,
  mostrarEstructura,
  mostrarItem,
  mostrarLista,
  mostrarPlaceholder,
  mostrarSingle,
  seleccionar,
} from './views';
import { iniciarContextMenu, cerrarContextMenu } from './contextMenu';
import { guardarTodo } from './guardado';
import { manejarMensajePreview, reconstruirDominioIndex, type EventoPreview } from './previewMessages';

/**
 * Orquestador del editor CMS: crea el cache por página y el `EditorContexto`,
 * cablea los módulos (`clipboard`, `views`, `previewSync`, `guardado`) y
 * registra los listeners del shell. Cada pieza vive en su módulo: los mensajes
 * del iframe en `previewMessages`, la persistencia en `guardado` y los
 * overrides de media en `mediaOverride`.
 */
export function montarEditor(init: InitData) {
  const secreto = init.secreto;

  // ── Estado por página, cacheado ──
  const cache = new Map<string, EstadoPagina>();
  cache.set(init.pagina.pagina, {
    datos: { pagina: init.pagina, ordenLayout: init.ordenLayout, secciones: init.secciones },
    originales: construirOriginales(init),
  });

  const iframe = document.getElementById('cms-iframe') as HTMLIFrameElement;
  const estadoEl = document.getElementById('cms-estado')!;
  const verPaginaEl = document.getElementById('cms-ver-pagina') as HTMLAnchorElement;
  const overlay = document.getElementById('cms-modal-overlay')!;
  const modal = document.getElementById('cms-modal')!;
  const portapapelesEl = document.getElementById('cms-portapapeles') as HTMLElement | null;
  const estructuraBtn = document.getElementById('cms-estructura') as HTMLButtonElement | null;

  // ── Contexto compartido por los módulos del editor ──
  const ctx: EditorContexto = {
    cache,
    paginaActual: init.pagina.pagina,
    portapapeles: null,
    dominioIndex: new Map<string, SeccionData>(),
    hayCambiosSinGuardar: false,
    secreto,
    iframe,
    estadoEl,
    overlay,
    modal,
    portapapelesEl,
    marcarSucio() {
      ctx.hayCambiosSinGuardar = true;
      estadoEl.textContent = 'Cambios sin guardar';
      estadoEl.className = 'cms-estado cms-estado--sucio';
    },
    actualizarBarraPortapapeles: () => actualizarBarraPortapapeles(ctx),
    syncPortapapelesPreview: () => syncPortapapelesPreview(ctx),
    syncPreviewOrden: (dominioAfectado?: string) => syncPreviewOrden(ctx, dominioAfectado),
    syncPreviewMedia: (dominio, clave, campo, valor) => syncPreviewMedia(ctx, dominio, clave, campo, valor),
    alEditarCampoInline: (dominio, clave, campo, valor) => alEditarCampoInline(ctx, dominio, clave, campo, valor),
    copiarItem: (dominio, data, campos) => copiarItem(ctx, dominio, data, campos),
    copiarSeccion: (sec) => copiarSeccion(ctx, sec),
    duplicarItem: (dominio, clave) => duplicarItem(ctx, dominio, clave),
    pegarEn: (dominio, indice) => pegarEn(ctx, dominio, indice),
    pegarSeccion: (sec, pos) => pegarSeccion(ctx, sec, pos),
    pegarSeccionDespues: (targetKey) => pegarSeccionDespues(ctx, targetKey),
    duplicarSeccion: (sec) => duplicarSeccion(ctx, sec),
    cerrarModal: () => cerrarModal(ctx),
    crearHeaderModal: (titulo, subtitulo, acciones) => crearHeaderModal(ctx, titulo, subtitulo, acciones),
    mostrarEstructura: () => mostrarEstructura(ctx),
    mostrarSingle: (sec) => mostrarSingle(ctx, sec),
    mostrarPlaceholder: (sec) => mostrarPlaceholder(ctx, sec),
    mostrarLista: (sec) => mostrarLista(ctx, sec),
    mostrarItem: (sec, clave) => mostrarItem(ctx, sec, clave),
    seleccionar: (dominio, clave) => seleccionar(ctx, dominio, clave),
  };

  // ── Cierres globales (menú contextual + modal) ──
  iniciarContextMenu();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) ctx.cerrarModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarContextMenu();
      if (!overlay.hidden) ctx.cerrarModal();
    }
  });

  window.addEventListener('beforeunload', (e) => {
    if (!ctx.hayCambiosSinGuardar) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // ── Guardado y refresco del shell ──
  document.getElementById('cms-guardar')?.addEventListener('click', () => void guardarTodo(ctx));
  document.getElementById('cms-refrescar')?.addEventListener('click', () => iframe.contentWindow?.location.reload());

  // ── Índice dominio → sección ──
  reconstruirDominioIndex(ctx);

  // ── Mensajes desde el iframe (preview del sitio real) ──
  window.addEventListener('message', (e) => {
    const mensaje = e.data as EventoPreview | null;
    if (!mensaje || mensaje.source !== 'cms-preview') return;
    manejarMensajePreview(ctx, mensaje, { paginas: init.paginas, verPagina: verPaginaEl });
  });

  // Cuando el iframe carga, sincronizar clipboard y orden actual
  iframe.addEventListener('load', () => {
    ctx.syncPortapapelesPreview();
    const estado = cache.get(ctx.paginaActual);
    if (estado) ctx.syncPreviewOrden();
  });

  // ── Botón Estructura en topbar ──
  estructuraBtn?.addEventListener('click', () => ctx.mostrarEstructura());

  // ── Barra de dispositivo ──
  const botonesDispositivo = document.querySelectorAll<HTMLButtonElement>('[data-device]');
  botonesDispositivo.forEach((btn) => {
    btn.addEventListener('click', () => {
      botonesDispositivo.forEach((b) => b.classList.remove('activo'));
      btn.classList.add('activo');
      const ancho = btn.dataset.device;
      iframe.style.width = ancho === 'full' ? '100%' : `${ancho}px`;
    });
  });
}