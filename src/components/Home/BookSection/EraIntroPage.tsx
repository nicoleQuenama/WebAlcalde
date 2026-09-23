import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import { ERA_WITH_PORTRAIT, REVEAL_EFFECT } from '@constants/book/book3D';
import type { EraTemario } from '@lib/db';
import type { IMG } from '@types/book3D';
import Page from '@components/Home/BookSection/Page';
import FigurePhoto from '@components/Home/BookSection/FigurePhoto';

/** Página de apertura de una era. La era con retrato (`ERA_WITH_PORTRAIT`) lleva foto del alcalde. */
export default function EraIntroPage({ era, photo }: { era: EraTemario; photo?: IMG }) {
  const s = createClasses(styles);
  const hasPortrait = era.id === ERA_WITH_PORTRAIT;
  return (
    <Page>
      <span className={s('caption')} data-reveal={REVEAL_EFFECT.BASE}>
        {era.eyebrow}
      </span>
      <h3 className={s('pageTitle')} data-reveal={REVEAL_EFFECT.BASE}>
        {era.titulo}
      </h3>
      <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal={REVEAL_EFFECT.BASE}>
        {era.bajada}
      </p>
      <FigurePhoto photo={photo} variant={hasPortrait ? 'portrait' : 'context'} />
    </Page>
  );
}