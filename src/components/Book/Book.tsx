import type { ReactNode } from 'react';
import styles from './Book.module.css';
import {
  PRESENTACION,
  CRECIMIENTO,
  NUEVA_COCHABAMBA,
  ERAS,
  type SeccionTemario,
  type EraTemario,
} from '../../constants/temario';
import { ajusteImagen, type Encuadre, type AjusteCarrusel } from '../../lib/ajusteImagen';

/**
 * Book — páginas del libro digital (FlipBook).
 *
 * El texto y el orden salen de src/constants/temario.ts, así el libro que se
 * hojea sigue exactamente la misma estructura que la página /gestion:
 *
 *   Portada
 *   → Presentación del alcalde        (retrato grande, foto completa)
 *   → Cómo ha crecido Cochabamba      (antes / después)
 *   → El inicio de una nueva Cochabamba
 *   → "Las obras son memorias" (intro) + 1 página por subsección de los años 90
 *   → "Cuando una ciudad vuelve a soñar en grande" (intro, retrato del alcalde)
 *     + 1 página por subsección 2021–2026
 *   Contraportada
 *
 * Reglas de imagen:
 *   - Donde el alcalde es el protagonista → clase `mediaPortrait`: la foto se ve
 *     COMPLETA (object-fit: contain) y ocupa casi toda la página. Nunca recortada.
 *   - Fotos de contexto / gente → `mediaFeature` / `mediaStrip`, que ahora crecen
 *     para llenar el espacio libre (imágenes más grandes que antes).
 *   - Cada imagen/video con `data-expand` se abre a pantalla completa.
 */

export interface IMG {
  src: string;
  alt: string;
  /** Dimensiones reales de la foto (para optimizarla sin deformar). */
  w?: number;
  h?: number;
  /** Encuadre por foto (misma lógica que las cards del hero). */
  encuadre?: Encuadre;
  zoomOut?: boolean;
  ajuste?: AjusteCarrusel;
}
export interface Video {
  src: string;
  alt: string;
}

export interface BookProps {
  /** Imagen de portada. */
  coverImage: string;
  /** Fotos disponibles para ilustrar páginas (alcalde + gente). */
  fotos: IMG[];
  /** Videos en orden del temario: playa, laguna, terminal, fexco, market, vet, permiso. */
  videos: Video[];
  children?: ReactNode;
}

// Traducción de nombres "bonitos" a las clases globales que el FlipBook usa para
// auto-generar el índice (deben quedar sin hash).
const s = (c: string) =>
  c === 'coverTitle'
    ? 'cover-title'
    : c === 'pageTitle'
      ? 'page-title'
      : c === 'backTitle'
        ? 'back-title'
        : (styles[c as keyof typeof styles] ?? c);

/** Qué video va en qué subsección (por `id` del temario). */
const VIDEO_POR_SECCION: Record<string, number> = {
  'espejos-de-agua': 1, // Laguna Alalay
  vialidad: 2, // Accesos nueva terminal de buses
  alianzas: 3, // FEXCO Arena
  vanguardia: 4, // Cocha Market
  salud: 6, // Clínica veterinaria municipal
};

/** Retrato protagonista: foto del alcalde recortada con el encuadre de las cards del hero. */
function RetratoAlcalde({ foto }: { foto?: IMG }) {
  if (!foto) return null;
  return (
    <figure className={s('mediaPortrait')} data-reveal="zoom">
      <img
        data-expand
        data-url={foto.src}
        data-alt={foto.alt}
        src={foto.src}
        alt={foto.alt}
        loading="lazy"
        style={ajusteImagen(foto)}
      />
    </figure>
  );
}

/** Imagen de contexto (paisaje / gente), recortada con el encuadre de las cards del hero. */
function FotoContexto({ foto }: { foto?: IMG }) {
  if (!foto) return null;
  return (
    <figure className={s('mediaFeature')} data-reveal="zoom">
      <img
        data-expand
        data-url={foto.src}
        data-alt={foto.alt}
        src={foto.src}
        alt={foto.alt}
        loading="lazy"
        style={ajusteImagen(foto)}
      />
    </figure>
  );
}

/** Lista compacta de obras para una página del libro (máx. 5 + "y N más"). */
function ListaObras({ seccion }: { seccion: SeccionTemario }) {
  const visibles = seccion.obras.slice(0, 5);
  const resto = seccion.obras.length - visibles.length;
  return (
    <ul className={s('obraList')} data-reveal="left">
      {visibles.map((obra) => (
        <li key={obra.nombre}>
          <span>{obra.nombre}</span>
          {obra.anio ? <em>{obra.anio}</em> : null}
        </li>
      ))}
      {resto > 0 ? (
        <li className={s('obraMas')}>y {resto} obras más — el detalle completo está en la web</li>
      ) : null}
    </ul>
  );
}

/** Página de una subsección del temario: título, bajada corta, media grande y lista. */
function PaginaSeccion({
  seccion,
  foto,
  video,
}: {
  seccion: SeccionTemario;
  foto?: IMG;
  video?: Video;
}) {
  return (
    <div className={s('page')}>
      <div className={s('pageInner')}>
        <h3 className={s('pageTitle')} data-reveal>
          {seccion.titulo}
        </h3>
        {seccion.bajada ? (
          <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal>
            {seccion.bajada}
          </p>
        ) : null}

        {video ? (
          <div
            className={s('videoFrame')}
            data-expand
            data-video
            data-url={video.src}
            data-alt={video.alt}
            data-reveal="right"
          >
            <div className={s('videoPlaceholder')}>
              <span className={s('playIcon')}>▶</span>
              <span>{video.alt}</span>
            </div>
          </div>
        ) : (
          <FotoContexto foto={foto} />
        )}

        <ListaObras seccion={seccion} />
      </div>
    </div>
  );
}

/** Página de apertura de una era. `sonar-en-grande` lleva retrato del alcalde. */
function PaginaEraIntro({ era, foto }: { era: EraTemario; foto?: IMG }) {
  const conRetrato = era.id === 'sonar-en-grande';
  return (
    <div className={s('page')}>
      <div className={s('pageInner')}>
        <span className={s('caption')} data-reveal>
          {era.eyebrow}
        </span>
        <h3 className={s('pageTitle')} data-reveal>
          {era.titulo}
        </h3>
        <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal>
          {era.bajada}
        </p>
        {conRetrato ? <RetratoAlcalde foto={foto} /> : <FotoContexto foto={foto} />}
      </div>
    </div>
  );
}

export default function Book({ coverImage, fotos, videos }: BookProps) {
  // Fotos con más presencia del alcalde (retrato). El resto son de contexto.
  const retratoPresentacion = fotos[0];
  const retratoEra2 = fotos[5] ?? fotos[0];

  // Índice rotativo para repartir el resto de fotos sin repetir de más.
  let f = 1;
  const nextFoto = (): IMG | undefined => {
    if (!fotos.length) return undefined;
    // salta los retratos ya usados (0 y 5)
    let idx = f++ % fotos.length;
    if (idx === 0 || idx === 5) idx = f++ % fotos.length;
    return fotos[idx];
  };

  return (
    <>
      {/* PORTADA — título tal cual el documento del temario */}
      <div className={s('cover')}>
        <img className={s('coverImg')} src={coverImage} alt="Cocha, la mejor ciudad de Bolivia" />
        <div className={s('coverColor')}></div>
        <div className={s('coverContent')}>
          <span className={s('coverBadge')} data-reveal>
            Libro digital
          </span>
          <h2 className={s('coverTitle')} data-reveal>
            Cocha,
            <br />
            la mejor ciudad de Bolivia
          </h2>
          <p className={s('coverSubtitle')} data-reveal>
            De los años 90 a la gestión 2021 — 2026
          </p>
        </div>
        <div className={s('coverShine')}></div>
      </div>

      {/* PRESENTACIÓN DEL ALCALDE — retrato grande, figura completa */}
      <div className={s('page')}>
        <div className={s('pageInner')}>
          <span className={s('caption')} data-reveal>
            {PRESENTACION.eyebrow}
          </span>
          <h3 className={s('pageTitle')} data-reveal>
            {PRESENTACION.titulo}
          </h3>
          <RetratoAlcalde foto={retratoPresentacion} />
          <p className={`${s('pageLead')} ${s('bajadaClamp')}`} data-reveal>
            {PRESENTACION.bajada}
          </p>
        </div>
      </div>

      {/* CÓMO HA CRECIDO COCHABAMBA (antes / después) */}
      <div className={s('page')}>
        <div className={s('pageInner')}>
          <h3 className={s('pageTitle')} data-reveal>
            {CRECIMIENTO.titulo}
          </h3>
          <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal>
            {CRECIMIENTO.bajada}
          </p>
          <div className={s('mediaStrip')} data-reveal="left">
            <figure data-expand data-url={fotos[1]?.src} data-alt="Cochabamba de ayer">
              <img src={fotos[1]?.src} alt="Cochabamba de ayer" loading="lazy" style={ajusteImagen(fotos[1])} />
            </figure>
            <figure data-expand data-url={fotos[2]?.src} data-alt="Cochabamba hoy">
              <img src={fotos[2]?.src} alt="Cochabamba hoy" loading="lazy" style={ajusteImagen(fotos[2])} />
            </figure>
          </div>
          <p className={s('caption')} data-reveal>
            Fotografías comparativas a través de los años — imágenes de referencia.
          </p>
        </div>
      </div>

      {/* EL INICIO DE UNA NUEVA COCHABAMBA */}
      <div className={s('page')}>
        <div className={s('pageInner')}>
          <h3 className={s('pageTitle')} data-reveal>
            {NUEVA_COCHABAMBA.titulo}
          </h3>
          <p className={s('pageLead')} data-reveal>
            {NUEVA_COCHABAMBA.eyebrow}
          </p>
          <p className={`${s('pageText')} ${s('bajadaClamp')}`} data-reveal>
            {NUEVA_COCHABAMBA.bajada}
          </p>
          <FotoContexto foto={fotos[3]} />
        </div>
      </div>

      {/* LAS DOS ERAS DE OBRAS.
          Ojo: el FlipBook cuenta como página cada hijo directo de este fragmento,
          así que aquí se devuelve una lista PLANA de páginas (flatMap), no divs
          anidados. */}
      {ERAS.flatMap((era) => [
        <PaginaEraIntro
          key={`${era.id}-intro`}
          era={era}
          foto={era.id === 'sonar-en-grande' ? retratoEra2 : fotos[4]}
        />,
        ...era.secciones.map((seccion) => {
          const idxVideo = VIDEO_POR_SECCION[seccion.id];
          const video = idxVideo != null ? videos[idxVideo] : undefined;
          return (
            <PaginaSeccion
              key={seccion.id}
              seccion={seccion}
              video={video}
              foto={video ? undefined : nextFoto()}
            />
          );
        }),
      ])}

      {/* CONTRAPORTADA */}
      <div className={s('backCover')}>
        <div className={s('backCoverContent')}>
          <h3 className={s('backTitle')} data-reveal>
            Fin
          </h3>
          <p className={s('backText')} data-reveal>
            Cochabamba, una ciudad que vuelve a soñar en grande.
          </p>
        </div>
        <div className={s('coverShine')}></div>
      </div>
    </>
  );
}
