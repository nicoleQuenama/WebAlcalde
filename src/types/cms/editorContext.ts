import type { FieldSpec } from '@cms/sitio';
import type { EstadoPagina, Portapapeles, SeccionData } from '../cms';

/**
 * Estado mutable compartido por los módulos del editor CMS (capa `src/admin`).
 * El orquestador (`montarEditor`) crea el contexto, inicializa el estado y
 * engancha las funciones de cada módulo; toda llamada que cruza de módulo a
 * módulo pasa por acá para mantener el grafo de imports sin ciclos.
 */
export interface EditorContexto {
  // ---- estado mutable ----
  cache: Map<string, EstadoPagina>;
  paginaActual: string;
  portapapeles: Portapapeles | null;
  dominioIndex: Map<string, SeccionData>;
  hayCambiosSinGuardar: boolean;
  secreto: string;

  // ---- DOM del shell del editor ----
  iframe: HTMLIFrameElement;
  estadoEl: HTMLElement;
  overlay: HTMLElement;
  modal: HTMLElement;
  portapapelesEl: HTMLElement | null;

  // ---- operaciones expuestas por los módulos (evita imports circulares) ----
  marcarSucio: () => void;
  actualizarBarraPortapapeles: () => void;
  syncPortapapelesPreview: () => void;
  syncPreviewOrden: (dominioAfectado?: string) => void;
  syncPreviewMedia: (dominio: string, clave: string | undefined, campo: string, valor: string) => void;
  alEditarCampoInline: (dominio: string, clave: string | undefined, campo: string, valor: string) => void;
  copiarItem: (dominio: string, data: Record<string, unknown>, campos: FieldSpec[]) => void;
  copiarSeccion: (sec: SeccionData) => void;
  duplicarItem: (dominio: string, clave: string) => boolean;
  pegarEn: (dominio: string, indice: number) => boolean;
  pegarSeccion: (sec: SeccionData, pos: number) => boolean;
  pegarSeccionDespues: (targetKey: string) => boolean;
  duplicarSeccion: (sec: SeccionData) => boolean;
  cerrarModal: () => void;
  crearHeaderModal: (titulo: string, subtitulo: string | undefined, acciones: HTMLElement[]) => HTMLElement;
  mostrarEstructura: () => void;
  mostrarSingle: (sec: SeccionData) => void;
  mostrarPlaceholder: (sec: SeccionData) => void;
  mostrarLista: (sec: SeccionData) => void;
  mostrarItem: (sec: SeccionData, clave: string) => void;
  seleccionar: (dominio: string | undefined, clave: string | undefined) => void;
}