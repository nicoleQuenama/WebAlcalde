import { useState, useEffect } from 'react';

interface Props {
  fondos: string[];
  autoplayMs?: number;
}

export default function CarouselFondo({ fondos, autoplayMs = 5000 }: Props) {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!autoplayMs || fondos.length < 2) return;
    const intervalo = setInterval(() => {
      setActual((prev) => (prev + 1) % fondos.length);
    }, autoplayMs);
    return () => clearInterval(intervalo);
  }, [autoplayMs, fondos.length]);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
      {fondos.map((src, index) => {
        const activo = index === actual;
        return (
          <img
            key={src}
            src={src}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'low'}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: activo ? 1 : 0,
              transition: 'opacity 1500ms ease-in-out',
              pointerEvents: activo ? 'auto' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}