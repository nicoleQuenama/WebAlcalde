import type { DatosPagina } from '@lib/cms/datosPagina';

export type { SeccionData, DatosPagina } from '@lib/cms/datosPagina';

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