import type { EditorContexto } from '@type/cms/editorContext';
import type { SeccionData } from '@type/cms';

/**
 * Override de medios genérico (sin dominio): cuando en la vista previa se
 * cambia una imagen o video que NO pertenece a un bloque `data-cms-*`, la
 * sustitución se guarda en un dominio virtual `media_override` dentro del
 * estado de la página actual. Se persiste junto al resto al guardar.
 * Lógica extraída del handler de mensajes del editor (`previewMessages`).
 */

export const DOMINIO_MEDIA_OVERRIDE = 'media_override';

function crearSeccionOverride(): SeccionData {
  return {
    key: DOMINIO_MEDIA_OVERRIDE,
    titulo: 'Media overrides',
    tipo: 'lista',
    fuente: { tipo: 'lista', coleccion: DOMINIO_MEDIA_OVERRIDE, porDefecto: async () => [] },
    dominio: DOMINIO_MEDIA_OVERRIDE,
    campos: [{ name: 'src', label: 'URL', type: 'imagen' }],
    items: [],
  };
}

/** Clave estable por origen: el override se re-aplica si se cambia la misma imagen. */
function claveDeOrigen(originalSrc: string): string {
  return `media_${btoa(originalSrc).slice(0, 32)}`;
}

/** Registra (o actualiza) la sustitución `original → src` en el estado. Devuelve false si no hay página activa. */
export function guardarOverrideMedia(ctx: EditorContexto, originalSrc: string, src: string): boolean {
  const estado = ctx.cache.get(ctx.paginaActual);
  if (!estado) return false;

  let secOverride = ctx.dominioIndex.get(DOMINIO_MEDIA_OVERRIDE);
  if (!secOverride) {
    secOverride = crearSeccionOverride();
    estado.datos.secciones.push(secOverride);
    ctx.dominioIndex.set(DOMINIO_MEDIA_OVERRIDE, secOverride);
  }

  const items = secOverride.items ?? (secOverride.items = []);
  const existente = items.find((i) => (i.data['original'] as string) === originalSrc);
  if (existente) existente.data['src'] = src;
  else items.push({ clave: claveDeOrigen(originalSrc), data: { original: originalSrc, src } });

  ctx.marcarSucio();
  return true;
}