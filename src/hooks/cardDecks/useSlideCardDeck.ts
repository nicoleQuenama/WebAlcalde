/**
 * useSlideCardDeck.ts — Hook personalizado para manejar el slide de tarjetas.
 *
 * Proporciona autoplay y navegación automática para el componente CardsDeck.
 */

import { useEffect, useRef } from 'react';

interface UseSlideCardDeckProps {
  /** Total de tarjetas */
  total: number;
  /** Intervalo de autoplay en ms (0 = sin autoplay) */
  autoplayMs?: number;
  /** Callback para navegar (delta: número de posiciones a mover) */
  onNavigate: (delta: number) => void;
}

export default function useSlideCardDeck({
  total,
  autoplayMs = 0,
  onNavigate,
}: UseSlideCardDeckProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // No iniciar autoplay si hay menos de 2 tarjetas o autoplayMs es 0
    if (total < 2 || autoplayMs <= 0) return;

    intervalRef.current = setInterval(() => {
      onNavigate(1);
    }, autoplayMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [total, autoplayMs, onNavigate]);
}
