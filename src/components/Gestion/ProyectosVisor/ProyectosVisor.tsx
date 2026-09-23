import { useState } from 'react';
import SelectorCategorias from './SelectorCategorias';
import GaleriaMedia from './GaleriaMedia';
import ArrowButton from '@components/ui/ArrowButton/ArrowButton';
import { ESTADO_COLORES } from '@constants/proyectoEstado';
import { SECCION_POR_CATEGORIA } from '@constants/proyectoSecciones';
import type { ProyectosVisorProps } from './types';

const inicialesDe = (titulo: string) =>
  titulo
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export default function ProyectosVisor({ categorias }: ProyectosVisorProps) {
  const [catActiva, setCatActiva] = useState(categorias[0]?.id ?? '');
  const [indice, setIndice] = useState(0);
  // Ítem activo de la mini galería (foto/video) de la obra actual. Se resetea a 0
  // al cambiar de obra o de categoría: cada obra arranca en su primera foto.
  const [indiceMedia, setIndiceMedia] = useState(0);

  const cambiarCategoria = (id: string) => {
    setCatActiva(id);
    setIndice(0);
    setIndiceMedia(0);
  };

  const categoria = categorias.find((c) => c.id === catActiva) ?? categorias[0];
  const obras = categoria?.obras ?? [];
  const total = obras.length;
  const obra = obras[indice % Math.max(total, 1)];

  if (!categoria || !obra) return null;

  const anterior = () => {
    setIndice((prev) => (prev - 1 + total) % total);
    setIndiceMedia(0);
  };
  const siguiente = () => {
    setIndice((prev) => (prev + 1) % total);
    setIndiceMedia(0);
  };

  const tituloSeccion = SECCION_POR_CATEGORIA[categoria.id] ?? categoria.label;
  const itemMedia =
    obra.media.length > 0 ? obra.media[indiceMedia % obra.media.length] : undefined;
  const esVideo = itemMedia?.tipo === 'video';

  return (
    <div className="flex flex-col items-center">
      <SelectorCategorias categorias={categorias} activa={categoria.id} onCambiar={cambiarCategoria} />

      <div className="mt-8 flex w-full items-center gap-3 sm:gap-5">
        {total > 1 && (
          <ArrowButton
            direction="left"
            variant="hero"
            onClick={anterior}
            aria-label={`Obra anterior en ${categoria.label}`}
            className="shrink-0"
          />
        )}

        <div
          id="proyectos-panel"
          role="tabpanel"
          aria-label={`Proyectos: ${categoria.label}`}
          className="min-w-0 flex-1"
        >
          <article
            key={obra.id}
            className="grid overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] md:grid-cols-2"
            data-cms-dominio="proyecto"
            data-cms-clave={obra.id}
          >
            {/* Limitación conocida del CMS inline: el visor renderiza UNA obra a la
                vez, así que el resto de los ítems del dominio `proyecto` solo son
                editables desde el panel del editor, no inline en el preview. */}
            <div className="relative min-h-[240px] md:min-h-[320px]">
              {esVideo && itemMedia ? (
                <video
                  key={indiceMedia}
                  controls
                  playsInline
                  preload="none"
                  poster={itemMedia.poster ?? itemMedia.thumb}
                  src={itemMedia.src}
                  className="absolute inset-0 h-full w-full bg-black object-cover"
                />
              ) : itemMedia ? (
                <img
                  key={indiceMedia}
                  src={itemMedia.src}
                  alt={itemMedia.alt ?? obra.titulo}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full animate-fadeIn object-cover"
                />
              ) : obra.imagenSrc ? (
                <img
                  src={obra.imagenSrc}
                  alt={obra.titulo}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: obra.objectPosition ?? '50% 50%' }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent"
                >
                  <span className="select-none text-6xl font-black tracking-tight text-white/15">
                    {inicialesDe(obra.titulo)}
                  </span>
                </div>
              )}

              {/* Mini galería de la obra (solo si hay más de un ítem de media). */}
              {obra.media.length > 1 && (
                <GaleriaMedia media={obra.media} indice={indiceMedia} onCambiar={setIndiceMedia} />
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-3 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Nombre de la obra como kicker (campo editable del dominio). */}
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent"
                  data-cms-campo="titulo"
                >
                  {obra.titulo}
                </p>
                {obra.estado && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      ESTADO_COLORES[obra.estado] ?? 'border-white/20 text-white/70'
                    }`}
                  >
                    {obra.estado}
                  </span>
                )}
              </div>

              {/*
                Cabezal editorial de la sección. Se resuelve desde el slug de la
                categoría (ver @constants/proyectoSecciones); si no hay título mapeado,
                cae al label. No es editable inline: la categoría se edita en el panel
                del CMS (el dato de la obra es el slug, no este texto).
              */}
              <h3 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                {tituloSeccion}
              </h3>

              <p
                className="text-[15px] leading-relaxed text-white/70"
                data-cms-campo="descripcion"
                data-cms-multilinea
              >
                {obra.descripcion}
              </p>

              <p
                aria-live="polite"
                className="mt-auto pt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45"
              >
                {indice + 1} / {total}
              </p>
            </div>
          </article>
        </div>

        {total > 1 && (
          <ArrowButton
            direction="right"
            variant="hero"
            onClick={siguiente}
            aria-label={`Obra siguiente en ${categoria.label}`}
            className="shrink-0"
          />
        )}
      </div>
    </div>
  );
}