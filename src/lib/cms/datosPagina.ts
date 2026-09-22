import { getCapitulos, getEras, getGestionHero, getNoticias, getNoticiasHero, getProyectos, getProyectosTitulo } from '@lib/db';
import { INSTITUTIONAL_CARDS } from '@constants/institutionalProfile/content';
import { efectivo, efectivoLista, efectivoOrden } from '@lib/cms/resolve';
import { paginaPorId, PAGINAS, type PaginaConfig, type SeccionConfig } from '@lib/cms/campos';
import {
  DEFAULT_HOME_HERO,
  DEFAULT_HOME_ANTES_DESPUES,
  DEFAULT_HOME_BIOGRAFIA,
  DEFAULT_FLIPBOOK_META,
  DEFAULT_SOBRE_HERO,
  DEFAULT_SOBRE_BIOGRAFIA,
  DEFAULT_HOME_LAYOUT,
  DEFAULT_GESTION_LAYOUT,
  DEFAULT_SOBRE_LAYOUT,
  DEFAULT_NOTICIAS_HERO,
  DEFAULT_NOTICIAS_LAYOUT,
} from '@lib/cms/defaults';

/**
 * Cómputo del contenido editable de una página (valores reales + overrides
 * del store) — usado tanto por `/admin/[secret]` (primer render) como por
 * `/api/admin/init/[pagina]` (cuando el admin navega DENTRO del iframe a
 * otra página del sitio y el editor necesita los campos de esa página nueva
 * sin recargar todo el shell del editor).
 */

export interface SeccionData extends SeccionConfig {
  valor?: Record<string, unknown>;
  items?: { clave: string; data: Record<string, unknown> }[];
}

export interface DatosPagina {
  pagina: PaginaConfig;
  ordenLayout: string[];
  secciones: SeccionData[];
}

export async function calcularDatosPagina(paginaId: string): Promise<DatosPagina | undefined> {
  const paginaConfig = paginaPorId(paginaId);
  if (!paginaConfig) return undefined;

  let ordenLayoutDefault: string[] = DEFAULT_HOME_LAYOUT;
  const secciones: SeccionData[] = [];

  if (paginaConfig.pagina === 'inicio') {
    ordenLayoutDefault = DEFAULT_HOME_LAYOUT;
    secciones.push(
      { ...paginaConfig.secciones[0], valor: efectivo('home_hero', 'principal', DEFAULT_HOME_HERO) },
      { ...paginaConfig.secciones[1], valor: efectivo('home_biografia', 'principal', DEFAULT_HOME_BIOGRAFIA) },
      { ...paginaConfig.secciones[2], valor: efectivo('home_antes_despues', 'principal', DEFAULT_HOME_ANTES_DESPUES) },
      { ...paginaConfig.secciones[3], valor: efectivo('flipbook_meta', 'principal', DEFAULT_FLIPBOOK_META) },
    );
  } else if (paginaConfig.pagina === 'gestion') {
    ordenLayoutDefault = DEFAULT_GESTION_LAYOUT;
    const erasCompletas = await getEras();
    const erasDefault = erasCompletas.map(({ secciones: _s, ...resto }) => resto);
    const seccionesDefault = erasCompletas.flatMap((era) => era.secciones.map((s) => ({ ...s, eraId: era.id })));
    const capitulosDefault = (await getCapitulos()).map((c) => ({ ...c }));

    secciones.push(
      { ...paginaConfig.secciones[0], valor: efectivo('gestion_hero', 'principal', await getGestionHero()) },
      {
        ...paginaConfig.secciones[1],
        items: efectivoLista(
          'capitulo',
          capitulosDefault.map((c) => ({ ...c })),
        ).map((c) => ({ clave: c.id as string, data: c })),
      },
      {
        ...paginaConfig.secciones[2],
        items: efectivoLista('era', erasDefault).map((e) => ({ clave: e.id as string, data: e })),
      },
      {
        ...paginaConfig.secciones[3],
        items: efectivoLista('seccion', seccionesDefault).map((s) => ({ clave: s.id as string, data: s })),
      },
      { ...paginaConfig.secciones[4], valor: efectivo('proyectos_titulo', 'principal', await getProyectosTitulo()) },
      {
        ...paginaConfig.secciones[5],
        items: efectivoLista(
          'proyecto',
          (await getProyectos()).map((p, i) => ({ ...p, id: String(i) })),
        ).map((p) => ({ clave: p.id as string, data: p })),
      },
    );
  } else if (paginaConfig.pagina === 'noticias') {
    ordenLayoutDefault = DEFAULT_NOTICIAS_LAYOUT;
    const heroDefault = (await getNoticiasHero()) ?? DEFAULT_NOTICIAS_HERO;
    const noticiasDefault = (await getNoticias()).map((n) => ({ ...n, id: String(n.id) }));
    secciones.push(
      { ...paginaConfig.secciones[0], valor: efectivo('noticias_hero', 'principal', heroDefault) },
      {
        ...paginaConfig.secciones[1],
        items: efectivoLista('noticias', noticiasDefault).map((n) => ({
          clave: String(n.id),
          data: n,
        })),
      },
    );
  } else {
    ordenLayoutDefault = DEFAULT_SOBRE_LAYOUT;
    const presentacion = (await getCapitulos()).find((c) => c.id === 'presentacion');
    secciones.push(
      { ...paginaConfig.secciones[0], valor: efectivo('sobre_hero', 'principal', DEFAULT_SOBRE_HERO) },
      {
        ...paginaConfig.secciones[1],
        valor: efectivo('sobre_biografia', 'principal', {
          ...DEFAULT_SOBRE_BIOGRAFIA,
          parrafo: presentacion?.bajada ?? '',
        }),
      },
      {
        ...paginaConfig.secciones[2],
        items: efectivoLista(
          'sobre_institutional',
          INSTITUTIONAL_CARDS.map((c) => ({ ...c })),
        ).map((c) => ({ clave: c.id as string, data: c })),
      },
      paginaConfig.secciones[3],
    );
  }

  const ordenLayout = efectivoOrden(paginaConfig.layoutDominio, ordenLayoutDefault);
  return { pagina: paginaConfig, ordenLayout, secciones };
}

/** Todas las páginas editables, con su ruta real — para que el editor detecte a qué página navegó el iframe. */
export const PAGINAS_CON_RUTA = PAGINAS.map((p) => ({ pagina: p.pagina, titulo: p.titulo, ruta: p.ruta }));
