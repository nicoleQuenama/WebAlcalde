import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode } from 'react';
import type { CarruselMovil, PlacaDolly, TabDolly } from './types';
import TimelineTabs from './TimelineTabs';

interface Props {
  tabs: TabDolly[];
  activa: number;
  placas: PlacaDolly[];
  carrusel: CarruselMovil;
  montado: boolean;
  detalleUI: ReactNode;
  modalUI: ReactNode;
  onCambiarTab: (i: number) => void;
}

/** Carrusel inmersivo que reemplaza al dolly 3D en pantallas móviles. */
export default function ModoMovil({ tabs, activa, placas, carrusel, montado, detalleUI, modalUI, onCambiarTab }: Props) {
  return (
    <div className="timeline-dolly">
      <TimelineTabs tabs={tabs} activa={activa} onCambiar={onCambiarTab} />
      <div className="timeline-movil">
        <div className="timeline-movil-progreso" aria-hidden="true">
          <div className="timeline-movil-progreso-bar" ref={carrusel.barra} />
        </div>
        <div
          className="timeline-movil-pista"
          ref={carrusel.pista}
          tabIndex={0}
          aria-label="Hitos profesionales, deslizá para recorrer"
          onScroll={carrusel.onScroll}
        >
          {placas.map((pl) => (
            <article
              key={pl.id}
              className="timeline-movil-placa"
              style={{ '--obj': pl.objectPosition } as CSSProperties}
              onPointerDown={carrusel.onTapDown}
              onPointerUp={carrusel.onTapUp}
              onPointerCancel={carrusel.onTapCancel}
            >
              <img src={pl.imagen} alt={pl.alt} draggable={false} loading="lazy" />
              <div className="timeline-movil-info">
                <div className="timeline-movil-info-top">
                  <span className="timeline-movil-anio">{pl.anio}</span>
                  <p className="timeline-movil-kicker">{pl.etapa}</p>
                </div>
                <h3 className="timeline-movil-titulo">{pl.titulo}</h3>
                <span className="timeline-movil-ver">Leer más</span>
              </div>
            </article>
          ))}
        </div>
        <p className="timeline-pistas">Deslizá para recorrer · Tocá una foto para leer más</p>
      </div>
      {montado && createPortal(detalleUI, document.body)}
      {montado && createPortal(modalUI, document.body)}
    </div>
  );
}