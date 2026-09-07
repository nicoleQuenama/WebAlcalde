import { useEffect, useState } from 'react';
import GaleriaModal, { type ImagenFaceta } from '../Hero/GaleriaModal';
import { HISTORIA } from '../../constants/historia';

// Solo los hitos que tienen foto entran a la galería. El orden acá debe coincidir
// con el `data-galeria-idx` que pinta LineaTiempo.astro.
const IMAGENES: ImagenFaceta[] = HISTORIA.filter((h) => h.imagen).map((h) => ({
  src: h.imagen as string,
  titulo: `${h.anio} · ${h.titulo}`,
}));

export default function TimelineGaleria() {
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (IMAGENES.length === 0) return;
    const onClick = (e: MouseEvent) => {
      const disparador = (e.target as HTMLElement).closest<HTMLElement>('[data-galeria-idx]');
      if (!disparador) return;
      const idx = Number(disparador.dataset.galeriaIdx);
      if (Number.isNaN(idx)) return;
      setIndice(idx);
      setAbierto(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (!abierto) return null;
  return (
    <GaleriaModal
      imagenes={IMAGENES}
      indice={indice}
      onIndice={setIndice}
      onCerrar={() => setAbierto(false)}
    />
  );
}
