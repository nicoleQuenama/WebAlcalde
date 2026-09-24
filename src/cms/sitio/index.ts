/** Content mapping del sitio: qué páginas hay, qué colecciones tocan y sus defaults. */
export {
  PAGINAS,
  paginaPorId,
  crearContextoSitio,
  type ContextoSitio,
  type FuenteSeccion,
  type PaginaConfig,
  type PaginaId,
  type SeccionConfig,
  type FieldSpec,
  type TipoCampo,
  type TipoSeccion,
} from './campos';
export { calcularDatosPagina, PAGINAS_CON_RUTA, type DatosPagina, type SeccionData } from './datosPagina';
export { getTemarioEfectivo } from './temario';
export {
  DEFAULT_HOME_HERO,
  DEFAULT_HOME_ANTES_DESPUES,
  DEFAULT_HOME_BIOGRAFIA,
  DEFAULT_FLIPBOOK_META,
  DEFAULT_SOBRE_HERO,
  DEFAULT_SOBRE_BIOGRAFIA,
  DEFAULT_NOTICIAS_HERO,
  DEFAULT_HOME_LAYOUT,
  DEFAULT_GESTION_LAYOUT,
  DEFAULT_SOBRE_LAYOUT,
  DEFAULT_NOTICIAS_LAYOUT,
} from './defaults';