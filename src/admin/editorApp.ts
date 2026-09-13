import type { FieldSpec, PaginaConfig, SeccionConfig } from './campos';

/**
 * Editor CMS (beta) — sin librería de page-builder. La vista previa es la
 * página REAL en un iframe (mismo HTML/CSS/responsive del sitio, con su
 * propia navegación funcionando). Clickear un texto simple (título, párrafo)
 * lo hace editable ahí mismo; clickear cualquier otra cosa (imagen, selector,
 * lista de obras, o la sección en general) abre un modal con sus campos.
 * Nada se guarda solo: todo queda en memoria hasta tocar "Guardar cambios".
 */

export interface SeccionData extends SeccionConfig {
  valor?: Record<string, unknown>;
  items?: { clave: string; data: Record<string, unknown> }[];
}

export interface DatosPagina {
  pagina: PaginaConfig;
  ordenLayout: string[];
  secciones: SeccionData[];
}

export interface InitData extends DatosPagina {
  secreto: string;
  paginas: { pagina: string; titulo: string; ruta: string }[];
}

type Obra = { nombre?: string; anio?: string; detalle?: string; video?: boolean };

interface EstadoPagina {
  datos: DatosPagina;
  /** Claves que YA existían en el servidor al cargar esta página, por dominio de lista — para poder mandar DELETE de las que se hayan sacado. */
  originales: Map<string, Set<string>>;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { className?: string },
  ...hijos: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const nodo = document.createElement(tag);
  if (props) Object.assign(nodo, props);
  for (const h of hijos) nodo.append(h);
  return nodo;
}

/** Adivina un texto representativo del ítem para el título del modal. */
function tituloDeItem(campos: FieldSpec[], data: Record<string, unknown>): string {
  const candidato = campos.find((c) => ['titulo', 'nombre', 'eyebrow'].includes(c.name));
  const valor = candidato ? data[candidato.name] : undefined;
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return texto || '(sin título)';
}

function construirOriginales(datos: DatosPagina): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const sec of datos.secciones) {
    if (sec.tipo === 'lista' && sec.dominio) out.set(sec.dominio, new Set((sec.items ?? []).map((i) => i.clave)));
  }
  return out;
}

export function montarEditor(init: InitData) {
  const secreto = init.secreto;

  // ── Estado por página, cacheado (la navegación real del sitio dentro del
  // iframe puede visitar varias páginas antes de guardar; nada se pierde). ──
  const cache = new Map<string, EstadoPagina>();
  cache.set(init.pagina.pagina, {
    datos: { pagina: init.pagina, ordenLayout: init.ordenLayout, secciones: init.secciones },
    originales: construirOriginales(init),
  });
  let paginaActual = init.pagina.pagina;

  const iframe = document.getElementById('cms-iframe') as HTMLIFrameElement;
  const estadoEl = document.getElementById('cms-estado')!;
  const verPaginaEl = document.getElementById('cms-ver-pagina') as HTMLAnchorElement;
  const overlay = document.getElementById('cms-modal-overlay')!;
  const modal = document.getElementById('cms-modal')!;

  let hayCambiosSinGuardar = false;
  function marcarSucio() {
    hayCambiosSinGuardar = true;
    estadoEl.textContent = 'Cambios sin guardar';
    estadoEl.className = 'cms-estado cms-estado--sucio';
  }

  window.addEventListener('beforeunload', (e) => {
    if (!hayCambiosSinGuardar) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // ── Guardado: todo junto, recién cuando se toca "Guardar cambios" ───────
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
    hayCambiosSinGuardar = false;
    estadoEl.textContent = 'Todo guardado';
    estadoEl.className = 'cms-estado';
    iframe.contentWindow?.location.reload();
  }

  document.getElementById('cms-guardar')?.addEventListener('click', () => void guardarTodo());
  document.getElementById('cms-refrescar')?.addEventListener('click', () => iframe.contentWindow?.location.reload());

  // ── Índice dominio → sección, reconstruido cada vez que cambia la página activa ──
  let dominioIndex = new Map<string, SeccionData>();
  function reconstruirDominioIndex() {
    const datos = cache.get(paginaActual)!.datos;
    dominioIndex = new Map(datos.secciones.filter((s) => s.dominio).map((s) => [s.dominio!, s]));
  }
  reconstruirDominioIndex();

  async function alCambiarPagina(ruta: string) {
    const objetivo = init.paginas.find((p) => p.ruta === ruta);
    if (!objetivo || objetivo.pagina === paginaActual) return;
    paginaActual = objetivo.pagina;
    cerrarModal();
    verPaginaEl.href = ruta;
    if (!cache.has(paginaActual)) {
      const res = await fetch(`/api/admin/init/${paginaActual}`, { headers: { 'X-Admin-Secret': secreto } });
      if (!res.ok) return;
      const datos: DatosPagina = await res.json();
      cache.set(paginaActual, { datos, originales: construirOriginales(datos) });
    }
    reconstruirDominioIndex();
  }

  window.addEventListener('message', (e) => {
    const data = e.data as { source?: string; type?: string; [k: string]: unknown } | null;
    if (!data || data.source !== 'cms-preview') return;
    if (data.type === 'pagina') void alCambiarPagina(String(data.ruta ?? ''));
    else if (data.type === 'campo') alEditarCampoInline(data.dominio as string, data.clave as string | undefined, data.campo as string, data.valor as string);
    else if (data.type === 'seleccionar') seleccionar(data.dominio as string | undefined, data.clave as string | undefined);
  });

  function alEditarCampoInline(dominio: string, clave: string | undefined, campo: string, valor: string) {
    const sec = dominioIndex.get(dominio);
    if (!sec) return;
    const destino = clave ? sec.items?.find((i) => i.clave === clave)?.data : sec.valor;
    if (!destino) return;
    destino[campo] = valor;
    marcarSucio();
  }

  // ── Campos (usados dentro del modal) ────────────────────────────────────
  function crearCampo(campo: FieldSpec, data: Record<string, unknown>, onCambio: () => void): HTMLElement {
    const valorActual = data[campo.name];

    if (campo.type === 'obras') return crearCampoObras(campo, data, onCambio);

    const label = el('label', { className: 'cms-campo__label' }, campo.label);
    let control: HTMLElement;

    if (campo.type === 'textarea') {
      const ta = el('textarea', { className: 'cms-campo__input', value: typeof valorActual === 'string' ? valorActual : '', rows: 3 });
      ta.addEventListener('input', () => {
        data[campo.name] = ta.value;
        onCambio();
      });
      control = ta;
    } else if (campo.type === 'select') {
      const sel = el(
        'select',
        { className: 'cms-campo__input' },
        ...(campo.options ?? []).map((o) => el('option', { value: o, selected: o === valorActual }, o)),
      );
      sel.addEventListener('change', () => {
        data[campo.name] = sel.value;
        onCambio();
      });
      control = sel;
    } else if (campo.type === 'imagen') {
      const input = el('input', {
        className: 'cms-campo__input',
        type: 'url',
        placeholder: 'https://…',
        value: typeof valorActual === 'string' ? valorActual : '',
      });
      const preview = el('img', { className: 'cms-campo__preview', src: typeof valorActual === 'string' ? valorActual : '', alt: '', loading: 'lazy' });
      preview.hidden = !valorActual;
      preview.addEventListener('error', () => (preview.hidden = true));
      preview.addEventListener('load', () => (preview.hidden = false));
      input.addEventListener('input', () => {
        data[campo.name] = input.value;
        preview.hidden = !input.value;
        preview.src = input.value;
        onCambio();
      });
      return el('div', { className: 'cms-campo' }, label, input, preview);
    } else {
      const input = el('input', {
        className: 'cms-campo__input',
        type: campo.type === 'url' ? 'url' : 'text',
        placeholder: campo.type === 'url' ? 'https://…' : '',
        value: typeof valorActual === 'string' ? valorActual : '',
      });
      input.addEventListener('input', () => {
        data[campo.name] = input.value;
        onCambio();
      });
      control = input;
    }

    return el('div', { className: 'cms-campo' }, label, control);
  }

  function crearCampoObras(campo: FieldSpec, data: Record<string, unknown>, onCambio: () => void): HTMLElement {
    const obras: Obra[] = Array.isArray(data[campo.name]) ? (data[campo.name] as Obra[]) : [];
    const lista = el('div', { className: 'cms-obras' });

    function pintar() {
      lista.replaceChildren();
      obras.forEach((obra, i) => {
        const nombre = el('input', { className: 'cms-obra__nombre', type: 'text', placeholder: 'Nombre de la obra', value: obra.nombre ?? '' });
        nombre.addEventListener('input', () => {
          obras[i] = { ...obras[i], nombre: nombre.value };
          onCambio();
        });
        const anio = el('input', { className: 'cms-obra__anio', type: 'text', placeholder: 'Año', value: obra.anio ?? '' });
        anio.addEventListener('input', () => {
          obras[i] = { ...obras[i], anio: anio.value };
          onCambio();
        });
        const detalle = el('input', { className: 'cms-obra__detalle', type: 'text', placeholder: 'Detalle (opcional)', value: obra.detalle ?? '' });
        detalle.addEventListener('input', () => {
          obras[i] = { ...obras[i], detalle: detalle.value };
          onCambio();
        });
        const video = el('input', { type: 'checkbox', checked: !!obra.video });
        video.addEventListener('change', () => {
          obras[i] = { ...obras[i], video: video.checked };
          onCambio();
        });
        const videoLabel = el('label', { className: 'cms-obra__video' }, video, ' Video');
        const quitar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Quitar obra' }, '✕');
        quitar.addEventListener('click', () => {
          obras.splice(i, 1);
          data[campo.name] = obras;
          pintar();
          onCambio();
        });
        lista.append(el('div', { className: 'cms-obra-fila' }, nombre, anio, detalle, videoLabel, quitar));
      });
    }
    pintar();
    data[campo.name] = obras;

    const agregar = el('button', { className: 'cms-btn cms-btn--ghost', type: 'button' }, '+ Agregar obra');
    agregar.addEventListener('click', () => {
      obras.push({ nombre: '' });
      pintar();
      onCambio();
    });

    return el('div', { className: 'cms-campo cms-campo--obras' }, el('label', { className: 'cms-campo__label' }, campo.label), lista, agregar);
  }

  function crearFormulario(campos: FieldSpec[], data: Record<string, unknown>, onCambio: () => void): HTMLElement {
    return el('div', { className: 'cms-form' }, ...campos.map((c) => crearCampo(c, data, onCambio)));
  }

  function crearBotonFlecha(direccion: 'up' | 'down', deshabilitado: boolean, onClick: () => void): HTMLElement {
    const btn = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: direccion === 'up' ? 'Subir' : 'Bajar' }, direccion === 'up' ? '↑' : '↓');
    (btn as HTMLButtonElement).disabled = deshabilitado;
    btn.addEventListener('click', () => onClick());
    return btn;
  }

  function valoresVacios(campos: FieldSpec[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const c of campos) out[c.name] = c.type === 'obras' ? [] : '';
    return out;
  }

  // ── Modal ────────────────────────────────────────────────────────────
  function cerrarModal() {
    overlay.hidden = true;
    modal.replaceChildren();
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrarModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) cerrarModal();
  });

  function crearHeaderModal(titulo: string, subtitulo: string | undefined, acciones: HTMLElement[]): HTMLElement {
    const cerrar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Cerrar' }, '✕');
    cerrar.addEventListener('click', () => cerrarModal());
    return el(
      'div',
      { className: 'cms-panel-header' },
      el(
        'div',
        { className: 'cms-panel-header__titulos' },
        el('span', { className: 'cms-panel-header__titulo' }, titulo),
        ...(subtitulo ? [el('span', { className: 'cms-panel-header__subtitulo' }, subtitulo)] : []),
      ),
      el('div', { className: 'cms-panel-header__acciones' }, ...acciones, cerrar),
    );
  }

  function mostrarSingle(sec: SeccionData) {
    const ordenLayout = cache.get(paginaActual)!.datos.ordenLayout;
    const index = ordenLayout.indexOf(sec.key);
    const acciones = [
      crearBotonFlecha('up', index <= 0, () => {
        [ordenLayout[index - 1], ordenLayout[index]] = [ordenLayout[index], ordenLayout[index - 1]];
        marcarSucio();
        mostrarSingle(sec);
      }),
      crearBotonFlecha('down', index === -1 || index === ordenLayout.length - 1, () => {
        [ordenLayout[index + 1], ordenLayout[index]] = [ordenLayout[index], ordenLayout[index + 1]];
        marcarSucio();
        mostrarSingle(sec);
      }),
    ];
    const cuerpo = crearFormulario(sec.campos ?? [], sec.valor!, marcarSucio);
    modal.replaceChildren(crearHeaderModal(sec.titulo, undefined, acciones), cuerpo);
    overlay.hidden = false;
  }

  function mostrarPlaceholder(sec: SeccionData) {
    modal.replaceChildren(crearHeaderModal(sec.titulo, undefined, []), el('p', { className: 'cms-panel-nota' }, sec.notaPlaceholder ?? 'No editable en esta beta.'));
    overlay.hidden = false;
  }

  function mostrarItem(sec: SeccionData, clave: string) {
    const items = sec.items ?? [];
    const index = items.findIndex((it) => it.clave === clave);
    if (index === -1) return cerrarModal();
    const item = items[index];
    const campos = sec.campos ?? [];

    const acciones: HTMLElement[] = [];
    if (!sec.bloqueado) {
      acciones.push(
        crearBotonFlecha('up', index === 0, () => {
          [items[index - 1], items[index]] = [items[index], items[index - 1]];
          marcarSucio();
          mostrarItem(sec, clave);
        }),
        crearBotonFlecha('down', index === items.length - 1, () => {
          [items[index + 1], items[index]] = [items[index], items[index + 1]];
          marcarSucio();
          mostrarItem(sec, clave);
        }),
      );
      const borrar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--peligro', type: 'button', title: 'Eliminar' }, '✕');
      borrar.addEventListener('click', () => {
        if (!confirm('¿Eliminar este elemento? Se borra al guardar los cambios.')) return;
        items.splice(index, 1);
        marcarSucio();
        cerrarModal();
      });
      acciones.push(borrar);
    }

    const cuerpo = crearFormulario(campos, item.data, marcarSucio);
    const subtitulo = `${sec.titulo} — ${index + 1} de ${items.length}`;
    const cuerpos = [cuerpo];
    if (!sec.bloqueado) {
      const agregar = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `+ Agregar otro elemento en "${sec.titulo}"`);
      agregar.addEventListener('click', () => {
        const claveNueva = `nuevo-${Date.now()}`;
        items.splice(index + 1, 0, { clave: claveNueva, data: valoresVacios(campos) });
        marcarSucio();
        mostrarItem(sec, claveNueva);
      });
      cuerpos.push(agregar);
    }
    modal.replaceChildren(crearHeaderModal(tituloDeItem(campos, item.data), subtitulo, acciones), ...cuerpos);
    overlay.hidden = false;
  }

  function seleccionar(dominio: string | undefined, clave: string | undefined) {
    if (!dominio) return;
    const sec = dominioIndex.get(dominio);
    if (!sec) return;
    if (sec.tipo === 'placeholder') return mostrarPlaceholder(sec);
    if (sec.tipo === 'single' || !clave) return mostrarSingle(sec);
    mostrarItem(sec, clave);
  }

  // ── Barra de dispositivo (ancho del iframe = responsive real) ──────────
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
