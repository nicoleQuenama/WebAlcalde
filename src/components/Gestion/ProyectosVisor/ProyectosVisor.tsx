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

const posicionDe = (objectPosition?: string) => objectPosition ?? '50% 50%';

export default function ProyectosVisor({ categorias }: ProyectosVisorProps) {
  const [catActiva, setCatActiva] = useState(categorias[0]?.id ?? '');
  // Un único estado para el avance de obra + ítem de la mini galería: ambos se
  // resetean juntos al cambiar de categoría o de obra (lineamiento del repo).
  const [avance, setAvance] = useState({ indice: 0, indiceMedia: 0 });
  const { indice, indiceMedia } = avance;

  const cambiarCategoria = (id: string) => {
    setCatActiva(id);
    setAvance({ indice: 0, indiceMedia: 0 });
  };

  const categoria = categorias.find((c) => c.id === catActiva) ?? categorias[0];
  const obras = categoria?.obras ?? [];
  const total = obras.length;
  const obra = obras[indice % Math.max(total, 1)];

  if (!categoria || !obra) return null;

  const anterior = () => {
    setAvance((prev) => ({
      indice: (prev.indice - 1 + total) % total,
      indiceMedia: 0,
    }));
  };
  const siguiente = () => {
    setAvance((prev) => ({
      indice: (prev.indice + 1) % total,
      indiceMedia: 0,
    }));
  };

  const tituloSeccion = SECCION_POR_CATEGORIA[categoria.id] ?? categoria.label;
  const itemMedia =
    obra.media.length > 0 ? obra.media[indiceMedia % obra.media.length] : undefined;
  const esVideo = itemMedia?.tipo === 'video';

  return (
    <div className="mx-auto flex w-full flex-col items-center">
      <SelectorCategorias categorias={categorias} activa={categoria.id} onCambiar={cambiarCategoria} />

      <div className="relative mt-8 flex w-full items-center gap-2 sm:gap-4 md:gap-6">
        {total > 1 && (
          <ArrowButton
            direction="left"
            variant="hero"
            onClick={anterior}
            aria-label={`Obra anterior en ${categoria.label}`}
            className="z-10 shrink-0 transition-transform hover:scale-110 active:scale-95"
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
            className="grid overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 shadow-2xl backdrop-blur-xl md:grid-cols-12 md:h-[34rem]"
            data-cms-dominio="proyecto"
            data-cms-clave={obra.id}
          >
            <div className="relative aspect-[16/10] w-full bg-slate-950 md:col-span-7 md:aspect-auto md:h-full">
              {esVideo && itemMedia ? (
                <video
                  key={indiceMedia}
                  controls
                  playsInline
                  preload="none"
                  poster={itemMedia.poster ?? itemMedia.thumb}
                  src={itemMedia.src}
                  className="absolute inset-0 h-full w-full animate-fadeIn object-cover"
                />
              ) : itemMedia ? (
                <img
                  key={indiceMedia}
                  src={itemMedia.src}
                  alt={itemMedia.alt ?? obra.titulo}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full animate-fadeIn object-cover"
                  style={{ objectPosition: posicionDe(obra.objectPosition) }}
                />
              ) : obra.imagenSrc ? (
                <img
                  src={obra.imagenSrc}
                  alt={obra.titulo}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: posicionDe(obra.objectPosition) }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 via-slate-900 to-slate-950"
                >
                  <span className="select-none text-8xl font-black tracking-tighter text-white/10">
                    {inicialesDe(obra.titulo)}
                  </span>
                </div>
              )}

              {/* Degradado inferior para contraste de la mini galería */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

              {/* Mini galería */}
              {obra.media.length > 1 && (
                <GaleriaMedia
                  media={obra.media}
                  indice={indiceMedia}
                  onCambiar={(i) => setAvance((prev) => ({ ...prev, indiceMedia: i }))}
                />
              )}
            </div>

            {/* Texto y detalles: 5 columnas bien aprovechadas horizontalmente */}
            <div className="flex flex-col justify-between p-7 sm:p-9 md:col-span-5 lg:p-12">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className="inline-flex min-w-0 flex-1 items-center gap-2 text-caption font-bold uppercase tracking-[0.24em] text-accent"
                    data-cms-campo="titulo"
                  >
                    <span className="truncate">{obra.titulo}</span>
                  </span>

                </div>

                <h3 className="line-clamp-2 font-roboto-condensed text-title font-bold tracking-tight text-white sm:text-title-md lg:text-title-lg">
                  {tituloSeccion}
                </h3>

                <p
                  className="line-clamp-4 text-body text-slate-300/90 lg:line-clamp-5 lg:text-body-lg"
                  data-cms-campo="descripcion"
                  data-cms-multilinea
                >
                  {obra.descripcion}
                </p>
              </div>

              {/* Pie de avance */}
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                <p
                  aria-live="polite"
                  className="text-caption font-semibold uppercase tracking-[0.22em] text-slate-400"
                >
                  Obra <span className="font-bold text-white">{indice + 1}</span> de {total}
                </p>

                <div className="flex items-center gap-1.5">
                  {obras.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setAvance({ indice: dotIdx, indiceMedia: 0 })}
                      aria-label={`Ir a obra ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        dotIdx === indice ? 'w-6 bg-accent' : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>

        {total > 1 && (
          <ArrowButton
            direction="right"
            variant="hero"
            onClick={siguiente}
            aria-label={`Obra siguiente en ${categoria.label}`}
            className="z-10 shrink-0 transition-transform hover:scale-110 active:scale-95"
          />
        )}
      </div>
    </div>
  );
}