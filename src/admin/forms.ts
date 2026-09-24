import type { FieldSpec, TipoCampo } from '@cms/sitio';
import { el } from './helpers';
import { crearCampoObras } from './campoObras';

/**
 * Formularios de campos para el editor CMS: un mapa elige el creador según el
 * `TipoCampo` (`text/url`, `textarea`, `select`, `imagen`, `obras`) y le pasa
 * la data encapsulada en un `ContextoCampo`. Capa pura de UI — no conoce el
 * estado del editor.
 */

/** Data mínima que necesita un campo para construirse y persistir sus edits. */
export interface ContextoCampo {
  /** Valor actual del campo dentro de la data (leído al abrir el formulario). */
  valor: unknown;
  /** Escribe el valor en la data y notifica al editor (marcarSucio + sync preview). */
  fijarValor: (valor: unknown) => void;
  /** Notifica un cambio sin escribir la data (campos con lógica propia). */
  onCambio: () => void;
}

type CreadorCampo = (campo: FieldSpec, ctx: ContextoCampo) => HTMLElement;

function crearContextoCampo(campo: FieldSpec, data: Record<string, unknown>, onCambio: () => void): ContextoCampo {
  return {
    valor: data[campo.name],
    fijarValor(valor: unknown) {
      data[campo.name] = valor;
      onCambio();
    },
    onCambio,
  };
}

function textoDe(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

function crearCampoTexto(campo: FieldSpec, ctx: ContextoCampo): HTMLElement {
  const esUrl = campo.type === 'url';
  const input = el('input', {
    className: 'cms-campo__input',
    type: esUrl ? 'url' : 'text',
    placeholder: esUrl ? 'https://…' : '',
    value: textoDe(ctx.valor),
  });
  input.addEventListener('input', () => ctx.fijarValor(input.value));
  return el('div', { className: 'cms-campo' }, el('label', { className: 'cms-campo__label' }, campo.label), input);
}

function crearCampoTextarea(campo: FieldSpec, ctx: ContextoCampo): HTMLElement {
  const ta = el('textarea', { className: 'cms-campo__input', value: textoDe(ctx.valor), rows: 3 });
  ta.addEventListener('input', () => ctx.fijarValor(ta.value));
  return el('div', { className: 'cms-campo' }, el('label', { className: 'cms-campo__label' }, campo.label), ta);
}

function crearCampoSelect(campo: FieldSpec, ctx: ContextoCampo): HTMLElement {
  const opciones = (campo.options ?? []).map((o) => el('option', { value: o, selected: o === ctx.valor }, o));
  const sel = el('select', { className: 'cms-campo__input' }, ...opciones);
  sel.addEventListener('change', () => ctx.fijarValor(sel.value));
  return el('div', { className: 'cms-campo' }, el('label', { className: 'cms-campo__label' }, campo.label), sel);
}

function crearCampoImagen(campo: FieldSpec, ctx: ContextoCampo): HTMLElement {
  const input = el('input', { className: 'cms-campo__input', type: 'url', placeholder: 'https://…', value: textoDe(ctx.valor) });
  const preview = el('img', { className: 'cms-campo__preview', src: textoDe(ctx.valor), alt: '', loading: 'lazy' });
  preview.hidden = !ctx.valor;
  preview.addEventListener('error', () => (preview.hidden = true));
  preview.addEventListener('load', () => (preview.hidden = false));
  input.addEventListener('input', () => {
    ctx.fijarValor(input.value);
    preview.hidden = !input.value;
    preview.src = input.value;
  });
  return el('div', { className: 'cms-campo' }, el('label', { className: 'cms-campo__label' }, campo.label), input, preview);
}

/** Mapa tipo → creador: agregar un tipo de campo nuevo es sumar una entrada acá. */
const CREADORES: Record<TipoCampo, CreadorCampo> = {
  text: crearCampoTexto,
  url: crearCampoTexto,
  textarea: crearCampoTextarea,
  select: crearCampoSelect,
  imagen: crearCampoImagen,
  obras: crearCampoObras,
};

function crearCampo(campo: FieldSpec, ctx: ContextoCampo): HTMLElement {
  return CREADORES[campo.type](campo, ctx);
}

export function crearFormulario(campos: FieldSpec[], data: Record<string, unknown>, onCambio: () => void): HTMLElement {
  return el('div', { className: 'cms-form' }, ...campos.map((c) => crearCampo(c, crearContextoCampo(c, data, onCambio))));
}