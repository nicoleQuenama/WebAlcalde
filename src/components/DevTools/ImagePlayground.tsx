import { useState, useCallback, useEffect, useRef } from 'react';

type Fit = 'cover' | 'contain';

interface CardTipo {
  nombre: string;
  ratio: string;
  fitPorDefecto: Fit;
  objectPosPorDefecto: string;
}

const CARDS: CardTipo[] = [
  { nombre: 'Comparador antes/después', ratio: '16/9', fitPorDefecto: 'cover', objectPosPorDefecto: '50% 50%' },
  { nombre: 'Hero — tarjeta cuadrada', ratio: '1/1', fitPorDefecto: 'cover', objectPosPorDefecto: '50% 50%' },
  { nombre: 'Subsección de obra', ratio: '4/3', fitPorDefecto: 'cover', objectPosPorDefecto: '50% 30%' },
  { nombre: 'Video biografía (póster)', ratio: '16/9', fitPorDefecto: 'cover', objectPosPorDefecto: '50% 30%' },
];

interface ImagenProyecto {
  key: string;
  titulo: string;
  src: string;
  cardIdx: number;
}

const IMAGENES: ImagenProyecto[] = [
  { key: 'cocha-antes', titulo: 'Coña Coña — ANTES', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/1_cona_cona_antes.jpg.webp', cardIdx: 0 },
  { key: 'cocha-ahora', titulo: 'Coña Coña — AHORA', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/ahora/6P9A2287.webp', cardIdx: 0 },
  { key: 'alalay-antes', titulo: 'Laguna Alalay — ANTES', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/Laguna_Alalay..._la_antigua_Loma_del_Burro_final_avenida_6_de_Agosto_y_el_actual_Circuito_Bolivia_en_1917._(2).jfif.webp', cardIdx: 0 },
  { key: 'alalay-ahora', titulo: 'Laguna Alalay — AHORA', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/ahora/Laguna_Alalay_el_proyecto_de_recuperacion_ambiental_mas_grande_del_pais.jpg.webp', cardIdx: 0 },
  { key: 'banderas-antes', titulo: 'Plaza Banderas — ANTES', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/trabajos_plaza_de_las_banderas_931.webp', cardIdx: 0 },
  { key: 'banderas-ahora', titulo: 'Plaza Banderas — AHORA', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/ahora/6P9A2287.webp', cardIdx: 0 },
  { key: 'parque-antes', titulo: 'Parque Vial — ANTES', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/parque_vial.webp', cardIdx: 0 },
  { key: 'parque-ahora', titulo: 'Parque Vial — AHORA', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/ahora/DJI_0169.webp', cardIdx: 0 },
  { key: 'plano', titulo: 'Hero panorámica', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/ahora/DJI_0001-Pano.webp', cardIdx: 1 },
  { key: 'alc-gente1', titulo: 'Alcalde con gente 1', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/raiz/IMG_2941.webp', cardIdx: 1 },
  { key: 'alc-gente2', titulo: 'Alcalde con gente 2', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/raiz/DSC_0807.webp', cardIdx: 1 },
  { key: 'alc-gente3', titulo: 'Reconocimiento Francia', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/premios-manfred/01 ALCALDE FRANCIA OK.webp', cardIdx: 1 },
  { key: 'conectividad', titulo: 'Conectividad (avenidas)', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/ahora/IMG_5929.webp', cardIdx: 2 },
  { key: 'vialidad', titulo: 'Vialidad (aérea)', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/cocha-antes-y-ahora/ahora/DJI_0169.webp', cardIdx: 2 },
  { key: 'biografia-poster', titulo: 'Póster video biografía', src: 'https://fsuxvbuupswucnsvrdce.supabase.co/storage/v1/object/public/media/imagenes/raiz/DSC_0802.webp', cardIdx: 3 },
];

interface EstadoImagen {
  fit: Fit;
  x: number;
  y: number;
  scale: number;
  w: number;
  h: number;
}

const estadoInicial = (c: CardTipo): EstadoImagen => ({
  fit: c.fitPorDefecto,
  x: Number(c.objectPosPorDefecto.split(' ')[0].replace('%', '')),
  y: Number(c.objectPosPorDefecto.split(' ')[1].replace('%', '')),
  scale: 1,
  w: 0,
  h: 0,
});

export default function ImagePlayground() {
  const [imgKey, setImgKey] = useState(IMAGENES[0].key);
  const { cardIdx, src, titulo } = IMAGENES.find((f) => f.key === imgKey)!;
  const card = CARDS[cardIdx];
  const [estado, setEstado] = useState<EstadoImagen>(() => estadoInicial(card));
  const [copiado, setCopiado] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; ix: number; iy: number } | null>(null);

  useEffect(() => {
    setEstado(estadoInicial(CARDS[IMAGENES.find((f) => f.key === imgKey)!.cardIdx]));
  }, [imgKey]);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 1600);
    return () => clearTimeout(t);
  }, [copiado]);

  const cssFinal = `object-fit: ${estado.fit};
object-position: ${estado.x}% ${estado.y}%;
transform: scale(${estado.scale});`;

  const copiar = useCallback(() => {
    navigator.clipboard.writeText(cssFinal);
    setCopiado(true);
  }, [cssFinal]);

  const imgRatio = estado.w && estado.h ? (estado.w / estado.h).toFixed(2) : null;

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const cardEl = (e.target as HTMLElement).closest('[data-card-preview]') as HTMLElement | null;
    if (!cardEl) return;
    cardEl.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ix: estado.x, iy: estado.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const cardEl = (e.target as HTMLElement).closest('[data-card-preview]') as HTMLElement | null;
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    setEstado((p) => ({
      ...p,
      x: Math.max(0, Math.min(100, dragRef.current!.ix + dx)),
      y: Math.max(0, Math.min(100, dragRef.current!.iy + dy)),
    }));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setEstado((p) => ({
      ...p,
      scale: Math.max(0.5, Math.min(4, +(p.scale + (e.deltaY > 0 ? -0.1 : 0.1)).toFixed(2))),
    }));
  };

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setEstado((p) => ({ ...p, w: img.naturalWidth, h: img.naturalHeight }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* ═══ Header ═══ */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Ajuste de imágenes del sitio</h1>
            <p className="text-xs text-slate-500">
              Elige una foto del proyecto, ajústala dentro de su card y copia el CSS.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 sm:inline">
            Solo desarrollo — no público
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {/* ═══ Selector de imagen ═══ */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Imágenes del proyecto
          </div>
          <div className="flex flex-wrap gap-2">
            {IMAGENES.map((f) => (
              <button
                key={f.key}
                onClick={() => setImgKey(f.key)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  f.key === imgKey
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {f.titulo}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Grid: preview + controles ═══ */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ── LEFT: Preview ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-base font-bold text-slate-900">{titulo}</div>
                <div className="text-xs text-slate-500">
                  {card.nombre} · relación {card.ratio}
                </div>
              </div>
            </div>

            {/* Card real — arrastrable y con zoom */}
            <div
              data-card-preview
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              className="relative w-full select-none overflow-hidden rounded-xl border border-slate-300 bg-slate-200"
              style={{ aspectRatio: card.ratio, cursor: 'grab', touchAction: 'none' }}
            >
              <img
                src={src}
                alt={titulo}
                draggable={false}
                loading="eager"
                onLoad={onImgLoad}
                className="pointer-events-none block h-full w-full"
                style={{
                  objectFit: estado.fit,
                  objectPosition: `${estado.x}% ${estado.y}%`,
                  transform: `scale(${estado.scale})`,
                }}
              />
              {estado.scale > 1 && (
                <div className="pointer-events-none absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                  {estado.scale.toFixed(2)}×
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              Arrastra la foto para posicionarla · rueda del ratón para hacer zoom.
            </p>

            {/* CSS generado */}
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wide">CSS</span>
                <button
                  onClick={copiar}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    copiado
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {copiado ? '✓ Copiado' : 'Copiar CSS'}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-green-300">
{`object-fit: ${estado.fit};
object-position: ${estado.x}% ${estado.y}%;
transform: scale(${estado.scale});`}
              </pre>
            </div>
          </div>

          {/* ── RIGHT: Controles ── */}
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
            {/* Card destino */}
            <section>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Card destino
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CARDS.map((c, i) => (
                  <button
                    key={c.nombre}
                    onClick={() => setImgKey(IMAGENES.find((f) => f.cardIdx === i)!.key)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      cardIdx === i
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Al elegir, se salta a la primera foto de esa card.
              </p>
            </section>

            {/* Dimensiones reales de la imagen */}
            <section>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Dimensiones de la imagen
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ancho</div>
                  <div className="text-base font-bold text-slate-900">
                    {estado.w ? `${estado.w}px` : '—'}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Alto</div>
                  <div className="text-base font-bold text-slate-900">
                    {estado.h ? `${estado.h}px` : '—'}
                  </div>
                </div>
              </div>
              {estado.w && estado.h && (
                <p className="text-xs text-slate-500">
                  Relación <span className="font-semibold text-slate-700">{imgRatio}:1</span>
                  {estado.scale !== 1 && (
                    <span className="ml-2 text-slate-400">
                      (mostrada ~{Math.round(estado.w * estado.scale)}×{Math.round(estado.h * estado.scale)}px)
                    </span>
                  )}
                </p>
              )}
            </section>

            {/* Object fit */}
            <section>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Object fit
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['cover', 'contain'] as Fit[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setEstado((p) => ({ ...p, fit: f }))}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                      estado.fit === f
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {estado.fit === 'cover'
                  ? 'Recorta para llenar la card completa.'
                  : 'Muestra la foto completa (puede dejar bandas).'}
              </p>
            </section>

            {/* Object position */}
            <section>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Object position
              </div>
              <Slider label="Horizontal" value={estado.x} onChange={(v) => setEstado((p) => ({ ...p, x: v }))} />
              <Slider label="Vertical" value={estado.y} onChange={(v) => setEstado((p) => ({ ...p, y: v }))} />
              <button
                onClick={() => setEstado({ ...estado, x: 50, y: 50 })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Centrar
              </button>
            </section>

            {/* Zoom */}
            <section>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Zoom
              </div>
              <div className="mb-2 flex items-center gap-2">
                <button
                  onClick={() => setEstado((p) => ({ ...p, scale: Math.max(0.5, +(p.scale - 0.1).toFixed(2)) }))}
                  className="h-9 w-9 shrink-0 rounded-lg border border-slate-300 bg-slate-50 text-lg font-bold text-slate-700 transition hover:bg-slate-100"
                  aria-label="Disminuir zoom"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.01}
                  value={estado.scale}
                  onChange={(e) => setEstado((p) => ({ ...p, scale: +e.target.value }))}
                  className="slider flex-1"
                  style={{
                    background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${((estado.scale - 0.5) / 3.5) * 100}%, #cbd5e1 ${((estado.scale - 0.5) / 3.5) * 100}%, #cbd5e1 100%)`,
                  }}
                />
                <button
                  onClick={() => setEstado((p) => ({ ...p, scale: Math.min(4, +(p.scale + 0.1).toFixed(2)) }))}
                  className="h-9 w-9 shrink-0 rounded-lg border border-slate-300 bg-slate-50 text-lg font-bold text-slate-700 transition hover:bg-slate-100"
                  aria-label="Aumentar zoom"
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{estado.scale.toFixed(2)}×</span>
                <button
                  onClick={() => setEstado((p) => ({ ...p, scale: 1 }))}
                  className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Restablecer
                </button>
              </div>
            </section>

            {/* Reset */}
            <button
              onClick={() => setEstado(estadoInicial(card))}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Restablecer valores del sitio
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const pct = value;
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <input
          type="number"
          value={value}
          min={0}
          max={100}
          onChange={(e) => onChange(Math.max(0, Math.min(100, +e.target.value)))}
          className="w-14 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center text-xs text-slate-900 outline-none focus:border-purple-500"
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="slider w-full"
        style={{
          background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${pct}%, #cbd5e1 ${pct}%, #cbd5e1 100%)`,
        }}
      />
    </div>
  );
}