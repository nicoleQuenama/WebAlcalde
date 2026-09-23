export const duplicateForCarousel = <T>(items: T[]): T[] => [...items, ...items];

/** Índice siguiente con wrap-around: del último vuelve al primero. */
export const indiceSiguiente = (actual: number, total: number): number =>
  actual === total - 1 ? 0 : actual + 1;
