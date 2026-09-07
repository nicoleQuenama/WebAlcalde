import { useState } from 'react';
import GaleriaModal, { type ImagenFaceta } from './GaleriaModal';

// ── Facetas de su vida ──────────────────────────────────────────────
// Reemplazá los `src` por las fotos reales (poné los archivos en /public/images/).
// Las 2 primeras se muestran como tarjetas (izquierda / derecha del alcalde);
// todas aparecen en la galería al hacer click.
const FACETAS: ImagenFaceta[] = [
  { src: '/images/ciudad.jpg', titulo: 'Gestión' },
  { src: '/images/alcalde.webp', titulo: 'Cercanía' },
  { src: '/images/ciudad.jpg', titulo: 'Deporte' },
  { src: '/images/alcalde.webp', titulo: 'Familia' },
];

// Distancia (px) desde el centro del hero al centro de cada tarjeta.
// Bajalo para juntarlas más; subilo para separarlas.
const SEPARACION = 190;
const ALTURA_VERTICAL = '52%'; // posición vertical del par de tarjetas

// Ocultas en móvil (no hay lugar para flanquear al alcalde en pantallas angostas);
// aparecen desde `md`.
const TARJETA_BASE =
  'pointer-events-auto absolute hidden md:block h-[38vh] max-h-[440px] w-[26vw] max-w-[280px] ' +
  'cursor-pointer rounded-3xl border border-[#454ca5]/15 bg-cover bg-center ' +
  'shadow-[0_24px_60px_rgba(69,76,165,0.22)] transition-[filter,box-shadow] duration-500 ' +
  'hover:brightness-110 hover:shadow-[0_30px_70px_rgba(69,76,165,0.34)]';

export default function HeroFacetas() {
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(0);

  const abrir = (i: number) => {
    setIndice(i);
    setAbierto(true);
  };

  const posicion = (lado: 'izq' | 'der') => {
    const signo = lado === 'izq' ? -1 : 1;
    return {
      left: '50%',
      top: ALTURA_VERTICAL,
      transform: `translate(calc(-50% + ${signo * SEPARACION}px), -50%) rotate(${signo * 6}deg)`,
    } as const;
  };

  return (
    <>
      {/* Tarjeta izquierda */}
      <button
        type="button"
        onClick={() => abrir(0)}
        aria-label={`Ver galería — ${FACETAS[0].titulo}`}
        className={TARJETA_BASE}
        style={{ ...posicion('izq'), backgroundImage: `url('${FACETAS[0].src}')` }}
      >
        <span className="absolute inset-x-0 bottom-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          {FACETAS[0].titulo}
        </span>
      </button>

      {/* Tarjeta derecha */}
      <button
        type="button"
        onClick={() => abrir(1)}
        aria-label={`Ver galería — ${FACETAS[1].titulo}`}
        className={TARJETA_BASE}
        style={{ ...posicion('der'), backgroundImage: `url('${FACETAS[1].src}')` }}
      >
        <span className="absolute inset-x-0 bottom-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          {FACETAS[1].titulo}
        </span>
      </button>

      {abierto && (
        <GaleriaModal
          imagenes={FACETAS}
          indice={indice}
          onIndice={setIndice}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </>
  );
}
