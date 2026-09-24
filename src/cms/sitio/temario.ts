import { getServicioCMS } from '@cms';
import type { Capitulo, EraTemario, SeccionTemario } from '@lib/db';
import { crearContextoSitio } from './campos';

/**
 * Temario efectivo del libro/gestión: capítulos de apertura + eras con sus
 * secciones, ya fusionado con lo guardado en el almacén CMS. Usado por `/`
 * y `/gestion` — misma colección, misma fusión.
 */
export async function getTemarioEfectivo(): Promise<{ capitulos: Capitulo[]; eras: EraTemario[] }> {
  const ctx = crearContextoSitio();
  const svc = getServicioCMS();

  const capitulos = await svc.efectivoLista('capitulo', await ctx.getCapitulos());

  const erasCompletas = await ctx.getEras();
  const erasBase = erasCompletas.map(({ secciones: _s, ...resto }) => resto);
  const seccionesBase: (SeccionTemario & { eraId: string })[] = erasCompletas.flatMap((era) =>
    era.secciones.map((s) => ({ ...s, eraId: era.id })),
  );

  const erasEfectivas = await svc.efectivoLista('era', erasBase);
  const seccionesEfectivas = await svc.efectivoLista('seccion', seccionesBase);

  const eras: EraTemario[] = erasEfectivas.map((era) => ({
    ...era,
    secciones: seccionesEfectivas.filter((s) => s.eraId === era.id),
  }));

  return { capitulos, eras };
}