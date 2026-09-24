import { useEffect, useRef } from 'react';

/**
 * Bloquea el scroll del fondo mientras `activo` sea true.
 * Al bloquear guarda en refs la posición de scroll y el `overflow` previo del body;
 * al desbloquear (o desmontar) restaura ambos valores exactos.
 */
export function useBodyScrollLock(activo: boolean): void {
  const scrollYRef = useRef(0);
  const prevOverflowRef = useRef('');
  const bloqueadoRef = useRef(false);

  useEffect(() => {
    if (activo) {
      bloqueadoRef.current = true;
      scrollYRef.current = window.scrollY;
      prevOverflowRef.current = document.body.style.overflow;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (!bloqueadoRef.current) return;
      bloqueadoRef.current = false;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = prevOverflowRef.current;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [activo]);
}