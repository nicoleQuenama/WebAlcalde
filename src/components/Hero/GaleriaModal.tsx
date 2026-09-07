import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ImagenFaceta {
  src: string;
  titulo?: string;
}

interface Props {
  imagenes: ImagenFaceta[];
  indice: number;
  onIndice: (i: number) => void;
  onCerrar: () => void;
}

/**
 * Galería a pantalla completa (reutilizable).
 * Cerrar: X, fondo o Esc. Navegar: flechas laterales, teclas ← →, o swipe en móvil.
 */
export default function GaleriaModal({ imagenes, indice, onIndice, onCerrar }: Props) {
  const total = imagenes.length;
  const anterior = () => onIndice((indice - 1 + total) % total);
  const siguiente = () => onIndice((indice + 1) % total);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      else if (e.key === 'ArrowLeft') anterior();
      else if (e.key === 'ArrowRight') siguiente();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const actual = imagenes[indice];
  if (typeof document === 'undefined' || !actual) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-3xl animate-[fadeIn_0.3s_ease-out]"
      onClick={onCerrar}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx > 50) anterior();
        else if (dx < -50) siguiente();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Galería de imágenes"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onCerrar(); }}
        className="fixed top-24 right-4 lg:top-28 lg:right-10 bg-white/10 hover:bg-white/30 border border-white/20 text-white p-3 lg:p-4 rounded-full backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:rotate-90 z-[1000] shadow-2xl"
        aria-label="Cerrar galería"
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); anterior(); }}
        className="absolute left-4 lg:left-12 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-4 hover:scale-110 transition-all z-[110]"
        aria-label="Imagen anterior"
      >
        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>

      <figure className="mt-16 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          key={actual.src}
          src={actual.src}
          alt={actual.titulo ?? 'Ampliación'}
          className="max-h-[72vh] max-w-[90vw] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-[zoomIn_0.4s_ease-out]"
        />
        {actual.titulo && (
          <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-white/90">
            {actual.titulo}
          </figcaption>
        )}
      </figure>

      <button
        onClick={(e) => { e.stopPropagation(); siguiente(); }}
        className="absolute right-4 lg:right-12 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-4 hover:scale-110 transition-all z-[110]"
        aria-label="Imagen siguiente"
      >
        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {total > 1 && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 text-[11px] font-semibold tracking-[0.35em] text-white/70">
          {String(indice + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      )}
    </div>,
    document.body,
  );
}
