interface FiltrosProps {
  busqueda: string;
  setBusqueda: (val: string) => void;
}

export default function NewsFilters({
  busqueda, setBusqueda
}: FiltrosProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-3 md:w-80">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar noticias..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-hover)] pl-9 pr-8 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none"
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] bg-none border-none cursor-pointer transition-colors hover:text-[var(--color-text-secondary)]"
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
