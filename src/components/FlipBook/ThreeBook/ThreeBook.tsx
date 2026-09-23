import { useEffect, useRef, useState } from 'react';
import styles from './ThreeBook.module.css';
import type { ThreeBookProps } from '../../../types/threeBook';
import { THREE_BOOK_COLORS } from '@constants/threeBook';
import { startThreeBook } from '@lib/threeBookScene';

// El acento (tapa, lomo y espina del libro) es el color de marca. FlipBook no
// pasa `accent`, así que lo tomamos del CSS global (--color-primary) en el
// navegador. En SSR (sin `document`) cae al mismo #472d82 de global.css.
function readBrandAccent(fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() ||
    fallback
  );
}

export default function ThreeBook({
  coverLabel = 'Cocha',
  accent: accentProp = THREE_BOOK_COLORS.accent,
  coverImage,
  onOpen,
}: ThreeBookProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  const labelText = coverLabel ?? 'Cocha';

  const [accent] = useState<string>(() => readBrandAccent(accentProp));

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    return startThreeBook(wrap, { label: labelText, accent, coverImage });
  }, [labelText, accent, coverImage]);

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      role="button"
      tabIndex={0}
      aria-label={`Abrir libro ${labelText}`}
      onClick={() => openRef.current?.()}
      onKeyDown={(e) => {
        if (e.repeat) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openRef.current?.();
        }
      }}
    />
  );
}