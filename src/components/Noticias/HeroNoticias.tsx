import { useState, useEffect, useRef } from 'react';
import GaleriaModal from '@components/global/Hero/GaleriaModal';

interface Noticia {
  id: number | string;
  src: string;
  titulo: string;
}

interface Props {
  noticias: Noticia[];
}

export default function HeroNoticias({ noticias }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [indiceActual, setIndiceActual] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const abrirModal = (index: number) => {
    setIndiceActual(index);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    scrollStart.current = trackRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const walk = (startX.current - e.pageX) * 1.5;
    trackRef.current.scrollLeft = scrollStart.current + walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleClick = (index: number) => {
    if (!isDragging.current) {
      abrirModal(index);
    }
  };

  return (
    <>
      <div className="ticker-wrapper">
        <div 
          ref={trackRef}
          className="ticker-track py-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {[...noticias, ...noticias].map((noticia, index) => (
            <article 
              key={`${noticia.id}-${index}`}
              className="group relative h-72 w-52 shrink-0 cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/30 bg-slate-900 shadow-xl transition-transform duration-500 hover:-translate-y-2 hover:shadow-primary/40"
              onClick={() => handleClick(index % noticias.length)}
            >
              <img 
                src={noticia.src}
                alt={noticia.titulo}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <span className="absolute inset-x-0 bottom-0 rounded-b-[1.5rem] bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-10 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                {noticia.titulo}
              </span>
            </article>
          ))}
        </div>
      </div>

      {modalAbierto && (
        <GaleriaModal
          imagenes={noticias.map(n => ({ src: n.src, titulo: n.titulo }))}
          indice={indiceActual}
          onIndice={setIndiceActual}
          onCerrar={cerrarModal}
        />
      )}
    </>
  );
}
