import type { VisorMedia } from './types';

interface GaleriaMediaProps {
  media: VisorMedia[];
  indice: number;
  onCambiar: (indice: number) => void;
}

export default function GaleriaMedia({ media, indice, onCambiar }: GaleriaMediaProps) {
  const total = media.length;
  if (total <= 1) return null;

  const anterior = () => onCambiar((indice - 1 + total) % total);
  const siguiente = () => onCambiar((indice + 1) % total);

  return (
    <div className="absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-950/75 px-3 py-2 shadow-lg backdrop-blur-md sm:inset-x-4 sm:bottom-4">
      <button
        type="button"
        onClick={anterior}
        aria-label="Foto o video anterior de esta obra"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:bg-white/15 active:scale-95"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Tira horizontal amplia para las miniaturas (mismo ratio 16/10 que la card) */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory py-0.5">
        {media.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onCambiar(i)}
            aria-label={item.alt ?? `Ver ítem ${i + 1} de ${total}`}
            aria-pressed={i === indice}
            className={`relative aspect-[16/10] w-14 shrink-0 snap-start overflow-hidden rounded-lg transition duration-150 sm:w-[4.5rem] ${
              i === indice
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-slate-950'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={item.thumb}
              alt=""
              loading="lazy"
              decoding="async"
              className="block h-full w-full object-cover"
            />
            {item.tipo === 'video' && (
              <span className="absolute inset-0 grid place-items-center bg-black/40">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/95 text-slate-900 shadow" aria-hidden="true">
                  <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      <span
        aria-live="polite"
        className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-label font-semibold tabular-nums text-white/90"
      >
        {indice + 1} / {total}
      </span>

      <button
        type="button"
        onClick={siguiente}
        aria-label="Foto o video siguiente de esta obra"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:bg-white/15 active:scale-95"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}