import { THREE_BOOK_COLORS } from '@constants/threeBook';

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr2 = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr2, y);
  ctx.lineTo(x + w - rr2, y);
  ctx.arcTo(x + w, y, x + w, y + rr2, rr2);
  ctx.lineTo(x + w, y + h - rr2);
  ctx.arcTo(x + w, y + h, x + w - rr2, y + h, rr2);
  ctx.lineTo(x + rr2, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr2, rr2);
  ctx.lineTo(x, y + rr2);
  ctx.arcTo(x, y, x + rr2, y, rr2);
  ctx.closePath();
}

export function makeCoverTexture(
  w: number,
  h: number,
  label: string,
  accent: string,
  coverImage?: string,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;

    const draw = () => {
      ctx.fillStyle = THREE_BOOK_COLORS.coverBase;
      ctx.fillRect(0, 0, w, h);

      let img: HTMLImageElement | null = null;
      if (coverImage) {
        img = new Image();
        img.crossOrigin = 'anonymous';
      }

      const paint = () => {
        if (img && img.complete && img.naturalWidth > 0) {
          const scale = Math.max(w / img.width, h / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          const dx = (w - dw) / 2;
          const dy = (h - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
        } else {
          const bg = ctx.createLinearGradient(0, 0, w * 0.24, h);
          bg.addColorStop(0, THREE_BOOK_COLORS.coverGradStart);
          bg.addColorStop(0.55, THREE_BOOK_COLORS.coverGradMid);
          bg.addColorStop(1, THREE_BOOK_COLORS.coverBase);
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);
        }

        const shade = ctx.createLinearGradient(0, 0, 0, h);
        shade.addColorStop(0, THREE_BOOK_COLORS.overlayShadowStart);
        shade.addColorStop(0.45, THREE_BOOK_COLORS.overlayShadowMid);
        shade.addColorStop(1, THREE_BOOK_COLORS.overlayShadowEnd);
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, w, h);

        const hl = ctx.createRadialGradient(
          w * 0.5,
          h * 0.16,
          0,
          w * 0.5,
          h * 0.16,
          w * 0.95
        );
        hl.addColorStop(0, THREE_BOOK_COLORS.overlayHighlight);
        hl.addColorStop(1, THREE_BOOK_COLORS.overlayFade);
        ctx.fillStyle = hl;
        ctx.fillRect(0, 0, w, h);

        const pad = w * 0.08;
        const baseFont = 'Segoe UI, system-ui, sans-serif';
        const cx = w / 2;

        const lines = label.split('\n');
        let labelPx = w * 0.2;
        ctx.font = `800 ${Math.round(labelPx)}px ${baseFont}`;
        while (
          lines.some((l) => ctx.measureText(l).width > w - pad * 2) &&
          labelPx > 14
        ) {
          labelPx -= 2;
          ctx.font = `800 ${Math.round(labelPx)}px ${baseFont}`;
        }

        const lineH = labelPx * 1.18;
        const blockH = lineH * lines.length;
        const startY = h * 0.46 - blockH / 2 + labelPx * 0.85;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        lines.forEach((line, i) => {
          ctx.shadowColor = THREE_BOOK_COLORS.textShadow;
          ctx.shadowBlur = 24;
          ctx.fillStyle = THREE_BOOK_COLORS.text;
          ctx.fillText(line, cx, startY + i * lineH);
          ctx.shadowBlur = 0;
        });

        ctx.save();
        ctx.globalAlpha = 0.08;
        const shine = ctx.createLinearGradient(w, 0, 0, h);
        shine.addColorStop(0, THREE_BOOK_COLORS.overlayFade);
        shine.addColorStop(0.5, THREE_BOOK_COLORS.overlayShine);
        shine.addColorStop(1, THREE_BOOK_COLORS.overlayFade);
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.moveTo(w * 0.86, 0);
        ctx.lineTo(w * 1.02, 0);
        ctx.lineTo(w * 0.12, h);
        ctx.lineTo(-w * 0.04, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = THREE_BOOK_COLORS.borderTexture;
        ctx.lineWidth = 3;
        roundRectPath(ctx, pad * 0.5, pad * 0.5, w - pad, h - pad, w * 0.02);
        ctx.stroke();

        resolve(c);
      };

      if (img && coverImage) {
        img.onload = paint;
        img.onerror = paint;
        img.src = coverImage;
        if (img.complete) paint();
      } else {
        paint();
      }
    };

    draw();
  });
}

export function makeBackTexture(w: number, h: number, accent: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createLinearGradient(0, h, w * 0.7, 0);
  bg.addColorStop(0, THREE_BOOK_COLORS.backGradStart);
  bg.addColorStop(1, THREE_BOOK_COLORS.backGradEnd);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = THREE_BOOK_COLORS.borderBack;
  ctx.lineWidth = w * 0.012;
  roundRectPath(ctx, w * 0.055, h * 0.055, w * 0.89, h * 0.89, w * 0.02);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  return c;
}

export function makeSpineTexture(w: number, h: number, accent: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createLinearGradient(w, 0, 0, 0);
  bg.addColorStop(0, THREE_BOOK_COLORS.spineGradStart);
  bg.addColorStop(0.5, THREE_BOOK_COLORS.spineGradMid);
  bg.addColorStop(1, THREE_BOOK_COLORS.spineGradEnd);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(w * 0.42, 0, w * 0.16, h);
  ctx.globalAlpha = 1;
  return c;
}

export function makePaperTexture(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = THREE_BOOK_COLORS.paperBase;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = THREE_BOOK_COLORS.paperLines;
  for (let y = 0; y < size; y += 4) {
    ctx.fillRect(0, y, size, 1);
  }
  return c;
}