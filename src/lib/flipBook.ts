import { Children, isValidElement, type ReactNode, type ReactElement, type ComponentType } from 'react';
import { FIT, WIDTH_BOOST } from '@constants/flipBook';
import type { OpenSize, Rect, TocGroup } from '@type/flipBook';
import type { Capitulo, EraTemario } from '@lib/db';

export const TITLE_RE = /(^|\s)(cover-title|back-title|page-title)($|\s)/;

let CachedFlipBook: ComponentType<Record<string, unknown>> | null = null;
let loadPromise: Promise<ComponentType<Record<string, unknown>>> | null = null;

export function loadFlipBook(): Promise<ComponentType<Record<string, unknown>>> {
  if (!loadPromise) {
    loadPromise = import('react-pageflip').then(
      (mod) => mod.default as unknown as ComponentType<Record<string, unknown>>,
    );
  }
  return loadPromise;
}

export function getCachedFlipBook(): ComponentType<Record<string, unknown>> | null {
  return CachedFlipBook;
}

export function setCachedFlipBook(comp: ComponentType<Record<string, unknown>>): void {
  CachedFlipBook = comp;
}

export function flattenPages(target: ReactNode): ReactNode {
  if (isValidElement(target)) {
    const element = target as ReactElement<Record<string, unknown>>;
    if (element.type === 'astro-slot') return element.props.children as ReactNode;
  }
  return target;
}

export function collectLabels(node: ReactNode, out: string[]): void {
  if (!isValidElement(node)) return;
  const element = node as ReactElement<{ className?: unknown; children?: ReactNode }>;
  const cls = typeof element.props?.className === 'string' ? element.props.className : '';
  if (TITLE_RE.test(cls)) {
    const text = Children.toArray(element.props.children)
      .map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) out.push(text);
  }
  Children.forEach(element.props.children, (child) => collectLabels(child, out));
}

export const computeOpenSize = (width: number, height: number): OpenSize => {
  const pad = 16;
  const topSpace = 70;
  const bottomSpace = 58;
  const availW = window.innerWidth - pad * 2;
  const availH = window.innerHeight - pad * 2 - topSpace - bottomSpace;
  const pageAspect = height / width;
  const spreadAspect = (2 * width) / height;

  if (window.innerWidth < 640) {
    const pageWidth = Math.min(Math.floor(availW * FIT), 440);
    let pageHeight = Math.floor(pageWidth * pageAspect);
    if (pageHeight > availH) pageHeight = Math.floor(availH * FIT);
    return { width: pageWidth, height: pageHeight, containerWidth: pageWidth };
  }

  let containerW = Math.floor(availH * FIT * spreadAspect * WIDTH_BOOST);
  let containerH = Math.floor(availH * FIT);
  const fitW = Math.floor(availW * FIT);
  if (containerW > fitW) {
    containerW = fitW;
    containerH = Math.floor(fitW / (spreadAspect * WIDTH_BOOST));
  }
  const pageWidth = Math.floor(containerW / 2);
  return {
    width: pageWidth,
    height: containerH,
    containerWidth: pageWidth * 2,
  };
};

/**
 * Índice del libro digital: portada + capítulos de apertura + una entrada
 * por era/sección, en el mismo orden de páginas que arma `Book.tsx`.
 */
export function buildLibroToc(capitulos: Capitulo[], eras: EraTemario[]): TocGroup[] {
  let page = 1;
  const aperturaItems = [
    { label: 'Portada', page: 0 },
    { label: capitulos[0].eyebrow, page: page++ },
    { label: capitulos[1].titulo, page: page++ },
    { label: capitulos[2].titulo, page: page++ },
  ];
  const gruposEras = eras.map((era) => {
    const items = [{ label: era.titulo, page: page++ }];
    for (const seccion of era.secciones) items.push({ label: seccion.titulo, page: page++ });
    return { title: era.eyebrow, items };
  });
  return [
    { title: 'Apertura', items: aperturaItems },
    ...gruposEras,
    { title: 'Cierre', items: [{ label: 'Contraportada', page }] },
  ];
}

export const isVideoUrl = (url: string): boolean => /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);
export const isYouTube = (url: string): boolean => /(youtube\.com|youtu\.be)/i.test(url);

export const youTubeEmbed = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,12})/);
  if (!m) return null;
  return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
};

export const animateBetween = (
  wrapper: HTMLDivElement,
  inner: HTMLDivElement,
  from: Rect,
  to: Rect,
  scaleFrom: number,
  scaleTo: number,
): void => {
  wrapper.style.transition = 'none';
  inner.style.transition = 'none';
  wrapper.style.left = `${from.x}px`;
  wrapper.style.top = `${from.y}px`;
  wrapper.style.width = `${from.width}px`;
  wrapper.style.height = `${from.height}px`;
  inner.style.transform = `scale(${scaleFrom})`;
  void wrapper.offsetHeight;
  wrapper.style.transition = '';
  inner.style.transition = '';
  requestAnimationFrame(() => {
    wrapper.style.left = `${to.x}px`;
    wrapper.style.top = `${to.y}px`;
    wrapper.style.width = `${to.width}px`;
    wrapper.style.height = `${to.height}px`;
    inner.style.transform = `scale(${scaleTo})`;
  });
};
