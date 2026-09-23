import { createPortal } from 'react-dom';
import GaleriaModal from '@components/global/Hero/GaleriaModal';
import { useTimelineCamera, useTimelineEstado, useTimelineMedia, useTimelineMovil } from '@hooks';
import type { PlacaDolly, TabDolly } from './types';
import TimelineTabs from './TimelineTabs';
import ModoEstatico from './ModoEstatico';
import ModoMovil from './ModoMovil';
import DollyEscenario from './DollyEscenario';
import OverlayDetalle from './OverlayDetalle';
import './timeline.css';

interface Props {
  tabs: TabDolly[];
}

/** Línea de tiempo: dolly 3D en desktop, carrusel en móvil, lista estática sin animación. */
export default function TimelineDolly({ tabs }: Props) {
  const { estatico, movil } = useTimelineMedia();
  const estado = useTimelineEstado();

  const tabActual = tabs[estado.pestana] ?? tabs[0];
  const placas: PlacaDolly[] = tabActual?.placas ?? [];
  const n = placas.length;
  const clave = tabActual?.id ?? '';
  const fin = Math.max(1, n - 1);

  // Hooks de comportamiento: solo "despiertan" en el modo que los usa.
  const camara = useTimelineCamera({
    n,
    fin,
    activo: !estatico && !movil && n > 0,
    clave,
    modalAbierta: estado.modal.abierta,
    onAbrirModal: estado.abrirGaleria,
  });
  const carrusel = useTimelineMovil({
    n,
    activo: !estatico && movil && n > 0,
    clave,
    modalAbierta: estado.modal.abierta,
    detalleAbierta: estado.detalle.abierta,
    onAbrirDetalle: estado.abrirDetalle,
  });

  const galeriaUI =
    estado.modal.abierta && tabActual ? (
      <GaleriaModal
        imagenes={tabActual.galeria}
        indice={estado.modal.idx}
        onIndice={estado.moverGaleriaA}
        onCerrar={estado.cerrarGaleria}
      />
    ) : null;

  const detalleUI =
    estado.detalle.abierta && placas[estado.detalle.idx] ? (
      <OverlayDetalle
        placa={placas[estado.detalle.idx]}
        indice={estado.detalle.idx}
        onCerrar={estado.cerrarDetalle}
        onVerGaleria={estado.verGaleriaDesdeDetalle}
      />
    ) : null;

  // Modo sin animación (prefers-reduced-motion).
  if (estatico) {
    return (
      <ModoEstatico
        tabs={tabs}
        activa={estado.pestana}
        placas={placas}
        montado={estado.montado}
        modalUI={galeriaUI}
        onCambiarTab={estado.cambiarPestana}
        onAbrir={estado.abrirGaleria}
      />
    );
  }

  if (n === 0) {
    return (
      <div className="timeline-dolly">
        <TimelineTabs tabs={tabs} activa={estado.pestana} onCambiar={estado.cambiarPestana} />
        <p className="mt-10 text-sm text-slate-500">Aún no hay hitos con foto para mostrar.</p>
      </div>
    );
  }

  // Carrusel inmersivo (pantallas pequeñas, en lugar del dolly 3D).
  if (movil) {
    return (
      <ModoMovil
        tabs={tabs}
        activa={estado.pestana}
        placas={placas}
        carrusel={carrusel}
        montado={estado.montado}
        detalleUI={detalleUI}
        modalUI={galeriaUI}
        onCambiarTab={estado.cambiarPestana}
      />
    );
  }

  // Dolly 3D desktop.
  return (
    <div className="timeline-dolly">
      <TimelineTabs tabs={tabs} activa={estado.pestana} onCambiar={estado.cambiarPestana} />
      <DollyEscenario
        placas={placas}
        fin={fin}
        indice={camara.indice}
        nodos={camara.nodos}
        onInicio={camara.onInicio}
        onMueve={camara.onMueve}
        onFin={camara.onFin}
        salto={camara.salto}
        onAbrirDetalle={estado.abrirDetalle}
      />
      <p className="timeline-pistas">
        {n > 1 ? 'Rueda para avanzar · Arrastrá la línea para saltar' : 'Arrastrá la línea para recorrerla'}
      </p>
      {estado.montado && createPortal(detalleUI, document.body)}
      {estado.montado && createPortal(galeriaUI, document.body)}
    </div>
  );
}
