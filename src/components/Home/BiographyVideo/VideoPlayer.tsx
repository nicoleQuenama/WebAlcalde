/**
 * VideoPlayer.tsx — Componente para reproducir videos de biografía.
 * Lazy: el video solo carga cuando entra en viewport (IntersectionObserver).
 */

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  /** URL del video */
  src: string;
  /** URL del poster/imagen previa */
  poster: string;
  /** Título del video */
  title?: string;
  /** Descripción del video */
  description?: string;
  /** Clases CSS adicionales */
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  description,
  className = '',
}: VideoPlayerProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Si ya está visible al montar, carga
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref as any} className={`overflow-hidden rounded-2xl border border-slate-200 ${className}`}>
      {shouldLoad ? (
        <video
          className="aspect-video w-full bg-slate-900 object-cover object-[50%_7%]"
          src={src}
          poster={poster}
          controls
          preload="none"
          playsInline
          width={1280}
          height={720}
        />
      ) : (
        <div className="relative aspect-video w-full bg-slate-900">
          <img
            src={poster}
            alt={title ?? 'Video biografía'}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-[50%_7%] opacity-90"
          />
          <div className="absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-white/90 p-4 shadow-lg backdrop-blur">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 text-primary"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </div>
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            {title ?? 'Biografía'}
          </span>
        </div>
      )}
      {(title || description) && (
        <figcaption className="bg-slate-50 px-4 py-2 text-xs font-medium italic text-slate-400">
          {title && <span className="font-semibold">{title}</span>}
          {title && description && ' — '}
          {description}
        </figcaption>
      )}
    </figure>
  );
}
