export {
  COMPARADOR_ANCHO,
  getHeroImageSrc,
  getBookImageSrc,
  getCarouselImageSrc,
  getOptimizedImageSrc,
  getExactSizeImageSrc,
  getComparadorImageSrc,
} from '@lib/imageOptimize';

export {
  getCapitulos,
  getEras,
  getGestionHero,
  getProyectosTitulo,
  getProyectos,
  getHistoriaIntro,
  getFiltrosHito,
  getHitos,
  type Hito,
  type Capitulo,
  type EraTemario,
  type SeccionTemario,
} from '@lib/db';

export { ajusteImagen } from '@lib/ajusteImagen';

export { buildLibroToc } from '@lib/flipBook';

export { efectivo, efectivoLista, efectivoOrden, getTemarioEfectivo } from '@lib/cms/resolve';