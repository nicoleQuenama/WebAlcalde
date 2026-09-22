/** Clampa un número entre 0 y 1. Usada por la cámara y el carrusel móvil. */
export const limita = (n: number) => Math.max(0, Math.min(1, n));
