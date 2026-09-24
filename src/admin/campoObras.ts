import type { FieldSpec } from '@cms/sitio';
import type { Obra } from '@type/cms';
import { activarDragReorder, clonarData, el } from './helpers';
import type { ContextoCampo } from './forms';

/**
 * Campo repetidor de "obras" del editor CMS: construye cada fila
 * (`crearFilaObra`), las acciones de mutación (`editar/quitar/duplicar/
 * reordenar/agregar`) y reordena por drag con `activarDragReorder`.
 */

interface AccionesObras {
  editar: (indice: number, cambios: Partial<Obra>) => void;
  quitar: (indice: number) => void;
  duplicar: (indice: number) => void;
  reordenar: (desde: number, hasta: number) => void;
  agregar: () => void;
}

function obrasExistentes(valor: unknown): Obra[] {
  return Array.isArray(valor) ? (valor as Obra[]) : [];
}

function crearAccionesObras(obras: Obra[], ctx: ContextoCampo, pintar: () => void): AccionesObras {
  const persistir = () => ctx.fijarValor(obras);
  return {
    editar(indice, cambios) {
      obras[indice] = { ...obras[indice], ...cambios };
      persistir();
    },
    quitar(indice) {
      obras.splice(indice, 1);
      persistir();
      pintar();
    },
    duplicar(indice) {
      obras.splice(indice + 1, 0, clonarData(obras[indice] as unknown as Record<string, unknown>) as unknown as Obra);
      persistir();
      pintar();
    },
    reordenar(desde, hasta) {
      const [mov] = obras.splice(desde, 1);
      obras.splice(hasta, 0, mov);
      persistir();
      pintar();
    },
    agregar() {
      obras.push({ nombre: '' });
      persistir();
      pintar();
    },
  };
}

function crearFilaObra(obra: Obra, indice: number, acciones: AccionesObras): HTMLElement {
  const fila = el('div', { className: 'cms-obra-fila' });
  fila.draggable = true;
  fila.dataset.dragIndex = String(indice);

  const handle = el('span', {}, '⋮⋮');
  handle.style.cursor = 'grab';
  handle.style.color = '#6b5f87';
  handle.title = 'Arrastrar';

  const nombre = el('input', { className: 'cms-obra__nombre', type: 'text', placeholder: 'Nombre de la obra', value: obra.nombre ?? '' });
  nombre.addEventListener('input', () => acciones.editar(indice, { nombre: nombre.value }));

  const anio = el('input', { className: 'cms-obra__anio', type: 'text', placeholder: 'Año', value: obra.anio ?? '' });
  anio.addEventListener('input', () => acciones.editar(indice, { anio: anio.value }));

  const detalle = el('input', { className: 'cms-obra__detalle', type: 'text', placeholder: 'Detalle (opcional)', value: obra.detalle ?? '' });
  detalle.addEventListener('input', () => acciones.editar(indice, { detalle: detalle.value }));

  const video = el('input', { type: 'checkbox', checked: !!obra.video });
  video.addEventListener('change', () => acciones.editar(indice, { video: video.checked }));
  const videoLabel = el('label', { className: 'cms-obra__video' }, video, ' Video');

  const quitar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Quitar obra' }, '✕');
  quitar.addEventListener('click', () => acciones.quitar(indice));

  const copiar = el('button', { className: 'cms-btn cms-btn--icono', type: 'button', title: 'Duplicar obra' }, '⧉');
  copiar.addEventListener('click', () => acciones.duplicar(indice));

  fila.append(handle, nombre, anio, detalle, videoLabel, copiar, quitar);
  return fila;
}

export function crearCampoObras(campo: FieldSpec, ctx: ContextoCampo): HTMLElement {
  const obras = obrasExistentes(ctx.valor);
  const lista = el('div', { className: 'cms-obras' });

  function pintar() {
    lista.replaceChildren();
    obras.forEach((obra, indice) => lista.append(crearFilaObra(obra, indice, acciones)));
  }

  const acciones = crearAccionesObras(obras, ctx, pintar);
  activarDragReorder(lista, (desde, hasta) => acciones.reordenar(desde, hasta));
  pintar();

  const agregar = el('button', { className: 'cms-btn cms-btn--ghost', type: 'button' }, '+ Agregar obra');
  agregar.addEventListener('click', () => acciones.agregar());

  return el('div', { className: 'cms-campo cms-campo--obras' }, el('label', { className: 'cms-campo__label' }, campo.label), lista, agregar);
}