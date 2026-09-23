import type { FieldSpec } from '@lib/cms/campos';
import type { EditorContexto } from '@types/cms/editorContext';
import type { SeccionData } from '@types/cms';
import {
  COLOR_ACCENT,
  COLOR_ACCENT_SOFT,
  COLOR_BLANCO,
  COLOR_PRIMARY,
} from '@constants/admin/editorColors';
import { clonarData, clonarSeccion, el, nuevaClaveItem, tituloDeItem, valoresVacios } from './helpers';

/**
 * Operaciones del portapapeles del editor: copiar/pegar/duplicar tarjetas y
 * secciones. Todo muta el estado vía `EditorContexto` y reporta en la barra
 * de estado (`estadoEl`).
 */

export function actualizarBarraPortapapeles(ctx: EditorContexto): void {
  const barra = ctx.portapapelesEl;
  if (!barra) return;
  const pp = ctx.portapapeles;
  if (!pp) {
    barra.hidden = true;
  } else {
    barra.hidden = false;
    const esSeccion = pp.tipo === 'seccion';
    const icono = esSeccion ? '⬢' : '⧉';
    const hint = el('span', { style: 'opacity:0.7' }, esSeccion ? ' — abrí Estructura (☰) y hacé click derecho para pegar la sección' : ' — click derecho donde quieras pegar (misma sección)');
    // Borde y fondo distinto según tipo para que se note en menú izquierda (topbar)
    barra.style.borderLeft = esSeccion ? `4px solid ${COLOR_PRIMARY}` : `4px solid ${COLOR_ACCENT}`;
    barra.style.background = esSeccion ? COLOR_ACCENT_SOFT : COLOR_BLANCO;
    const badge = el('span', { style: `font-size:10px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;background:${COLOR_PRIMARY};color:${COLOR_BLANCO};padding:2px 6px;border-radius:999px;` }, esSeccion ? 'SECCIÓN' : 'TARJETA');
    barra.replaceChildren(
      badge,
      el('span', {}, ` ${icono} `),
      el('strong', {}, pp.label),
      el('span', {}, ` (${pp.dominio})`),
      hint,
      (() => {
        const b = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Limpiar' }, '✕');
        b.addEventListener('click', () => {
          ctx.portapapeles = null;
          ctx.actualizarBarraPortapapeles();
        });
        return b;
      })(),
    );
  }
  ctx.syncPortapapelesPreview();
}

export function copiarItem(ctx: EditorContexto, dominio: string, data: Record<string, unknown>, campos: FieldSpec[]) {
  ctx.portapapeles = { dominio, data: clonarData(data), label: tituloDeItem(campos, data), tipo: 'item' };
  ctx.actualizarBarraPortapapeles();
  ctx.estadoEl.textContent = `Copiado: ${ctx.portapapeles.label} — click derecho donde quieras pegar`;
  ctx.estadoEl.className = 'cms-estado';
  setTimeout(() => {
    if (ctx.hayCambiosSinGuardar) {
      ctx.estadoEl.textContent = 'Cambios sin guardar';
      ctx.estadoEl.className = 'cms-estado cms-estado--sucio';
    } else {
      ctx.estadoEl.textContent = 'Todo guardado';
    }
  }, 2200);
}

export function copiarSeccion(ctx: EditorContexto, sec: SeccionData) {
  const label = sec.titulo || sec.key;
  const dominio = sec.dominio || sec.key;
  // Para secciones lista, guardamos una copia del primer item como ejemplo si existe; si no, guardamos estructura vacía
  const dataEjemplo = sec.tipo === 'lista' ? (sec.items?.[0]?.data ?? valoresVacios(sec.campos ?? [])) : (sec.valor ?? {});
  ctx.portapapeles = { dominio, data: clonarData(dataEjemplo as Record<string, unknown>), label, tipo: 'seccion', seccionKey: sec.key, seccionTitulo: sec.titulo };
  ctx.actualizarBarraPortapapeles();
  ctx.estadoEl.textContent = `Copiada sección: ${label} — abrí Estructura y pegá donde quieras`;
  ctx.estadoEl.className = 'cms-estado';
  setTimeout(() => {
    if (ctx.hayCambiosSinGuardar) {
      ctx.estadoEl.textContent = 'Cambios sin guardar';
      ctx.estadoEl.className = 'cms-estado cms-estado--sucio';
    } else {
      ctx.estadoEl.textContent = 'Todo guardado';
    }
  }, 2800);
}

export function duplicarItem(ctx: EditorContexto, dominio: string, clave: string): boolean {
  const sec = ctx.dominioIndex.get(dominio);
  if (!sec?.items || sec.bloqueado) return false;
  const idx = sec.items.findIndex((i) => i.clave === clave);
  if (idx === -1) return false;
  const src = sec.items[idx];
  // clonarData garantiza que la tarjeta duplicada sea independiente — no afecta al componente original ni a su estructura
  sec.items.splice(idx + 1, 0, { clave: nuevaClaveItem(), data: clonarData(src.data) });
  ctx.marcarSucio();
  ctx.syncPreviewOrden(dominio);
  ctx.estadoEl.textContent = `Duplicado: ${tituloDeItem(sec.campos ?? [], src.data)}`;
  setTimeout(() => {
    ctx.estadoEl.textContent = 'Cambios sin guardar';
  }, 1500);
  return true;
}

export function pegarEn(ctx: EditorContexto, dominio: string, indice: number): boolean {
  const pp = ctx.portapapeles;
  if (!pp || pp.tipo !== 'item' || pp.dominio !== dominio) return false;
  const sec = ctx.dominioIndex.get(dominio);
  if (!sec || !sec.items || sec.bloqueado) return false;
  sec.items.splice(indice, 0, { clave: nuevaClaveItem(), data: clonarData(pp.data) });
  ctx.marcarSucio();
  ctx.syncPreviewOrden(dominio);
  return true;
}

/** Registra una sección clonada en el estado: secciones + índice + ordenLayout + marca sucio. */
export function registrarSeccionNueva(ctx: EditorContexto, nuevo: SeccionData, pos: number): void {
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return;
  estado.datos.secciones.push(nuevo);
  ctx.dominioIndex.set(nuevo.dominio ?? nuevo.key, nuevo);
  estado.datos.ordenLayout.splice(pos, 0, nuevo.key);
  ctx.marcarSucio();
  ctx.syncPreviewOrden();
}

/** Clona una sección y la inserta en `pos` del ordenLayout. Única vía de "pegar sección". */
export function pegarSeccion(ctx: EditorContexto, sec: SeccionData, pos: number): boolean {
  if (sec.tipo === 'placeholder') return false;
  registrarSeccionNueva(ctx, clonarSeccion(sec), pos);
  return true;
}

export function duplicarSeccion(ctx: EditorContexto, sec: SeccionData): boolean {
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return false;
  const idx = estado.datos.ordenLayout.indexOf(sec.key);
  if (idx === -1) return false;
  if (sec.tipo === 'placeholder') return false;
  const nuevo = clonarSeccion(sec);
  registrarSeccionNueva(ctx, nuevo, idx + 1);
  ctx.estadoEl.textContent = `Sección duplicada: ${nuevo.titulo}`;
  setTimeout(() => {
    ctx.estadoEl.textContent = 'Cambios sin guardar';
  }, 1500);
  return true;
}

export function pegarSeccionDespues(ctx: EditorContexto, targetKey: string): boolean {
  const pp = ctx.portapapeles;
  if (!pp || pp.tipo !== 'seccion' || !pp.seccionKey) return false;
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return false;
  const srcSec = estado.datos.secciones.find((s) => s.key === pp.seccionKey);
  if (!srcSec) {
    console.warn('[CMS] sección origen no encontrada', pp.seccionKey);
    return false;
  }
  let targetIdx = estado.datos.ordenLayout.indexOf(targetKey);
  if (targetIdx === -1) targetIdx = estado.datos.ordenLayout.length - 1; // si no hay target, pegar al final
  return ctx.pegarSeccion(srcSec, targetIdx + 1);
}