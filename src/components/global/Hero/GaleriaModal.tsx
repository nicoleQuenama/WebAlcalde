import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ArrowButton from '@components/ui/ArrowButton/ArrowButton';
import './hero.css';

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
      className="hero-modal-overlay fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-3xl"
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
        className="fixed top-24 right-4 lg:top-28 lg:right-10 bg-white/10 hover:bg-white/30 border border-white/20 text-white p-3 lg:p-4 rounded-full backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:rotate-90 z-[1000]"
        aria-label="Cerrar galería"
      >
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <ArrowButton direction="left" variant="modal" onClick={(e) => { e?.stopPropagation(); anterior(); }} aria-label="Imagen anterior" className="absolute left-4 lg:left-12 z-[110]" />

      <figure className="mt-16 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          key={actual.src}
          src={actual.src}
          alt={actual.titulo ?? 'Ampliación'}
          className="hero-modal-image max-h-[72vh] max-w-[90vw] object-contain rounded-2xl"
        />
        {actual.titulo && (
          <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-white/90">
            {actual.titulo}
          </figcaption>
        )}
      </figure>

      <ArrowButton direction="right" variant="modal" onClick={(e) => { e?.stopPropagation(); siguiente(); }} aria-label="Imagen siguiente" className="absolute right-4 lg:right-12 z-[110]" />

      {total > 1 && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 text-[11px] font-semibold tracking-[0.35em] text-white/70">
          {String(indice + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      )}
    </div>,
    document.body,
  );
}