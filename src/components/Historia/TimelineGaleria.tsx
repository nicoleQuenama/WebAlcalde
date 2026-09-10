import { useEffect, useState } from 'react';
import GaleriaModal, { type ImagenFaceta } from '@components/global/Hero/GaleriaModal';

interface Props {
  /** Imágenes de los hitos con foto, en el mismo orden que `data-galeria-idx`. */
  imagenes: ImagenFaceta[];
}

export default function TimelineGaleria({ imagenes }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (imagenes.length === 0) return;
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
  }, [imagenes.length]);

  if (!abierto) return null;
  return (
    <GaleriaModal
      imagenes={imagenes}
      indice={indice}
      onIndice={setIndice}
      onCerrar={() => setAbierto(false)}
    />
  );
}
