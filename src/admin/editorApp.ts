import type { FieldSpec, PaginaConfig, SeccionConfig } from './campos';

/**
 * Editor CMS (beta) — sin librería de page-builder. La vista previa es la
 * página REAL en un iframe (mismo HTML/CSS/responsive del sitio, con su
 * propia navegación funcionando). Clickear un texto simple (título, párrafo)
 * lo hace editable ahí mismo; clickear cualquier otra cosa (imagen, selector,
 * lista de obras, o la sección en general) abre un modal con sus campos.
 * Nada se guarda solo: todo queda en memoria hasta tocar "Guardar cambios".
 *
 * v2: + Copiar/Pegar elementos con selector de posición
 *     + Drag & drop para reordenar (layout y listas)
 *     + Vista "Estructura" para mover secciones arriba/abajo arrastrando
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

interface Portapapeles {
  dominio: string;
  data: Record<string, unknown>;
  label: string;
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
  const candidato = campos.find((c) => ['titulo', 'nombre', 'eyebrow', 'title'].includes(c.name));
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

function clonarData(data: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data));
}

export function montarEditor(init: InitData) {
  const secreto = init.secreto;

  // ── Estado por página, cacheado ──
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
  const portapapelesEl = document.getElementById('cms-portapapeles') as HTMLElement | null;
  const estructuraBtn = document.getElementById('cms-estructura') as HTMLButtonElement | null;

  // ── Portapapeles global (copiar/pegar entre secciones compatibles) ──
  let portapapeles: Portapapeles | null = null;

  function actualizarBarraPortapapeles() {
    if (!portapapelesEl) return;
    if (!portapapeles) {
      portapapelesEl.hidden = true;
    } else {
      portapapelesEl.hidden = false;
      portapapelesEl.replaceChildren(
        el('span', {}, 'Copiado: '),
        el('strong', {}, portapapeles.label),
        el('span', {}, ` (${portapapeles.dominio})`),
        (() => {
          const b = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Limpiar' }, '✕');
          b.addEventListener('click', () => { portapapeles = null; actualizarBarraPortapapeles(); syncClipboardToPreview(); });
          return b;
        })(),
      );
    }
    syncClipboardToPreview();
  }

  function syncClipboardToPreview(){
    try{ iframe.contentWindow?.postMessage({ source:'cms-editor', type:'clipboard', payload: portapapeles ? { dominio: portapapeles.dominio, label: portapapeles.label } : null }, '*'); }catch{}
  }

  function syncPreviewOrden(dominioAfectado?: string){
    try{
      const estado = cache.get(paginaActual);
      if(!estado) return;
      // Layout
      iframe.contentWindow?.postMessage({ source:'cms-editor', type:'cms-sync', ordenLayout: estado.datos.ordenLayout, dominio: dominioAfectado, ordenClaves: dominioAfectado ? (dominioIndex.get(dominioAfectado)?.items?.map(i=>i.clave) ?? null) : null }, '*');
      // Fallback directo si es same-origin y iframe cargado
      const doc = iframe.contentDocument;
      if(doc){
        // Aplicar ordenLayout via style.order
        const containers = Array.from(doc.querySelectorAll<HTMLElement>('div[style*="flex-direction:column"], main[style*="display:flex"]'));
        containers.forEach(container=>{
          const hijos = Array.from(container.children).filter(c=> c instanceof HTMLElement && (c as HTMLElement).hasAttribute('data-cms-dominio')) as HTMLElement[];
          if(hijos.length<2) return;
          estado.datos.ordenLayout.forEach((key, idx)=>{
            const DOMINIO_A_KEY: Record<string,string> = { 'home_hero':'hero','home_biografia':'biografia','home_antes_despues':'antes_despues','flipbook_meta':'libro','gestion_hero':'hero','capitulo':'capitulos','era':'eras','seccion':'secciones','proyectos_titulo':'proyectos_titulo','proyecto':'proyectos','sobre_hero':'hero','sobre_biografia':'biografia','sobre_institutional':'institutional' };
            const h = hijos.find(x=> (DOMINIO_A_KEY[x.dataset.cmsDominio||'']||x.dataset.cmsDominio)===key);
            if(h) h.style.order = String(idx);
          });
        });
        if(dominioAfectado){
          const sec = dominioIndex.get(dominioAfectado);
          if(sec?.items){
            // Reordenar DOM de ese dominio según nuevo orden
            const all = Array.from(doc.querySelectorAll<HTMLElement>(`[data-cms-clave]`)).filter(el=> (el.getAttribute('data-cms-dominio')||'')===dominioAfectado);
            const porParent = new Map<HTMLElement, HTMLElement[]>();
            all.forEach(el=>{ const p = el.parentElement!; if(!porParent.has(p)) porParent.set(p, []); porParent.get(p)!.push(el); });
            const orden = sec.items.map(i=>i.clave);
            porParent.forEach((items, parent)=>{
              const mapa = new Map(items.map(i=> [i.dataset.cmsClave!, i]));
              orden.forEach(k=>{ const n = mapa.get(k); if(n) parent.appendChild(n); });
              // Si hay nuevos (pegar), crear clones visuales simples: clonar primer nodo como placeholder y marcar flash
              if(sec.items.length > items.length){
                const faltantes = sec.items.filter(it=> !items.some(e=> e.dataset.cmsClave===it.clave));
                faltantes.forEach(f=>{
                  // crear nodo fantasma clonando el primero si existe
                  if(items[0]){
                    const clone = items[0].cloneNode(true) as HTMLElement;
                    clone.dataset.cmsClave = f.clave;
                    // actualizar textos visibles con datos
                    try{
                      const campos = sec.campos ?? [];
                      campos.forEach(c=>{
                        const campoEl = clone.querySelector(`[data-cms-campo="${c.name}"]`);
                        if(campoEl && typeof f.data[c.name]==='string') campoEl.textContent = String(f.data[c.name]);
                      });
                    }catch{}
                    clone.style.outline='3px solid #c9b8e8';
                    parent.appendChild(clone);
                  }
                });
              }
            });
          }
        }
      }
    }catch{}
  }

  function syncPreviewMedia(dominio: string, clave: string | undefined, campo: string, valor: string){
    try{
      const doc = iframe.contentDocument; if(!doc) return;
      if(clave){
        const el = doc.querySelector<HTMLElement>(`[data-cms-dominio="${dominio}"][data-cms-clave="${clave}"]`);
        if(!el) return;
        // actualizar img/video dentro del bloque
        const img = el.querySelector<HTMLImageElement>('img');
        const vid = el.querySelector<HTMLVideoElement>('video');
        if(img && (campo==='imagen' || campo==='coverImage' || campo==='src')) img.src = valor;
        if(vid && (campo==='video' || campo==='src')) vid.src = valor;
        // también data-url (libro)
        el.querySelectorAll<HTMLElement>('[data-url]').forEach(n=> n.dataset.url = valor);
        el.style.outline='3px solid #c9b8e8'; setTimeout(()=> el.style.outline='', 800);
      } else if(dominio){
        const sec = doc.querySelector<HTMLElement>(`[data-cms-dominio="${dominio}"]`);
        if(!sec) return;
        const img = sec.querySelector<HTMLImageElement>('img');
        if(img && (campo==='imagen' || campo==='coverImage')) img.src = valor;
        const bg = sec as HTMLElement;
        if(campo==='imagen' && bg.style.backgroundImage) bg.style.backgroundImage = `url('${valor}')`;
      }
    }catch{}
  }

  function copiarItem(dominio: string, data: Record<string, unknown>, campos: FieldSpec[]) {
    portapapeles = { dominio, data: clonarData(data), label: tituloDeItem(campos, data) };
    actualizarBarraPortapapeles();
    estadoEl.textContent = `Copiado: ${portapapeles.label} — elige dónde pegar`;
    estadoEl.className = 'cms-estado';
    setTimeout(() => { if (hayCambiosSinGuardar) { estadoEl.textContent = 'Cambios sin guardar'; estadoEl.className = 'cms-estado cms-estado--sucio'; } else { estadoEl.textContent = 'Todo guardado'; } }, 1800);
  }

  function pegarEn(dominio: string, campos: FieldSpec[], indice: number) {
    if (!portapapeles || portapapeles.dominio !== dominio) return false;
    const sec = dominioIndex.get(dominio);
    if (!sec || !sec.items) return false;
    if (sec.bloqueado) return false;
    const nuevaClave = `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    sec.items.splice(indice, 0, { clave: nuevaClave, data: clonarData(portapapeles.data) });
    marcarSucio();
    syncPreviewOrden(dominio);
    return true;
  }

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
    hayCambiosSinGuardar = false;
    estadoEl.textContent = 'Todo guardado';
    estadoEl.className = 'cms-estado';
    iframe.contentWindow?.location.reload();
  }

  document.getElementById('cms-guardar')?.addEventListener('click', () => void guardarTodo());
  document.getElementById('cms-refrescar')?.addEventListener('click', () => iframe.contentWindow?.location.reload());

  // ── Índice dominio → sección ─────────────────────────────────────────
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
    else if (data.type === 'campo') { alEditarCampoInline(data.dominio as string, data.clave as string | undefined, data.campo as string, data.valor as string); if(['imagen','coverImage','video','src'].includes(String(data.campo))) syncPreviewMedia(data.dominio as string, data.clave as string | undefined, String(data.campo), String(data.valor)); }
    else if (data.type === 'imagen') {
      const d = data as unknown as { dominio?:string; clave?:string; src?:string; originalSrc?:string };
      if(d.dominio && d.src){
        // Ya manejado por 'campo', solo sincronizar preview media
        syncPreviewMedia(d.dominio, d.clave, 'imagen', String(d.src));
      } else if(d.src && d.originalSrc){
        // Override genérico sin dominio: guardar en dominio virtual media_override
        const key = `media_${btoa(d.originalSrc).slice(0,32)}`;
        const estado = cache.get(paginaActual);
        if(estado){
          // Guardar en un dominio virtual para persistir
          let secOverride = dominioIndex.get('media_override');
          if(!secOverride){
            // crear sección virtual en memoria si no existe
            const nueva: SeccionData = { key:'media_override', titulo:'Media overrides', tipo:'lista', dominio:'media_override', campos:[{name:'src', label:'URL', type:'imagen'}], items:[] };
            estado.datos.secciones.push(nueva);
            dominioIndex.set('media_override', nueva);
          }
          secOverride = dominioIndex.get('media_override')!;
          const items = secOverride.items ?? (secOverride.items = []);
          const existente = items.find(i=> (i.data['original'] as string)===d.originalSrc);
          if(existente) existente.data['src']=d.src; else items.push({ clave:key, data:{ original:d.originalSrc, src:d.src }});
          marcarSucio();
        }
      }
    }
    else if (data.type === 'seleccionar') seleccionar(data.dominio as string | undefined, data.clave as string | undefined);
    else if (data.type === 'copiar') {
      const dominio = data.dominio as string; const clave = data.clave as string | undefined;
      const sec = dominioIndex.get(dominio); if(!sec) return;
      const src = clave ? sec.items?.find(i=>i.clave===clave)?.data : sec.valor;
      if(!src) return;
      copiarItem(dominio, src as Record<string,unknown>, sec.campos ?? []);
      // Si estábamos en vista lista, refrescar para mostrar dropzones activas
      const modalVisible = !overlay.hidden;
      if(modalVisible && sec.tipo==='lista') mostrarLista(sec);
    } else if (data.type === 'pegar') {
      const dominio = data.dominio as string; const clave = data.clave as string | undefined;
      const sec = dominioIndex.get(dominio); if(!sec) return;
      const idx = clave ? (sec.items?.findIndex(i=>i.clave===clave) ?? -1) : -1;
      const pos = idx===-1 ? (sec.items?.length ?? 0) : idx+1;
      if(pegarEn(dominio, sec.campos ?? [], pos)){
        // feedback y actualizar modal si está abierto
        if(!overlay.hidden && sec.tipo==='lista') mostrarLista(sec);
      }
    } else if (data.type === 'reordenar') {
      const d = data as unknown as { dominio?: string; clave?: string; direccion?: string; orden?: string[]; ordenClaves?: string[] };
      if (d.orden && Array.isArray(d.orden)) {
        const estado = cache.get(paginaActual);
        if (estado) { estado.datos.ordenLayout = d.orden as string[]; marcarSucio(); syncPreviewOrden(); }
      } else if (d.dominio && d.ordenClaves && Array.isArray(d.ordenClaves)) {
        const sec = dominioIndex.get(d.dominio);
        if (!sec?.items) return;
        const mapa = new Map(sec.items.map((it) => [it.clave, it]));
        const reordenados = d.ordenClaves.map((k) => mapa.get(k)).filter(Boolean) as typeof sec.items;
        for (const it of sec.items) if (!d.ordenClaves.includes(it.clave)) reordenados.push(it);
        sec.items = reordenados;
        marcarSucio(); syncPreviewOrden(d.dominio);
      } else if (d.dominio && d.clave && d.direccion) {
        const sec = dominioIndex.get(d.dominio);
        if (!sec?.items) return;
        const idx = sec.items.findIndex((i) => i.clave === d.clave);
        if (idx === -1) return;
        const ni = d.direccion === 'up' ? idx - 1 : idx + 1;
        if (ni < 0 || ni >= sec.items.length) return;
        [sec.items[idx], sec.items[ni]] = [sec.items[ni], sec.items[idx]];
        marcarSucio(); syncPreviewOrden(d.dominio);
      }
    }
  });

  // Cuando el iframe carga, sincronizar clipboard y orden actual
  iframe.addEventListener('load', ()=>{ syncClipboardToPreview(); const estado=cache.get(paginaActual); if(estado) syncPreviewOrden(); });

  function alEditarCampoInline(dominio: string, clave: string | undefined, campo: string, valor: string) {
    const sec = dominioIndex.get(dominio);
    if (!sec) return;
    const destino = clave ? sec.items?.find((i) => i.clave === clave)?.data : sec.valor;
    if (!destino) return;
    destino[campo] = valor;
    marcarSucio();
    if(['imagen','coverImage','video','src','poster'].includes(campo)) syncPreviewMedia(dominio, clave, campo, valor);
  }

  // ── Campos ────────────────────────────────────────────────────────────
  function crearCampo(campo: FieldSpec, data: Record<string, unknown>, onCambio: () => void): HTMLElement {
    const valorActual = data[campo.name];
    if (campo.type === 'obras') return crearCampoObras(campo, data, onCambio);
    const label = el('label', { className: 'cms-campo__label' }, campo.label);
    let control: HTMLElement;
    if (campo.type === 'textarea') {
      const ta = el('textarea', { className: 'cms-campo__input', value: typeof valorActual === 'string' ? valorActual : '', rows: 3 });
      ta.addEventListener('input', () => { data[campo.name] = ta.value; onCambio(); });
      control = ta;
    } else if (campo.type === 'select') {
      const sel = el('select', { className: 'cms-campo__input' }, ...(campo.options ?? []).map((o) => el('option', { value: o, selected: o === valorActual }, o)));
      sel.addEventListener('change', () => { data[campo.name] = sel.value; onCambio(); });
      control = sel;
    } else if (campo.type === 'imagen') {
      const input = el('input', { className: 'cms-campo__input', type: 'url', placeholder: 'https://…', value: typeof valorActual === 'string' ? valorActual : '' });
      const preview = el('img', { className: 'cms-campo__preview', src: typeof valorActual === 'string' ? valorActual : '', alt: '', loading: 'lazy' });
      preview.hidden = !valorActual;
      preview.addEventListener('error', () => (preview.hidden = true));
      preview.addEventListener('load', () => (preview.hidden = false));
      input.addEventListener('input', () => { data[campo.name] = input.value; preview.hidden = !input.value; preview.src = input.value; onCambio(); });
      return el('div', { className: 'cms-campo' }, label, input, preview);
    } else {
      const input = el('input', { className: 'cms-campo__input', type: campo.type === 'url' ? 'url' : 'text', placeholder: campo.type === 'url' ? 'https://…' : '', value: typeof valorActual === 'string' ? valorActual : '' });
      input.addEventListener('input', () => { data[campo.name] = input.value; onCambio(); });
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
        const fila = el('div', { className: 'cms-obra-fila' });
        fila.draggable = true;
        fila.addEventListener('dragstart', (e) => {
          fila.classList.add('cms-obra-fila--dragging');
          e.dataTransfer!.effectAllowed = 'move';
          e.dataTransfer!.setData('text/plain', String(i));
        });
        fila.addEventListener('dragend', () => fila.classList.remove('cms-obra-fila--dragging'));
        fila.addEventListener('dragover', (e) => e.preventDefault());
        fila.addEventListener('drop', (e) => {
          e.preventDefault();
          const from = Number(e.dataTransfer!.getData('text/plain'));
          if (Number.isNaN(from) || from === i) return;
          const [mov] = obras.splice(from, 1);
          obras.splice(i, 0, mov);
          data[campo.name] = obras;
          pintar(); onCambio();
        });
        const handle = el('span', {}, '⋮⋮');
        handle.style.cursor = 'grab'; handle.style.color = '#6b5f87'; handle.title = 'Arrastrar';
        const nombre = el('input', { className: 'cms-obra__nombre', type: 'text', placeholder: 'Nombre de la obra', value: obra.nombre ?? '' });
        nombre.addEventListener('input', () => { obras[i] = { ...obras[i], nombre: nombre.value }; onCambio(); });
        const anio = el('input', { className: 'cms-obra__anio', type: 'text', placeholder: 'Año', value: obra.anio ?? '' });
        anio.addEventListener('input', () => { obras[i] = { ...obras[i], anio: anio.value }; onCambio(); });
        const detalle = el('input', { className: 'cms-obra__detalle', type: 'text', placeholder: 'Detalle (opcional)', value: obra.detalle ?? '' });
        detalle.addEventListener('input', () => { obras[i] = { ...obras[i], detalle: detalle.value }; onCambio(); });
        const video = el('input', { type: 'checkbox', checked: !!obra.video });
        video.addEventListener('change', () => { obras[i] = { ...obras[i], video: video.checked }; onCambio(); });
        const videoLabel = el('label', { className: 'cms-obra__video' }, video, ' Video');
        const quitar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Quitar obra' }, '✕');
        quitar.addEventListener('click', () => { obras.splice(i, 1); data[campo.name] = obras; pintar(); onCambio(); });
        const copiar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Duplicar obra' }, '⧉');
        copiar.addEventListener('click', () => { obras.splice(i + 1, 0, clonarData(obra as unknown as Record<string, unknown>) as unknown as Obra); pintar(); onCambio(); });
        fila.append(handle, nombre, anio, detalle, videoLabel, copiar, quitar);
        lista.append(fila);
      });
    }
    pintar();
    data[campo.name] = obras;
    const agregar = el('button', { className: 'cms-btn cms-btn--ghost', type: 'button' }, '+ Agregar obra');
    agregar.addEventListener('click', () => { obras.push({ nombre: '' }); pintar(); onCambio(); });
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

  // ── Helpers drag & drop genéricos ───────────────────────────────────
  function activarDragReorder<T>(container: HTMLElement, getItems: () => T[], onReorder: (from: number, to: number) => void) {
    let dragFrom = -1;
    container.addEventListener('dragstart', (e) => {
      const row = (e.target as HTMLElement).closest('[data-drag-index]') as HTMLElement | null;
      if (!row) return;
      dragFrom = Number(row.dataset.dragIndex);
      row.classList.add('cms-estructura-item--dragging');
      e.dataTransfer!.effectAllowed = 'move';
      e.dataTransfer!.setData('text/plain', String(dragFrom));
    });
    container.addEventListener('dragend', () => {
      container.querySelectorAll('[data-drag-index]').forEach((n) => n.classList.remove('cms-estructura-item--dragging', 'cms-estructura-item--over', 'cms-lista-item-row--dragging', 'cms-lista-item-row--over'));
      dragFrom = -1;
    });
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const row = (e.target as HTMLElement).closest('[data-drag-index]') as HTMLElement | null;
      if (!row) return;
      container.querySelectorAll('[data-drag-index]').forEach((n) => n.classList.remove('cms-estructura-item--over', 'cms-lista-item-row--over'));
      row.classList.add(row.classList.contains('cms-estructura-item') ? 'cms-estructura-item--over' : 'cms-lista-item-row--over');
    });
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const row = (e.target as HTMLElement).closest('[data-drag-index]') as HTMLElement | null;
      if (!row || dragFrom === -1) return;
      const to = Number(row.dataset.dragIndex);
      if (to === dragFrom) return;
      onReorder(dragFrom, to);
    });
  }

  // ── Modal helpers ───────────────────────────────────────────────────
  function cerrarModal() {
    overlay.hidden = true;
    modal.replaceChildren();
  }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) cerrarModal(); });

  function crearHeaderModal(titulo: string, subtitulo: string | undefined, acciones: HTMLElement[]): HTMLElement {
    const cerrar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Cerrar' }, '✕');
    cerrar.addEventListener('click', () => cerrarModal());
    return el('div', { className: 'cms-panel-header' },
      el('div', { className: 'cms-panel-header__titulos' },
        el('span', { className: 'cms-panel-header__titulo' }, titulo),
        ...(subtitulo ? [el('span', { className: 'cms-panel-header__subtitulo' }, subtitulo)] : []),
      ),
      el('div', { className: 'cms-panel-header__acciones' }, ...acciones, cerrar),
    );
  }

  // ── Vista ESTRUCTURA: reordenar secciones de la página arrastrando ──
  function mostrarEstructura() {
    const estado = cache.get(paginaActual)!;
    const ordenLayout = estado.datos.ordenLayout;
    const porKey = new Map(estado.datos.secciones.map((s) => [s.key, s]));

    const lista = el('div', { className: 'cms-estructura-lista' });
    ordenLayout.forEach((key, idx) => {
      const sec = porKey.get(key);
      if (!sec) return;
      const fila = el('div', { className: 'cms-estructura-item' });
      fila.draggable = true;
      fila.dataset.dragIndex = String(idx);
      const handle = el('span', { className: 'cms-estructura-item__handle', title: 'Arrastrar para reordenar' }, '⋮⋮');
      const titulo = el('span', { className: 'cms-estructura-item__titulo' }, sec.titulo);
      const badge = el('span', { className: 'cms-estructura-item__badge' }, sec.tipo);
      const btnUp = crearBotonFlecha('up', idx === 0, () => {
        [ordenLayout[idx - 1], ordenLayout[idx]] = [ordenLayout[idx], ordenLayout[idx - 1]];
        marcarSucio(); syncPreviewOrden(); mostrarEstructura();
      });
      const btnDown = crearBotonFlecha('down', idx === ordenLayout.length - 1, () => {
        [ordenLayout[idx + 1], ordenLayout[idx]] = [ordenLayout[idx], ordenLayout[idx + 1]];
        marcarSucio(); syncPreviewOrden(); mostrarEstructura();
      });
      const editar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Editar' }, '✎');
      editar.addEventListener('click', () => {
        if (sec.tipo === 'lista') mostrarLista(sec);
        else if (sec.tipo === 'single') mostrarSingle(sec);
        else mostrarPlaceholder(sec);
      });
      fila.append(handle, titulo, badge, btnUp, btnDown, editar);
      fila.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (sec.tipo === 'lista') mostrarLista(sec);
        else if (sec.tipo === 'single') mostrarSingle(sec);
        else mostrarPlaceholder(sec);
      });
      lista.append(fila);
    });

    activarDragReorder(lista, () => ordenLayout.slice(), (from, to) => {
      const [mov] = ordenLayout.splice(from, 1);
      ordenLayout.splice(to, 0, mov);
      marcarSucio(); syncPreviewOrden();
      mostrarEstructura();
    });

    const header = crearHeaderModal('Estructura de la página', `${estado.datos.pagina.titulo} — arrastra para reordenar`, []);
    const nota = el('p', { className: 'cms-panel-nota' }, 'Arrastra las secciones o usa ↑/↓. Los cambios se aplican al guardar.');
    modal.replaceChildren(header, nota, lista);
    overlay.hidden = false;
  }

  // ── Vistas ──────────────────────────────────────────────────────────
  function mostrarSingle(sec: SeccionData) {
    const ordenLayout = cache.get(paginaActual)!.datos.ordenLayout;
    const index = ordenLayout.indexOf(sec.key);
    const acciones = [
      el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver estructura' }, '☰'),
      crearBotonFlecha('up', index <= 0, () => { [ordenLayout[index - 1], ordenLayout[index]] = [ordenLayout[index], ordenLayout[index - 1]]; marcarSucio(); syncPreviewOrden(); mostrarSingle(sec); }),
      crearBotonFlecha('down', index === -1 || index === ordenLayout.length - 1, () => { [ordenLayout[index + 1], ordenLayout[index]] = [ordenLayout[index], ordenLayout[index + 1]]; marcarSucio(); syncPreviewOrden(); mostrarSingle(sec); }),
    ];
    (acciones[0] as HTMLElement).addEventListener('click', () => mostrarEstructura());
    const cuerpo = crearFormulario(sec.campos ?? [], sec.valor!, marcarSucio);
    modal.replaceChildren(crearHeaderModal(sec.titulo, `Sección single — posición ${index + 1} de ${ordenLayout.length}`, acciones), cuerpo);
    overlay.hidden = false;
  }

  function mostrarPlaceholder(sec: SeccionData) {
    const ordenLayout = cache.get(paginaActual)!.datos.ordenLayout;
    const idx = ordenLayout.indexOf(sec.key);
    const acciones = [
      el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver estructura' }, '☰'),
      crearBotonFlecha('up', idx <= 0, () => { [ordenLayout[idx - 1], ordenLayout[idx]] = [ordenLayout[idx], ordenLayout[idx - 1]]; marcarSucio(); syncPreviewOrden(); mostrarPlaceholder(sec); }),
      crearBotonFlecha('down', idx === -1 || idx === ordenLayout.length - 1, () => { [ordenLayout[idx + 1], ordenLayout[idx]] = [ordenLayout[idx], ordenLayout[idx + 1]]; marcarSucio(); syncPreviewOrden(); mostrarPlaceholder(sec); }),
    ];
    (acciones[0] as HTMLElement).addEventListener('click', () => mostrarEstructura());
    modal.replaceChildren(crearHeaderModal(sec.titulo, undefined, acciones), el('p', { className: 'cms-panel-nota' }, sec.notaPlaceholder ?? 'No editable en esta beta.'));
    overlay.hidden = false;
  }

  /** Vista lista completa: drag, copiar/pegar con selector de posición. */
  function mostrarLista(sec: SeccionData) {
    const ordenLayout = cache.get(paginaActual)!.datos.ordenLayout;
    const idxLayout = ordenLayout.indexOf(sec.key);
    const items = sec.items ?? [];
    const campos = sec.campos ?? [];
    const puedePegar = !!portapapeles && portapapeles.dominio === sec.dominio && !sec.bloqueado;

    const headerAcciones: HTMLElement[] = [
      el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver estructura' }, '☰'),
      crearBotonFlecha('up', idxLayout <= 0, () => { [ordenLayout[idxLayout - 1], ordenLayout[idxLayout]] = [ordenLayout[idxLayout], ordenLayout[idxLayout - 1]]; marcarSucio(); syncPreviewOrden(); mostrarLista(sec); }),
      crearBotonFlecha('down', idxLayout === -1 || idxLayout === ordenLayout.length - 1, () => { [ordenLayout[idxLayout + 1], ordenLayout[idxLayout]] = [ordenLayout[idxLayout], ordenLayout[idxLayout + 1]]; marcarSucio(); syncPreviewOrden(); mostrarLista(sec); }),
    ];
    (headerAcciones[0] as HTMLElement).addEventListener('click', () => mostrarEstructura());

    const header = crearHeaderModal(sec.titulo, `${items.length} elementos — arrastra para reordenar, copia y pega donde quieras`, headerAcciones);

    const cont = el('div', { className: 'cms-lista-drag' });

    function crearDropzone(pos: number): HTMLElement {
      const dz = el('div', { className: `cms-dropzone ${puedePegar ? 'cms-dropzone--has-clipboard' : ''}` }, puedePegar ? `+ Pegar aquí (posición ${pos + 1})` : '—');
      if (puedePegar) {
        dz.classList.add('cms-dropzone--activo');
        dz.addEventListener('click', () => { if (pegarEn(sec.dominio!, campos, pos)) mostrarLista(sec); });
        dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('cms-dropzone--over'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('cms-dropzone--over'));
        dz.addEventListener('drop', (e) => {
          e.preventDefault();
          const fromStr = e.dataTransfer!.getData('text/plain');
          // Si viene de drag de item, no pegar sino reordenar via dropzone
          const from = Number(fromStr);
          if (!Number.isNaN(from) && fromStr !== '' && sec.items) {
            // Reordenar: insertar antes de pos ajustando índice
            const item = sec.items[from];
            if (item) {
              sec.items.splice(from, 1);
              const insertAt = from < pos ? pos - 1 : pos;
              sec.items.splice(insertAt, 0, item);
              marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarLista(sec); return;
            }
          }
          if (pegarEn(sec.dominio!, campos, pos)) mostrarLista(sec);
        });
      } else {
        // dropzone solo para reordenar por arrastre aunque no haya portapapeles
        dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('cms-dropzone--over'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('cms-dropzone--over'));
        dz.addEventListener('drop', (e) => {
          e.preventDefault();
          const from = Number(e.dataTransfer!.getData('text/plain'));
          if (Number.isNaN(from)) return;
          const item = sec.items![from];
          if (!item) return;
          sec.items!.splice(from, 1);
          const insertAt = from < pos ? pos - 1 : pos;
          sec.items!.splice(insertAt, 0, item);
          marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarLista(sec);
        });
      }
      return dz;
    }

    cont.append(crearDropzone(0));

    items.forEach((it, i) => {
      const row = el('div', { className: 'cms-lista-item-row' });
      row.draggable = !sec.bloqueado;
      row.dataset.dragIndex = String(i);
      if (sec.bloqueado) row.style.cursor = 'default';
      const handle = el('span', { title: sec.bloqueado ? 'Bloqueado' : 'Arrastrar para reordenar' }, sec.bloqueado ? '🔒' : '⋮⋮');
      handle.className = 'cms-estructura-item__handle';
      const titulo = el('span', { className: 'cms-estructura-item__titulo' }, tituloDeItem(campos, it.data));
      const editar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Editar' }, '✎');
      editar.addEventListener('click', () => mostrarItem(sec, it.clave));
      row.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('button')) return; mostrarItem(sec, it.clave); });

      const acciones: HTMLElement[] = [];
      if (!sec.bloqueado) {
        const copiar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--copiar', type: 'button', title: 'Copiar' }, '⧉');
        copiar.addEventListener('click', (e) => { e.stopPropagation(); copiarItem(sec.dominio!, it.data, campos); mostrarLista(sec); });
        const dup = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Duplicar aquí' }, '⎘');
        dup.addEventListener('click', (e) => {
          e.stopPropagation();
          const nuevaClave = `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          sec.items!.splice(i + 1, 0, { clave: nuevaClave, data: clonarData(it.data) });
          marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarLista(sec);
        });
        acciones.push(copiar, dup);
        const up = crearBotonFlecha('up', i === 0, () => { [items[i - 1], items[i]] = [items[i], items[i - 1]]; marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarLista(sec); });
        const down = crearBotonFlecha('down', i === items.length - 1, () => { [items[i + 1], items[i]] = [items[i], items[i + 1]]; marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarLista(sec); });
        acciones.push(up, down);
        const borrar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--peligro', type: 'button', title: 'Eliminar' }, '✕');
        borrar.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!confirm('¿Eliminar este elemento? Se borra al guardar los cambios.')) return;
          items.splice(i, 1); marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarLista(sec);
        });
        acciones.push(borrar);
      }
      row.append(handle, titulo, editar, ...acciones);
      cont.append(row);
      cont.append(crearDropzone(i + 1));
    });

    // Botón agregar al final (cuando no hay dropzone de pegado único)
    if (!sec.bloqueado) {
      const agregar = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `+ Agregar elemento en "${sec.titulo}"`);
      agregar.style.margin = '8px 14px';
      agregar.addEventListener('click', () => {
        const claveNueva = `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        items.push({ clave: claveNueva, data: valoresVacios(campos) });
        marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarItem(sec, claveNueva);
      });
      cont.append(agregar);
      if (puedePegar) {
        const pegarFinal = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `⧉ Pegar "${portapapeles!.label}" al final`);
        pegarFinal.style.margin = '0 14px 12px';
        pegarFinal.addEventListener('click', () => { if (pegarEn(sec.dominio!, campos, items.length)) mostrarLista(sec); });
        cont.append(pegarFinal);
      }
    } else {
      const nota = el('p', { className: 'cms-panel-nota' }, 'Esta sección está bloqueada (no se puede reordenar ni duplicar). Solo edición de textos.');
      cont.append(nota);
    }

    // activar drag entre rows (además de dropzones)
    if (!sec.bloqueado) {
      activarDragReorder(cont, () => items.slice(), (from, to) => {
        const [mov] = items.splice(from, 1);
        items.splice(to, 0, mov);
        marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarLista(sec);
      });
    }

    modal.replaceChildren(header, cont);
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
        crearBotonFlecha('up', index === 0, () => { [items[index - 1], items[index]] = [items[index], items[index - 1]]; marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarItem(sec, clave); }),
        crearBotonFlecha('down', index === items.length - 1, () => { [items[index + 1], items[index]] = [items[index], items[index + 1]]; marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarItem(sec, clave); }),
      );
      const copiar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--copiar', type: 'button', title: 'Copiar elemento' }, '⧉ Copiar');
      copiar.addEventListener('click', () => { copiarItem(sec.dominio!, item.data, campos); });
      acciones.push(copiar);
      const duplicar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Duplicar' }, '⎘');
      duplicar.addEventListener('click', () => {
        const nuevaClave = `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        items.splice(index + 1, 0, { clave: nuevaClave, data: clonarData(item.data) });
        marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarItem(sec, nuevaClave);
      });
      acciones.push(duplicar);
      // Pegar después de este si hay portapapeles compatible
      if (portapapeles && portapapeles.dominio === sec.dominio) {
        const pegar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: `Pegar "${portapapeles.label}" después` }, '📋 Pegar');
        pegar.addEventListener('click', () => { if (pegarEn(sec.dominio!, campos, index + 1)) { mostrarItem(sec, clave); } });
        acciones.push(pegar);
      }
      const verLista = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver todos' }, '☰');
      verLista.addEventListener('click', () => mostrarLista(sec));
      acciones.push(verLista);
      const borrar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--peligro', type: 'button', title: 'Eliminar' }, '✕');
      borrar.addEventListener('click', () => {
        if (!confirm('¿Eliminar este elemento? Se borra al guardar los cambios.')) return;
        items.splice(index, 1); marcarSucio(); syncPreviewOrden(sec.dominio!); cerrarModal();
      });
      acciones.push(borrar);
    } else {
      const verLista = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver todos' }, '☰');
      verLista.addEventListener('click', () => mostrarLista(sec));
      acciones.push(verLista);
    }

    const cuerpo = crearFormulario(campos, item.data, marcarSucio);
    const subtitulo = `${sec.titulo} — ${index + 1} de ${items.length}`;
    const cuerpos: HTMLElement[] = [cuerpo];
    if (!sec.bloqueado) {
      const agregar = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `+ Agregar otro elemento en "${sec.titulo}"`);
      agregar.addEventListener('click', () => {
        const claveNueva = `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        items.splice(index + 1, 0, { clave: claveNueva, data: valoresVacios(campos) });
        marcarSucio(); syncPreviewOrden(sec.dominio!); mostrarItem(sec, claveNueva);
      });
      cuerpos.push(agregar);
      if (portapapeles && portapapeles.dominio === sec.dominio) {
        const pegarBtn = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `⧉ Pegar "${portapapeles.label}" después de este`);
        pegarBtn.addEventListener('click', () => { if (pegarEn(sec.dominio!, campos, index + 1)) mostrarItem(sec, claveNuevaSafe(items, index + 1)); });
        function claveNuevaSafe(arr: typeof items, pos: number) { return arr[pos]?.clave ?? clave; }
        cuerpos.push(pegarBtn);
      }
    }
    modal.replaceChildren(crearHeaderModal(tituloDeItem(campos, item.data), subtitulo, acciones), ...cuerpos);
    overlay.hidden = false;
  }

  function seleccionar(dominio: string | undefined, clave: string | undefined) {
    if (!dominio) return;
    const sec = dominioIndex.get(dominio);
    if (!sec) return;
    if (sec.tipo === 'placeholder') return mostrarPlaceholder(sec);
    if (sec.tipo === 'single' || (sec.tipo === 'lista' && clave && sec.bloqueado)) {
      // lista bloqueada: ir directo a item
      if (sec.tipo === 'lista' && clave) return mostrarItem(sec, clave);
      return mostrarSingle(sec);
    }
    if (sec.tipo === 'lista' && !clave) return mostrarLista(sec);
    if (sec.tipo === 'lista' && clave) return mostrarItem(sec, clave);
    // single con clave (no debería pasar) -> single
    return mostrarSingle(sec);
  }

  // ── Botón Estructura en topbar ───────────────────────────────────────
  estructuraBtn?.addEventListener('click', () => mostrarEstructura());

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
