import type { DatosPagina } from '@cms/sitio';

export type { SeccionData, DatosPagina } from '@cms/sitio';

export type Obra = { nombre?: string; anio?: string; detalle?: string; video?: boolean };

export interface EstadoPagina {
  datos: DatosPagina;
  originales: Map<string, Set<string>>;
}

export interface Portapapeles {
  dominio: string;
  data: Record<string, unknown>;
  label: string;
  tipo: 'item' | 'seccion';
  seccionKey?: string;
  seccionTitulo?: string;
}

/**
 * Payload del editor: `DatosPagina` de la página inicial + datos de sesión
 * (secreto) y el índice de páginas editables con su ruta real (para saber a
 * qué página navegó el iframe dentro de la vista previa).
 */
export interface InitData extends DatosPagina {
  secreto: string;
  paginas: Array<{ pagina: string; titulo: string; ruta: string }>;
}