import { useMemo, useState } from 'react';
import NewsCarousel from './NewsCarousel';
import NewsFilters from './Filters';
import NewsModal from '../Modal';
import type { NoticiaFeed } from '@lib/db';

export default function Feed({ noticias }: { noticias: NoticiaFeed[] }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [indiceActual, setIndiceActual] = useState(0);

  const noticiasFiltradas = useMemo(() => {
    const base = [...noticias].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    const q = busqueda.trim().toLowerCase();
    return base.filter((n) => {
      if (categoria !== 'Todas' && n.categoria !== categoria) return false;
      if (!q) return true;
      return (
        n.titulo.toLowerCase().includes(q) ||
        n.categoria.toLowerCase().includes(q) ||
        n.resumen.toLowerCase().includes(q)
      );
    });
  }, [noticias, busqueda, categoria]);

  const ultimasNoticias = noticiasFiltradas.slice(0, 4);
  const masNoticias = noticiasFiltradas.slice(4);

  const abrirModal = (id: number | string) => {
    const index = noticiasFiltradas.findIndex(n => n.id === id);
    setIndiceActual(index);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const noticiaSiguiente = () => {
    setIndiceActual((prev) => (prev === noticiasFiltradas.length - 1 ? 0 : prev + 1));
  };

  const noticiaAnterior = () => {
    setIndiceActual((prev) => (prev === 0 ? noticiasFiltradas.length - 1 : prev - 1));
  };

  return (
    <section id="feed-noticias" className="animate-[fadeInUp_0.6s_ease-out_forwards]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">

        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="text-[1.875rem] font-bold text-[var(--color-text-primary)] md:text-[2.25rem]">Últimas Noticias</h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-text-secondary)]">
            Mantente informado sobre los proyectos, obras y avances más recientes de nuestra ciudad.
          </p>
        </div>

        <NewsFilters
          busqueda={busqueda} setBusqueda={setBusqueda}
          categoria={categoria} setCategoria={setCategoria}
        />

        {ultimasNoticias.length > 0 && (
          <NewsCarousel
            titulo="Últimas Noticias"
            noticias={ultimasNoticias}
            onAbrirModal={abrirModal}
          />
        )}

        {masNoticias.length > 0 && (
          <NewsCarousel
            titulo="Más Noticias"
            noticias={masNoticias}
            onAbrirModal={abrirModal}
            compacto
          />
        )}

        {noticiasFiltradas.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-hover)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
                <path d="M8 11h6"/>
              </svg>
            </div>
            <p className="text-lg font-medium text-[var(--color-text-secondary)]">No se encontraron noticias</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Intenta con otros términos de búsqueda.</p>
            <button
              onClick={() => { setBusqueda(''); setCategoria('Todas'); }}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border-none bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--color-primary-deep)] hover:shadow-[0_10px_15px_-3px_rgba(71,45,130,0.2)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Limpiar búsqueda
            </button>
          </div>
        )}

        <NewsModal
          isOpen={modalAbierto}
          noticia={noticiasFiltradas[indiceActual] || null}
          onClose={cerrarModal}
          onNext={noticiaSiguiente}
          onPrev={noticiaAnterior}
          todasLasNoticias={noticiasFiltradas}
          indiceActual={indiceActual}
        />

      </div>
    </section>
  );
}