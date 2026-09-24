/**
 * Metadata declarativa de campos para el editor CMS y el resolver genérico de
 * páginas. Cada `SeccionConfig` declara su FUENTE de datos (colección + default
 * computado por contexto) y un único `resolverSeccion()` (en `datosPagina.ts`)
 * lo materializa para todas las páginas. Sin strings de dominios dispersos:
 * cada colección solo aparece en su declaración.
 */

import {
  getCapitulos,
  getEras,
  getGestionHero,
  getNoticias,
  getNoticiasHero,
  getProyectos,
  getProyectosTitulo,
  type Capitulo,
  type EraTemario,
  type GestionHero,
  type NoticiaFeed,
  type NoticiasHero,
  type Proyecto,
  type ProyectosTitulo,
} from '@lib/db';
import { INSTITUTIONAL_CARDS } from '@constants/institutionalProfile/content';
import {
  DEFAULT_HOME_ANTES_DESPUES,
  DEFAULT_HOME_BIOGRAFIA,
  DEFAULT_HOME_HERO,
  DEFAULT_FLIPBOOK_META,
  DEFAULT_GESTION_LAYOUT,
  DEFAULT_HOME_LAYOUT,
  DEFAULT_NOTICIAS_HERO,
  DEFAULT_NOTICIAS_LAYOUT,
  DEFAULT_SOBRE_BIOGRAFIA,
  DEFAULT_SOBRE_HERO,
  DEFAULT_SOBRE_LAYOUT,
} from './defaults';

export type TipoCampo = 'text' | 'textarea' | 'url' | 'imagen' | 'select' | 'obras';

export interface FieldSpec {
  name: string;
  label: string;
  type: TipoCampo;
  options?: string[];
}

export type TipoSeccion = 'single' | 'lista' | 'placeholder';

/** Puente único del resolver a los getters del dominio (de `src/lib/db`). */
export interface ContextoSitio {
  getCapitulos(): Promise<Capitulo[]>;
  getEras(): Promise<EraTemario[]>;
  getGestionHero(): Promise<GestionHero>;
  getProyectosTitulo(): Promise<ProyectosTitulo>;
  getProyectos(): Promise<Proyecto[]>;
  getNoticiasHero(): Promise<NoticiasHero | undefined>;
  getNoticias(): Promise<NoticiaFeed[]>;
}

/** Declara de dónde sale el contenido editable de una sección. */
export type FuenteSeccion =
  | {
      tipo: 'fila';
      coleccion: string;
      clave: string;
      porDefecto: (ctx: ContextoSitio) => Promise<Record<string, unknown>>;
    }
  | {
      tipo: 'lista';
      coleccion: string;
      porDefecto: (ctx: ContextoSitio) => Promise<Record<string, unknown>[]>;
    }
  | { tipo: 'layoutEmulado' };

export interface SeccionConfig {
  /** Clave de la sección "macro" dentro del layout de la página (orden top-level). */
  key: string;
  titulo: string;
  tipo: TipoSeccion;
  fuente: FuenteSeccion;
  campos?: FieldSpec[];
  /** Si es true: solo edición de texto, sin agregar/quitar/reordenar ítems (protege mecánicas que dependen de la posición/cantidad, ej. el libro). */
  bloqueado?: boolean;
  notaPlaceholder?: string;
}

export type PaginaId = 'inicio' | 'gestion' | 'sobre' | 'noticias';

export interface PaginaConfig {
  pagina: PaginaId;
  titulo: string;
  ruta: string;
  layoutDominio: string;
  layoutPorDefecto: string[];
  secciones: SeccionConfig[];
}

/** Adapta un objeto tipado del dominio al mapa opaco que espera el resolver. */
function asMap<T extends object>(x: T): Record<string, unknown> {
  return x as unknown as Record<string, unknown>;
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

const CAMPOS_NOTICIA: FieldSpec[] = [
  { name: 'label', label: 'Etiqueta corta (cards del hero)', type: 'text' },
  { name: 'titulo', label: 'Título', type: 'text' },
  { name: 'categoria', label: 'Categoría', type: 'text' },
  { name: 'fecha', label: 'Fecha (YYYY-MM-DD)', type: 'text' },
  { name: 'resumen', label: 'Resumen', type: 'textarea' },
  { name: 'src', label: 'Imagen', type: 'imagen' },
];

export const PAGINAS: PaginaConfig[] = [
  {
    pagina: 'inicio',
    titulo: 'Inicio',
    ruta: '/',
    layoutDominio: 'home_layout',
    layoutPorDefecto: DEFAULT_HOME_LAYOUT,
    secciones: [
      {
        key: 'hero',
        titulo: 'Hero',
        tipo: 'single',
        fuente: {
          tipo: 'fila',
          coleccion: 'home_hero',
          clave: 'principal',
          porDefecto: async () => DEFAULT_HOME_HERO,
        },
        campos: [
          { name: 'eyebrow', label: 'Texto superior', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
        ],
      },
      {
        key: 'biografia',
        titulo: 'Biografía',
        tipo: 'single',
        fuente: {
          tipo: 'fila',
          coleccion: 'home_biografia',
          clave: 'principal',
          porDefecto: async () => DEFAULT_HOME_BIOGRAFIA,
        },
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
        fuente: {
          tipo: 'fila',
          coleccion: 'home_antes_despues',
          clave: 'principal',
          porDefecto: async () => DEFAULT_HOME_ANTES_DESPUES,
        },
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
        fuente: {
          tipo: 'fila',
          coleccion: 'flipbook_meta',
          clave: 'principal',
          porDefecto: async () => DEFAULT_FLIPBOOK_META,
        },
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
    layoutPorDefecto: DEFAULT_GESTION_LAYOUT,
    secciones: [
      {
        key: 'hero',
        titulo: 'Hero de gestión',
        tipo: 'single',
        fuente: {
          tipo: 'fila',
          coleccion: 'gestion_hero',
          clave: 'principal',
          porDefecto: async (ctx) => asMap(await ctx.getGestionHero()),
        },
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
        fuente: {
          tipo: 'lista',
          coleccion: 'capitulo',
          porDefecto: async (ctx) => (await ctx.getCapitulos()).map((c) => asMap({ ...c })),
        },
        campos: CAMPOS_CAPITULO,
        bloqueado: true,
      },
      {
        key: 'eras',
        titulo: 'Eras de obras',
        tipo: 'lista',
        fuente: {
          tipo: 'lista',
          coleccion: 'era',
          porDefecto: async (ctx) => {
            const eras = await ctx.getEras();
            return eras.map(({ secciones: _s, ...resto }) => asMap(resto));
          },
        },
        campos: CAMPOS_ERA,
      },
      {
        key: 'secciones',
        titulo: 'Secciones de las eras (con sus obras)',
        tipo: 'lista',
        fuente: {
          tipo: 'lista',
          coleccion: 'seccion',
          porDefecto: async (ctx) => {
            const eras = await ctx.getEras();
            return eras.flatMap((era) => era.secciones.map((s) => asMap({ ...s, eraId: era.id })));
          },
        },
        campos: CAMPOS_SECCION,
      },
      {
        key: 'proyectos_titulo',
        titulo: 'Encabezado de proyectos',
        tipo: 'single',
        fuente: {
          tipo: 'fila',
          coleccion: 'proyectos_titulo',
          clave: 'principal',
          porDefecto: async (ctx) => asMap(await ctx.getProyectosTitulo()),
        },
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
        fuente: {
          tipo: 'lista',
          coleccion: 'proyecto',
          porDefecto: async (ctx) =>
            (await ctx.getProyectos()).map((p, i) => asMap({ ...p, id: String(i) })),
        },
        campos: CAMPOS_PROYECTO,
      },
    ],
  },
  {
    pagina: 'sobre',
    titulo: 'Sobre',
    ruta: '/about',
    layoutDominio: 'sobre_layout',
    layoutPorDefecto: DEFAULT_SOBRE_LAYOUT,
    secciones: [
      {
        key: 'hero',
        titulo: 'Hero',
        tipo: 'single',
        fuente: {
          tipo: 'fila',
          coleccion: 'sobre_hero',
          clave: 'principal',
          porDefecto: async () => DEFAULT_SOBRE_HERO,
        },
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
        fuente: {
          tipo: 'fila',
          coleccion: 'sobre_biografia',
          clave: 'principal',
          porDefecto: async (ctx) => {
            const presentacion = (await ctx.getCapitulos()).find((c) => c.id === 'presentacion');
            return asMap({ ...DEFAULT_SOBRE_BIOGRAFIA, parrafo: presentacion?.bajada ?? '' });
          },
        },
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
        fuente: {
          tipo: 'lista',
          coleccion: 'sobre_institutional',
          porDefecto: async () => INSTITUTIONAL_CARDS.map((c) => asMap({ ...c })),
        },
        campos: CAMPOS_INSTITUTIONAL,
        bloqueado: true,
      },
      {
        key: 'timeline',
        titulo: 'Línea de tiempo',
        tipo: 'placeholder',
        fuente: { tipo: 'layoutEmulado' },
        notaPlaceholder: 'Interactiva (scroll 3D) — no editable en esta beta.',
      },
    ],
  },
  {
    pagina: 'noticias',
    titulo: 'Noticias',
    ruta: '/noticias',
    layoutDominio: 'noticias_layout',
    layoutPorDefecto: DEFAULT_NOTICIAS_LAYOUT,
    secciones: [
      {
        key: 'hero',
        titulo: 'Hero de noticias',
        tipo: 'single',
        fuente: {
          tipo: 'fila',
          coleccion: 'noticias_hero',
          clave: 'principal',
          porDefecto: async (ctx) => asMap((await ctx.getNoticiasHero()) ?? DEFAULT_NOTICIAS_HERO),
        },
        campos: [
          { name: 'kicker', label: 'Etiqueta', type: 'text' },
          { name: 'titulo', label: 'Título', type: 'text' },
          { name: 'bajada', label: 'Bajada', type: 'textarea' },
        ],
      },
      {
        key: 'lista_noticias',
        titulo: 'Lista de noticias',
        tipo: 'lista',
        fuente: {
          tipo: 'lista',
          coleccion: 'noticias',
          porDefecto: async (ctx) => (await ctx.getNoticias()).map((n) => asMap({ ...n, id: String(n.id) })),
        },
        campos: CAMPOS_NOTICIA,
      },
    ],
  },
];

export function paginaPorId(id: string): PaginaConfig | undefined {
  return PAGINAS.find((p) => p.pagina === id);
}

/** Cablea `ContextoSitio` con los getters reales del dominio (`src/lib/db`). */
export function crearContextoSitio(): ContextoSitio {
  return {
    getCapitulos: () => getCapitulos(),
    getEras: () => getEras(),
    getGestionHero: () => getGestionHero(),
    getProyectosTitulo: () => getProyectosTitulo(),
    getProyectos: () => getProyectos(),
    getNoticiasHero: () => getNoticiasHero(),
    getNoticias: () => getNoticias(),
  };
}