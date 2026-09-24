import styles from './Book.module.css';
import { createClasses } from '@lib/book3D';
import { PLAY_ICON, REVEAL_EFFECT } from '@constants/book/book3D';
import type { SeccionTemario } from '@lib/db';
import type { IMG, Video } from '@type/book3D';
import Page from '@components/Home/BookSection/Page';
import FigurePhoto from '@components/Home/BookSection/FigurePhoto';
import WorksList from '@components/Home/BookSection/WorksList';

/** Página de una subsección del temario: título, bajada, media (video o foto) y lista. */
export default function SectionPage({
  section,
  photo,
  video,
}: {
  section: SeccionTemario;
  photo?: IMG;
  video?: Video;
}) {
  const s = createClasses(styles);
  return (
    <Page>
      <h3 className={s('pageTitle')} data-reveal={REVEAL_EFFECT.BASE}>
        {section.titulo}
      </h3>
      {section.bajada ? (
        <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal={REVEAL_EFFECT.BASE}>
          {section.bajada}
        </p>
      ) : null}

      {video ? (
        <div
          className={s('videoFrame')}
          data-expand
          data-video
          data-url={video.src}
          data-alt={video.alt}
          data-reveal={REVEAL_EFFECT.RIGHT}
        >
          <div className={s('videoPlaceholder')}>
            <span className={s('playIcon')}>{PLAY_ICON}</span>
            <span>{video.alt}</span>
          </div>
        </div>
      ) : (
        <FigurePhoto photo={photo} variant="context" />
      )}

      <WorksList section={section} />
    </Page>
  );
}