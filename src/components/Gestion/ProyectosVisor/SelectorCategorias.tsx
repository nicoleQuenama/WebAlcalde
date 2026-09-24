import { useEffect, useRef, useState } from 'react';
import { CATEGORIAS_PILLS } from '@constants/proyectoCategorias';
import type { VisorCategoria } from './types';

interface Props {
  categorias: VisorCategoria[];
  activa: string;
  onCambiar: (id: string) => void;
}

type CategoriaOpcion = Pick<VisorCategoria, 'id' | 'label'>;

const esPill = (id: string) => (CATEGORIAS_PILLS as readonly string[]).includes(id);

const CLASE_PILL_BASE =
  'cursor-pointer rounded-full border px-5 py-2 text-caption font-bold uppercase tracking-[0.14em] transition-all duration-200';

export default function SelectorCategorias({ categorias, activa, onCambiar }: Props) {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const pills: CategoriaOpcion[] = categorias.filter((c) => esPill(c.id));
  const resto: CategoriaOpcion[] = categorias.filter((c) => !esPill(c.id));
  const activaEnResto = resto.some((c) => c.id === activa);
  const activaLabel = categorias.find((c) => c.id === activa)?.label ?? '';

  useEffect(() => {
    if (!dropdownAbierto) return;
    const alClickFuera = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setDropdownAbierto(false);
    };
    const alEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownAbierto(false);
    };
    document.addEventListener('mousedown', alClickFuera);
    document.addEventListener('keydown', alEsc);
    return () => {
      document.removeEventListener('mousedown', alClickFuera);
      document.removeEventListener('keydown', alEsc);
    };
  }, [dropdownAbierto]);

  const seleccionar = (id: string) => {
    onCambiar(id);
    setDropdownAbierto(false);
  };

  const clasePill = (activa: boolean) =>
    `${CLASE_PILL_BASE} ${
      activa
        ? 'border-white bg-white text-slate-950 shadow-lg shadow-white/10'
        : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/40 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div
      role="tablist"
      aria-label="Categorías de proyectos"
      className="flex flex-wrap items-center justify-center gap-2.5"
    >
      {pills.map((c) => (
        <button
          key={c.id}
          id={`proyectos-tab-${c.id}`}
          type="button"
          role="tab"
          aria-selected={c.id === activa}
          aria-controls="proyectos-panel"
          onClick={() => seleccionar(c.id)}
          className={clasePill(c.id === activa)}
        >
          {c.label}
        </button>
      ))}

      {resto.length > 0 && (
        <div ref={contenedorRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdownAbierto}
            onClick={() => setDropdownAbierto((v) => !v)}
            className={`${clasePill(activaEnResto)} inline-flex items-center gap-2`}
          >
            <span>{activaEnResto ? activaLabel : 'Más categorías'}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`shrink-0 transition-transform duration-300 ease-out ${
                dropdownAbierto ? 'rotate-180' : ''
              }`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropdownAbierto && (
            <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(88vw,340px)] origin-top -translate-x-1/2 animate-dropdownIn sm:left-auto sm:right-0 sm:w-[460px] sm:origin-top-right sm:translate-x-0 md:w-[540px]">
              {/* Cuerpo del panel (rounded completo; el caret sobresale arriba) */}
              <div
                role="menu"
                aria-label="Más categorías de proyectos"
                className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl shadow-black/80 backdrop-blur-xl"
              >
                {/* Header del dropdown */}
                <div className="flex items-center justify-between border-b border-white/10 px-4 pb-2 pt-3">
                  <span className="text-label font-bold uppercase tracking-[0.18em] text-slate-400">
                    Todas las categorías
                  </span>
                  <span className="text-label text-slate-500 tabular-nums">
                    {resto.length} disponibles
                  </span>
                </div>

                {/* Grid de 2 columnas en mobile, 3 en sm+ */}
                <div className="grid max-h-[300px] grid-cols-2 gap-1.5 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid-cols-3">
                  {resto.map((c) => {
                    const estaActiva = c.id === activa;
                    return (
                      <button
                        key={c.id}
                        id={`proyectos-tab-${c.id}`}
                        type="button"
                        role="menuitemradio"
                        aria-checked={estaActiva}
                        onClick={() => seleccionar(c.id)}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-caption font-medium transition-all ${
                          estaActiva
                            ? 'border border-accent/40 bg-accent/20 font-bold text-white'
                            : 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="line-clamp-1">{c.label}</span>
                        {estaActiva && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="shrink-0 text-accent"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caret que conecta el botón con el panel */}
              <span
                aria-hidden="true"
                className="absolute -top-[11px] left-1/2 block h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t border-white/15 bg-slate-900/95 sm:left-auto sm:right-8 sm:translate-x-0"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}