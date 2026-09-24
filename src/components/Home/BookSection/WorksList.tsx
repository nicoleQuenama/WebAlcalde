import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import {
  REVEAL_EFFECT,
  VISIBLE_WORKS_LIMIT,
  REMAINING_WORKS_TEXT,
} from '@constants/book/book3D';
import type { SeccionTemario } from '@lib/db';

/** Lista compacta de obras de una sección (máx. N visibles + fila "y N más"). */
export default function WorksList({ section }: { section: SeccionTemario }) {
  const s = createClasses(styles);
  const visibleWorks = section.obras.slice(0, VISIBLE_WORKS_LIMIT);
  const remaining = section.obras.length - visibleWorks.length;
  return (
    <ul className={s('obraList')} data-reveal={REVEAL_EFFECT.LEFT}>
      {visibleWorks.map((work) => (
        <li key={work.nombre}>
          <span>{work.nombre}</span>
          {work.anio ? <em>{work.anio}</em> : null}
        </li>
      ))}
      {remaining > 0 ? (
        <li className={s('obraMas')}>{REMAINING_WORKS_TEXT(remaining)}</li>
      ) : null}
    </ul>
  );
}