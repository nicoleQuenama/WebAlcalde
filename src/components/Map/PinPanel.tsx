import { useEffect, useState } from 'react';
import styles from './Map.module.css';

export interface PinDatos {
  nombre: string;
  coords: [number, number];
  descripcion?: string;
  imagenes: string[];
}

interface Props {
  pin: PinDatos;
  onCerrar: () => void;
}

export default function PinPanel({ pin, onCerrar }: Props) {
  const total = pin.imagenes.length;
  const [indice, setIndice] = useState(0);

  useEffect(() => setIndice(0), [pin]);

  const anterior = () => setIndice((i) => (i - 1 + total) % total);
  const siguiente = () => setIndice((i) => (i + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      else if (e.key === 'ArrowLeft') anterior();
      else if (e.key === 'ArrowRight') siguiente();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const imagen = total > 0 ? pin.imagenes[Math.min(indice, total - 1)] : null;

  return (
    <div
      className={styles.panelOverlay}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${pin.nombre}`}
    >
      <aside className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <header className={styles.panelHeader}>
          <div>
            <h3 className={styles.panelTitulo}>{pin.nombre}</h3>
            {pin.descripcion && <p className={styles.panelDescripcion}>{pin.descripcion}</p>}
          </div>
          <button type="button" className={styles.panelCerrar} onClick={onCerrar} aria-label="Cerrar panel">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className={styles.carousel}>
          {imagen && (
            <img
              key={imagen}
              src={imagen}
              alt={`${pin.nombre} — foto ${indice + 1}`}
              className={styles.carouselImg}
              loading="lazy"
              decoding="async"
            />
          )}
          {total > 1 && (
            <>
              <button type="button" className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`} onClick={anterior} aria-label="Foto anterior">
                ‹
              </button>
              <button type="button" className={`${styles.carouselBtn} ${styles.carouselBtnNext}`} onClick={siguiente} aria-label="Foto siguiente">
                ›
              </button>
            </>
          )}
        </div>

        {total > 0 && (
          <footer className={styles.panelFooter}>
            <div className={styles.carouselDots} aria-label="Seleccionar foto">
              {pin.imagenes.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={`${styles.dot} ${i === indice ? styles.dotActive : ''}`}
                  onClick={() => setIndice(i)}
                  aria-label={`Ir a la foto ${i + 1}`}
                />
              ))}
            </div>
            <span className={styles.carouselContador}>
              {String(indice + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </footer>
        )}
      </aside>
    </div>
  );
}