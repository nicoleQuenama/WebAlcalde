import type { ReactNode } from 'react';

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
}

export interface PageFlipInstance {
  flipNext: (corner?: 'top' | 'bottom') => void;
  flipPrev: (corner?: 'top' | 'bottom') => void;
  flip: (page: number) => void;
  turnToPage: (page: number) => void;
  getCurrentPageIndex: () => number;
  getPageCount: () => number;
  getOrientation: () => 'portrait' | 'landscape';
}
