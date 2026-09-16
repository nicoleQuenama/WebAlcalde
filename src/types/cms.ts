import type { FieldSpec, PaginaConfig, SeccionConfig } from '@lib/cms/campos';

export interface SeccionData extends SeccionConfig {
  valor?: Record<string, unknown>;
  items?: { clave: string; data: Record<string, unknown> }[];
}

export interface DatosPagina {
  pagina: PaginaConfig;
  ordenLayout: string[];
  secciones: SeccionData[];
}

export interface InitData extends DatosPagina {
  secreto: string;
  paginas: { pagina: string; titulo: string; ruta: string }[];
}

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
