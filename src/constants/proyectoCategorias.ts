export const CATEGORIAS_PILLS = ['puentes', 'areas verdes', 'destacados'] as const;

export const CATEGORIAS_DROPDOWN = [
  'salud',
  'agua',
  'recreacion',
  'lagunas',
  'futuro ecologico',
  'infraestructura vial',
  'progreso',
  'a.p.p.s',
] as const;

export const CATEGORIAS_ORDEN: readonly string[] = [...CATEGORIAS_PILLS, ...CATEGORIAS_DROPDOWN];

export const CATEGORIAS_LABELS: Record<string, string> = {
  puentes: 'Puentes',
  'areas verdes': 'Áreas verdes',
  destacados: 'Destacados',
  salud: 'Salud',
  agua: 'Agua',
  recreacion: 'Recreación',
  lagunas: 'Lagunas',
  'futuro ecologico': 'Futuro ecológico',
  'infraestructura vial': 'Infraestructura vial',
  progreso: 'Progreso',
  'a.p.p.s': 'A.P.P.S',
};
