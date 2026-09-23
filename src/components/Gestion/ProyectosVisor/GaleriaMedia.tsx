import type { VisorMedia } from './types';

interface GaleriaMediaProps {
  media: VisorMedia[];
  /** Índice del ítem activo en el slot principal. */
  indice: number;
  onCambiar: (indice: number) => void;
}

/** Flechas chicas de la galería (con wrap) + contador en aria-live. */
export default function GaleriaMedia({ media, indice, onCambiar }: GaleriaMediaProps) {
  const total = media.length;
  if (total <= 1) return null;

  const anterior = () => onCambiar((indice - 1 + total) % total);
  const siguiente = () => onCambiar((indice + 1) % total);

  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/50 px-3 py-2.5 backdrop-blur-sm sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={anterior}
        aria-label="Foto o video anterior de esta obra"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/25 text-white/90 transition-colors hover:bg-white/15 focus-visible:outline-accent"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto snap-x snap-mandatory">
        {media.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onCambiar(i)}
            aria-label={item.alt ?? `Ver ítem ${i + 1} de ${total}`}
            aria-pressed={i === indice}
            className={`relative h-14 w-14 shrink-0 snap-start overflow-hidden rounded-lg transition sm:h-16 sm:w-16 ${
              i === indice
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-black/50'
                : 'opacity-80 hover:opacity-100 focus-visible:outline-accent'
            }`}
          >
            <img
              src={item.thumb}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            {item.tipo === 'video' && (
              <span className="absolute inset-0 grid place-items-center bg-black/25">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/90 text-black" aria-hidden="true">
                  <svg width="9" height="9" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      <p
        aria-live="polite"
        className="shrink-0 whitespace-nowrap text-[11px] font-semibold tabular-nums text-white/85"
      >
        {indice + 1} / {total}
      </p>

      <button
        type="button"
        onClick={siguiente}
        aria-label="Foto o video siguiente de esta obra"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/25 text-white/90 transition-colors hover:bg-white/15 focus-visible:outline-accent"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}