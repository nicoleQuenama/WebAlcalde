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

const CLASE_PIL_BASE =
  'cursor-pointer rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors';

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
    `${CLASE_PIL_BASE} ${
      activa
        ? 'border-white bg-white text-primary'
        : 'border-white/25 bg-white/[0.06] text-white/75 hover:border-white/50 hover:text-white'
    }`;

  return (
    <div
      role="tablist"
      aria-label="Categorías de proyectos"
      className="flex flex-wrap items-center justify-center gap-2"
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
            className={`${clasePill(activaEnResto)} inline-flex items-center gap-1.5`}
          >
            {activaEnResto ? activaLabel : 'Más categorías'}
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
              className={`transition-transform ${dropdownAbierto ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropdownAbierto && (
            <div
              role="menu"
              aria-label="Más categorías de proyectos"
              className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
            >
              {resto.map((c) => (
                <button
                  key={c.id}
                  id={`proyectos-tab-${c.id}`}
                  type="button"
                  role="menuitemradio"
                  aria-checked={c.id === activa}
                  onClick={() => seleccionar(c.id)}
                  className={`block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    c.id === activa ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}