// src/components/Noticias/NewsFilters.tsx
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
    <div className="mb-10">
      {/* Barra de filtros compacta */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        
        {/* Lado izquierdo: Búsqueda */}
        <div className="flex items-center gap-3 md:w-72">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:border-[#472d82] focus:bg-white focus:outline-none"
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Lado derecho: Fecha y estado */}
        <div className="flex items-center gap-3">
          {/* Filtro de fecha */}
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input 
              type="date" 
              value={fechaSel}
              onChange={(e) => setFechaSel(e.target.value)}
              className="border-none bg-transparent text-xs text-gray-600 focus:outline-none"
            />
          </div>

          {/* Estado */}
          <div className="hidden text-xs text-gray-400 sm:block">
            {busqueda || categoriaSel !== 'Todas' || fechaSel ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#472d82]"></span>
                Filtros activos
              </span>
            ) : (
              <span>{categorias.length - 1} categorías</span>
            )}
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaSel(cat)}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 ${
              categoriaSel === cat 
                ? 'bg-[#472d82] text-white shadow-sm' 
                : 'border border-gray-200 bg-white text-gray-600 hover:border-[#472d82]/30 hover:text-[#472d82]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
