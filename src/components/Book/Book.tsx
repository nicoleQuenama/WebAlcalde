import type { ReactNode } from 'react';
import styles from './Book.module.css';

export interface IMG {
  src: string;
  alt: string;
}

export interface Video {
  src: string;
  alt: string;
}

export interface BookProps {
  /** URL de la imagen de portada */
  coverImage: string;
  /** Fotos del alcalde */
  alcalde: IMG[];
  /** Fotos con la gente */
  gente: IMG[];
  /** Videos por página */
  videos: Video[];
  /** Contenido extra que se añade tras la contraportada, o para reemplazar páginas */
  children?: ReactNode;
}

const s = (c: string) =>
  c === 'coverTitle' ? 'cover-title'
  : c === 'pageTitle' ? 'page-title'
  : c === 'backTitle' ? 'back-title'
  : (styles[c as keyof typeof styles] ?? c);

export default function Book({ coverImage, alcalde, gente, videos }: BookProps) {
  const [a1, a2, a3, a4] = alcalde;
  const [g1, g2, g3, g4, g5] = gente;
  const [playa, laguna, terminal, fexco, market, vet, permiso] = videos;

  return (
    <>
      {/* 1. PORTADA */}
      <div className={s('cover')}>
        <img className={s('coverImg')} src={coverImage} alt="Cochabamba, ciudad tecnológica" />
        <div className={s('coverColor')}></div>
        <div className={s('coverContent')}>
          <span className={s('coverBadge')} data-reveal>Libro Digital</span>
          <h2 className={s('coverTitle')} data-reveal>Cochabamba<br />Ciudad Tecnológica</h2>
          <p className={s('coverSubtitle')} data-reveal>Obras, servicios y gestión 2026</p>
        </div>
        <div className={s('coverShine')}></div>
      </div>

      {/* 2. INTRODUCCIÓN */}
      <div className={s('page')}>
        <div className={s('pageInner')}>
          <h3 className={s('pageTitle')} data-reveal>Introducción</h3>
          <p className={s('pageText')} data-reveal>
            Libro digital que muestra la gestión de la Alcaldía de Cochabamba, con obras, servicios y proyectos que transforman la ciudad y mejoran la calidad de vida de sus habitantes.
          </p>

          <figure className={s('mediaInline')}>
            <img
              data-expand
              data-reveal="zoom"
              data-url={a1?.src}
              data-alt={a1?.alt ?? 'El alcalde de Cochabamba'}
              src={a1?.src}
              alt={a1?.alt ?? 'El alcalde de Cochabamba'}
              loading="lazy"
            />
          </figure>

          <p className={s('pageText')} data-reveal>
            Navega con las flechas del teclado, arrastra las esquinas o usa el
            slider inferior. Toca cualquier imagen o video para verlo en
            pantalla completa.
          </p>
        </div>
      </div>

      {/* 3. EL ALCALDE */}
      <div className={s('page')}>
        <div className={s('pageInner')}>
          <h3 className={s('pageTitle')} data-reveal>El Alcalde</h3>

          <figure className={s('mediaFeature')}>
            <img
              data-expand
              data-reveal="zoom"
              data-url={a2?.src}
              data-alt={a2?.alt ?? 'El alcalde'}
              src={a2?.src}
              alt={a2?.alt ?? 'El alcalde'}
              loading="lazy"
            />
          </figure>

          <div className={s('mediaStrip')} data-reveal="left">
            <figure data-expand data-url={a3?.src} data-alt={a3?.alt ?? 'Alcalde'}>
              <img src={a3?.src} alt={a3?.alt ?? 'Alcalde'} loading="lazy" />
            </figure>
            <figure data-expand data-url={a4?.src} data-alt={a4?.alt ?? 'Alcalde'}>
              <img src={a4?.src} alt={a4?.alt ?? 'Alcalde'} loading="lazy" />
            </figure>
          </div>

          <p className={s('caption')} data-reveal>
            Toca cualquier imagen para verla en grande.
          </p>
        </div>
      </div>

      {/* 4. CON LA GENTE */}
      <div className={s('page')}>
        <div className={s('pageInner')}>
          <h3 className={s('pageTitle')} data-reveal>Con la Gente</h3>

          <div className={s('mediaRow')} data-reveal="left">
            <figure className={s('figureWider')} data-expand data-url={g1?.src} data-alt={g1?.alt ?? 'Con la comunidad'}>
              <img src={g1?.src} alt={g1?.alt ?? 'Con la comunidad'} loading="lazy" />
            </figure>
            <figure data-expand data-url={g2?.src} data-alt={g2?.alt ?? 'Con la comunidad'}>
              <img src={g2?.src} alt={g2?.alt ?? 'Con la comunidad'} loading="lazy" />
            </figure>
          </div>

          <div className={s('mediaStrip')} data-reveal="right">
            <figure data-expand data-url={g3?.src} data-alt={g3?.alt ?? 'Con la comunidad'}>
              <img src={g3?.src} alt={g3?.alt ?? 'Con la comunidad'} loading="lazy" />
            </figure>
            <figure data-expand data-url={g4?.src} data-alt={g4?.alt ?? 'Con la comunidad'}>
              <img src={g4?.src} alt={g4?.alt ?? 'Con la comunidad'} loading="lazy" />
            </figure>
            <figure data-expand data-url={g5?.src} data-alt={g5?.alt ?? 'Con la comunidad'}>
              <img src={g5?.src} alt={g5?.alt ?? 'Con la comunidad'} loading="lazy" />
            </figure>
          </div>

          <p className={s('caption')} data-reveal>
            La gestión de cerca, junto a los vecinos.
          </p>
        </div>
      </div>

      {/* PÁGINAS DE VIDEO */}
      {[
        { title: 'Playa Turquesa', video: playa, caption: 'Toca el video para verlo en pantalla completa.' },
        { title: 'Laguna Alalay', video: laguna, caption: 'Un pulmón verde para la ciudad.' },
        { title: 'Nueva Infraestructura', video: terminal, caption: 'Toca el video para verlo en pantalla completa.' },
        { title: 'FEXCO Arena', video: fexco, caption: 'Espacios nuevos para la ciudad.' },
        { title: 'Cocha Market', video: market, caption: 'Comercio y servicios digitales para todos.' },
        { title: 'Clínica Veterinaria Municipal', video: vet, caption: 'Toca el video para verlo en pantalla completa.' },
        { title: 'Permiso de Viaje Digital', video: permiso, caption: 'Portal digital para trámites municipales.' },
      ].map(({ title, video, caption }) => (
        <div className={s('page')} key={title}>
          <div className={s('pageInner')}>
            <h3 className={s('pageTitle')} data-reveal>{title}</h3>
            <div
              className={s('videoFrame')}
              data-expand
              data-video
              data-url={video?.src}
              data-alt={video?.alt ?? `Video - ${title}`}
              data-reveal="right"
            >
              <div className={s('videoPlaceholder')}>
                <span className={s('playIcon')}>▶</span>
                <span>{video?.alt ?? title}</span>
              </div>
            </div>
            <p className={s('caption')} data-reveal>{caption}</p>
          </div>
        </div>
      ))}

      {/* 12. CONTRAPORTADA */}
      <div className={s('backCover')}>
        <div className={s('backCoverContent')}>
          <h3 className={s('backTitle')} data-reveal>Fin</h3>
          <p className={s('backText')} data-reveal>Cochabamba, ciudad que avanza</p>
        </div>
        <div className={s('coverShine')}></div>
      </div>
    </>
  );
}
