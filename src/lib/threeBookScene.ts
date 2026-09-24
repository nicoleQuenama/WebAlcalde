import type { BufferGeometry, Group, Material, Mesh, Texture, WebGLRenderer } from 'three';
import type { ThreeBookSceneOptions } from '../types/threeBook';
import { BOOK_SCALE, CAM_DIST, FOV, ROT_HOVER_Y, ROT_REST_Y, THREE_BOOK_COLORS } from '@constants/threeBook';
import { makeBackTexture, makeCoverTexture, makePaperTexture, makeSpineTexture } from '@lib/threeBookTextures';

const COVER_SIZE = { w: 1024, h: 1638 };
const SPINE_SIZE = { w: 256, h: 1638 };
const PAPER_SIZE = 256;

export function startThreeBook(
  container: HTMLElement,
  opts: ThreeBookSceneOptions,
): () => void {
  let disposed = false, raf = 0, renderer: WebGLRenderer | null = null;
  let resizeObs: ResizeObserver | null = null, group: Group | null = null, materials: Material[] = [];
  let textures: Texture[] = [], geometries: BufferGeometry[] = [], plumb = 0;
  let rotY = ROT_REST_Y, rotX = 0.02, hover = false;
  
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleOver = () => {
    hover = true;
  };
  const handleLeave = () => {
    hover = false;
  };

  const disposeResources = () => {
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    geometries.forEach((g) => g.dispose());
    materials = [];
    textures = [];
    geometries = [];
    group = null;
  };

  const buildScene = async (T: typeof import('three')) => {
    const scene = new T.Scene();

    const boxGeo = new T.BoxGeometry(1, 1.6, 0.14);
    geometries.push(boxGeo);

    const coverCanvas = await makeCoverTexture(
      COVER_SIZE.w,
      COVER_SIZE.h,
      opts.label,
      opts.accent,
      opts.coverImage,
    );
    const coverTex = new T.CanvasTexture(coverCanvas);
    const backTex = new T.CanvasTexture(makeBackTexture(COVER_SIZE.w, COVER_SIZE.h, opts.accent));
    const spineTex = new T.CanvasTexture(makeSpineTexture(SPINE_SIZE.w, SPINE_SIZE.h, opts.accent));
    const paperTex = new T.CanvasTexture(makePaperTexture(PAPER_SIZE));
    textures.push(coverTex, backTex, spineTex, paperTex);

    const standard = (tex: Texture) =>
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

    const bookMats = [
      paperMat,
      standard(spineTex),
      paperMat,
      paperMat,
      standard(coverTex),
      standard(backTex),
    ];
    const shadowMat = new T.ShadowMaterial({ opacity: 0.5 });
    materials = [...bookMats, shadowMat];

    const book = new T.Mesh(boxGeo, bookMats);
    book.castShadow = true;
    book.receiveShadow = true;

    group = new T.Group();
    group.add(book);
    group.scale.setScalar(BOOK_SCALE);
    group.rotation.y = ROT_REST_Y;
    group.rotation.x = 0.02;
    scene.add(group);

    const planeGeo = new T.PlaneGeometry(4.4, 2.4);
    geometries.push(planeGeo);
    const plane = new T.Mesh(planeGeo, shadowMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.86;
    plane.receiveShadow = true;
    scene.add(plane);

    const amb = new T.AmbientLight(THREE_BOOK_COLORS.lightAmbient, 1.35);
    scene.add(amb);

    const light = new T.DirectionalLight(THREE_BOOK_COLORS.lightMain, 2.4);
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

    const rim = new T.DirectionalLight(THREE_BOOK_COLORS.lightRim, 0.5);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    return scene;
  };

  const run = async () => {
    try {
      const T = await import('three');
      if (disposed) return;

      const scene = await buildScene(T);
      if (disposed) {
        disposeResources();
        return;
      }

      const camera = new T.PerspectiveCamera(FOV, 1, 0.1, 100);
      camera.position.set(0, 0, CAM_DIST);
      camera.lookAt(0, 0, 0);

      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      scene.traverse((obj) => {
        const mesh = obj as Mesh;
        if (mesh.isMesh && Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            const mat = m as import('three').MeshStandardMaterial;
            if (mat.map) mat.map.anisotropy = maxAniso;
          });
        }
      });

      const resize = () => {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        renderer!.setSize(rect.width, rect.height);
        camera.aspect = Math.max(rect.width / rect.height, 0.2);
        camera.updateProjectionMatrix();
      };

      resize();
      container.appendChild(renderer.domElement);

      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(container);

      container.addEventListener('pointerenter', handleOver);
      container.addEventListener('pointerleave', handleLeave);

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
    container.removeEventListener('pointerenter', handleOver);
    container.removeEventListener('pointerleave', handleLeave);
    if (renderer) {
      renderer.setAnimationLoop(null);
      renderer.domElement.remove();
      renderer.dispose();
    }
    disposeResources();
  };
}