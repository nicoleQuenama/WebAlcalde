/**
 * slider.ts — Lógica reutilizable para sliders y comparadores de imágenes.
 *
 * Utilizado en ComparatingProjects/ProjectSlide.tsx
 */

/**
 * Calcula la posición del slider basándose en la posición del mouse/touch.
 */
export function calculateSliderPosition(
  clientX: number,
  containerRect: DOMRect,
  initialPosition: number = 50
): number {
  if (containerRect.width === 0) return initialPosition;
  const relative = ((clientX - containerRect.left) / containerRect.width) * 100;
  return clamp(relative, 0, 100);
}

/**
 * Limita un valor entre un mínimo y un máximo.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Navega al siguiente/elemento anterior en un carrusel.
 */
export function navigateCarousel(
  currentIndex: number,
  delta: number,
  total: number
): number {
  return (currentIndex + delta + total) % total;
}

/**
 * Calcula la posición de un elemento en un carrusel circular.
 */
export function getCarouselPosition(
  totalItems: number,
  currentIndex: number,
  itemIndex: number
): 'centro' | 'izquierda' | 'derecha' | 'oculta' {
  if (itemIndex === currentIndex) return 'centro';
  if (itemIndex === (currentIndex - 1 + totalItems) % totalItems) return 'izquierda';
  if (itemIndex === (currentIndex + 1) % totalItems) return 'derecha';
  return 'oculta';
}
