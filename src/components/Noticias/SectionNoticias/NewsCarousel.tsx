import { useEffect, useState } from 'react';
import NewsFeedCard from './FeedCard';
import ArrowButton from '@components/ui/ArrowButton/ArrowButton';
import { useDragToScroll } from '@hooks/useDragToScroll';
import type { NoticiaFeed } from '@lib/db';

interface NewsCarouselProps {
  titulo: string;
  noticias: NoticiaFeed[];
  onAbrirModal: (id: number | string) => void;
  compacto?: boolean;
}

export default function NewsCarousel({
  titulo,
  noticias,
  onAbrirModal,
  compacto = false,
}: NewsCarouselProps) {
  const { trackRef, isDragging, onMouseDown, onMouseMove, onMouseUp } =
    useDragToScroll<HTMLDivElement>({ speed: 1.5 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const amount = 340;
    const newScroll =
      direction === 'left'
        ? trackRef.current.scrollLeft - amount
        : trackRef.current.scrollLeft + amount;
    trackRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  const handleItemClick = (id: number | string) => {
    if (!isDragging.current) {
      onAbrirModal(id);
    }
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
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
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