import { useState, useCallback } from 'react';
import ImageSlider from '../ImageSlider/ImageSlider';

/**
 * ComparadorAntesDespues — un comparador "antes / después" GRANDE con flechas a
 * los costados para pasar entre varios pares.
 *
 * Reutiliza <ImageSlider> (se arrastra el tirador central). Cada par es un punto
 * de la ciudad; las flechas y los puntos de abajo permiten recorrer todos.
 *
 * ⚠️ Sin sombras y con el color de marca (#472d82) en los controles. Las fotos
 *    son de referencia hasta tener los pares antes/después reales.
 */

export interface ParComparador {
  titulo: string;
  antes: string;
  despues: string;
}

interface Props {
  pares: ParComparador[];
}

export default function ComparadorAntesDespues({ pares }: Props) {
  const [i, setI] = useState(0);
  const total = pares.length;

  const ir = useCallback(
    (delta: number) => setI((prev) => (prev + delta + total) % total),
    [total],
  );

  if (total === 0) return null;
  const par = pares[i];

  return (
    <div className="relative">
      {/* Comparador grande */}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <ImageSlider
          key={i}
          beforeImage={par.antes}
          afterImage={par.despues}
          beforeLabel="Antes"
          afterLabel="Después"
        />
      </div>

      {/* Flechas laterales (solo si hay más de un par) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => ir(-1)}
            aria-label="Comparación anterior"
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#472d82] text-white transition-transform hover:scale-110 sm:left-4 sm:h-14 sm:w-14"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            type="button"
            onClick={() => ir(1)}
            aria-label="Comparación siguiente"
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#472d82] text-white transition-transform hover:scale-110 sm:right-4 sm:h-14 sm:w-14"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      {/* Título + puntos + nota */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-sm font-bold tracking-tight text-slate-800">{par.titulo}</p>
          <p className="text-xs font-medium italic text-slate-400">
            Desliza para comparar el antes y el ahora.
          </p>
        </div>

        {total > 1 && (
          <div className="flex items-center gap-2">
            {pares.map((p, idx) => (
              <button
                key={p.titulo}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Ver comparación ${idx + 1}: ${p.titulo}`}
                aria-current={idx === i}
                className={`h-2.5 rounded-full transition-all ${
                  idx === i ? 'w-7 bg-[#472d82]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
