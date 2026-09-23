import type { PointerEvent as ReactPointerEvent } from 'react';
import { DESPLAZAMIENTO_X_INICIAL, PASO_Z } from '@constants/timeline/dolly';
import type { DollyRefs, PlacaDolly } from './types';
import EjeMarcas from './EjeMarcas';
import InfoPlaca from './InfoPlaca';

interface Props {
  placas: PlacaDolly[];
  fin: number;
  indice: number;
  nodos: DollyRefs;
  onInicio: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onMueve: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onFin: () => void;
  salto: (i: number) => void;
  onAbrirDetalle: (i: number) => void;
}

/** Vista desktop: escenario 3D + eje arrastrable + tarjeta de info. */
export default function DollyEscenario({ placas, fin, indice, nodos, onInicio, onMueve, onFin, salto, onAbrirDetalle }: Props) {
  return (
    <div className="timeline-galeria" aria-label="Línea de tiempo interactiva">
      <div
        className="timeline-escenario"
        ref={nodos.escenario}
        onPointerDown={onInicio}
        onPointerMove={onMueve}
        onPointerUp={onFin}
        onPointerCancel={onFin}
      >
        {placas.map((pl, i) => {
          const lado = i % 2 === 0 ? -1 : 1;
          return (
            <div
              key={pl.id}
              ref={(el) => {
                nodos.placas.current[i] = el;
              }}
              className="timeline-placa"
              style={{
                transform: `translate(-50%, -50%) translate3d(${lado * DESPLAZAMIENTO_X_INICIAL}px, 0px, ${i * -PASO_Z}px)`,
              }}
            >
              <img src={pl.imagen} alt={pl.alt} draggable={false} loading="lazy" style={{ objectPosition: pl.objectPosition }} />
              <span className="timeline-placa-anio">{pl.anio}</span>
            </div>
          );
        })}

        <EjeMarcas placas={placas} fin={fin} relleno={nodos.relleno} pulgar={nodos.pulgar} onSalto={salto} />
      </div>

      {placas[indice] ? (
        <InfoPlaca placa={placas[indice]} derecha={indice % 2 === 0} infoRef={nodos.info} onClick={() => onAbrirDetalle(indice)} />
      ) : null}
    </div>
  );
}