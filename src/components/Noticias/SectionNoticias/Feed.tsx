// src/components/Noticias/NewsFeed.tsx
import { useState, useMemo } from 'react';
import NewsFeedCard, { type NoticiaFeed } from './FeedCard';
import NewsFilters from './Filters';

// Base de datos de prueba
const NOTICIAS_DB: NoticiaFeed[] = [
  { id: 1, src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', titulo: 'Avanza la Nueva Terminal', categoria: 'Obras Públicas', fecha: '2026-09-14' },
  { id: 2, src: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800', titulo: 'Recuperación de la Laguna Alalay', categoria: 'Medio Ambiente', fecha: '2026-09-12' },
  { id: 3, src: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800', titulo: 'Equipamiento de Centros de Salud', categoria: 'Salud', fecha: '2026-09-10' },
  { id: 4, src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', titulo: 'FEXCO 2026 proyecta récord en ventas', categoria: 'Economía', fecha: '2026-09-08' },
  { id: 5, src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', titulo: 'Inauguración de Parques Urbanos', categoria: 'Medio Ambiente', fecha: '2026-09-05' },
  { id: 6, src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', titulo: 'Plan de Movilidad Urbana Sostenible', categoria: 'Obras Públicas', fecha: '2026-09-01' },
];

const CATEGORIAS = ['Todas', 'Medio Ambiente', 'Obras Públicas', 'Salud', 'Economía'];

export default function NewsFeed() {
  const [busqueda, setBusqueda] = useState('');
  const [fechaSel, setFechaSel] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todas');

  // Filtrado instantáneo
  const noticiasFiltradas = useMemo(() => {
    return NOTICIAS_DB.filter((noticia) => {
      const matchBusqueda = noticia.titulo.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = categoriaSel === 'Todas' || noticia.categoria === categoriaSel;
      const matchFecha = fechaSel === '' || noticia.fecha >= fechaSel;
      return matchBusqueda && matchCategoria && matchFecha;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [busqueda, fechaSel, categoriaSel]);

  const ultimasNoticias = noticiasFiltradas.slice(0, 3);
  const masNoticias = noticiasFiltradas.slice(3);

  return (
    <section className="feed-section relative mx-auto w-full max-w-7xl px-6 py-20 lg:px-12">
      
      {/* Encabezado de la sección */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#472d82]/15 bg-[#472d82]/5 px-5 py-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#472d82]/60"></span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#472d82]/70">Explorar Noticias</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Últimas Noticias</h2>
        <p className="mt-4 max-w-lg text-base text-gray-500">Mantente informado sobre los proyectos, obras y avances más recientes de nuestra ciudad.</p>
      </div>

      <NewsFilters 
        busqueda={busqueda} setBusqueda={setBusqueda}
        fechaSel={fechaSel} setFechaSel={setFechaSel}
        categoriaSel={categoriaSel} setCategoriaSel={setCategoriaSel}
        categorias={CATEGORIAS}
      />

      {/* BLOQUE: ÚLTIMAS NOTICIAS */}
      {ultimasNoticias.length > 0 && (
        <div className="mb-20">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#472d82] to-[#6b4cbf]"></div>
              <h2 className="text-2xl font-bold text-gray-900">Últimas Noticias</h2>
            </div>
            <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ultimasNoticias.map(noticia => (
              <NewsFeedCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        </div>
      )}

      {/* BLOQUE: MÁS NOTICIAS */}
      {masNoticias.length > 0 && (
        <div>
          <div className="mb-10 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#472d82]/50 to-[#6b4cbf]/50"></div>
              <h2 className="text-xl font-semibold text-gray-700">Más Noticias</h2>
            </div>
            <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {masNoticias.map(noticia => (
              <NewsFeedCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        </div>
      )}

      {/* ESTADO VACÍO */}
      {noticiasFiltradas.length === 0 && (
        <div className="py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50">
            <svg className="h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
              <path d="M8 11h6"/>
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700">No se encontraron noticias</p>
          <p className="mt-2 text-sm text-gray-400">Intenta con otros términos de búsqueda o filtros diferentes.</p>
          <button 
            onClick={() => { setBusqueda(''); setCategoriaSel('Todas'); setFechaSel(''); }} 
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#472d82] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#3a2470] hover:shadow-lg hover:shadow-[#472d82]/20"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            Limpiar filtros
          </button>
        </div>
      )}

    </section>
  );
}
