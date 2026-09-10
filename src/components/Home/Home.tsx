/**
 * Home.tsx — Archivo principal que ensambla todas las secciones del Home.
 *
 * Secciones:
 *   1. Hero          — título del libro + nombre del alcalde (carrusel de fotos).
 *   2. BiographyVideo — el video, justo después del hero.
 *   3. ComparatingProjects — comparador grande "antes / después".
 *   4. BookSection   — introducción al libro digital.
 */

import Hero from '@components/global/Hero/Hero.astro';
import HeroCards from '@components/global/Hero/HeroCard';
import type { TarjetaImagen } from '@components/global/Hero/HeroCard';
import ComparingProjects from './ComparatingProjects/ProjectSlide';
import type { ParComparador } from './ComparatingProjects/ProjectSlide';
import BookSection from './BookSection/Book3D';
import type { BookProps } from './BookSection/Book3D';

interface HomeProps {
  /** Imágenes del carrusel del hero */
  imagenesHero: TarjetaImagen[];
  /** URL de la imagen de fondo del hero */
  fondoSrc: string;
  /** Video de biografía */
  videoBiografia: string;
  /** Poster del video de biografía */
  posterBiografia: string;
  /** Pares de imágenes antes/después */
  paresComparador: ParComparador[];
  /** Props del libro digital */
  bookProps: BookProps;
  /** Autoplay del carrusel (ms) */
  autoplayMs?: number;
}

export default function Home({
  imagenesHero,
  fondoSrc,
  videoBiografia,
  posterBiografia,
  paresComparador,
  bookProps,
  autoplayMs = 4500,
}: HomeProps) {
  return (
    <>
      {/* HERO */}
      <Hero fondoSrc={fondoSrc} eyebrow="Cocha, la mejor ciudad de Bolivia" titulo="Manfred Reyes Villa">
        <HeroCards imagenes={imagenesHero} autoplayMs={autoplayMs} />
      </Hero>

      {/* VIDEO DE BIOGRAFÍA */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-primary">
            Manfred Reyes Villa
          </p>
          <h2 className="mt-4 text-[1.9rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-4xl">
            La ciudad, contada en un video
          </h2>

          <figure className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <video
              className="aspect-video bg-slate-900 object-cover object-[50%_7%]"
              src={videoBiografia}
              poster={posterBiografia}
              controls
              preload="metadata"
              playsInline
            ></video>
            <figcaption className="bg-slate-50 px-4 py-2 text-xs font-medium italic text-slate-400">
              Manfred Reyes Villa — su historia y su vínculo con Cochabamba.
            </figcaption>
          </figure>

          <a
            href="/sobre"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition-transform hover:-translate-y-0.5"
          >
            Conocer al alcalde
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      </section>

      {/* ANTES / DESPUÉS */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28">
          <header className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-primary">
              Antes y después
            </p>
            <h2 className="mt-4 text-[1.9rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-4xl">
              De una ciudad de ayer a una que mira al futuro
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Desliza el tirador para comparar cada punto; usa las flechas para pasar al siguiente.
            </p>
          </header>

          <div className="mt-12">
            <ComparingProjects pares={paresComparador} />
          </div>
        </div>
      </section>

      {/* INTRODUCCIÓN AL LIBRO DIGITAL */}
      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16 lg:px-8 lg:py-20">
          <header className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-accent">
              El libro digital
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Un recorrido en imágenes por las obras que transformaron Cochabamba, de los años 90 a
              la gestión 2021–2026. Ábrelo y hojéalo página por página, con fotos y videos.
            </p>
          </header>

          <BookSection {...bookProps} />
        </div>
      </section>
    </>
  );
}
