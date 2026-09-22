import { useCallback, useEffect, useState } from 'react';

/** Overlay de la línea de tiempo: modal de galería o detalle de placa. */
interface TimelineCapa {
  abierta: boolean;
  idx: number;
}

/** Toda la UI de TimelineDolly en un solo estado: montaje, pestaña y overlays. */
interface TimelineUi {
  montado: boolean;
  pestana: number;
  modal: TimelineCapa;
  detalle: TimelineCapa;
}

const CAPA_CERRADA: TimelineCapa = { abierta: false, idx: 0 };
const UI_INICIAL: TimelineUi = { montado: false, pestana: 0, modal: CAPA_CERRADA, detalle: CAPA_CERRADA };

/** Estado de la línea de tiempo (una sola fuente, sin useState sueltos en el componente). */
export function useTimelineEstado() {
  const [ui, setUi] = useState<TimelineUi>(UI_INICIAL);

  // Hidratación: los portales solo se montan en el cliente.
  useEffect(() => setUi((s) => ({ ...s, montado: true })), []);

  const cambiarPestana = useCallback((pestana: number) => setUi((s) => ({ ...s, pestana })), []);
  const abrirGaleria = useCallback((idx: number) => setUi((s) => ({ ...s, modal: { abierta: true, idx } })), []);
  const cerrarGaleria = useCallback(() => setUi((s) => ({ ...s, modal: CAPA_CERRADA })), []);
  const moverGaleriaA = useCallback((idx: number) => setUi((s) => ({ ...s, modal: { ...s.modal, idx } })), []);
  const abrirDetalle = useCallback((idx: number) => setUi((s) => ({ ...s, detalle: { abierta: true, idx } })), []);
  const cerrarDetalle = useCallback(() => setUi((s) => ({ ...s, detalle: CAPA_CERRADA })), []);
  const verGaleriaDesdeDetalle = useCallback(
    (idx: number) => setUi((s) => ({ ...s, detalle: CAPA_CERRADA, modal: { abierta: true, idx } })),
    [],
  );

  return {
    ...ui,
    cambiarPestana,
    abrirGaleria,
    cerrarGaleria,
    moverGaleriaA,
    abrirDetalle,
    cerrarDetalle,
    verGaleriaDesdeDetalle,
  };
}
