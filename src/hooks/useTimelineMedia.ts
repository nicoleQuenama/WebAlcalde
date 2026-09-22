import { useEffect, useState } from 'react';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const ESCRITORIO = '(min-width: 1024px)';

interface MediaTimeline {
  estatico: boolean;
  movil: boolean;
}

/** Detecta prefers-reduced-motion (lista estática) y modo móvil/desktop. */
export function useTimelineMedia() {
  const [media, setMedia] = useState<MediaTimeline>({ estatico: false, movil: false });

  useEffect(() => {
    const reduce = window.matchMedia(REDUCED_MOTION);
    const escritorio = window.matchMedia(ESCRITORIO);
    const sincronizar = () => setMedia({ estatico: reduce.matches, movil: !escritorio.matches });
    sincronizar();
    reduce.addEventListener('change', sincronizar);
    escritorio.addEventListener('change', sincronizar);
    return () => {
      reduce.removeEventListener('change', sincronizar);
      escritorio.removeEventListener('change', sincronizar);
    };
  }, []);

  return media;
}
