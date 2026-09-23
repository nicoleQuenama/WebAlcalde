import { DEFAULT_META } from '@constants/book/book3D';
import type { BookProps } from '@types/book3D';
import { deriveBookPages, eraIntroPhoto, sectionVideo } from '@lib/book3D';
import CoverPage from '@components/Home/BookSection/CoverPage';
import PresentationPage from '@components/Home/BookSection/PresentationPage';
import GrowthPage from '@components/Home/BookSection/GrowthPage';
import NewCochabambaPage from '@components/Home/BookSection/NewCochabambaPage';
import EraIntroPage from '@components/Home/BookSection/EraIntroPage';
import SectionPage from '@components/Home/BookSection/SectionPage';
import BackCoverPage from '@components/Home/BookSection/BackCoverPage';

/**
 * Páginas interiores del libro digital. Orquesta SOLO composición: los datos
 * derivados (retratos por índice, selector de fotos, construcción plana de
 * eras/páginas) viven en `src/lib/book3D.ts` y llegan ya resueltos por props.
 */
export default function Book({
  coverImage,
  chapters,
  eras,
  photos,
  videos,
  meta,
}: BookProps) {
  const bookMeta = { ...DEFAULT_META, ...meta };
  const pages = deriveBookPages(chapters, photos);

  return (
    <>
      {/* PORTADA — título tal cual el documento del temario */}
      <CoverPage coverImage={coverImage} meta={bookMeta} />

      {/* PRESENTACIÓN DEL ALCALDE — retrato grande, figura completa */}
      <PresentationPage
        chapter={pages.presentationChapter}
        photo={pages.presentationPortrait}
      />

      {/* CÓMO HA CRECIDO COCHABAMBA (antes / después) */}
      <GrowthPage
        chapter={pages.growthChapter}
        yesterdayPhoto={pages.yesterdayPhoto}
        todayPhoto={pages.todayPhoto}
        caption={bookMeta.antesDespuesCaption}
      />

      {/* EL INICIO DE UNA NUEVA COCHABAMBA */}
      <NewCochabambaPage
        chapter={pages.newCochabambaChapter}
        photo={pages.newCochabambaContextPhoto}
      />

      {/* LAS DOS ERAS DE OBRAS.
          Ojo: el FlipBook cuenta como página cada hijo directo de este fragmento,
          así que aquí se devuelve una lista PLANA de páginas (flatMap), no divs
          anidados. */}
      {eras.flatMap((era) => [
        <EraIntroPage
          key={`${era.id}-intro`}
          era={era}
          photo={eraIntroPhoto(era.id, pages.era2Portrait, pages.era1IntroPhoto)}
        />,
        ...era.secciones.map((section) => {
          const video = sectionVideo(section.id, videos);
          return (
            <SectionPage
              key={section.id}
              section={section}
              video={video}
              photo={video ? undefined : pages.nextPhoto()}
            />
          );
        }),
      ])}

      {/* CONTRAPORTADA */}
      <BackCoverPage meta={bookMeta} />
    </>
  );
}