import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import GaleriaModal from '@components/global/Hero/GaleriaModal';
import type { PlacaDolly, TabDolly } from './types';
import './timeline.css';

interface Props {
  tabs: TabDolly[];
}

/** Profundidad (px) entre placas consecutivas a lo largo del eje Z. */
const PASO_Z = 750;
/** Cuántas placas se ven "atrás" del foco antes de apagarse. */
const ALCANCE = 2.5;
/** Cuántas placas "delante" del foco pasan rápido por la lente. */
const PASO = 0.8;
/** Suavizado de la cámara (0 = instantáneo, 1 = no llega nunca). */
const RESORTE = 0.16;
/** Umbral de quietud para mostrar el overlay de la placa enfocada. */
const UMBRAL = 0.22;

const limita = (n: number) => Math.max(0, Math.min(1, n));

export default function TimelineDolly({ tabs }: Props) {
  const [pestana, setPestana] = useState(0);
  const [estatico, setEstatico] = useState(false);
  const [movil, setMovil] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  const tabActual = tabs[pestana] ?? tabs[0];
  const placas: PlacaDolly[] = tabActual?.placas ?? [];
  const N = placas.length;
  const claveTab = tabActual?.id ?? '';

  const [indice, setIndice] = useState(0);
  const [mvIdx, setMvIdx] = useState(0);
  const [modal, setModal] = useState<{ abierta: boolean; idx: number }>({ abierta: false, idx: 0 });
  const [detalle, setDetalle] = useState<{ abierta: boolean; idx: number }>({ abierta: false, idx: 0 });

  // ── Refs de la animación (escritura directa por frame, sin re-renders) ──
  const pos = useRef(0);
  const objetivo = useRef(0);
  const redondo = useRef(0);
  const escenario = useRef<HTMLDivElement>(null);
  const placasNodo = useRef<(HTMLDivElement | null)[]>([]);
  const relleno = useRef<HTMLDivElement>(null);
  const pulgar = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ y: number; movido: boolean } | null>(null);
  const suprimirClick = useRef(false);
  const ultimaRueda = useRef(0);
  const geo = useRef({ w: 268, h: 335, alt: 0.16 });
  const pistaMovil = useRef<HTMLDivElement>(null);
  const barraMovil = useRef<HTMLDivElement>(null);
  const mvDown = useRef({ x: 0, y: 0, movio: true });

  const fin = useMemo(() => Math.max(1, N - 1), [N]);

  const pintar = useCallback(() => {
    if (placasNodo.current.length > N) placasNodo.current.length = N;
    const p = pos.current;
    for (let i = 0; i < N; i += 1) {
      const nodo = placasNodo.current[i];
      if (!nodo) continue;
      const d = i - p;
      const lado = i % 2 === 0 ? -1 : 1;
      const x = lado * geo.current.w * geo.current.alt;
      const atras = d > 0;
      const opac = atras ? limita(1 - d / ALCANCE) : limita(1 + d / PASO);
      const gris = limita(Math.abs(d) / 1.4);
      const brillo = 1 - limita(Math.abs(d) / 2.5) * 0.18;
      nodo.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0px, ${d * -PASO_Z}px) rotateY(${lado * 2}deg)`;
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

    if (info.current) {
      const dist = Math.abs(p - idx);
      const vis = 1 - limita((dist / 0.3) ** 2);
      info.current.style.opacity = String(vis);
      info.current.style.visibility = vis > 0.15 ? 'visible' : 'hidden';
      info.current.style.pointerEvents = vis > 0.15 ? 'auto' : 'none';
    }
  }, [N, fin]);

  // ── Bucle de animación (cámara que se acerca al objetivo) ──────────
  useEffect(() => {
    redondo.current = 0;
    setIndice(0);
    pos.current = 0;
    objetivo.current = 0;

    let raf = 0;
    const animar = () => {
      const p = pos.current;
      const t = objetivo.current;
      pos.current = Math.abs(t - p) < 0.0005 ? t : p + (t - p) * (arrastre.current ? 0.3 : RESORTE);
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
      geo.current = { w, h: w * 1.25, alt: w >= 300 ? 0.75 : 0.18 };
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

  // ── Detección de móvil → carrusel inmersivo en lugar del dolly ─────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setMovil(!mq.matches);
    const alCambio = (e: MediaQueryListEvent) => setMovil(!e.matches);
    mq.addEventListener('change', alCambio);
    return () => mq.removeEventListener('change', alCambio);
  }, []);

  // ── Carrusel móvil: progreso y avance vertical automático ───────────
  const onScrollMovil = () => {
    const c = pistaMovil.current;
    if (!c) return;
    const slideW = c.children[0] ? c.children[0].clientWidth + 16 : c.clientWidth;
    const sn = slideW > 0 ? Math.round(c.scrollLeft / slideW) : 0;
    if (sn !== mvIdx && sn >= 0 && sn < N) setMvIdx(sn);
    const total = Math.max(1, c.scrollWidth - c.clientWidth);
    const fracc = limita(c.scrollLeft / total);
    if (barraMovil.current) barraMovil.current.style.width = `${fracc * 100}%`;
  };

  const onTapMovilDown = (e: React.PointerEvent<HTMLElement>) => {
    mvDown.current = { x: e.clientX, y: e.clientY, movio: false };
  };
  const onTapMovilUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = mvDown.current;
    if (d.movio) return;
    const dx = Math.abs(e.clientX - d.x);
    const dy = Math.abs(e.clientY - d.y);
    if (dx < 8 && dy < 8) abrirDetalle(mvIdx);
  };

  useEffect(() => {
    if (!movil || estatico) return;
    const onKey = (e: KeyboardEvent) => {
      if (modal.abierta || detalle.abierta) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const c = pistaMovil.current;
        if (!c) return;
        const pasoW = (c.children[0] ? c.children[0].clientWidth + 16 : c.clientWidth) || c.clientWidth;
        c.scrollBy({ left: e.key === 'ArrowRight' ? pasoW : -pasoW, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [movil, estatico, modal.abierta, detalle.abierta]);

  useEffect(() => {
    if (!detalle.abierta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarDetalle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detalle.abierta]);

  useEffect(() => {
    pistaMovil.current?.scrollTo({ left: 0 });
    setMvIdx(0);
  }, [pestana]);

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
    suprimirClick.current = false;
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
      suprimirClick.current = true;
      setTimeout(() => {
        suprimirClick.current = false;
      }, 80);
    } else if (Math.abs(objetivo.current - indice) < UMBRAL) {
      setModal({ abierta: true, idx: indice });
    }
  };

  const salto = (i: number) => {
    if (suprimirClick.current) {
      suprimirClick.current = false;
      return;
    }
    objetivo.current = i;
  };

  const cerrarModal = () => setModal({ abierta: false, idx: 0 });

  const abrirDetalle = (i: number) => setDetalle({ abierta: true, idx: i });
  const cerrarDetalle = () => setDetalle({ abierta: false, idx: 0 });

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

  const detalleUI =
    detalle.abierta && placas[detalle.idx] ? (
      <div className="timeline-detalle-overlay" onClick={cerrarDetalle}>
        <div
          className="timeline-detalle"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de ${placas[detalle.idx].titulo}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            className="timeline-detalle-img"
            src={placas[detalle.idx].imagen}
            alt={placas[detalle.idx].alt}
            style={{ '--obj': placas[detalle.idx].objectPosition } as import('react').CSSProperties}
          />
          <div className="timeline-detalle-cuerpo">
            <div className="timeline-detalle-top">
              <span className="timeline-detalle-anio">{placas[detalle.idx].anio}</span>
              <p className="timeline-detalle-kicker">{placas[detalle.idx].etapa}</p>
            </div>
            <h3 className="timeline-detalle-titulo">{placas[detalle.idx].titulo}</h3>
            <p className="timeline-detalle-desc">{placas[detalle.idx].descripcion}</p>
          </div>
          <div className="timeline-detalle-acciones">
            <button
              type="button"
              className="timeline-detalle-boton"
              onClick={() => {
                const i = detalle.idx;
                cerrarDetalle();
                setModal({ abierta: true, idx: i });
              }}
            >
              Ver galería
            </button>
            <button type="button" className="timeline-detalle-boton timeline-detalle-boton-borde" onClick={cerrarDetalle}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
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
        {montado && createPortal(modalUI, document.body)}
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

  // ── Móvil: carrusel inmersivo (en lugar del dolly 3D) ──────────────
  if (movil) {
    return (
      <div className="timeline-dolly">
        {tabsUI}
        <div className="timeline-movil">
          <div className="timeline-movil-progreso" aria-hidden="true">
            <div className="timeline-movil-progreso-bar" ref={barraMovil} />
          </div>
          <div
            className="timeline-movil-pista"
            ref={pistaMovil}
            tabIndex={0}
            aria-label="Hitos profesionales, deslizá para recorrer"
            onScroll={onScrollMovil}
          >
            {placas.map((pl) => (
              <article
                key={pl.id}
                className="timeline-movil-placa"
                style={{ '--obj': pl.objectPosition } as import('react').CSSProperties}
                onPointerDown={onTapMovilDown}
                onPointerUp={onTapMovilUp}
                onPointerCancel={() => {
                  mvDown.current.movio = true;
                }}
              >
                <img src={pl.imagen} alt={pl.alt} draggable={false} loading="lazy" />
                <div className="timeline-movil-info">
                  <div className="timeline-movil-info-top">
                    <span className="timeline-movil-anio">{pl.anio}</span>
                    <p className="timeline-movil-kicker">{pl.etapa}</p>
                  </div>
                  <h3 className="timeline-movil-titulo">{pl.titulo}</h3>
                  <span className="timeline-movil-ver">Leer más</span>
                </div>
              </article>
            ))}
          </div>
          <p className="timeline-pistas">Deslizá para recorrer · Tocá una foto para leer más</p>
        </div>
        {montado && createPortal(detalleUI, document.body)}
        {montado && createPortal(modalUI, document.body)}
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
                  transform: `translate(-50%, -50%) translate3d(${lado * 50}px, 0px, ${i * -PASO_Z}px)`,
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
              >
                <span className="timeline-eje-punto" />
                <span className="timeline-eje-anio">{pl.anio}</span>
              </button>
            ))}
          </div>
        </div>

        {placas[indice] ? (
          <div
            ref={info}
            className={`timeline-info ${indice % 2 === 0 ? 'timeline-info--der' : 'timeline-info--izq'}`}
            onClick={() => abrirDetalle(indice)}
          >
            <p className="timeline-info-kicker">{placas[indice].etapa}</p>
            <h3 className="timeline-info-titulo">{placas[indice].titulo}</h3>
            <span className="timeline-info-anio">{placas[indice].anio}</span>
            <span className="timeline-info-zoom">Leer más</span>
          </div>
        ) : null}
      </div>

      <p className="timeline-pistas">
        {N > 1 ? 'Rueda para avanzar · Arrastrá la línea para saltar' : 'Arrastrá la línea para recorrerla'}
      </p>

      {montado && createPortal(detalleUI, document.body)}
      {montado && createPortal(modalUI, document.body)}
    </div>
  );
}