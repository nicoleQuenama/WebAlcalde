import type { FieldSpec } from '@cms/sitio';
import type { DatosPagina, SeccionData } from '@type/cms';
import type { EditorContexto } from '@type/cms/editorContext';

/**
 * Helpers puros del editor CMS: construcción de DOM, clonado de datos y
 * generación de claves/dominios únicos para copiar, pegar y duplicar.
 * No tocan el estado del editor (van por `EditorContexto` en quien los usa).
 */

/** Muestra un aviso temporal en la barra de estado y lo restaura según haya cambios sin guardar o no. */
export function feedbackEstado(ctx: EditorContexto, texto: string, ms = 1500): void {
  ctx.estadoEl.textContent = texto;
  ctx.estadoEl.className = 'cms-estado';
  setTimeout(() => {
    if (ctx.hayCambiosSinGuardar) {
      ctx.estadoEl.textContent = 'Cambios sin guardar';
      ctx.estadoEl.className = 'cms-estado cms-estado--sucio';
    } else {
      ctx.estadoEl.textContent = 'Todo guardado';
    }
  }, ms);
}

type PropsDeEl<K extends keyof HTMLElementTagNameMap> = Partial<Omit<HTMLElementTagNameMap[K], 'style'>> & {
  className?: string;
  style?: string;
};

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: PropsDeEl<K>,
  ...hijos: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const nodo = document.createElement(tag);
  if (props) Object.assign(nodo, props);
  for (const h of hijos) nodo.append(h);
  return nodo;
}

/** Adivina un texto representativo del ítem para el título del modal. */
export function tituloDeItem(campos: FieldSpec[], data: Record<string, unknown>): string {
  const candidato = campos.find((c) => ['titulo', 'nombre', 'eyebrow', 'title'].includes(c.name));
  const valor = candidato ? data[candidato.name] : undefined;
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return texto || '(sin título)';
}

export function construirOriginales(datos: DatosPagina): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const sec of datos.secciones) {
    if (sec.tipo === 'lista' && sec.dominio) out.set(sec.dominio, new Set((sec.items ?? []).map((i) => i.clave)));
  }
  return out;
}

/** Copia profunda vía JSON — garantiza que los datos duplicados sean independientes. */
export function clonarData(data: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data));
}

export function valoresVacios(campos: FieldSpec[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const c of campos) out[c.name] = c.type === 'obras' ? [] : '';
  return out;
}

// ── Generación de claves únicas (copiar/pegar/duplicar) ────────────────

export function nuevaClaveItem(): string {
  return `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function nuevaClaveItemDesde(original: string): string {
  return `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 5)}-${original}`;
}

export function nuevaClaveSeccion(base: string): string {
  return `${base}-copia-${Date.now().toString(36).slice(2, 6)}`;
}

export function nuevoDominioCopia(dominio: string): string {
  return `${dominio}_copia_${Date.now().toString(36).slice(2, 4)}`;
}

/** Clona una sección entera con claves/dominios nuevos e independientes. */
export function clonarSeccion(sec: SeccionData): SeccionData {
  return {
    ...JSON.parse(JSON.stringify(sec)),
    key: nuevaClaveSeccion(sec.key),
    titulo: `${sec.titulo} (copia)`,
    dominio: sec.dominio ? nuevoDominioCopia(sec.dominio) : undefined,
    items: sec.items
      ? sec.items.map((it) => ({ clave: nuevaClaveItemDesde(it.clave), data: clonarData(it.data) }))
      : undefined,
    valor: sec.valor ? clonarData(sec.valor) : undefined,
  };
}

// ── Helpers de UI reutilizables ─────────────────────────────────────────

export function crearBotonFlecha(direccion: 'up' | 'down', deshabilitado: boolean, onClick: () => void): HTMLElement {
  const btn = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: direccion === 'up' ? 'Subir' : 'Bajar' }, direccion === 'up' ? '↑' : '↓');
  (btn as HTMLButtonElement).disabled = deshabilitado;
  btn.addEventListener('click', () => onClick());
  return btn;
}

/** Drag & drop genérico para cualquier lista que use filas con `[data-drag-index]`. */
export function activarDragReorder<T>(container: HTMLElement, onReorder: (from: number, to: number) => void) {
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