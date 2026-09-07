import { useEffect, useRef } from 'react';
import styles from './ThreeBook.module.css';

export interface ThreeBookProps {
  coverLabel?: string;
  accent?: string;
  coverImage?: string;
  onOpen?: () => void;
}

const FOV = 42;
const CAM_DIST = 3.25;
const BOOK_SCALE = 0.96;
const ROT_REST_Y = -0.55;
const ROT_HOVER_Y = -0.14;

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

function makeCoverTexture(
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
      ctx.fillStyle = '#12122a';
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
          bg.addColorStop(0, '#2c2c50');
          bg.addColorStop(0.55, '#1d1d3a');
          bg.addColorStop(1, '#12122a');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);
        }

        const shade = ctx.createLinearGradient(0, 0, 0, h);
        shade.addColorStop(0, 'rgba(10,10,26,0.38)');
        shade.addColorStop(0.45, 'rgba(10,10,26,0.3)');
        shade.addColorStop(1, 'rgba(10,10,26,0.68)');
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
        hl.addColorStop(0, 'rgba(255,255,255,0.16)');
        hl.addColorStop(1, 'rgba(255,255,255,0)');
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
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 24;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line, cx, startY + i * lineH);
          ctx.shadowBlur = 0;
        });

        ctx.save();
        ctx.globalAlpha = 0.08;
        const shine = ctx.createLinearGradient(w, 0, 0, h);
        shine.addColorStop(0, 'rgba(255,255,255,0)');
        shine.addColorStop(0.5, 'rgba(255,255,255,1)');
        shine.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.moveTo(w * 0.86, 0);
        ctx.lineTo(w * 1.02, 0);
        ctx.lineTo(w * 0.12, h);
        ctx.lineTo(-w * 0.04, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
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

function makeBackTexture(w: number, h: number, accent: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createLinearGradient(0, h, w * 0.7, 0);
  bg.addColorStop(0, '#14142c');
  bg.addColorStop(1, '#222245');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
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

function makeSpineTexture(w: number, h: number, accent: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createLinearGradient(w, 0, 0, 0);
  bg.addColorStop(0, '#0d0d20');
  bg.addColorStop(0.5, '#26264a');
  bg.addColorStop(1, '#1a1a36');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(w * 0.42, 0, w * 0.16, h);
  ctx.globalAlpha = 1;
  return c;
}

function makePaperTexture(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f6f2e6';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#d8d2c0';
  for (let y = 0; y < size; y += 4) {
    ctx.fillRect(0, y, size, 1);
  }
  return c;
}

export default function ThreeBook({
  coverLabel = 'Cochabamba',
  accent = '#c9a96e',
  coverImage,
  onOpen,
}: ThreeBookProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  const labelText = coverLabel ?? 'Cochabamba';

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let disposed = false;
    let raf = 0;
    let renderer: import('three').WebGLRenderer | null = null;
    let resizeObs: ResizeObserver | null = null;
    let group: import('three').Group | null = null;
    let materials: import('three').Material[] = [];
    let plumb = 0;
    let rotY = ROT_REST_Y;
    let rotX = 0.02;
    let hover = false;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const makeRoom = async (T: typeof import('three')) => {
      const scene = new T.Scene();

      const geo = new T.BoxGeometry(1, 1.6, 0.14);

      const coverCanvas = await makeCoverTexture(
        1024,
        1638,
        labelText,
        accent,
        coverImage,
      );
      const coverTex = new T.CanvasTexture(coverCanvas);
      const backTex = new T.CanvasTexture(makeBackTexture(1024, 1638, accent));
      const spineTex = new T.CanvasTexture(makeSpineTexture(256, 1638, accent));
      const paperTex = new T.CanvasTexture(makePaperTexture(256));

      const standard = (tex: import('three').Texture) =>
        new T.MeshStandardMaterial({
          map: tex,
          roughness: 0.55,
          metalness: 0.12,
        });
      const paperMat = new T.MeshStandardMaterial({
        map: paperTex,
        roughness: 0.85,
        metalness: 0,
      });

      materials = [
        paperMat,
        standard(spineTex),
        paperMat,
        paperMat,
        standard(coverTex),
        standard(backTex),
      ];

      const book = new T.Mesh(geo, materials);
      book.castShadow = true;
      book.receiveShadow = true;

      group = new T.Group();
      group.add(book);
      group.scale.setScalar(BOOK_SCALE);
      group.rotation.y = ROT_REST_Y;
      group.rotation.x = 0.02;
      scene.add(group);

      const plane = new T.Mesh(
        new T.PlaneGeometry(4.4, 2.4),
        new T.ShadowMaterial({ opacity: 0.5 }),
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -0.86;
      plane.receiveShadow = true;
      scene.add(plane);

      const amb = new T.AmbientLight(0xdfe3ff, 1.35);
      scene.add(amb);

      const light = new T.DirectionalLight(0xffffff, 2.4);
      light.position.set(3, 5, 4);
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      light.shadow.camera.left = -2.5;
      light.shadow.camera.right = 2.5;
      light.shadow.camera.top = 2.5;
      light.shadow.camera.bottom = -2.5;
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 20;
      light.shadow.bias = -0.0004;
      scene.add(light);

      const rim = new T.DirectionalLight(0x8fa3ff, 0.5);
      rim.position.set(-4, 3, -3);
      scene.add(rim);

      return { scene, geo };
    };

    const run = async () => {
      try {
        const T = await import('three');
        if (disposed) return;

        const { scene, geo: boxGeo } = await makeRoom(T);
        if (disposed) return;

        const camera = new T.PerspectiveCamera(FOV, 1, 0.1, 100);
        camera.position.set(0, 0, CAM_DIST);
        camera.lookAt(0, 0, 0);

        renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        const maxAniso = renderer.capabilities.getMaxAnisotropy();
        scene.traverse((obj) => {
          const mesh = obj as import('three').Mesh;
          if (mesh.isMesh && Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              const mat = m as import('three').MeshStandardMaterial;
              if (mat.map) mat.map.anisotropy = maxAniso;
            });
          }
        });

        const resize = () => {
          const rect = wrap.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          renderer!.setSize(rect.width, rect.height);
          camera.aspect = Math.max(rect.width / rect.height, 0.2);
          camera.updateProjectionMatrix();
        };

        resize();
        wrap.appendChild(renderer.domElement);

        resizeObs = new ResizeObserver(resize);
        resizeObs.observe(wrap);

        const handleOver = () => {
          hover = true;
        };
        const handleLeave = () => {
          hover = false;
        };
        wrap.addEventListener('pointerenter', handleOver);
        wrap.addEventListener('pointerleave', handleLeave);

        const clock = new T.Clock();
        const tick = () => {
          if (disposed) return;
          raf = requestAnimationFrame(tick);
          const dt = Math.min(clock.getDelta(), 0.05);
          plumb += dt * 1.7;
          if (group) {
            if (reduced) {
              rotY = hover ? ROT_HOVER_Y : ROT_REST_Y;
              rotX = hover ? 0.05 : 0.02;
            } else {
              rotY += ((hover ? ROT_HOVER_Y : ROT_REST_Y) - rotY) * 2.4 * dt;
              rotX += ((hover ? 0.05 : 0.02) - rotX) * 2.4 * dt;
            }
            group.rotation.y = rotY;
            group.rotation.x = rotX;
            group.position.y = reduced ? 0 : Math.sin(plumb) * 0.028;
          }
          renderer!.render(scene, camera);
        };
        tick();
      } catch (err) {
        console.error('ThreeBook init failed', err);
      }
    };

    void run();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObs?.disconnect();
      if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.domElement.remove();
        renderer.dispose();
      }
      materials.forEach((m) => {
        const mat = m as import('three').Material & { map?: import('three').Texture | null };
        mat.map?.dispose();
        mat.dispose();
      });
    };
  }, [labelText, accent, coverImage]);

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      role="button"
      tabIndex={0}
      aria-label={`Abrir libro ${labelText}`}
      onClick={() => openRef.current?.()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openRef.current?.();
        }
      }}
    />
  );
}