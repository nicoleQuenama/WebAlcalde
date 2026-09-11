import { useState, useMemo } from 'react';
import type { Noticia } from '@types/noticias';

interface Props {
  noticias: Noticia[];
  categorias: string[];
}

function formatFecha(fechaISO: string) {
  return new Date(fechaISO).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function NoticiasFiltros({ noticias, categorias }: Props) {
  const [categoria, setCategoria] = useState('Todas');
  const [query, setQuery] = useState('');

  const filtradas = useMemo(() => {
    return noticias.filter((n) => {
      const matchCat = categoria === 'Todas' || n.categoria === categoria;
      const q = query.toLowerCase().trim();
      const matchQuery =
        !q ||
        n.titulo.toLowerCase().includes(q) ||
        n.resumen.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [categoria, query, noticias]);

  return (
    <section aria-label="Filtrar noticias" className="bg-[#0f0f0f] px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Controles */}
        <div className="flex flex-col gap-4 border-b border-white/10 py-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Chips categorías */}
          <div role="tablist" aria-label="Categorías" className="flex flex-wrap gap-2">
            {['Todas', ...categorias].map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={categoria === cat}
                onClick={() => setCategoria(cat)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  categoria === cat
                    ? 'border-white bg-white text-black'
                    : 'border-white/20 bg-transparent text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <label className="relative flex w-full max-w-sm items-center">
            <span className="sr-only">Buscar noticias</span>
            <svg
              className="pointer-events-none absolute left-3 h-4 w-4 text-white/40"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16.5 16.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar noticia..."
              className="w-full rounded-full border border-white/15 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </label>
        </div>

        {/* Resultados */}
        <div className="py-8">
          <p className="mb-6 text-xs uppercase tracking-[0.16em] text-white/50" aria-live="polite">
            {filtradas.length} {filtradas.length === 1 ? 'resultado' : 'resultados'}
            {categoria !== 'Todas' ? ` en ${categoria}` : ''}
            {query ? ` para "${query}"` : ''}
          </p>

          {filtradas.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center">
              <p className="text-sm font-semibold text-white">Sin resultados</p>
              <p className="mt-1 text-sm text-white/60">Prueba con otra categoría o término de búsqueda.</p>
              <button
                type="button"
                onClick={() => {
                  setCategoria('Todas');
                  setQuery('');
                }}
                className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-black hover:bg-white/90"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtradas.map((noticia) => (
                <li key={noticia.slug} className="flex">
                  <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] transition hover:-translate-y-1 hover:border-white/20">
                    <a
                      href={`/noticias/${noticia.slug}`}
                      className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <figure className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
                        <img
                          src={noticia.imagen}
                          alt={noticia.imagenAlt}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                        <figcaption className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                          {noticia.categoria}
                        </figcaption>
                      </figure>
                      <div className="flex flex-1 flex-col p-4">
                        <time dateTime={noticia.fecha} className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                          {formatFecha(noticia.fecha)}
                        </time>
                        <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-white group-hover:text-accent">
                          {noticia.titulo}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/60">
                          {noticia.resumen}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 group-hover:text-white">
                          Leer más
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
