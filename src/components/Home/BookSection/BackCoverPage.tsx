import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import { REVEAL_EFFECT } from '@constants/book/book3D';
import type { BookMeta } from '@type/book3D';

/** Contraportada: título y texto final sobre la tapa dura de cierre. */
export default function BackCoverPage({ meta }: { meta: Required<BookMeta> }) {
  const s = createClasses(styles);
  return (
    <div className={s('backCover')}>
      <footer className={s('backCoverContent')}>
        <h3 className={s('backTitle')} data-reveal={REVEAL_EFFECT.BASE}>
          {meta.backTitle}
        </h3>
        <p className={s('backText')} data-reveal={REVEAL_EFFECT.BASE}>
          {meta.backText}
        </p>
      </footer>
      <div className={s('coverShine')}></div>
    </div>
  );
}