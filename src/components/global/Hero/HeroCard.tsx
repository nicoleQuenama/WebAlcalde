import { useState, useEffect } from 'react';
import { ajusteImagen } from '@lib/ajusteImagen';
import type { TarjetaImagen } from './types';
import ArrowButton from '@components/ui/ArrowButton/ArrowButton';
import GaleriaModal from './GaleriaModal'; 
import './hero.css';

export type { TarjetaImagen } from './types';

const IMAGENES_DEFECTO: TarjetaImagen[] = [];

interface Props {
  imagenes: TarjetaImagen[];
  autoplayMs?: number;
}

const cardAjuste = ajusteImagen;

export default function HeroCards({ imagenes, autoplayMs = 3500 }: Props) {
  const IMAGENES = imagenes && imagenes.length > 0 ? imagenes : IMAGENES_DEFECTO;
  const [actual, setActual] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    if (!autoplayMs || modalAbierto || IMAGENES.length < 2) return;
    const intervalo = setInterval(() => {
      setActual((prev) => (prev + 1) % IMAGENES.length);
    }, autoplayMs);
    return () => clearInterval(intervalo);
  }, [actual, autoplayMs, modalAbierto, IMAGENES.length]);

  const siguiente = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActual((prev) => (prev + 1) % IMAGENES.length);
  };

  const anterior = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActual((prev) => (prev - 1 + IMAGENES.length) % IMAGENES.length);
  };

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  return (
    <>
      <div className="relative flex w-full items-center justify-center h-[420px] sm:h-[480px] lg:h-[540px] pb-10">
        <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px]">
          {IMAGENES.map((img, index) => {
            // Lógica limpia usando las clases del CSS
            let posicion = 'hero-card-oculta';
            if (index === actual) posicion = 'hero-card-centro';
            else if (index === (actual - 1 + IMAGENES.length) % IMAGENES.length) posicion = 'hero-card-izquierda';
            else if (index === (actual + 1) % IMAGENES.length) posicion = 'hero-card-derecha';

            return (
              <div
                key={img.id}
                className={`hero-card-base ${posicion}`}
                onClick={() => {
                  if (posicion === 'hero-card-centro') abrirModal();
                  if (posicion === 'hero-card-izquierda') anterior();
                  if (posicion === 'hero-card-derecha') siguiente();
                }}
              >
                <img
                  src={img.src}
                  alt={img.titulo ?? ''}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                  style={cardAjuste(img)}
                />
                {posicion === 'hero-card-centro' && img.titulo && (
                  <span className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-10 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    {img.titulo}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 flex gap-8 z-40">
          <ArrowButton direction="left" variant="hero" onClick={anterior} aria-label="Anterior" />
          <ArrowButton direction="right" variant="hero" onClick={siguiente} aria-label="Siguiente" />
        </div>
      </div>

      {/* Renderizamos el Modal reutilizable sin duplicar código */}
      {modalAbierto && (
        <GaleriaModal
          imagenes={IMAGENES.map(img => ({ src: img.src, titulo: img.titulo }))}
          indice={actual}
          onIndice={setActual}
          onCerrar={cerrarModal}
        />
      )}
    </>
  );
}