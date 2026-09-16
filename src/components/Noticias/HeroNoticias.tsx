import { useState, useRef, useEffect } from 'react';
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
  
  // Referencias para el Drag-to-Scroll y el Auto-Scroll
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isHovered = useRef(false); // pausa si el mouse esta encima
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  const abrirModal = (index: number) => {
    setIndiceActual(index);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  /*SCROLL AUTOMÁTICO*/
  useEffect(() => {
    const track = trackRef.current;
    let animationId: number;

    const playScroll = () => {
      if (track) {
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0;
        }
        if (!isDragging.current && !isHovered.current) {
          track.scrollLeft += 1; // Velocidad: Cambia este número a 0.5 o 2 si lo quieres más lento o rápido
        }
      }
      animationId = requestAnimationFrame(playScroll);
    };

    animationId = requestAnimationFrame(playScroll);
    return () => cancelAnimationFrame(animationId);
  }, []);

  /*EVENTOS DEL MOUSE*/
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - (trackRef.current?.offsetLeft || 0);
    scrollLeftStart.current = trackRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    
    e.preventDefault(); 
    
    const x = e.pageX - (trackRef.current.offsetLeft || 0);
    const distance = x - startX.current;

    if (Math.abs(distance) > 5) {
      hasMoved.current = true;
    }

    // El usuario mueve el carrusel manualmente
    trackRef.current.scrollLeft = scrollLeftStart.current - distance;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleClick = (index: number) => {
    if (!hasMoved.current) {
      abrirModal(index);
    }
  };

  return (
    <>
      {/* Contenedor principal con máscara de degradado */}
      <div className="flex overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]">
        
        {/* Carrusel*/}
        <div 
          ref={trackRef}
          className="flex w-full overflow-x-auto gap-6 py-4 px-[10%] select-none cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={() => (isHovered.current = true)}   
          onMouseLeave={() => { 
            isHovered.current = false; 
            isDragging.current = false; 
          }} 
        >
          {/* Duplicamos las noticias para el efecto infinito */}
          {[...noticias, ...noticias].map((noticia, index) => (
            <article 
              key={`${noticia.id}-${index}`}
              className="group relative h-72 w-52 shrink-0 overflow-hidden rounded-[1.5rem] border border-white/30 bg-slate-900 shadow-xl transition-transform duration-500 hover:-translate-y-2 hover:shadow-primary/40"
              onClick={() => handleClick(index % noticias.length)}
            >
              <img 
                src={noticia.src}
                alt={noticia.titulo}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <span className="absolute inset-x-0 bottom-0 rounded-b-[1.5rem] bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-10 text-sm font-semibold uppercase tracking-[0.18em] text-white pointer-events-none">
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