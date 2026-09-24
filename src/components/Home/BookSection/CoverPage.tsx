import { Fragment } from 'react';
import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import { COVER_ALT, REVEAL_EFFECT } from '@constants/book/book3D';
import type { BookMeta } from '@type/book3D';

/** Portada del libro: imagen de tapa, badge, título multilínea y subtítulo. */
export default function CoverPage({
  coverImage,
  meta,
}: {
  coverImage: string;
  meta: Required<BookMeta>;
}) {
  const s = createClasses(styles);
  return (
    <div className={s('cover')}>
      <img className={s('coverImg')} src={coverImage} alt={COVER_ALT} />
      <div className={s('coverColor')}></div>
      <header className={s('coverContent')}>
        <span className={s('coverBadge')} data-reveal={REVEAL_EFFECT.BASE}>
          {meta.coverBadge}
        </span>
        <h2 className={s('coverTitle')} data-reveal={REVEAL_EFFECT.BASE}>
          {meta.coverTitle.split('\n').map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h2>
        <p className={s('coverSubtitle')} data-reveal={REVEAL_EFFECT.BASE}>
          {meta.coverSubtitle}
        </p>
      </header>
      <div className={s('coverShine')}></div>
    </div>
  );
}