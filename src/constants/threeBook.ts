export const FOV = 42;
export const CAM_DIST = 3.25;
export const BOOK_SCALE = 0.96;
export const ROT_REST_Y = -0.55;
export const ROT_HOVER_Y = -0.14;

// Paleta de las texturas canvas del libro 3D (tonos nocturnos de marca + papel).
export const THREE_BOOK_COLORS = {
  coverBase: '#12122a',
  coverGradStart: '#2c2c50',
  coverGradMid: '#1d1d3a',
  backGradStart: '#14142c',
  backGradEnd: '#222245',
  spineGradStart: '#0d0d20',
  spineGradMid: '#26264a',
  spineGradEnd: '#1a1a36',
  paperBase: '#f6f2e6',
  paperLines: '#d8d2c0',
  accent: '#472d82',
  text: '#ffffff',
  textShadow: 'rgba(0,0,0,0.6)',
  overlayShadowStart: 'rgba(10,10,26,0.38)',
  overlayShadowMid: 'rgba(10,10,26,0.3)',
  overlayShadowEnd: 'rgba(10,10,26,0.68)',
  overlayHighlight: 'rgba(255,255,255,0.16)',
  overlayFade: 'rgba(255,255,255,0)',
  overlayShine: 'rgba(255,255,255,1)',
  borderTexture: 'rgba(255,255,255,0.14)',
  borderBack: 'rgba(255,255,255,0.07)',
  lightAmbient: 0xdfe3ff,
  lightMain: 0xffffff,
  lightRim: 0x8fa3ff,
} as const;
