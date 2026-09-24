import type { DatosPagina, SeccionData } from '@cms/sitio';
import type { FieldSpec } from '@cms/sitio';
import {
  COLOR_ACCENT,
  COLOR_ACCENT_SOFT,
  COLOR_BLANCO,
  COLOR_PRIMARY,
} from '@constants/admin/editorColors';

/**
 * Mutación directa del DOM en la vista previa durante `syncPreviewOrden`:
 * detecta qué secciones se pegaron, crea sus "fantasmas" visuales, aplica el
 * `style.order` del layout y reordena los ítems `[data-cms-clave]`. Funciones
 * puras sobre `(datos, container/doc)` — no dependen del contexto del editor.
 */

/** Nodos hijos de un contenedor que representan secciones editables (`data-cms-dominio`). */
export function hijosConDominio(container: HTMLElement): HTMLElement[] {
  return Array.from(container.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute('data-cms-dominio'));
}

/** Keys de `ordenLayout` cuya sección todavía no tiene nodo `data-cms-dominio` en el DOM. */
export function seccionesFaltantes(datos: DatosPagina, hijos: HTMLElement[]): string[] {
  const dominiosExistentes = new Set(hijos.map((h) => h.dataset.cmsDominio || ''));
  return datos.ordenLayout.filter((k) => {
    const sec = datos.secciones.find((s) => s.key === k);
    return sec && !dominiosExistentes.has(sec.dominio || k);
  });
}

/** Clona la sección-plantilla como "fantasma" para cada sección recién pegada (máx. 2, para no duplicar la página). */
export function crearFantasmasSeccion(faltantesKeys: string[], container: HTMLElement, datos: DatosPagina, hijos: HTMLElement[]): void {
  if (faltantesKeys.length === 0 || faltantesKeys.length > 2) return;
  const plantilla = hijos[hijos.length - 1] ?? hijos[0];
  if (!plantilla) return;
  faltantesKeys.forEach((fk) => {
    const srcSec = datos.secciones.find((s) => s.key === fk);
    if (!srcSec || srcSec.tipo === 'placeholder') return;
    // Evitar crear si ya existe un fantasma con mismo dominio copiado
    if (container.querySelector(`[data-cms-dominio="${srcSec.dominio}"]`)) return;
    const clone = plantilla.cloneNode(true) as HTMLElement;
    if (srcSec.dominio) clone.setAttribute('data-cms-dominio', srcSec.dominio);
    else clone.dataset.cmsDominio = fk;
    clone.querySelectorAll('[data-cms-clave]').forEach((n) => (n as HTMLElement).removeAttribute('data-cms-clave'));
    if (srcSec.items?.length) {
      const srcItem = srcSec.items[0];
      const itemTemplate = plantilla.querySelector('[data-cms-clave]') as HTMLElement | null;
      if (itemTemplate && srcItem) {
        const itemClone = itemTemplate.cloneNode(true) as HTMLElement;
        itemClone.setAttribute('data-cms-dominio', srcSec.dominio || fk);
        itemClone.setAttribute('data-cms-clave', srcItem.clave);
        rellenarCampos(itemClone, srcItem.data, srcSec.campos);
        const contLista = clone.querySelector('[data-cms-clave]')?.parentElement ?? clone;
        contLista.replaceChildren(itemClone);
        if (srcSec.items.length > 1) contLista.appendChild(badgeTarjetasExtra(srcSec.items.length - 1));
      }
    } else if (srcSec.valor) {
      rellenarCampos(clone, srcSec.valor, srcSec.campos);
    }
    marcarFantasma(clone, `⬢ COPIA: ${srcSec.titulo}`);
    const hTitle = clone.querySelector('h1,h2,h3');
    if (hTitle && srcSec.titulo) hTitle.textContent = srcSec.titulo + ' (copia)';
    container.appendChild(clone);
  });
}

/** Asigna `style.order` a cada sección según `ordenLayout` y devuelve el mapa `dominio → nodo` para el scroll final. */
export function aplicarOrdenLayout(container: HTMLElement, datos: DatosPagina): Map<string, HTMLElement> {
  const domToEl = new Map(hijosConDominio(container).map((h) => [h.dataset.cmsDominio || '', h]));
  datos.ordenLayout.forEach((key, idx) => {
    const sec = datos.secciones.find((s) => s.key === key);
    const h = domToEl.get(sec?.dominio || key);
    if (h) h.style.order = String(idx);
  });
  return domToEl;
}

/** Si se pegó exactamente una sección, hace scroll suave hasta su fantasma recién creado. */
export function hacerScrollAlPegado(
  faltantesKeys: string[],
  datos: DatosPagina,
  domToEl: Map<string, HTMLElement>,
  container: HTMLElement,
): void {
  if (faltantesKeys.length !== 1) return;
  const sec = datos.secciones.find((s) => s.key === faltantesKeys[0]);
  const nuevoEl = sec?.dominio ? (domToEl.get(sec.dominio) ?? (container.lastElementChild as HTMLElement | null)) : null;
  if (nuevoEl) nuevoEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** Reordena los nodos `[data-cms-clave]` de un dominio dentro de sus contenedores y crea fantasmas para los ítems pegados. */
export function reordenarItemsDominio(doc: Document, dominio: string, sec: SeccionData): void {
  const items = sec.items ?? [];
  if (items.length === 0) return;
  const nodos = Array.from(doc.querySelectorAll<HTMLElement>('[data-cms-clave]')).filter((n) => (n.getAttribute('data-cms-dominio') || '') === dominio);
  const porParent = new Map<HTMLElement, HTMLElement[]>();
  nodos.forEach((n) => {
    const p = n.parentElement!;
    if (!porParent.has(p)) porParent.set(p, []);
    porParent.get(p)!.push(n);
  });
  const orden = items.map((i) => i.clave);
  porParent.forEach((nodosParent, parent) => {
    const mapa = new Map(nodosParent.map((n) => [n.dataset.cmsClave!, n]));
    orden.forEach((k) => {
      const n = mapa.get(k);
      if (n) parent.appendChild(n);
    });
    // Si hay nuevos (pegar), crear clones visuales simples: clonar primer nodo como placeholder y marcar flash
    if (items.length > nodosParent.length) {
      items
        .filter((it) => !nodosParent.some((n) => n.dataset.cmsClave === it.clave))
        .forEach((f) => {
          if (!nodosParent[0]) return;
          const clone = nodosParent[0].cloneNode(true) as HTMLElement;
          clone.dataset.cmsClave = f.clave;
          rellenarCampos(clone, f.data, sec.campos);
          marcarFantasma(clone, undefined, 0);
          parent.appendChild(clone);
        });
    }
  });
}

/** Vuelca los textos editables del estado a los nodos `data-cms-campo` de un nodo clonado. */
function rellenarCampos(el: Element, data: Record<string, unknown>, campos: FieldSpec[] | undefined): void {
  (campos ?? []).forEach((c) => {
    const cel = el.querySelector(`[data-cms-campo="${c.name}"]`);
    if (cel && typeof data[c.name] === 'string') cel.textContent = String(data[c.name]);
  });
}

/** Flash visual de "fantasma": outline accent + badge COPIA (opcional). `autoocultarMs: 0` mantiene el outline fijo. */
function marcarFantasma(el: HTMLElement, texto?: string, autoocultarMs = 2500): void {
  el.style.outline = `3px solid ${COLOR_ACCENT}`;
  if (texto) {
    el.style.position = 'relative';
    const badge = document.createElement('div');
    badge.textContent = texto;
    badge.style.cssText = `position:absolute;top:6px;left:6px;background:${COLOR_PRIMARY};color:${COLOR_BLANCO};font-size:10px;font-weight:800;letter-spacing:0.05em;padding:4px 8px;border-radius:999px;z-index:5;`;
    el.appendChild(badge);
    if (autoocultarMs > 0) setTimeout(() => (badge.style.opacity = '0.85'), autoocultarMs);
  }
  if (autoocultarMs > 0) setTimeout(() => (el.style.outline = ''), autoocultarMs);
}

/** Badge "+ N tarjetas más" para fantasmas de secciones con muchas tarjetas. */
function badgeTarjetasExtra(cantidad: number): HTMLElement {
  const extra = document.createElement('div');
  extra.className = 'cms-pegado-count';
  extra.textContent = `+ ${cantidad} tarjetas más`;
  extra.style.cssText = `margin:8px auto;padding:6px 10px;background:${COLOR_ACCENT_SOFT};color:${COLOR_PRIMARY};border-radius:999px;font-size:11px;font-weight:700;text-align:center;`;
  return extra;
}