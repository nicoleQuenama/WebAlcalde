import type { TabDolly } from './types';

interface Props {
  tabs: TabDolly[];
  activa: number;
  onCambiar: (i: number) => void;
}

/** Pestañas de filtro (Historia / Reconocimiento). */
export default function TimelineTabs({ tabs, activa, onCambiar }: Props) {
  return (
    <div className="timeline-tabs" role="tablist" aria-label="Filtrar línea de tiempo">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={i === activa ? 'true' : 'false'}
          onClick={() => onCambiar(i)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}