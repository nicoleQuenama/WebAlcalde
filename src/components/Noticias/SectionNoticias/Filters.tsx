interface FiltrosProps {
  busqueda: string;
  setBusqueda: (val: string) => void;
  fechaSel: string;
  setFechaSel: (val: string) => void;
  categoriaSel: string;
  setCategoriaSel: (val: string) => void;
  categorias: string[];
}

export default function NewsFilters({
  busqueda, setBusqueda, fechaSel, setFechaSel, categoriaSel, setCategoriaSel, categorias
}: FiltrosProps) {
  return (
    <div className="noticias-filtros">
      <div className="noticias-filtros__barra">
        <div className="noticias-filtros__busqueda-wrap">
          <div className="noticias-filtros__busqueda">
            <svg className="noticias-filtros__busqueda-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda('')}
                className="noticias-filtros__limpiar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="noticias-filtros__derecha">
          <div className="noticias-filtros__fecha">
            <svg className="noticias-filtros__fecha-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input 
              type="date" 
              value={fechaSel}
              onChange={(e) => setFechaSel(e.target.value)}
            />
          </div>

          <div className="noticias-filtros__estado">
            {busqueda || categoriaSel !== 'Todas' || fechaSel ? (
              <span>
                <span className="noticias-filtros__estado-dot"></span>
                Filtros activos
              </span>
            ) : (
              <span>{categorias.length - 1} categorías</span>
            )}
          </div>
        </div>
      </div>

      <div className="noticias-filtros__categorias">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaSel(cat)}
            className={`noticias-filtros__cat-btn ${categoriaSel === cat ? 'noticias-filtros__cat-btn--activo' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
