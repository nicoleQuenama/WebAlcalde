import { useEffect, type CSSProperties } from 'react';
import type { PlacaDolly } from './types';

interface Props {
  placa: PlacaDolly;
  indice: number;
  onCerrar: () => void;
  onVerGaleria: (indice: number) => void;
}

/** Detalle de una placa: resumen de texto + acceso a la galería. */
export default function OverlayDetalle({ placa, indice, onCerrar, onVerGaleria }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  return (
    <div className="timeline-detalle-overlay" onClick={onCerrar}>
      <div
        className="timeline-detalle"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${placa.titulo}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          className="timeline-detalle-img"
          src={placa.imagen}
          alt={placa.alt}
          style={{ '--obj': placa.objectPosition } as CSSProperties}
        />
        <div className="timeline-detalle-cuerpo">
          <div className="timeline-detalle-top">
            <span className="timeline-detalle-anio">{placa.anio}</span>
            <p className="timeline-detalle-kicker">{placa.etapa}</p>
          </div>
          <h3 className="timeline-detalle-titulo">{placa.titulo}</h3>
          <p className="timeline-detalle-desc">{placa.descripcion}</p>
        </div>
        <div className="timeline-detalle-acciones">
          <button type="button" className="timeline-detalle-boton" onClick={() => onVerGaleria(indice)}>
            Ver galería
          </button>
          <button type="button" className="timeline-detalle-boton timeline-detalle-boton-borde" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}