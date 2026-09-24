import type { EditorContexto } from '@type/cms/editorContext';
import type { SeccionData } from '@type/cms';
import {
  COLOR_ACCENT,
  COLOR_ACCENT_SOFT,
  COLOR_BLANCO,
  COLOR_PANEL_SOFT,
  COLOR_PRIMARY,
  COLOR_TEXTO,
} from '@constants/admin/editorColors';
import { activarDragReorder, clonarData, crearBotonFlecha, el, nuevaClaveItem, tituloDeItem, valoresVacios } from './helpers';
import { crearFormulario } from './forms';
import { cerrarContextMenu, mostrarContextMenu } from './contextMenu';

/**
 * Vistas / modales del editor CMS: estructura (reordenar secciones), sección
 * single, placeholder y listas con drag, copiar/pegar y dropzones. Toda la
 * interacción muta el estado vía `EditorContexto`.
 */

// ── Modal helpers ────────────────────────────────────────────────────

export function cerrarModal(ctx: EditorContexto) {
  ctx.overlay.hidden = true;
  ctx.modal.replaceChildren();
  cerrarContextMenu();
}

export function crearHeaderModal(ctx: EditorContexto, titulo: string, subtitulo: string | undefined, acciones: HTMLElement[]): HTMLElement {
  const cerrar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Cerrar' }, '✕');
  cerrar.addEventListener('click', () => cerrarModal(ctx));
  return el('div', { className: 'cms-panel-header' },
    el('div', { className: 'cms-panel-header__titulos' },
      el('span', { className: 'cms-panel-header__titulo' }, titulo),
      ...(subtitulo ? [el('span', { className: 'cms-panel-header__subtitulo' }, subtitulo)] : []),
    ),
    el('div', { className: 'cms-panel-header__acciones' }, ...acciones, cerrar),
  );
}

// ── Vista ESTRUCTURA: reordenar secciones de la página arrastrando ──

export function mostrarEstructura(ctx: EditorContexto) {
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return;
  const ordenLayout = estado.datos.ordenLayout;
  const porKey = new Map(estado.datos.secciones.map((s) => [s.key, s]));
  const pp = ctx.portapapeles;

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
      ctx.marcarSucio();
      ctx.syncPreviewOrden();
      mostrarEstructura(ctx);
    });
    const btnDown = crearBotonFlecha('down', idx === ordenLayout.length - 1, () => {
      [ordenLayout[idx + 1], ordenLayout[idx]] = [ordenLayout[idx], ordenLayout[idx + 1]];
      ctx.marcarSucio();
      ctx.syncPreviewOrden();
      mostrarEstructura(ctx);
    });
    const editar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Editar' }, '✎');
    const abrirEdicion = () => {
      if (sec.tipo === 'lista') ctx.mostrarLista(sec);
      else if (sec.tipo === 'single') ctx.mostrarSingle(sec);
      else ctx.mostrarPlaceholder(sec);
    };
    editar.addEventListener('click', abrirEdicion);
    fila.append(handle, titulo, badge, btnUp, btnDown, editar);
    fila.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      abrirEdicion();
    });
    fila.addEventListener('contextmenu', (e) => {
      const puedePegarSeccion = !!pp && pp.tipo === 'seccion' && !sec.bloqueado;
      const puedePegarItem = sec.tipo === 'lista' && !!pp && pp.tipo === 'item' && pp.dominio === sec.dominio && !sec.bloqueado;
      mostrarContextMenu(e as MouseEvent, {
        titulo: sec.titulo,
        acciones: [
          { label: '✎ Editar sección', onClick: abrirEdicion },
          { label: '⧉ Copiar sección', onClick: () => { ctx.copiarSeccion(sec); mostrarEstructura(ctx); } },
          { label: '⎘ Duplicar sección', onClick: () => { ctx.duplicarSeccion(sec); mostrarEstructura(ctx); } },
          ...(puedePegarSeccion && pp ? [
            { label: `📋 Pegar sección "${pp.label.slice(0, 18)}" después de aquí`, onClick: () => { if (ctx.pegarSeccionDespues(sec.key)) mostrarEstructura(ctx); } },
          ] : []),
          ...(puedePegarItem && pp ? [
            { label: `📋 Pegar tarjeta "${pp.label.slice(0, 18)}" aquí`, onClick: () => { if (ctx.pegarEn(sec.dominio!, 0)) ctx.mostrarLista(sec); } },
          ] : []),
          ...(!puedePegarSeccion && !puedePegarItem && pp ? [
            {
              label: pp.tipo === 'seccion' ? '📋 Pegar sección aquí' : '📋 Pegar aquí',
              disabled: pp.tipo === 'item' && pp.dominio !== sec.dominio,
              title: pp.tipo === 'item' && pp.dominio !== sec.dominio ? `Portapapeles: ${pp.dominio} — no compatible con ${sec.dominio}` : 'Pegar sección disponible',
              onClick: () => { if (pp.tipo === 'seccion' && ctx.pegarSeccionDespues(sec.key)) mostrarEstructura(ctx); },
            },
          ] : []),
        ],
        hint: !pp ? 'Copia una sección o tarjeta para pegarla' : puedePegarSeccion ? 'Sección copiada — pegará después de esta' : puedePegarItem ? 'Tarjeta copiada — pegará dentro de esta sección' : undefined,
      });
    });
    // dropzone visual entre secciones si hay sección copiada
    if (pp?.tipo === 'seccion') {
      const dz = el('div', { className: 'cms-dropzone cms-dropzone--activo cms-dropzone--has-clipboard' }, `+ Pegar sección "${pp.label}" aquí`);
      dz.style.margin = '4px 0';
      dz.addEventListener('click', () => {
        if (ctx.pegarSeccionDespues(sec.key)) mostrarEstructura(ctx);
      });
      lista.append(fila);
      lista.append(dz);
    } else {
      lista.append(fila);
    }
  });

  activarDragReorder(lista, (from, to) => {
    const [mov] = ordenLayout.splice(from, 1);
    ordenLayout.splice(to, 0, mov);
    ctx.marcarSucio();
    ctx.syncPreviewOrden();
    mostrarEstructura(ctx);
  });

  // Banner visible cuando hay algo copiado — aparece en el menú de la izquierda (modal Estructura)
  let banner: HTMLElement | null = null;
  if (pp) {
    const esSec = pp.tipo === 'seccion';
    banner = el('div', { style: `margin:0 14px 8px;padding:10px 12px;border-radius:10px;border:1px solid ${esSec ? COLOR_PRIMARY : COLOR_ACCENT};background:${esSec ? COLOR_ACCENT_SOFT : COLOR_PANEL_SOFT};font-size:12px;color:${COLOR_TEXTO};display:flex;align-items:center;gap:8px;` },
      el('span', { style: `font-size:10px;font-weight:800;background:${COLOR_PRIMARY};color:${COLOR_BLANCO};padding:2px 6px;border-radius:999px;` }, esSec ? 'SECCIÓN COPIADA' : 'TARJETA COPIADA'),
      el('strong', {}, pp.label),
      el('span', { style: 'opacity:0.7' }, esSec ? ' — click derecho o + para pegar' : ` (${pp.dominio})`),
    );
  }

  const header = crearHeaderModal(ctx, 'Estructura de la página', `${estado.datos.pagina.titulo} — arrastra para reordenar`, []);
  const nota = el('p', { className: 'cms-panel-nota' }, pp?.tipo === 'seccion' ? `Sección copiada: "${pp.label}" — usa los dropzones "+ Pegar sección" o click derecho sobre una sección para pegarla.` : 'Arrastra las secciones o usa ↑/↓. Click derecho para copiar/pegar secciones. Los cambios se aplican al guardar.');
  const hijos: HTMLElement[] = banner ? [header, banner, nota, lista] : [header, nota, lista];
  // también permitir pegar al principio si hay sección copiada
  if (pp?.tipo === 'seccion') {
    const dzTop = el('div', { className: 'cms-dropzone cms-dropzone--activo' }, `+ Pegar sección "${pp.label}" al principio`);
    dzTop.addEventListener('click', () => {
      const estado2 = ctx.cache.get(ctx.paginaActual);
      if (!estado2) return;
      const srcSec = estado2.datos.secciones.find((s) => s.key === pp!.seccionKey);
      if (!srcSec) return;
      if (ctx.pegarSeccion(srcSec, 0)) mostrarEstructura(ctx);
    });
    hijos.splice(3, 0, dzTop);
  }
  ctx.modal.replaceChildren(...hijos);
  // click derecho en fondo del modal estructura: pegar sección
  ctx.modal.addEventListener('contextmenu', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('.cms-estructura-item') || t.closest('.cms-dropzone') || t.closest('button')) return;
    if (pp?.tipo === 'seccion') {
      e.preventDefault();
      mostrarContextMenu(e as MouseEvent, {
        titulo: 'Estructura',
        acciones: [{
          label: `📋 Pegar sección "${pp.label}" al final`,
          onClick: () => {
            const estado2 = ctx.cache.get(ctx.paginaActual);
            if (!estado2) return;
            const sec = estado2.datos.secciones.find((s) => s.key === pp!.seccionKey);
            if (!sec) return;
            if (ctx.pegarSeccion(sec, estado2.datos.ordenLayout.length)) mostrarEstructura(ctx);
          },
        }],
      });
    }
  }, { once: true });
  ctx.overlay.hidden = false;
}

// ── Vistas ──────────────────────────────────────────────────────────

export function mostrarSingle(ctx: EditorContexto, sec: SeccionData) {
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return;
  const ordenLayout = estado.datos.ordenLayout;
  const index = ordenLayout.indexOf(sec.key);
  const acciones = [
    el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver estructura' }, '☰'),
    crearBotonFlecha('up', index <= 0, () => { [ordenLayout[index - 1], ordenLayout[index]] = [ordenLayout[index], ordenLayout[index - 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(); mostrarSingle(ctx, sec); }),
    crearBotonFlecha('down', index === -1 || index === ordenLayout.length - 1, () => { [ordenLayout[index + 1], ordenLayout[index]] = [ordenLayout[index], ordenLayout[index + 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(); mostrarSingle(ctx, sec); }),
  ];
  acciones[0].addEventListener('click', () => mostrarEstructura(ctx));
  const cuerpo = crearFormulario(sec.campos ?? [], sec.valor!, ctx.marcarSucio);
  ctx.modal.replaceChildren(crearHeaderModal(ctx, sec.titulo, `Sección single — posición ${index + 1} de ${ordenLayout.length}`, acciones), cuerpo);
  ctx.overlay.hidden = false;
}

export function mostrarPlaceholder(ctx: EditorContexto, sec: SeccionData) {
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return;
  const ordenLayout = estado.datos.ordenLayout;
  const idx = ordenLayout.indexOf(sec.key);
  const acciones = [
    el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver estructura' }, '☰'),
    crearBotonFlecha('up', idx <= 0, () => { [ordenLayout[idx - 1], ordenLayout[idx]] = [ordenLayout[idx], ordenLayout[idx - 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(); mostrarPlaceholder(ctx, sec); }),
    crearBotonFlecha('down', idx === -1 || idx === ordenLayout.length - 1, () => { [ordenLayout[idx + 1], ordenLayout[idx]] = [ordenLayout[idx], ordenLayout[idx + 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(); mostrarPlaceholder(ctx, sec); }),
  ];
  acciones[0].addEventListener('click', () => mostrarEstructura(ctx));
  ctx.modal.replaceChildren(crearHeaderModal(ctx, sec.titulo, undefined, acciones), el('p', { className: 'cms-panel-nota' }, sec.notaPlaceholder ?? 'No editable en esta beta.'));
  ctx.overlay.hidden = false;
}

/** Vista lista completa: drag, copiar/pegar con selector de posición. */
export function mostrarLista(ctx: EditorContexto, sec: SeccionData) {
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return;
  const ordenLayout = estado.datos.ordenLayout;
  const idxLayout = ordenLayout.indexOf(sec.key);
  const items = sec.items ?? [];
  const campos = sec.campos ?? [];
  const puedePegar = !!ctx.portapapeles && ctx.portapapeles.tipo === 'item' && ctx.portapapeles.dominio === sec.dominio && !sec.bloqueado;

  const headerAcciones: HTMLElement[] = [
    el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver estructura' }, '☰'),
    crearBotonFlecha('up', idxLayout <= 0, () => { [ordenLayout[idxLayout - 1], ordenLayout[idxLayout]] = [ordenLayout[idxLayout], ordenLayout[idxLayout - 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(); mostrarLista(ctx, sec); }),
    crearBotonFlecha('down', idxLayout === -1 || idxLayout === ordenLayout.length - 1, () => { [ordenLayout[idxLayout + 1], ordenLayout[idxLayout]] = [ordenLayout[idxLayout], ordenLayout[idxLayout + 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(); mostrarLista(ctx, sec); }),
  ];
  headerAcciones[0].addEventListener('click', () => mostrarEstructura(ctx));

  const header = crearHeaderModal(ctx, sec.titulo, `${items.length} elementos — arrastra para reordenar, copia y pega donde quieras`, headerAcciones);

  const cont = el('div', { className: 'cms-lista-drag' });

  function crearDropzone(pos: number): HTMLElement {
    const dz = el('div', { className: `cms-dropzone ${puedePegar ? 'cms-dropzone--has-clipboard' : ''}` }, puedePegar ? `+ Pegar aquí (posición ${pos + 1}) — o click derecho` : '— click derecho para pegar');
    if (puedePegar) {
      dz.classList.add('cms-dropzone--activo');
      dz.addEventListener('click', () => { if (ctx.pegarEn(sec.dominio!, pos)) mostrarLista(ctx, sec); });
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
            ctx.marcarSucio();
            ctx.syncPreviewOrden(sec.dominio!);
            mostrarLista(ctx, sec);
            return;
          }
        }
        if (ctx.pegarEn(sec.dominio!, pos)) mostrarLista(ctx, sec);
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
        ctx.marcarSucio();
        ctx.syncPreviewOrden(sec.dominio!);
        mostrarLista(ctx, sec);
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
    editar.addEventListener('click', () => ctx.mostrarItem(sec, it.clave));
    row.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('button')) return; ctx.mostrarItem(sec, it.clave); });

    const acciones: HTMLElement[] = [];
    if (!sec.bloqueado) {
      const copiar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--copiar', type: 'button', title: 'Copiar' }, '⧉');
      copiar.addEventListener('click', (e) => { e.stopPropagation(); ctx.copiarItem(sec.dominio!, it.data, campos); mostrarLista(ctx, sec); });
      const dup = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Duplicar aquí' }, '⎘');
      dup.addEventListener('click', (e) => {
        e.stopPropagation();
        const nuevaClave = nuevaClaveItem();
        sec.items!.splice(i + 1, 0, { clave: nuevaClave, data: clonarData(it.data) });
        ctx.marcarSucio();
        ctx.syncPreviewOrden(sec.dominio!);
        mostrarLista(ctx, sec);
      });
      acciones.push(copiar, dup);
      const up = crearBotonFlecha('up', i === 0, () => { [items[i - 1], items[i]] = [items[i], items[i - 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(sec.dominio!); mostrarLista(ctx, sec); });
      const down = crearBotonFlecha('down', i === items.length - 1, () => { [items[i + 1], items[i]] = [items[i], items[i + 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(sec.dominio!); mostrarLista(ctx, sec); });
      acciones.push(up, down);
      const borrar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--peligro', type: 'button', title: 'Eliminar' }, '✕');
      borrar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar este elemento? Se borra al guardar los cambios.')) return;
        items.splice(i, 1);
        ctx.marcarSucio();
        ctx.syncPreviewOrden(sec.dominio!);
        mostrarLista(ctx, sec);
      });
      acciones.push(borrar);
    }
    row.append(handle, titulo, editar, ...acciones);
    row.addEventListener('contextmenu', (e) => {
      const pp = ctx.portapapeles;
      mostrarContextMenu(e as MouseEvent, {
        titulo: tituloDeItem(campos, it.data),
        acciones: [
          { label: '✎ Editar tarjeta', onClick: () => ctx.mostrarItem(sec, it.clave) },
          ...(sec.bloqueado
            ? []
            : [
                { label: '⧉ Copiar tarjeta', onClick: () => { ctx.copiarItem(sec.dominio!, it.data, campos); mostrarLista(ctx, sec); } },
                { label: '⎘ Duplicar (copia independiente)', onClick: () => { if (ctx.duplicarItem(sec.dominio!, it.clave)) mostrarLista(ctx, sec); } },
                {
                  label: pp && pp.dominio === sec.dominio ? `📋 Pegar después — "${pp.label.slice(0, 20)}"` : '📋 Pegar después',
                  disabled: !(pp && pp.dominio === sec.dominio),
                  title: pp ? (pp.dominio === sec.dominio ? '' : `Portapapeles: ${pp.dominio}`) : 'Nada copiado',
                  onClick: () => { if (ctx.pegarEn(sec.dominio!, i + 1)) mostrarLista(ctx, sec); },
                },
                { label: '🗑 Eliminar', onClick: () => { if (!confirm('¿Eliminar este elemento?')) return; items.splice(i, 1); ctx.marcarSucio(); ctx.syncPreviewOrden(sec.dominio!); mostrarLista(ctx, sec); } },
              ]),
        ],
        hint: sec.bloqueado ? 'Sección bloqueada — solo lectura' : !pp ? 'Copia primero para pegar' : undefined,
      });
    });
    cont.append(row);
    cont.append(crearDropzone(i + 1));
  });
  // click derecho en zona vacía de la lista: pegar al final
  cont.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cms-lista-item-row') || target.closest('.cms-dropzone') || target.closest('button')) return;
    e.preventDefault();
    const pp = ctx.portapapeles;
    if (!pp || pp.dominio !== sec.dominio || sec.bloqueado) {
      mostrarContextMenu(e as MouseEvent, { titulo: sec.titulo, acciones: [{ label: '📋 Pegar aquí', disabled: true, title: pp ? `Portapapeles: ${pp.dominio}` : 'Nada copiado', onClick: () => {} }], hint: 'Copia una tarjeta compatible para pegarla aquí' });
      return;
    }
    mostrarContextMenu(e as MouseEvent, { titulo: sec.titulo, acciones: [{ label: `📋 Pegar "${pp.label.slice(0, 24)}" al final`, onClick: () => { if (ctx.pegarEn(sec.dominio!, items.length)) mostrarLista(ctx, sec); } }] });
  });

  // Botón agregar al final (cuando no hay dropzone de pegado único)
  if (!sec.bloqueado) {
    const agregar = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `+ Agregar elemento en "${sec.titulo}"`);
    agregar.style.margin = '8px 14px';
    agregar.addEventListener('click', () => {
      const claveNueva = nuevaClaveItem();
      items.push({ clave: claveNueva, data: valoresVacios(campos) });
      ctx.marcarSucio();
      ctx.syncPreviewOrden(sec.dominio!);
      ctx.mostrarItem(sec, claveNueva);
    });
    cont.append(agregar);
    if (puedePegar) {
      const pp = ctx.portapapeles!;
      const pegarFinal = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `⧉ Pegar "${pp.label}" al final`);
      pegarFinal.style.margin = '0 14px 12px';
      pegarFinal.addEventListener('click', () => { if (ctx.pegarEn(sec.dominio!, items.length)) mostrarLista(ctx, sec); });
      cont.append(pegarFinal);
    }
  } else {
    const nota = el('p', { className: 'cms-panel-nota' }, 'Esta sección está bloqueada (no se puede reordenar ni duplicar). Solo edición de textos.');
    cont.append(nota);
  }

  // activar drag entre rows (además de dropzones)
  if (!sec.bloqueado) {
    activarDragReorder(cont, (from, to) => {
      const [mov] = items.splice(from, 1);
      items.splice(to, 0, mov);
      ctx.marcarSucio();
      ctx.syncPreviewOrden(sec.dominio!);
      mostrarLista(ctx, sec);
    });
  }

  ctx.modal.replaceChildren(header, cont);
  ctx.overlay.hidden = false;
}

export function mostrarItem(ctx: EditorContexto, sec: SeccionData, clave: string) {
  const items = sec.items ?? [];
  const index = items.findIndex((it) => it.clave === clave);
  if (index === -1) return cerrarModal(ctx);
  const item = items[index];
  const campos = sec.campos ?? [];

  const acciones: HTMLElement[] = [];
  if (!sec.bloqueado) {
    acciones.push(
      crearBotonFlecha('up', index === 0, () => { [items[index - 1], items[index]] = [items[index], items[index - 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(sec.dominio!); mostrarItem(ctx, sec, clave); }),
      crearBotonFlecha('down', index === items.length - 1, () => { [items[index + 1], items[index]] = [items[index], items[index + 1]]; ctx.marcarSucio(); ctx.syncPreviewOrden(sec.dominio!); mostrarItem(ctx, sec, clave); }),
    );
    const copiar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--copiar', type: 'button', title: 'Copiar elemento' }, '⧉ Copiar');
    copiar.addEventListener('click', () => { ctx.copiarItem(sec.dominio!, item.data, campos); });
    acciones.push(copiar);
    const duplicar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Duplicar' }, '⎘');
    duplicar.addEventListener('click', () => {
      const nuevaClave = nuevaClaveItem();
      items.splice(index + 1, 0, { clave: nuevaClave, data: clonarData(item.data) });
      ctx.marcarSucio();
      ctx.syncPreviewOrden(sec.dominio!);
      mostrarItem(ctx, sec, nuevaClave);
    });
    acciones.push(duplicar);
    // Pegar después de este si hay portapapeles compatible
    if (ctx.portapapeles && ctx.portapapeles.dominio === sec.dominio) {
      const pp = ctx.portapapeles;
      const pegar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: `Pegar "${pp.label}" después` }, '📋 Pegar');
      pegar.addEventListener('click', () => { if (ctx.pegarEn(sec.dominio!, index + 1)) mostrarItem(ctx, sec, clave); });
      acciones.push(pegar);
    }
    const verLista = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver todos' }, '☰');
    verLista.addEventListener('click', () => ctx.mostrarLista(sec));
    acciones.push(verLista);
    const borrar = el('button', { className: 'cms-btn cms-btn--icono cms-btn--peligro', type: 'button', title: 'Eliminar' }, '✕');
    borrar.addEventListener('click', () => {
      if (!confirm('¿Eliminar este elemento? Se borra al guardar los cambios.')) return;
      items.splice(index, 1);
      ctx.marcarSucio();
      ctx.syncPreviewOrden(sec.dominio!);
      cerrarModal(ctx);
    });
    acciones.push(borrar);
  } else {
    const verLista = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Ver todos' }, '☰');
    verLista.addEventListener('click', () => ctx.mostrarLista(sec));
    acciones.push(verLista);
  }

  const cuerpo = crearFormulario(campos, item.data, ctx.marcarSucio);
  const subtitulo = `${sec.titulo} — ${index + 1} de ${items.length}`;
  const cuerpos: HTMLElement[] = [cuerpo];
  if (!sec.bloqueado) {
    const agregar = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `+ Agregar otro elemento en "${sec.titulo}"`);
    agregar.addEventListener('click', () => {
      const claveNueva = nuevaClaveItem();
      items.splice(index + 1, 0, { clave: claveNueva, data: valoresVacios(campos) });
      ctx.marcarSucio();
      ctx.syncPreviewOrden(sec.dominio!);
      mostrarItem(ctx, sec, claveNueva);
    });
    cuerpos.push(agregar);
    if (ctx.portapapeles && ctx.portapapeles.dominio === sec.dominio) {
      const pp = ctx.portapapeles;
      const pegarBtn = el('button', { className: 'cms-btn cms-btn--ghost cms-btn--full', type: 'button' }, `⧉ Pegar "${pp.label}" después de este`);
      pegarBtn.addEventListener('click', () => { if (ctx.pegarEn(sec.dominio!, index + 1)) mostrarItem(ctx, sec, items[index + 1]?.clave ?? clave); });
      cuerpos.push(pegarBtn);
    }
  }
  ctx.modal.replaceChildren(crearHeaderModal(ctx, tituloDeItem(campos, item.data), subtitulo, acciones), ...cuerpos);
  ctx.overlay.hidden = false;
}

export function seleccionar(ctx: EditorContexto, dominio: string | undefined, clave: string | undefined) {
  if (!dominio) return;
  const sec = ctx.dominioIndex.get(dominio);
  if (!sec) return;
  if (sec.tipo === 'placeholder') return mostrarPlaceholder(ctx, sec);
  if (sec.tipo === 'single' || (sec.tipo === 'lista' && clave && sec.bloqueado)) {
    // lista bloqueada: ir directo a item
    if (sec.tipo === 'lista' && clave) return mostrarItem(ctx, sec, clave);
    return mostrarSingle(ctx, sec);
  }
  if (sec.tipo === 'lista' && !clave) return mostrarLista(ctx, sec);
  if (sec.tipo === 'lista' && clave) return mostrarItem(ctx, sec, clave);
  // single con clave (no debería pasar) -> single
  return mostrarSingle(ctx, sec);
}