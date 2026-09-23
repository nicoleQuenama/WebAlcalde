import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import { REVEAL_EFFECT } from '@constants/book/book3D';
import type { Capitulo } from '@lib/db';
import type { IMG } from '@types/book3D';
import Page from '@components/Home/BookSection/Page';
import FigurePhoto from '@components/Home/BookSection/FigurePhoto';

/** "El inicio de una nueva Cochabamba": página de apertura de la segunda etapa. */
export default function NewCochabambaPage({
  chapter,
  photo,
}: {
  chapter: Capitulo;
  photo?: IMG;
}) {
  const s = createClasses(styles);
  return (
    <Page>
      <h3 className={s('pageTitle')} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.titulo}
      </h3>
      <p className={s('pageLead')} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.eyebrow}
      </p>
      <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.bajada}
      </p>
      <FigurePhoto photo={photo} variant="context" />
    </Page>
  );
}