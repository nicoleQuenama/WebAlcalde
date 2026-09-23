import type { RefObject } from 'react';
import type { PlacaDolly } from './types';

interface Props {
  placas: PlacaDolly[];
  fin: number;
  relleno: RefObject<HTMLDivElement | null>;
  pulgar: RefObject<HTMLDivElement | null>;
  onSalto: (i: number) => void;
}

/** Eje vertical central (arrastrable = índice rápido), con marcas y pulgar. */
export default function EjeMarcas({ placas, fin, relleno, pulgar, onSalto }: Props) {
  return (
    <div className="timeline-eje" aria-hidden="true">
      <div className="timeline-eje-relleno" ref={relleno} />
      <div ref={pulgar} className="timeline-eje-pulgar" />
      {placas.map((pl, i) => (
        <button
          key={pl.id}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="timeline-eje-marca"
          style={{ top: `${(i / fin) * 100}%` }}
          onClick={() => onSalto(i)}
        >
          <span className="timeline-eje-punto" />
          <span className="timeline-eje-anio">{pl.anio}</span>
        </button>
      ))}
    </div>
  );
}