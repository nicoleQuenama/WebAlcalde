import { useState, useCallback } from 'react';
import ImageSlider from '@components/ImageSlider/ImageSlider';
import ArrowButton from '@components/ui/ArrowButton/ArrowButton';


export interface ParComparador {
  titulo: string;
  antes: string;
  despues: string;
  afterFit?: 'cover' | 'contain' | 'fill' | 'none';
  afterPosition?: string;
  afterScale?: number;
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
          afterFit={par.afterFit}
          afterPosition={par.afterPosition}
          afterScale={par.afterScale}
        />
      </div>

      {/* Flechas laterales (solo si hay más de un par) */}
      {total > 1 && (
        <>
          <ArrowButton
            direction="left"
            variant="comparison"
            onClick={() => ir(-1)}
            aria-label="Comparación anterior"
            className="absolute left-2 top-1/2 z-10 sm:left-4"
          />
          <ArrowButton
            direction="right"
            variant="comparison"
            onClick={() => ir(1)}
            aria-label="Comparación siguiente"
            className="absolute right-2 top-1/2 z-10 sm:right-4"
          />
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
                  idx === i ? 'w-7 bg-primary' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
