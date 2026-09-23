import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import {
  REVEAL_EFFECT,
  YESTERDAY_CITY_ALT,
  TODAY_CITY_ALT,
} from '@constants/book/book3D';
import type { Capitulo } from '@lib/db';
import type { IMG } from '@types/book3D';
import Page from '@components/Home/BookSection/Page';

/** "Cómo ha crecido Cochabamba": strip antes/después con dos fotos expandibles. */
export default function GrowthPage({
  chapter,
  yesterdayPhoto,
  todayPhoto,
  caption,
}: {
  chapter: Capitulo;
  yesterdayPhoto?: IMG;
  todayPhoto?: IMG;
  caption: string;
}) {
  const s = createClasses(styles);
  return (
    <Page>
      <h3 className={s('pageTitle')} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.titulo}
      </h3>
      <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal={REVEAL_EFFECT.BASE}>
        {chapter.bajada}
      </p>
      <div className={s('mediaStrip')} data-reveal={REVEAL_EFFECT.LEFT}>
        <figure data-expand data-url={yesterdayPhoto?.src} data-alt={YESTERDAY_CITY_ALT}>
          <img src={yesterdayPhoto?.src} alt={YESTERDAY_CITY_ALT} loading="lazy" />
        </figure>
        <figure data-expand data-url={todayPhoto?.src} data-alt={TODAY_CITY_ALT}>
          <img src={todayPhoto?.src} alt={TODAY_CITY_ALT} loading="lazy" />
        </figure>
      </div>
      <p className={s('caption')} data-reveal={REVEAL_EFFECT.BASE}>
        {caption}
      </p>
    </Page>
  );
}