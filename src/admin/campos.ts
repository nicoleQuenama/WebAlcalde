/**
 * Metadata de campos para el editor CMS (beta). Solo describe FORMA (qué
 * campos tiene cada tipo de bloque y cómo mostrarlos) — los VALORES actuales
 * se calculan en `src/pages/admin/[secret].astro` a partir del contenido real
 * de cada página (mismos getters/constantes que usan index/gestion/sobre) más
 * los overrides del store en memoria.
 */

export type TipoCampo = 'text' | 'textarea' | 'url' | 'imagen' | 'select' | 'obras';

export interface FieldSpec {
  name: string;
  label: string;
  type: TipoCampo;
  options?: string[];
}

export type TipoSeccion = 'single' | 'lista' | 'placeholder';

export interface SeccionConfig {
  /** Clave de la sección "macro" dentro del layout de la página (orden top-level). */
  key: string;
  titulo: string;
  tipo: TipoSeccion;
  /** Dominio del store (`home_hero`, `proyecto`, etc.) — no aplica a placeholders. */
  dominio?: string;
  campos?: FieldSpec[];
  /** Si es true: solo edición de texto, sin agregar/quitar/reordenar ítems (protege mecánicas que dependen de la posición/cantidad, ej. el libro). */
  bloqueado?: boolean;
  notaPlaceholder?: string;
}

export interface PaginaConfig {
  pagina: 'inicio' | 'gestion' | 'sobre';
  titulo: string;
  ruta: string;
  layoutDominio: string;
  secciones: SeccionConfig[];
}

const CAMPOS_PROYECTO: FieldSpec[] = [
  { name: 'titulo', label: 'Título', type: 'text' },
  { name: 'categoria', label: 'Categoría', type: 'text' },
  { name: 'descripcion', label: 'Descripción', type: 'textarea' },
  {
    name: 'estado',
    label: 'Estado',
    type: 'select',
    options: ['En ejecución', 'Concluido', 'En diseño'],
  },
  { name: 'imagen', label: 'Imagen', type: 'imagen' },
];

const CAMPOS_CAPITULO: FieldSpec[] = [
  { name: 'eyebrow', label: 'Etiqueta (eyebrow)', type: 'text' },
  { name: 'titulo', label: 'Título', type: 'text' },
  { name: 'bajada', label: 'Bajada', type: 'textarea' },
];

const CAMPOS_ERA: FieldSpec[] = [
  { name: 'eyebrow', label: 'Etiqueta (eyebrow)', type: 'text' },
  { name: 'titulo', label: 'Título', type: 'text' },
  { name: 'bajada', label: 'Bajada', type: 'textarea' },
];

const CAMPOS_SECCION: FieldSpec[] = [
  { name: 'eraId', label: 'Era a la que pertenece', type: 'text' },
  { name: 'titulo', label: 'Título', type: 'text' },
  { name: 'bajada', label: 'Bajada', type: 'textarea' },
  { name: 'imagen', label: 'Imagen', type: 'imagen' },
  { name: 'obras', label: 'Obras de esta sección', type: 'obras' },
];

const CAMPOS_INSTITUTIONAL: FieldSpec[] = [
  { name: 'eyebrow', label: 'Etiqueta (eyebrow)', type: 'text' },
  { name: 'title', label: 'Título', type: 'text' },
  { name: 'body', label: 'Texto', type: 'textarea' },
];

export const PAGINAS: PaginaConfig[] = [
  {
    pagina: 'inicio',
    titulo: 'Inicio',
    ruta: '/',
    layoutDominio: 'home_layout',
    secciones: [
      {
        key: 'hero',
        titulo: 'Hero',
        tipo: 'single',
        dominio: 'home_hero',
        campos: [
          { name: 'eyebrow', label: 'Texto superior', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
        ],
      },
      {
        key: 'biografia',
        titulo: 'Biografía',
        tipo: 'single',
        dominio: 'home_biografia',
        campos: [
          { name: 'eyebrow', label: 'Etiqueta', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'parrafo', label: 'Párrafo', type: 'textarea' },
          { name: 'cta1Label', label: 'Botón 1 — texto', type: 'text' },
          { name: 'cta1Href', label: 'Botón 1 — enlace', type: 'url' },
          { name: 'cta2Label', label: 'Botón 2 — texto', type: 'text' },
          { name: 'cta2Href', label: 'Botón 2 — enlace', type: 'url' },
        ],
      },
      {
        key: 'antes_despues',
        titulo: 'Antes y después',
        tipo: 'single',
        dominio: 'home_antes_despues',
        campos: [
          { name: 'kicker', label: 'Etiqueta', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'parrafo', label: 'Párrafo', type: 'textarea' },
        ],
      },
      {
        key: 'libro',
        titulo: 'Libro digital',
        tipo: 'single',
        dominio: 'flipbook_meta',
        campos: [
          { name: 'kicker', label: 'Etiqueta de la sección', type: 'text' },
          { name: 'parrafo', label: 'Párrafo de la sección', type: 'textarea' },
          { name: 'title', label: 'Título de la tarjeta cerrada', type: 'text' },
          { name: 'subtitle', label: 'Subtítulo de la tarjeta cerrada', type: 'text' },
          { name: 'ctaLabel', label: 'Texto del botón', type: 'text' },
          { name: 'coverImage', label: 'Portada', type: 'imagen' },
          { name: 'coverBadge', label: 'Portada — etiqueta', type: 'text' },
          { name: 'coverTitle', label: 'Portada — título', type: 'textarea' },
          { name: 'coverSubtitle', label: 'Portada — subtítulo', type: 'text' },
          { name: 'coverLabel3D', label: 'Portada 3D — título', type: 'textarea' },
          { name: 'backTitle', label: 'Contraportada — título', type: 'text' },
          { name: 'backText', label: 'Contraportada — texto', type: 'textarea' },
          { name: 'antesDespuesCaption', label: 'Pie de foto antes/después', type: 'textarea' },
        ],
      },
    ],
  },
  {
    pagina: 'gestion',
    titulo: 'Gestión',
    ruta: '/gestion',
    layoutDominio: 'gestion_layout',
    secciones: [
      {
        key: 'hero',
        titulo: 'Hero de gestión',
        tipo: 'single',
        dominio: 'gestion_hero',
        campos: [
          { name: 'kicker', label: 'Etiqueta', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'bajada', label: 'Bajada', type: 'textarea' },
          { name: 'periodo', label: 'Período', type: 'text' },
        ],
      },
      {
        key: 'capitulos',
        titulo: 'Capítulos de apertura',
        tipo: 'lista',
        dominio: 'capitulo',
        campos: CAMPOS_CAPITULO,
        bloqueado: true,
      },
      {
        key: 'eras',
        titulo: 'Eras de obras',
        tipo: 'lista',
        dominio: 'era',
        campos: CAMPOS_ERA,
      },
      {
        key: 'secciones',
        titulo: 'Secciones de las eras (con sus obras)',
        tipo: 'lista',
        dominio: 'seccion',
        campos: CAMPOS_SECCION,
      },
      {
        key: 'proyectos_titulo',
        titulo: 'Encabezado de proyectos',
        tipo: 'single',
        dominio: 'proyectos_titulo',
        campos: [
          { name: 'kicker', label: 'Etiqueta', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'bajada', label: 'Bajada', type: 'textarea' },
        ],
      },
      {
        key: 'proyectos',
        titulo: 'Tarjetas de proyecto',
        tipo: 'lista',
        dominio: 'proyecto',
        campos: CAMPOS_PROYECTO,
      },
    ],
  },
  {
    pagina: 'sobre',
    titulo: 'Sobre',
    ruta: '/sobre',
    layoutDominio: 'sobre_layout',
    secciones: [
      {
        key: 'hero',
        titulo: 'Hero',
        tipo: 'single',
        dominio: 'sobre_hero',
        campos: [
          { name: 'eyebrow', label: 'Texto superior', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'quote', label: 'Frase', type: 'text' },
        ],
      },
      {
        key: 'biografia',
        titulo: 'Biografía',
        tipo: 'single',
        dominio: 'sobre_biografia',
        campos: [
          { name: 'eyebrow', label: 'Etiqueta', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'parrafo', label: 'Párrafo', type: 'textarea' },
          { name: 'ctaLabel', label: 'Botón — texto', type: 'text' },
          { name: 'ctaHref', label: 'Botón — enlace', type: 'url' },
        ],
      },
      {
        key: 'institutional',
        titulo: 'Misión y visión',
        tipo: 'lista',
        dominio: 'sobre_institutional',
        campos: CAMPOS_INSTITUTIONAL,
        bloqueado: true,
      },
      {
        key: 'timeline',
        titulo: 'Línea de tiempo',
        tipo: 'placeholder',
        notaPlaceholder: 'Interactiva (scroll 3D) — no editable en esta beta.',
      },
    ],
  },
];

export function paginaPorId(id: string): PaginaConfig | undefined {
  return PAGINAS.find((p) => p.pagina === id);
}
