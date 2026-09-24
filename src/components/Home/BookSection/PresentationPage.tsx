import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import { REVEAL_EFFECT } from '@constants/book/book3D';
import type { Capitulo } from '@lib/db';
import type { IMG } from '@type/book3D';
import Page from '@components/Home/BookSection/Page';
import FigurePhoto from '@components/Home/BookSection/FigurePhoto';

/** Presentación del alcalde: retrato grande a figura completa. */
export default function PresentationPage({
  chapter,
  photo,
}: {
  chapter: Capitulo;
  photo?: IMG;
}) {
  const s = createClasses(styles);
  return (
    <Page>
      <span className={s('caption')} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.eyebrow}
      </span>
      <h3 className={s('pageTitle')} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.titulo}
      </h3>
      <FigurePhoto photo={photo} variant="portrait" />
      <p className={`${s('pageLead')} ${s('bajadaClamp')}`} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.bajada}
      </p>
    </Page>
  );
}