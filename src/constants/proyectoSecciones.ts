/**
 * Cabezal editorial de cada categoría del visor de proyectos (/gestion).
 * Los valores replican los títulos reales de las secciones del seed
 * (`src/lib/db.ts`, dominio `seccion`) para que el visor diga lo mismo
 * que las eras; las categorías sin sección equivalente usan un título
 * editorial corto. Fallback en la isla: `categoria.label`.
 */

export const SECCION_POR_CATEGORIA: Record<string, string> = {
  puentes: 'Pioneros en pasos a desnivel y puentes',
  'areas verdes': 'Ciudad Jardín: áreas verdes y parques',
  destacados: 'Hitos que marcaron época',
  salud: 'Salud de calidad',
  agua: 'Cobertura de agua potable: deuda social',
  recreacion: 'Cochabamba, Ciudad Jardín: recreación y encuentro',
  lagunas: 'Nuestros espejos de agua',
  'futuro ecologico': 'Un compromiso con el futuro ecológico',
  'infraestructura vial': 'Cochabamba conectada: infraestructura vial para una ciudad que avanza',
  progreso: 'Cochabamba a la vanguardia del progreso',
  'a.p.p.s': 'Pioneros en alianzas público-privadas',
};