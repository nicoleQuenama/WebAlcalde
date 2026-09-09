import { useState, useEffect } from 'react';
import { ajusteImagen, type Encuadre, type AjusteCarrusel } from '../../lib/ajusteImagen';

/**
 * Imagen del carrusel del hero (y del libro): misma foto con opciones de
 * encuadre/zoom. Ver `src/lib/ajusteImagen.ts`.
 */
export interface TarjetaImagen {
  id: number | string;
  src: string;
  /** Texto opcional que se muestra sobre la tarjeta y en la galería. */
  titulo?: string;
  /** Dimensiones reales de la foto (para optimizarla sin deformar). */
  w?: number;
  h?: number;
  encuadre?: Encuadre;
  /**
   * Zoom out en la card: alarga la zona visible (menos recorte arriba/abajo).
   * Solo aplica a la card, NO al modal.
   */
  zoomOut?: boolean;
  /**
   * Valores EXACTOS de ajuste por imagen (tal como los copias del playground).
   * Tienen prioridad sobre `encuadre`/`zoomOut`.
   * Ejemplo: { objectFit: 'cover', objectPosition: '46% 40%', scale: 1.18 }
   */
  ajuste?: AjusteCarrusel;
}

const IMAGENES_DEFECTO: TarjetaImagen[] = [];

interface Props {
  /** Imágenes del carrusel (se pasan siempre desde el Hero o Proyectos). */
  imagenes: TarjetaImagen[];
  /** Autoplay del carrusel (ms). 0 = sin autoplay. */
  autoplayMs?: number;
}

/**
 * Las tarjetas siempre muestran un recorte cuadrado de la foto; el encuadre y
 * el zoom por imagen se calculan con `ajusteImagen` (igual que el libro).
 */
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
  const cerrarModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalAbierto(false);
  };

  const actualImg = IMAGENES[actual];

  return (
    <>
      <div className="relative flex w-full items-center justify-center h-[420px] sm:h-[480px] lg:h-[540px] pb-10">
        <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px]">
          {IMAGENES.map((img, index) => {
            let posicion = 'oculta';
            if (index === actual) posicion = 'centro';
            else if (index === (actual - 1 + IMAGENES.length) % IMAGENES.length) posicion = 'izquierda';
            else if (index === (actual + 1) % IMAGENES.length) posicion = 'derecha';

            const estilosBase =
              `absolute top-0 left-0 w-full h-full rounded-3xl overflow-hidden bg-slate-900 border border-white/30 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]`;

            const estilosPosicion = {
              centro:
                'z-30 scale-100 translate-x-0 rotate-0 opacity-100 cursor-pointer',
              izquierda: 'z-20 scale-90 -translate-x-36 -rotate-6 opacity-40 cursor-pointer hover:opacity-80',
              derecha: 'z-20 scale-90 translate-x-36 rotate-6 opacity-40 cursor-pointer hover:opacity-80',
              oculta: 'z-10 scale-75 opacity-0',
            };

            return (
              <div
                key={img.id}
                className={`${estilosBase} ${estilosPosicion[posicion as keyof typeof estilosPosicion]}`}
                onClick={() => {
                  if (posicion === 'centro') abrirModal();
                  if (posicion === 'izquierda') anterior();
                  if (posicion === 'derecha') siguiente();
                }}
              >
                {/* Imagen de la tarjeta: cubre el marco respetando proporción según su encuadre */}
                <img
                  src={img.src}
                  alt={img.titulo ?? ''}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                  style={cardAjuste(img)}
                />
                {posicion === 'centro' && img.titulo && (
                  <span className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-10 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    {img.titulo}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 flex gap-8 z-40">
          <button
            onClick={anterior}
            aria-label="Anterior"
            className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full text-white transition-transform hover:scale-110"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={siguiente}
            aria-label="Siguiente"
            className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full text-white transition-transform hover:scale-110"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-3xl animate-[fadeIn_0.3s_ease-out]"
          onClick={cerrarModal}
        >
          <button
            onClick={cerrarModal}
            className="fixed top-24 right-4 lg:top-28 lg:right-10 bg-white/10 hover:bg-white/30 border border-white/20 text-white p-3 lg:p-4 rounded-full backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:rotate-90 z-[1000] shadow-2xl"
            aria-label="Cerrar galería"
          >
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); anterior(); }}
            className="absolute left-4 lg:left-12 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-4 hover:scale-110 transition-all z-[110]"
            aria-label="Anterior"
          >
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <figure className="mt-16 flex max-h-[85vh] max-w-[90vw] flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={actualImg.src}
              alt={actualImg.titulo ?? 'Ampliación'}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl animate-[zoomIn_0.4s_ease-out] object-contain"
            />
            {actualImg.titulo && (
              <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-white/90">
                {actualImg.titulo}
              </figcaption>
            )}
          </figure>

          <button
            onClick={(e) => { e.stopPropagation(); siguiente(); }}
            className="absolute right-4 lg:right-12 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-4 hover:scale-110 transition-all z-[110]"
            aria-label="Siguiente"
          >
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
