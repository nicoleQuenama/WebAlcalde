import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import type { PlacaDolly, TabDolly } from './types';
import TimelineTabs from './TimelineTabs';

interface Props {
  tabs: TabDolly[];
  activa: number;
  placas: PlacaDolly[];
  montado: boolean;
  modalUI: ReactNode;
  onCambiarTab: (i: number) => void;
  onAbrir: (i: number) => void;
}

/** Modo sin animación (reduced motion): lista estática con las placas. */
export default function ModoEstatico({ tabs, activa, placas, montado, modalUI, onCambiarTab, onAbrir }: Props) {
  return (
    <div className="timeline-dolly">
      <TimelineTabs tabs={tabs} activa={activa} onCambiar={onCambiarTab} />
      <ol className="timeline-estatico">
        {placas.map((pl, i) => (
          <li key={pl.id} onClick={() => onAbrir(i)}>
            <img src={pl.imagen} alt={pl.alt} loading="lazy" />
            <div>
              <p>{pl.anio}</p>
              <h3>{pl.titulo}</h3>
              <p>{pl.descripcion}</p>
            </div>
          </li>
        ))}
      </ol>
      {montado && createPortal(modalUI, document.body)}
    </div>
  );
}