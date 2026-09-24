import type { ReactNode } from 'react';
import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';

/**
 * Esqueleto de una página del libro: la doble capa `.page`/`.pageInner` que
 * `react-pageflip` cuenta como página (cada hijo directo del fragmento de `Book`).
 */
export default function Page({ children }: { children: ReactNode }) {
  const s = createClasses(styles);
  return (
    <div className={s('page')}>
      <div className={s('pageInner')}>{children}</div>
    </div>
  );
}