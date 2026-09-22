import type { RefObject } from 'react';
import type { PlacaDolly } from './types';

interface Props {
  placa: PlacaDolly;
  derecha: boolean;
  infoRef: RefObject<HTMLDivElement | null>;
  onClick: () => void;
}

/** Tarjeta de información de la placa enfocada (lado opuesto al eje). */
export default function InfoPlaca({ placa, derecha, infoRef, onClick }: Props) {
  return (
    <div
      ref={infoRef}
      className={`timeline-info ${derecha ? 'timeline-info--der' : 'timeline-info--izq'}`}
      onClick={onClick}
    >
      <p className="timeline-info-kicker">{placa.etapa}</p>
      <h3 className="timeline-info-titulo">{placa.titulo}</h3>
      <span className="timeline-info-anio">{placa.anio}</span>
      <span className="timeline-info-zoom">Leer más</span>
    </div>
  );
}