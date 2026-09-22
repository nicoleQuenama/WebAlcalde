import { useRef } from 'react';
import type { MouseEvent } from 'react';

interface UseDragToScrollOptions {
  speed?: number;
  threshold?: number;
}

export function useDragToScroll<T extends HTMLElement>({
  speed = 1,
  threshold = 5,
}: UseDragToScrollOptions = {}) {
  const trackRef = useRef<T | null>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const onMouseDown = (e: MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX;
    scrollStart.current = el.scrollLeft;
  };

  const onMouseMove = (e: MouseEvent) => {
    const el = trackRef.current;
    if (!isDragging.current || !el) return;
    e.preventDefault();
    const deltaX = e.pageX - startX.current;
    if (Math.abs(deltaX) > threshold) hasMoved.current = true;
    el.scrollLeft = scrollStart.current - deltaX * speed;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  return { trackRef, isDragging, hasMoved, onMouseDown, onMouseMove, onMouseUp };
}