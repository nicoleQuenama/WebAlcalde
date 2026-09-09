import { useRef, useState, useCallback } from 'react';
import type { ImageSliderProps } from './types';
import styles from './ImageSlider.module.css';

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export default function ImageSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'ANTES',
  afterLabel = 'DESPUÉS',
  initialPosition = 50,
  className,
  afterFit,
  afterPosition,
  afterScale,
}: ImageSliderProps) {
  const [position, setPosition] = useState(clamp(initialPosition));
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0) return;
    const relative = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(relative));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      updateFromClientX(e.clientX);
    },
    [updateFromClientX]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      updateFromClientX(e.clientX);
    },
    [updateFromClientX]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className ?? ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <img
        className={styles.after}
        src={afterImage}
        alt={afterLabel}
        draggable={false}
        loading="lazy"
        style={
          afterFit || afterPosition || afterScale
            ? {
                objectFit: afterFit,
                objectPosition: afterPosition,
                transform: afterScale ? `scale(${afterScale})` : undefined,
              }
            : undefined
        }
      />

      <div
        className={styles.before}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          className={styles.after}
          src={beforeImage}
          alt={beforeLabel}
          draggable={false}
          loading="lazy"
        />
      </div>

      <span className={styles.labelBefore}>{beforeLabel}</span>
      <span className={styles.labelAfter}>{afterLabel}</span>

      <div
        className={styles.handle}
        style={{ left: `${position}%` }}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-label="Comparar antes y después"
        tabIndex={0}
      >
        <div className={styles.handleLine} />
        <div className={styles.handleKnob} aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>
      </div>
    </div>
  );
}
