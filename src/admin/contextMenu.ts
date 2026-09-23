import { el } from './helpers';
import {
  COLOR_ACCENT_SOFT,
  COLOR_BLANCO,
  COLOR_BORDE_CLARO,
  COLOR_TEXTO,
  COLOR_TEXTO_SUAVE,
} from '@constants/admin/editorColors';

/**
 * Menú contextual del editor (click derecho en listas/estructura) — capa
 * autocontenida: no conoce el estado del editor, solo DOM.
 */

type AccionCtx = {
  label: string;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
};

type OpcionesCtxMenu = {
  titulo: string;
  acciones: AccionCtx[];
  hint?: string;
};

let menu: HTMLElement | null = null;

function getMenu(): HTMLElement {
  if (menu) return menu;
  menu = el('div', { className: 'cms-context-menu' });
  menu.id = 'cms-editor-context-menu';
  menu.style.cssText = `position:fixed; z-index:200; min-width:200px; background:${COLOR_BLANCO}; border:1px solid ${COLOR_BORDE_CLARO}; border-radius:12px; box-shadow:0 12px 32px rgba(42,26,73,0.22); padding:6px; display:none; flex-direction:column; gap:2px;`;
  document.body.appendChild(menu);
  return menu;
}

export function cerrarContextMenu(): void {
  if (menu) menu.style.display = 'none';
}

/** Registra una única vez los cierres globales (click fuera / Escape). */
export function iniciarContextMenu(): void {
  document.addEventListener('click', cerrarContextMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarContextMenu();
  });
}

export function mostrarContextMenu(e: MouseEvent, opts: OpcionesCtxMenu): void {
  e.preventDefault();
  e.stopPropagation();
  const nodo = getMenu();
  nodo.replaceChildren();
  const header = el('div', {}, opts.titulo);
  header.style.cssText = `font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR_TEXTO_SUAVE};padding:6px 10px 4px;border-bottom:1px solid ${COLOR_ACCENT_SOFT};margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
  nodo.append(header);
  opts.acciones.forEach((a) => {
    const btn = el('button', { type: 'button', title: a.title ?? '' }, a.label) as HTMLButtonElement;
    btn.style.cssText = `appearance:none;border:none;background:${COLOR_BLANCO};text-align:left;font-size:13px;font-weight:600;color:${COLOR_TEXTO};padding:8px 10px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;`;
    if (a.disabled) {
      btn.disabled = true;
      btn.style.opacity = '0.38';
      btn.style.cursor = 'default';
    } else {
      btn.addEventListener('click', () => {
        cerrarContextMenu();
        a.onClick();
      });
      btn.addEventListener('mouseenter', () => (btn.style.background = COLOR_ACCENT_SOFT));
      btn.addEventListener('mouseleave', () => (btn.style.background = COLOR_BLANCO));
    }
    nodo.append(btn);
  });
  if (opts.hint) {
    const h = el('div', {}, opts.hint);
    h.style.cssText = `font-size:11px;color:${COLOR_TEXTO_SUAVE};padding:4px 10px;font-style:italic;`;
    nodo.append(h);
  }
  nodo.style.display = 'flex';
  nodo.style.left = '0';
  nodo.style.top = '0';
  const r = nodo.getBoundingClientRect();
  let x = e.clientX + 6;
  let y = e.clientY + 6;
  if (x + r.width > window.innerWidth - 8) x = window.innerWidth - r.width - 8;
  if (y + r.height > window.innerHeight - 8) y = window.innerHeight - r.height - 8;
  nodo.style.left = x + 'px';
  nodo.style.top = y + 'px';
}