interface FiltrosProps {
  busqueda: string;
  setBusqueda: (val: string) => void;
}

export default function NewsFilters({
  busqueda, setBusqueda
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
              placeholder="Buscar noticias..." 
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
      </div>
    </div>
  );
}
