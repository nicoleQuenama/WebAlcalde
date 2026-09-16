import { useState, useMemo, useRef, useEffect } from 'react';
import NewsFeedCard from './FeedCard';
import type { NoticiaFeed } from '@types/noticiaFeed';
import NewsFilters from './Filters';
import NewsModal from '../Modal';
import ArrowButton from '@components/ui/ArrowButton/ArrowButton';
import { NOTICIAS_DB } from '@constants/noticias';

function CarruselNoticias({
  titulo, 
  noticias, 
  onAbrirModal,
  compacto = false
}: {
  titulo: string;
  noticias: NoticiaFeed[];
  onAbrirModal: (id: number | string) => void;
  compacto?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [noticias]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    scrollStart.current = trackRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const x = e.pageX;
    const walk = (startX.current - x) * 1.5;
    trackRef.current.scrollLeft = scrollStart.current + walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleItemClick = (id: number | string) => {
    if (!isDragging.current) {
      onAbrirModal(id);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const amount = 340;
    const newScroll = direction === 'left' 
      ? trackRef.current.scrollLeft - amount 
      : trackRef.current.scrollLeft + amount;
    trackRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  if (noticias.length === 0) return null;

  return (
    <div style={{ marginBottom: compacto ? '0' : '3rem' }}>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-1 rounded-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-light)] ${compacto ? 'h-6 bg-gradient-to-b from-[var(--color-primary)]/50 to-[var(--color-primary-light)]/50' : ''}`}></div>
          <h2 className={`text-xl font-bold text-[var(--color-text-primary)] ${compacto ? 'text-lg font-semibold text-[var(--color-text-secondary)]' : ''}`}>
            {titulo}
          </h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-border)] to-transparent"></div>
      </div>
      
      <div className="relative">
        {canScrollLeft && (
          <ArrowButton
            direction="left"
            variant="carousel"
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="!-left-2.5 md:!-left-5"
          />
        )}

        <div 
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 pr-4 cursor-grab [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing active:snap-proximity"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {noticias.map(noticia => (
            <div 
              key={noticia.id} 
              onClick={() => handleItemClick(noticia.id)} 
              className="flex-none w-[300px] sm:w-[320px] snap-start"
            >
              <NewsFeedCard noticia={noticia} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <ArrowButton
            direction="right"
            variant="carousel"
            onClick={() => scroll('right')}
            aria-label="Siguiente"
            className="!-right-2.5 md:!-right-5"
          />
        )}
      </div>
    </div>
  );
}

export default function Feed() {
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [indiceActual, setIndiceActual] = useState(0);

  // Ordenar y filtrar noticias por búsqueda
  const noticiasFiltradas = useMemo(() => {
    const base = [...NOTICIAS_DB].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    if (!busqueda.trim()) return base;
    const q = busqueda.toLowerCase();
    return base.filter(
      (n) =>
        n.titulo.toLowerCase().includes(q) ||
        n.categoria.toLowerCase().includes(q) ||
        n.resumen.toLowerCase().includes(q)
    );
  }, [busqueda]);

  const ultimasNoticias = noticiasFiltradas.slice(0, 4);
  const masNoticias = noticiasFiltradas.slice(4);

  const abrirModal = (id: number | string) => {
    const index = noticiasFiltradas.findIndex(n => n.id === id);
    setIndiceActual(index);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const noticiaSiguiente = () => {
    setIndiceActual((prev) => (prev === noticiasFiltradas.length - 1 ? 0 : prev + 1));
  };

  const noticiaAnterior = () => {
    setIndiceActual((prev) => (prev === 0 ? noticiasFiltradas.length - 1 : prev - 1));
  };

  return (
    <section id="feed-noticias" className="animate-[fadeInUp_0.6s_ease-out_forwards]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="text-[1.875rem] font-bold text-[var(--color-text-primary)] md:text-[2.25rem]">Últimas Noticias</h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-text-secondary)]">
            Mantente informado sobre los proyectos, obras y avances más recientes de nuestra ciudad.
          </p>
        </div>

        <NewsFilters
          busqueda={busqueda} setBusqueda={setBusqueda}
        />

        {ultimasNoticias.length > 0 && (
          <CarruselNoticias 
            titulo="Últimas Noticias"
            noticias={ultimasNoticias}
            onAbrirModal={abrirModal}
          />
        )}

        {masNoticias.length > 0 && (
          <CarruselNoticias 
            titulo="Más Noticias"
            noticias={masNoticias}
            onAbrirModal={abrirModal}
            compacto
          />
        )}

        {noticiasFiltradas.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-hover)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
                <path d="M8 11h6"/>
              </svg>
            </div>
            <p className="text-lg font-medium text-[var(--color-text-secondary)]">No se encontraron noticias</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Intenta con otros términos de búsqueda.</p>
            <button 
              onClick={() => setBusqueda('')} 
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border-none bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--color-primary-deep)] hover:shadow-[0_10px_15px_-3px_rgba(71,45,130,0.2)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Limpiar búsqueda
            </button>
          </div>
        )}

        <NewsModal 
          isOpen={modalAbierto} 
          noticia={noticiasFiltradas[indiceActual] || null} 
          onClose={cerrarModal}
          onNext={noticiaSiguiente}
          onPrev={noticiaAnterior}
          todasLasNoticias={noticiasFiltradas}
          indiceActual={indiceActual}
        />

      </div>
    </section>
  );
}
