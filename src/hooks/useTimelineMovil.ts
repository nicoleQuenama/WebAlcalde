import { useEffect, useRef, useState } from 'react';
import { SEPARACION_MOVIL, UMBRAL_TAP } from '@constants/timeline/dolly';
import { limita } from '@utils/limita';
import type { CarruselMovil } from '@components/About/LifeJourney/Timeline/types';

interface Config {
  /** Cantidad de placas de la pestaña activa. */
  n: number;
  /** true solo cuando el carrusel móvil está montado. */
  activo: boolean;
  /** Id de la pestaña activa (reinicia el carrusel al cambiar). */
  clave: string;
  /** true mientras hay un modal abierto (silencia el teclado). */
  modalAbierta: boolean;
  /** true mientras el detalle está abierto (silencia el teclado). */
  detalleAbierta: boolean;
  /** Abre el detalle de la placa cuando el usuario toca (sin deslizar). */
  onAbrirDetalle: (indice: number) => void;
}

const TECLAS_PESTAÑA = ['ArrowRight', 'ArrowLeft'];

/** Carrusel móvil: scroll vertical, barra de progreso y tap para leer más. */
export function useTimelineMovil({ n, activo, clave, modalAbierta, detalleAbierta, onAbrirDetalle }: Config): CarruselMovil {
  const [indice, setIndice] = useState(0);
  const pista = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const abajo = useRef({ x: 0, y: 0, movio: true });

  const anchoSlide = (c: HTMLDivElement) =>
    c.children[0] ? c.children[0].clientWidth + SEPARACION_MOVIL : c.clientWidth;

  const onScroll = () => {
    const c = pista.current;
    if (!c) return;
    const slideW = anchoSlide(c);
    const sn = slideW > 0 ? Math.round(c.scrollLeft / slideW) : 0;
    if (sn !== indice && sn >= 0 && sn < n) setIndice(sn);
    const total = Math.max(1, c.scrollWidth - c.clientWidth);
    const fracc = limita(c.scrollLeft / total);
    if (barra.current) barra.current.style.width = `${fracc * 100}%`;
  };

  const onTapDown = (e: React.PointerEvent<HTMLElement>) => {
    abajo.current = { x: e.clientX, y: e.clientY, movio: false };
  };
  const onTapUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = abajo.current;
    if (d.movio) return;
    const dx = Math.abs(e.clientX - d.x);
    const dy = Math.abs(e.clientY - d.y);
    if (dx < UMBRAL_TAP && dy < UMBRAL_TAP) onAbrirDetalle(indice);
  };
  const onTapCancel = () => {
    abajo.current.movio = true;
  };

  // Teclado: flechas laterales recorren la pista.
  useEffect(() => {
    if (!activo) return;
    const onKey = (e: KeyboardEvent) => {
      if (modalAbierta || detalleAbierta) return;
      if (TECLAS_PESTAÑA.includes(e.key)) {
        e.preventDefault();
        const c = pista.current;
        if (!c) return;
        const pasoW = anchoSlide(c) || c.clientWidth;
        c.scrollBy({ left: e.key === 'ArrowRight' ? pasoW : -pasoW, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activo, modalAbierta, detalleAbierta]);

  // Al cambiar de pestaña, vuelve al inicio.
  useEffect(() => {
    pista.current?.scrollTo({ left: 0 });
    setIndice(0);
  }, [clave]);

  return { indice, pista, barra, onScroll, onTapDown, onTapUp, onTapCancel };
}
