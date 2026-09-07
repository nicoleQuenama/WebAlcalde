import { useEffect, useState } from 'react';

/** Progreso 0→1 del scroll dentro de una altura dada (para el fundido del hero). */
export function useDesvanecidoScroll(heroHeight: number = 800) {
  const [progreso, setProgreso] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const p = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
        setProgreso(p);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [heroHeight]);
  return progreso;
}

/** scrollY crudo en px (para la secuencia de frases al hacer scroll). */
export function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setY(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

export function estilosDesvanecido(tipo: 'letra' | 'alcalde' | 'botones' | 'fondo', progreso: number) {
  if (tipo === 'letra') {
    return { transform: `translateY(${-progreso * 160}px)`, opacity: 1 - progreso * 2.5 } as const;
  }
  if (tipo === 'alcalde' || tipo === 'botones') {
    return { transform: `translateY(${progreso * 140}px)`, opacity: 1 - progreso * 2.2 } as const;
  }
  if (tipo === 'fondo') {
    // fondo claro que cubre la imagen al empezar el scroll
    return { opacity: Math.min(progreso * 2.8, 1) } as const;
  }
  return {} as const;
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * Estilo de una frase de la secuencia según el scrollY.
 * Cada frase entra desde abajo, se mantiene y sale hacia arriba mientras se hace scroll.
 * `inicio`   = px de scroll antes de la primera frase
 * `duracion` = px de scroll que dura cada frase
 * `mantener` = true en la ÚLTIMA frase: entra y NO sale (queda fija hasta que la
 *              sección de abajo la tapa al subir).
 */
export function estiloFrase(
  indice: number,
  scrollY: number,
  opts: { inicio: number; duracion: number; mantener?: boolean },
) {
  const { inicio, duracion, mantener = false } = opts;
  const local = (scrollY - (inicio + indice * duracion)) / duracion; // 0→1 mientras está activa

  // Antes de entrar → oculta. Después de su ventana → oculta, salvo que `mantener`.
  if (local <= -0.12 || (!mantener && local >= 1.12)) {
    return { opacity: 0, transform: 'translateY(56px) scale(0.97)', visibility: 'hidden' as const };
  }

  let opacity = 1;
  let ty = 0;
  let scale = 1;

  // entrada rápida (0 → 0.18) · mantiene mucho tiempo · salida (0.84 → 1)
  if (local < 0.18) {
    const t = clamp01(local / 0.18);
    opacity = t;
    ty = (1 - t) * 56;
    scale = 0.97 + t * 0.03;
  } else if (!mantener && local > 0.84) {
    const t = clamp01((local - 0.84) / 0.16);
    opacity = 1 - t;
    ty = -t * 56;
    scale = 1 - t * 0.03;
  }
  // Con `mantener`: una vez local ≥ 0.18 queda en opacity 1 / sin transform, fija.

  return {
    opacity,
    transform: `translateY(${ty}px) scale(${scale})`,
    visibility: 'visible' as const,
  };
}
