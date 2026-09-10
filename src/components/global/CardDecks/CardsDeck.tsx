/**
 * Contenedor principal de las tarjetas.
 * Renderiza un grupo de tarjetas con navegación flechas.
 * las rutas en solo archivo, la estructura
 */
import { useState, useCallback, useEffect } from 'react';
import CardDeck from './CardDeck';
import useSlideCardDeck from '@hooks/cardDecks/useSlideCardDeck';

export interface CardData {
  id: string | number;
  image: string;
  content: string;
  title?: string;
}

interface CardsDeckProps {
  cards: CardData[];
  visibleCount?: number;
  autoplayMs?: number;
  className?: string;
}

export default function CardsDeck({
  cards,
  visibleCount = 3,
  autoplayMs = 0,
  className = '',
}: CardsDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = cards.length;

  const goTo = useCallback(
    (delta: number) => {
      setCurrentIndex((prev) => (prev + delta + total) % total);
    },
    [total]
  );

  useSlideCardDeck({ total, autoplayMs, onNavigate: goTo });

  // Escuchador de eventos de Astro
  useEffect(() => {
    const handleNext = () => goTo(1);
    const handlePrev = () => goTo(-1);

    document.addEventListener('deck:nextSlide', handleNext as EventListener);
    document.addEventListener('deck:prevSlide', handlePrev as EventListener);

    return () => {
      document.removeEventListener('deck:nextSlide', handleNext as EventListener);
      document.removeEventListener('deck:prevSlide', handlePrev as EventListener);
    };
  }, [goTo]);

  if (total === 0) return null;

  const visibleCards: CardData[] = [];
  for (let i = 0; i < visibleCount; i++) {
    const idx = (currentIndex + i) % total;
    visibleCards.push(cards[idx]);
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-6 overflow-hidden px-12">
        {visibleCards.map((card, idx) => (
          <CardDeck
            key={card.id}
            image={card.image}
            content={card.content}
            title={card.title}
            isActive={idx === Math.floor(visibleCount / 2)}
          />
        ))}
      </div>

      {total > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {cards.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir a tarjeta ${idx + 1}`}
              aria-current={idx === currentIndex}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}