import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GaleriaModal from '@components/global/Hero/GaleriaModal';
import type { PlacaDolly, TabDolly } from './types';
import './timeline.css';

interface Props {
  tabs: TabDolly[];
}

/** Profundidad (px) entre placas consecutivas a lo largo del eje Z. */
const PASO_Z = 300;
/** Cuántas placas se ven "atrás" del foco antes de apagarse. */
const ALCANCE = 1.55;
/** Cuántas placas "delante" del foco pasan rápido por la lente. */
const PASO = 1.1;
/** Suavizado de la cámara (0 = instantáneo, 1 = no llega nunca). */
const RESORTE = 0.16;
/** Umbral de quietud para mostrar el overlay de la placa enfocada. */
const UMBRAL = 0.22;

const limita = (n: number) => Math.max(0, Math.min(1, n));

export default function TimelineDolly({ tabs }: Props) {
  const [pestana, setPestana] = useState(0);
  const [estatico, setEstatico] = useState(false);

  const tabActual = tabs[pestana] ?? tabs[0];
  const placas: PlacaDolly[] = tabActual?.placas ?? [];
  const N = placas.length;
  const claveTab = tabActual?.id ?? '';

  const [indice, setIndice] = useState(0);
  const [asentada, setAsentada] = useState(true);
  const [modal, setModal] = useState<{ abierta: boolean; idx: number }>({ abierta: false, idx: 0 });

  // ── Refs de la animación (escritura directa por frame, sin re-renders) ──
  const pos = useRef(0);
  const objetivo = useRef(0);
  const redondo = useRef(0);
  const quieto = useRef(true);
  const escenario = useRef<HTMLDivElement>(null);
  const placasNodo = useRef<(HTMLDivElement | null)[]>([]);
  const relleno = useRef<HTMLDivElement>(null);
  const pulgar = useRef<HTMLButtonElement>(null);
  const arrastre = useRef<{ y: number; movido: boolean } | null>(null);
  const ultimaRueda = useRef(0);
  const geo = useRef({ w: 268, h: 335 });

  const fin = useMemo(() => Math.max(1, N - 1), [N]);

  const pintar = useCallback(() => {
    if (placasNodo.current.length > N) placasNodo.current.length = N;
    const p = pos.current;
    for (let i = 0; i < N; i += 1) {
      const nodo = placasNodo.current[i];
      if (!nodo) continue;
      const d = i - p;
      const lado = i % 2 === 0 ? -1 : 1;
      const x = lado * geo.current.w * 0.16;
      const y = lado * geo.current.h * 0.05;
      const atras = d > 0;
      const opac = atras ? limita(1 - d / ALCANCE) : limita(1 + d / PASO);
      const gris = limita(Math.abs(d) / 1.4);
      const brillo = 1 - limita(Math.abs(d) / 2.5) * 0.18;
      nodo.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${d * -PASO_Z}px) rotateY(${lado * 2}deg)`;
      nodo.style.opacity = String(opac);
      nodo.style.filter = `grayscale(${gris}) brightness(${brillo})`;
      nodo.style.zIndex = String(Math.round(500 - d * 150));
      nodo.style.pointerEvents = Math.abs(d) < 0.6 && opac > 0.5 ? 'auto' : 'none';
      nodo.setAttribute('aria-hidden', String(!(Math.abs(d) < 0.6)));
    }

    const frac = limita(p / fin);
    if (pulgar.current) pulgar.current.style.top = `${frac * 100}%`;
    if (relleno.current) relleno.current.style.transform = `scaleY(${frac})`;

    const idx = Math.round(p);
    if (idx !== redondo.current) {
      redondo.current = idx;
      setIndice(idx);
    }
    const quieta = Math.abs(p - idx) < UMBRAL && !arrastre.current;
    if (quieta !== quieto.current) {
      quieto.current = quieta;
      setAsentada(quieta);
    }
  }, [N, fin]);

  // ── Bucle de animación (cámara que se acerca al objetivo) ──────────
  useEffect(() => {
    redondo.current = 0;
    quieto.current = true;
    setIndice(0);
    setAsentada(true);
    pos.current = 0;
    objetivo.current = 0;

    let raf = 0;
    const animar = () => {
      const p = pos.current;
      const t = objetivo.current;
      pos.current = Math.abs(t - p) < 0.0005 ? t : p + (t - p) * RESORTE;
      pintar();
      raf = requestAnimationFrame(animar);
    };
    raf = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(raf);
  }, [pintar]);

  // ── Geometría (ancho real de la placa según breakpoint) ─────────────
  useEffect(() => {
    const medir = () => {
      const zona = escenario.current;
      if (!zona) return;
      const s = getComputedStyle(zona);
      const w = parseFloat(s.getPropertyValue('--placa-w')) || 268;
      geo.current = { w, h: w * 1.25 };
    };
    medir();
    const zona = escenario.current;
    if (!zona) return;
    const ro = new ResizeObserver(medir);
    ro.observe(zona);
    return () => ro.disconnect();
  }, [pestana]);

  // ── prefers-reduced-motion → lista estática ──────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEstatico(mq.matches);
    const alCambio = (e: MediaQueryListEvent) => setEstatico(e.matches);
    mq.addEventListener('change', alCambio);
    return () => mq.removeEventListener('change', alCambio);
  }, []);

  // ── Avance por pasos (½ placa por rueda) ─────────────────────────────
  const paso = useCallback(
    (dir: 1 | -1) => {
      if (N <= 1) return;
      objetivo.current = Math.max(0, Math.min(fin, objetivo.current + dir * 0.5));
    },
    [N, fin],
  );

  useEffect(() => {
    const zona = escenario.current;
    if (!zona) return;
    const onWheel = (e: WheelEvent) => {
      if (N <= 1 || estatico) return;
      e.preventDefault();
      const ahora = performance.now();
      if (ahora - ultimaRueda.current < 380) return;
      ultimaRueda.current = ahora;
      paso(e.deltaY > 0 ? 1 : -1);
    };
    zona.addEventListener('wheel', onWheel, { passive: false });
    return () => zona.removeEventListener('wheel', onWheel);
  }, [N, fin, paso, estatico]);

  // ── Teclado (oculto cuando el modal está abierto) ─────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modal.abierta || estatico) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        paso(e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paso, modal.abierta, estatico]);

  // ── Arrastre: el eje (y todo el escenario) funciona como índice ──────
  const onInicio = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    arrastre.current = { y: e.clientY, movido: false };
  };
  const onMueve = (e: React.PointerEvent<HTMLDivElement>) => {
    const dr = arrastre.current;
    const zona = escenario.current;
    if (!dr || !zona || N <= 1) return;
    if (Math.abs(e.clientY - dr.y) > 6) dr.movido = true;
    const rect = zona.getBoundingClientRect();
    const alto = Math.max(1, rect.height - 32);
    const frac = limita((e.clientY - rect.top - 16) / alto);
    objetivo.current = frac * fin;
  };
  const onFin = () => {
    const dr = arrastre.current;
    arrastre.current = null;
    if (!dr || N <= 1) return;
    if (dr.movido) {
      objetivo.current = Math.round(objetivo.current);
    } else if (Math.abs(objetivo.current - indice) < UMBRAL) {
      setModal({ abierta: true, idx: indice });
    }
  };

  const salto = (i: number) => {
    objetivo.current = i;
  };

  const cerrarModal = () => setModal({ abierta: false, idx: 0 });

  const abrirEstatica = (i: number) => setModal({ abierta: true, idx: i });

  const tabsUI = (
    <div className="timeline-tabs" role="tablist" aria-label="Filtrar línea de tiempo">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={i === pestana ? 'true' : 'false'}
          onClick={() => setPestana(i)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const modalUI =
    modal.abierta && tabActual ? (
      <GaleriaModal
        imagenes={tabActual.galeria}
        indice={modal.idx}
        onIndice={(i) => setModal((m) => ({ ...m, idx: i }))}
        onCerrar={cerrarModal}
      />
    ) : null;

  // ── Modo estático (reduced motion / sin animación) ──
  if (estatico) {
    return (
      <div className="timeline-dolly">
        {tabsUI}
        <ol className="timeline-estatico">
          {placas.map((pl, i) => (
            <li key={pl.id} onClick={() => abrirEstatica(i)}>
              <img src={pl.imagen} alt={pl.alt} loading="lazy" />
              <div>
                <p>{pl.anio}</p>
                <h3>{pl.titulo}</h3>
                <p>{pl.descripcion}</p>
              </div>
            </li>
          ))}
        </ol>
        {modalUI}
      </div>
    );
  }

  if (N === 0) {
    return (
      <div className="timeline-dolly">
        {tabsUI}
        <p className="mt-10 text-sm text-slate-500">Aún no hay hitos con foto para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="timeline-dolly">
      {tabsUI}

      <div className="timeline-galeria" aria-label="Línea de tiempo interactiva">
        <div
          className="timeline-escenario"
          ref={escenario}
          onPointerDown={onInicio}
          onPointerMove={onMueve}
          onPointerUp={onFin}
          onPointerCancel={onFin}
        >
          {placas.map((pl, i) => {
            const lado = i % 2 === 0 ? -1 : 1;
            return (
              <div
                key={pl.id}
                ref={(el) => {
                  placasNodo.current[i] = el;
                }}
                className="timeline-placa"
                style={{
                  transform: `translate(-50%, -50%) translate3d(${lado * 34}px, 0px, ${i * -PASO_Z}px)`,
                }}
              >
                <img src={pl.imagen} alt={pl.alt} draggable={false} loading="lazy" style={{ objectPosition: pl.objectPosition }} />
                <span className="timeline-placa-anio">{pl.anio}</span>
              </div>
            );
          })}

          <div className="timeline-eje" aria-hidden="true">
            <div className="timeline-eje-relleno" ref={relleno} />
            <div
              ref={pulgar}
              className="timeline-eje-pulgar"
              onPointerDown={(e) => e.stopPropagation()}
            />
            {placas.map((pl, i) => (
              <button
                key={pl.id}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className="timeline-eje-marca"
                style={{ top: `${(i / fin) * 100}%` }}
                onClick={() => salto(i)}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="timeline-eje-punto" />
                <span className="timeline-eje-anio">{pl.anio}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className={`timeline-panel${asentada ? ' is-activa' : ''}`} aria-live="polite">
          <p className="timeline-panel-etapa">{placas[indice]?.etapa}</p>
          <p className="timeline-panel-anio">{placas[indice]?.anio}</p>
          <h3 className="timeline-panel-titulo">{placas[indice]?.titulo}</h3>
          <p className="timeline-panel-desc">{placas[indice]?.descripcion}</p>
          <div className="timeline-panel-pie">
            <span className="timeline-panel-cont">
              {String(indice + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </span>
            <button type="button" className="timeline-panel-zoom" onClick={() => setModal({ abierta: true, idx: indice })}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6" />
              </svg>
              Ampliar
            </button>
          </div>
        </aside>
      </div>

      <p className="timeline-pistas">
        {N > 1 ? 'Rueda para avanzar · Arrastrá la línea para saltar' : 'Arrastrá la línea para recorrerla'}
      </p>

      {modalUI}
    </div>
  );
}