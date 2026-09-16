import type { MutableRefObject, ReactNode } from 'react';

export interface FlipBookProps {
  width: number;
  height: number;
  children: ReactNode;
  size?: 'fixed' | 'stretch';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  flippingTime?: number;
  drawShadow?: boolean;
  maxShadowOpacity?: number;
  showPageCorners?: boolean;
  mobileScrollSupport?: boolean;
  swipeDistance?: number;
  usePortrait?: boolean;
  className?: string;
  bookRef?: MutableRefObject<{ pageFlip: () => unknown } | null>;
  eyebrow?: string;
  title?: string;
  subtitle?: ReactNode;
  ctaLabel?: string;
  coverImage?: string;
  coverLabel3D?: string;
  toc?: TocGroup[] | TocItem[];
  initialPage?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface MediaItem {
  type: 'video' | 'image';
  url: string | null;
  alt: string;
}

export type TocItem = { label: string; page: number };
export type TocGroup = { title?: string; items: TocItem[] };

export type PageFlipLike = {
  flip: (page: number) => void;
  getUI?: () => { getDistElement?: () => HTMLElement };
  flipNext?: () => void;
  flipPrev?: () => void;
};

export type Phase = 'closed' | 'opening' | 'open' | 'closing';

export interface OpenSize {
  width: number;
  height: number;
  containerWidth: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
