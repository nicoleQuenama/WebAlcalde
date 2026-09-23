import type { DatosPagina, EstadoPagina, InitData, SeccionData } from '@types/cms';
import type { EditorContexto } from '@types/cms/editorContext';
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
  const ctx = {} as EditorContexto;
  ctx.cache = cache;
  ctx.paginaActual = init.pagina.pagina;
  ctx.portapapeles = null;
  ctx.dominioIndex = new Map<string, SeccionData>();
  ctx.hayCambiosSinGuardar = false;
  ctx.secreto = secreto;
  ctx.iframe = iframe;
  ctx.estadoEl = estadoEl;
  ctx.overlay = overlay;
  ctx.modal = modal;
  ctx.portapapelesEl = portapapelesEl;

  function marcarSucio() {
    ctx.hayCambiosSinGuardar = true;
    estadoEl.textContent = 'Cambios sin guardar';
    estadoEl.className = 'cms-estado cms-estado--sucio';
  }
  ctx.marcarSucio = marcarSucio;
  ctx.actualizarBarraPortapapeles = () => actualizarBarraPortapapeles(ctx);
  ctx.syncPortapapelesPreview = () => syncPortapapelesPreview(ctx);
  ctx.syncPreviewOrden = (dominioAfectado?: string) => syncPreviewOrden(ctx, dominioAfectado);
  ctx.syncPreviewMedia = (dominio, clave, campo, valor) => syncPreviewMedia(ctx, dominio, clave, campo, valor);
  ctx.alEditarCampoInline = (dominio, clave, campo, valor) => alEditarCampoInline(ctx, dominio, clave, campo, valor);
  ctx.copiarItem = (dominio, data, campos) => copiarItem(ctx, dominio, data, campos);
  ctx.copiarSeccion = (sec) => copiarSeccion(ctx, sec);
  ctx.duplicarItem = (dominio, clave) => duplicarItem(ctx, dominio, clave);
  ctx.pegarEn = (dominio, indice) => pegarEn(ctx, dominio, indice);
  ctx.pegarSeccion = (sec, pos) => pegarSeccion(ctx, sec, pos);
  ctx.pegarSeccionDespues = (targetKey) => pegarSeccionDespues(ctx, targetKey);
  ctx.duplicarSeccion = (sec) => duplicarSeccion(ctx, sec);
  ctx.cerrarModal = () => cerrarModal(ctx);
  ctx.crearHeaderModal = (titulo, subtitulo, acciones) => crearHeaderModal(ctx, titulo, subtitulo, acciones);
  ctx.mostrarEstructura = () => mostrarEstructura(ctx);
  ctx.mostrarSingle = (sec) => mostrarSingle(ctx, sec);
  ctx.mostrarPlaceholder = (sec) => mostrarPlaceholder(ctx, sec);
  ctx.mostrarLista = (sec) => mostrarLista(ctx, sec);
  ctx.mostrarItem = (sec, clave) => mostrarItem(ctx, sec, clave);
  ctx.seleccionar = (dominio, clave) => seleccionar(ctx, dominio, clave);

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

  // ── Guardado ──────────────────────────────────────────────────────────
  async function llamarApi(metodo: 'POST' | 'DELETE', dominio: string, body: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/contenido/${dominio}`, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': secreto },
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function guardarTodo() {
    estadoEl.textContent = 'Guardando…';
    estadoEl.className = 'cms-estado';
    const tareas: Promise<boolean>[] = [];

    for (const estado of cache.values()) {
      const { datos, originales } = estado;
      datos.ordenLayout.forEach((key, i) => {
        tareas.push(llamarApi('POST', datos.pagina.layoutDominio, { clave: key, data: {}, orden: i }));
      });
      for (const sec of datos.secciones) {
        if (sec.tipo === 'single' && sec.dominio) {
          tareas.push(llamarApi('POST', sec.dominio, { clave: 'principal', data: sec.valor ?? {}, orden: 0 }));
        } else if (sec.tipo === 'lista' && sec.dominio) {
          const items = sec.items ?? [];
          items.forEach((it, i) => tareas.push(llamarApi('POST', sec.dominio!, { clave: it.clave, data: it.data, orden: i })));
          const actuales = new Set(items.map((i) => i.clave));
          for (const claveVieja of originales.get(sec.dominio) ?? []) {
            if (!actuales.has(claveVieja)) tareas.push(llamarApi('DELETE', sec.dominio, { clave: claveVieja }));
          }
        }
      }
    }

    const resultados = await Promise.all(tareas);
    const huboError = resultados.some((ok) => !ok);
    for (const estado of cache.values()) estado.originales = construirOriginales(estado.datos);

    if (huboError) {
      estadoEl.textContent = 'Error al guardar — reintentá';
      estadoEl.className = 'cms-estado cms-estado--error';
      return;
    }
    ctx.hayCambiosSinGuardar = false;
    estadoEl.textContent = 'Todo guardado';
    estadoEl.className = 'cms-estado';
    iframe.contentWindow?.location.reload();
  }

  document.getElementById('cms-guardar')?.addEventListener('click', () => void guardarTodo());
  document.getElementById('cms-refrescar')?.addEventListener('click', () => iframe.contentWindow?.location.reload());

  // ── Índice dominio → sección ─────────────────────────────────────────
  function reconstruirDominioIndex() {
    const datos = cache.get(ctx.paginaActual)!.datos;
    ctx.dominioIndex = new Map(datos.secciones.filter((s) => s.dominio).map((s) => [s.dominio!, s]));
  }
  reconstruirDominioIndex();

  async function alCambiarPagina(ruta: string) {
    const objetivo = init.paginas.find((p) => p.ruta === ruta);
    if (!objetivo || objetivo.pagina === ctx.paginaActual) return;
    ctx.paginaActual = objetivo.pagina;
    ctx.cerrarModal();
    verPaginaEl.href = ruta;
    if (!cache.has(ctx.paginaActual)) {
      const res = await fetch(`/api/admin/init/${ctx.paginaActual}`, { headers: { 'X-Admin-Secret': secreto } });
      if (!res.ok) return;
      const datos: DatosPagina = await res.json();
      cache.set(ctx.paginaActual, { datos, originales: construirOriginales(datos) });
    }
    reconstruirDominioIndex();
  }

  // ── Mensajes desde el iframe (preview del sitio real) ────────────────
  window.addEventListener('message', (e) => {
    const data = e.data as { source?: string; type?: string; [k: string]: unknown } | null;
    if (!data || data.source !== 'cms-preview') return;
    if (data.type === 'pagina') void alCambiarPagina(String(data.ruta ?? ''));
    else if (data.type === 'campo') {
      const dominio = data.dominio as string;
      const clave = data.clave as string | undefined;
      const campo = String(data.campo ?? '');
      const valor = String(data.valor ?? '');
      ctx.alEditarCampoInline(dominio, clave, campo, valor);
      if (['imagen', 'coverImage', 'video', 'src'].includes(campo)) ctx.syncPreviewMedia(dominio, clave, campo, valor);
    }
    else if (data.type === 'imagen') {
      const d = data as unknown as { dominio?: string; clave?: string; src?: string; originalSrc?: string };
      if (d.dominio && d.src) {
        // Ya manejado por 'campo', solo sincronizar preview media
        ctx.syncPreviewMedia(d.dominio, d.clave, 'imagen', String(d.src));
      } else if (d.src && d.originalSrc) {
        // Override genérico sin dominio: guardar en dominio virtual media_override
        const key = `media_${btoa(d.originalSrc).slice(0, 32)}`;
        const estado = cache.get(ctx.paginaActual);
        if (estado) {
          // Guardar en un dominio virtual para persistir
          let secOverride = ctx.dominioIndex.get('media_override');
          if (!secOverride) {
            // crear sección virtual en memoria si no existe
            const nueva: SeccionData = { key: 'media_override', titulo: 'Media overrides', tipo: 'lista', dominio: 'media_override', campos: [{ name: 'src', label: 'URL', type: 'imagen' }], items: [] };
            estado.datos.secciones.push(nueva);
            ctx.dominioIndex.set('media_override', nueva);
          }
          secOverride = ctx.dominioIndex.get('media_override')!;
          const items = secOverride.items ?? (secOverride.items = []);
          const existente = items.find((i) => (i.data['original'] as string) === d.originalSrc);
          if (existente) existente.data['src'] = d.src;
          else items.push({ clave: key, data: { original: d.originalSrc, src: d.src } });
          marcarSucio();
        }
      }
    }
    else if (data.type === 'seleccionar') ctx.seleccionar(data.dominio as string | undefined, data.clave as string | undefined);
    else if (data.type === 'copiar') {
      const dominio = data.dominio as string;
      const clave = data.clave as string | undefined;
      const esSeccion = data.esSeccion as boolean | undefined;
      const sec = ctx.dominioIndex.get(dominio);
      if (!sec) return;
      // Si se pidió copiar sección explícitamente (click derecho sobre sección sin clave)
      if (esSeccion || (!clave && sec.tipo !== 'single')) {
        // Para lista sin clave => copiar sección completa (no solo un item)
        if (!clave) {
          ctx.copiarSeccion(sec);
          if (!overlay.hidden) ctx.mostrarEstructura();
          return;
        }
      }
      const src = clave ? sec.items?.find((i) => i.clave === clave)?.data : sec.valor;
      if (!src) {
        // fallback: si era lista sin items, copiar sección
        if (sec.tipo === 'lista' && !clave) {
          ctx.copiarSeccion(sec);
          if (!overlay.hidden) ctx.mostrarEstructura();
          return;
        }
        return;
      }
      ctx.copiarItem(dominio, src as Record<string, unknown>, sec.campos ?? []);
      // Si estábamos en vista lista, refrescar para mostrar dropzones activas
      if (!overlay.hidden && sec.tipo === 'lista') ctx.mostrarLista(sec);
    } else if (data.type === 'duplicar') {
      const dominio = data.dominio as string;
      const clave = data.clave as string | undefined;
      const esSeccion = data.esSeccion as boolean | undefined;
      if (esSeccion || !clave) {
        const sec = ctx.dominioIndex.get(dominio);
        if (sec && ctx.duplicarSeccion(sec)) {
          if (!overlay.hidden) ctx.mostrarEstructura();
        }
      } else if (ctx.duplicarItem(dominio, clave ?? '')) {
        const sec = ctx.dominioIndex.get(dominio);
        if (sec && !overlay.hidden && sec.tipo === 'lista') ctx.mostrarLista(sec);
      }
    } else if (data.type === 'pegarSeccion') {
      const dominio = data.dominio as string | undefined;
      let targetKey: string | undefined;
      if (dominio) {
        const sec = ctx.dominioIndex.get(dominio);
        targetKey = sec?.key;
      }
      // si no hay dominio (click en fondo), pegar al final
      if (!targetKey) {
        const estado = cache.get(ctx.paginaActual)!;
        targetKey = estado.datos.ordenLayout[estado.datos.ordenLayout.length - 1];
      }
      if (targetKey && ctx.pegarSeccionDespues(targetKey)) {
        if (!overlay.hidden) ctx.mostrarEstructura();
        // forzar refresco de estructura para mostrar banner actualizado
        try {
          ctx.mostrarEstructura();
        } catch {}
        estadoEl.textContent = `Sección pegada: ${ctx.portapapeles?.label ?? ''}`;
        setTimeout(() => {
          if (ctx.hayCambiosSinGuardar) estadoEl.textContent = 'Cambios sin guardar';
        }, 1500);
      }
    } else if (data.type === 'pegar') {
      const dominio = data.dominio as string;
      const clave = data.clave as string | undefined;
      const posicion = data.posicion as string | undefined;
      // Si el portapapeles es sección, redirigir a pegarSeccion
      if (ctx.portapapeles?.tipo === 'seccion') {
        const sec = ctx.dominioIndex.get(dominio);
        if (sec && ctx.pegarSeccionDespues(sec.key)) {
          if (!overlay.hidden) ctx.mostrarEstructura();
          estadoEl.textContent = `Sección pegada: ${ctx.portapapeles?.label ?? ''}`;
          setTimeout(() => {
            if (ctx.hayCambiosSinGuardar) estadoEl.textContent = 'Cambios sin guardar';
          }, 1500);
        }
        return;
      }
      const sec = ctx.dominioIndex.get(dominio);
      if (!sec) return;
      let pos: number;
      if (posicion === 'final' || !clave) pos = sec.items?.length ?? 0;
      else {
        const idx = sec.items?.findIndex((i) => i.clave === clave) ?? -1;
        pos = idx === -1 ? (sec.items?.length ?? 0) : idx + 1;
      }
      if (ctx.pegarEn(dominio, pos)) {
        if (!overlay.hidden && sec.tipo === 'lista') ctx.mostrarLista(sec);
        // feedback visual en preview: flash del nuevo item
        estadoEl.textContent = `Pegado: ${ctx.portapapeles?.label ?? ''}`;
        setTimeout(() => {
          if (ctx.hayCambiosSinGuardar) estadoEl.textContent = 'Cambios sin guardar';
        }, 1200);
      }
    } else if (data.type === 'reordenar') {
      const d = data as unknown as { dominio?: string; clave?: string; direccion?: string; orden?: string[]; ordenClaves?: string[] };
      if (d.orden && Array.isArray(d.orden)) {
        const estado = cache.get(ctx.paginaActual);
        if (estado) {
          estado.datos.ordenLayout = d.orden as string[];
          marcarSucio();
          ctx.syncPreviewOrden();
        }
      } else if (d.dominio && d.ordenClaves && Array.isArray(d.ordenClaves)) {
        const sec = ctx.dominioIndex.get(d.dominio);
        if (!sec?.items) return;
        const mapa = new Map(sec.items.map((it) => [it.clave, it]));
        const reordenados = d.ordenClaves.map((k) => mapa.get(k)).filter(Boolean) as typeof sec.items;
        for (const it of sec.items) if (!d.ordenClaves.includes(it.clave)) reordenados.push(it);
        sec.items = reordenados;
        marcarSucio();
        ctx.syncPreviewOrden(d.dominio);
      } else if (d.dominio && d.clave && d.direccion) {
        const sec = ctx.dominioIndex.get(d.dominio);
        if (!sec?.items) return;
        const idx = sec.items.findIndex((i) => i.clave === d.clave);
        if (idx === -1) return;
        const ni = d.direccion === 'up' ? idx - 1 : idx + 1;
        if (ni < 0 || ni >= sec.items.length) return;
        [sec.items[idx], sec.items[ni]] = [sec.items[ni], sec.items[idx]];
        marcarSucio();
        ctx.syncPreviewOrden(d.dominio);
      }
    }
  });

  // Cuando el iframe carga, sincronizar clipboard y orden actual
  iframe.addEventListener('load', () => {
    ctx.syncPortapapelesPreview();
    const estado = cache.get(ctx.paginaActual);
    if (estado) ctx.syncPreviewOrden();
  });

  // ── Botón Estructura en topbar ───────────────────────────────────────
  estructuraBtn?.addEventListener('click', () => ctx.mostrarEstructura());

  // ── Barra de dispositivo ────────────────────────────────────────────
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