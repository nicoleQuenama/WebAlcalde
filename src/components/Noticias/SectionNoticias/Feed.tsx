import { useState, useMemo, useRef } from 'react';
import NewsFeedCard, { type NoticiaFeed } from './FeedCard';
import NewsFilters from './Filters';
import NewsModal from '../Modal';
import { MEDIA } from '@lib/media';

const NOTICIAS_DB: NoticiaFeed[] = [
  { 
    id: 1, 
    src: MEDIA.proyectos.playaTurquesa,
    titulo: 'Playa Turquesa: el espacio recreativo favorito de Cochabamba', 
    categoria: 'Espacio público', 
    fecha: '2026-09-14',
    resumen: 'El Complejo Recreacional Coña Coña se consolida como el destino de recreación y turismo para las familias cochabambinas, con playa artificial, plaza de comidas y amplias áreas verdes.'
  },
  { 
    id: 2, 
    src: MEDIA.proyectos.lagunaAlalay,
    titulo: 'Recuperación de la Laguna Alalay avanza con fuerza', 
    categoria: 'Medio Ambiente', 
    fecha: '2026-09-12',
    resumen: 'El proyecto de dragado y recuperación del mayor espejo de agua de la ciudad continúa avanzando, con sendas, forestación y control del deterioro ambiental.'
  },
  { 
    id: 3, 
    src: MEDIA.proyectos.plazaBanderas,
    titulo: 'Plaza de las Banderas: espacio renovado para la ciudad', 
    categoria: 'Espacio público', 
    fecha: '2026-09-10',
    resumen: 'El remozado y mejoramiento de la plaza y sus fuentes se enmarca dentro del plan de recuperación de espacios de encuentro ciudadano.'
  },
  { 
    id: 4, 
    src: MEDIA.proyectos.parqueVial,
    titulo: 'Parque Vial: pulmón verde de Cochabamba', 
    categoria: 'Ciudad Jardín', 
    fecha: '2026-09-08',
    resumen: 'El parque renovado dentro del Plan Maestro de Forestación representa un hito en la recuperación de áreas verdes de la llajta.'
  },
  { 
    id: 5, 
    src: MEDIA.temario.salud,
    titulo: 'Avances en salud municipal para nuestra comunidad', 
    categoria: 'Salud', 
    fecha: '2026-09-05',
    resumen: 'La inversión en infraestructura y equipamiento médico marca la diferencia en la atención a la población de Cochabamba.'
  },
  { 
    id: 6, 
    src: MEDIA.temario.educacion,
    titulo: 'Educación integral: construyendo el futuro', 
    categoria: 'Educación', 
    fecha: '2026-09-01',
    resumen: 'La construcción, ampliación y mejoramiento de infraestructuras educativas beneficia a miles de estudiantes con ambientes dignos y modernos.'
  },
  { 
    id: 7, 
    src: MEDIA.temario.vialidad,
    titulo: 'Cochabamba conectada: infraestructura vial moderna', 
    categoria: 'Obras Públicas', 
    fecha: '2026-08-28',
    resumen: 'Puentes, distribuidores, pavimento rígido y asfaltos para una ciudad que crece y necesita desplazarse mejor.'
  },
  { 
    id: 8, 
    src: MEDIA.temario.ecologia,
    titulo: 'Compromiso con el futuro ecológico de la ciudad', 
    categoria: 'Medio Ambiente', 
    fecha: '2026-08-25',
    resumen: 'Cochabamba avanza hacia un futuro más verde, limpio y sostenible con la protección del medio ambiente como prioridad.'
  },
];

const CATEGORIAS = ['Todas', 'Espacio público', 'Medio Ambiente', 'Salud', 'Educación', 'Obras Públicas', 'Ciudad Jardín'];

export default function Feed() {
  const [busqueda, setBusqueda] = useState('');
  const [fechaSel, setFechaSel] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todas');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [indiceActual, setIndiceActual] = useState(0);

  const ultimasRef = useRef<HTMLDivElement>(null);
  const masRef = useRef<HTMLDivElement>(null);

  const noticiasFiltradas = useMemo(() => {
    return NOTICIAS_DB.filter((noticia) => {
      const matchBusqueda = noticia.titulo.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = categoriaSel === 'Todas' || noticia.categoria === categoriaSel;
      const matchFecha = fechaSel === '' || noticia.fecha >= fechaSel;
      return matchBusqueda && matchCategoria && matchFecha;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [busqueda, fechaSel, categoriaSel]);

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

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 340;
      const newScroll = direction === 'left' 
        ? ref.current.scrollLeft - scrollAmount 
        : ref.current.scrollLeft + scrollAmount;
      ref.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  return (
    <section className="feed-section noticias-carrusel">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        
        <div className="noticias-encabezado">
          <div className="noticias-encabezado__badge">
            <span className="noticias-encabezado__badge-dot"></span>
            <span className="noticias-encabezado__badge-texto">Explorar Noticias</span>
          </div>
          <h2 className="noticias-encabezado__titulo">Últimas Noticias</h2>
          <p className="noticias-encabezado__descripcion">
            Mantente informado sobre los proyectos, obras y avances más recientes de nuestra ciudad.
          </p>
        </div>

        <NewsFilters 
          busqueda={busqueda} setBusqueda={setBusqueda}
          fechaSel={fechaSel} setFechaSel={setFechaSel}
          categoriaSel={categoriaSel} setCategoriaSel={setCategoriaSel}
          categorias={CATEGORIAS}
        />

        {ultimasNoticias.length > 0 && (
          <div style={{ marginBottom: '5rem' }}>
            <div className="noticias-subencabezado">
              <div className="noticias-subencabezado__label">
                <div className="noticias-subencabezado__barra"></div>
                <h2 className="noticias-subencabezado__titulo">Últimas Noticias</h2>
              </div>
              <div className="noticias-subencabezado__linea"></div>
            </div>
            
            <div className="noticias-carrusel">
              <button 
                onClick={() => scroll(ultimasRef, 'left')}
                className="noticias-flecha noticias-flecha--izquierda"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div 
                ref={ultimasRef}
                className="noticias-carrusel__track scrollbar-hide"
              >
                {ultimasNoticias.map(noticia => (
                  <div 
                    key={noticia.id} 
                    onClick={() => abrirModal(noticia.id)} 
                    className="noticias-carrusel__item"
                  >
                    <NewsFeedCard noticia={noticia} />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => scroll(ultimasRef, 'right')}
                className="noticias-flecha noticias-flecha--derecha"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {masNoticias.length > 0 && (
          <div>
            <div className="noticias-subencabezado">
              <div className="noticias-subencabezado__label">
                <div className="noticias-subencabezado__barra noticias-subencabezado__barra--pequena"></div>
                <h2 className="noticias-subencabezado__titulo noticias-subencabezado__titulo--secundario">Más Noticias</h2>
              </div>
              <div className="noticias-subencabezado__linea"></div>
            </div>
            
            <div className="noticias-carrusel noticias-carrusel--compacto">
              <button 
                onClick={() => scroll(masRef, 'left')}
                className="noticias-flecha noticias-flecha--izquierda"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div 
                ref={masRef}
                className="noticias-carrusel__track scrollbar-hide"
              >
                {masNoticias.map(noticia => (
                  <div 
                    key={noticia.id} 
                    onClick={() => abrirModal(noticia.id)} 
                    className="noticias-carrusel__item"
                  >
                    <NewsFeedCard noticia={noticia} />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => scroll(masRef, 'right')}
                className="noticias-flecha noticias-flecha--derecha"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {noticiasFiltradas.length === 0 && (
          <div className="noticias-vacio">
            <div className="noticias-vacio__icono">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
                <path d="M8 11h6"/>
              </svg>
            </div>
            <p className="noticias-vacio__titulo">No se encontraron noticias</p>
            <p className="noticias-vacio__descripcion">Intenta con otros términos de búsqueda o filtros diferentes.</p>
            <button 
              onClick={() => { setBusqueda(''); setCategoriaSel('Todas'); setFechaSel(''); }} 
              className="noticias-vacio__btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}

        <NewsModal 
          isOpen={modalAbierto} 
          noticia={noticiasFiltradas[indiceActual] || null} 
          onClose={cerrarModal}
          onNext={noticiaSiguiente}
          onPrev={noticiaAnterior}
        />

      </div>
    </section>
  );
}
