import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CableCarScrollProps } from './types';
import styles from './CableCarScroll.module.css';

interface CabinProps {
  curve: THREE.CatmullRomCurve3;
  offset: number;
  scrollRef: React.MutableRefObject<number>;
  cabinColor: string;
  accent: string;
  windowColor: string;
  primary: boolean;
  reduced: boolean;
}

function Cabin({
  curve,
  offset,
  scrollRef,
  cabinColor,
  accent,
  windowColor,
  primary,
  reduced,
}: CabinProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const base = scrollRef.current + offset;
    const t = ((base % 1) + 1) % 1;
    const point = curve.getPointAt(Math.min(Math.max(t, 0), 1));
    group.position.copy(point);

    if (reduced) {
      group.rotation.set(0, 0, 0);
    } else {
      group.rotation.z = Math.sin(clock.elapsedTime * 2 + offset * 20) * (primary ? 0.05 : 0.09);
    }

    if (glassRef.current) {
      const mat = glassRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 3 + offset * 20) * 0.12;
    }
  });

  const dim = primary ? 1 : 0.72;

  return (
    <group ref={groupRef} scale={[dim, dim, dim]}>
      <group position={[0, -0.8, 0]}>
        {/* hook / hanger */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 10]} />
          <meshStandardMaterial color={accent} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* roof */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[1.05, 0.08, 0.75]} />
          <meshStandardMaterial color={accent} metalness={0.6} roughness={0.35} />
        </mesh>
        {/* body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0.9, 0.7]} />
          <meshStandardMaterial color={cabinColor} metalness={0.4} roughness={0.4} />
        </mesh>
        {/* windows: front + back glass with glow */}
        <mesh ref={glassRef} position={[0, 0, 0.352]}>
          <boxGeometry args={[0.82, 0.55, 0.01]} />
          <meshPhysicalMaterial
            color={windowColor}
            transparent
            opacity={0.4}
            metalness={0.1}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0, -0.352]}>
          <boxGeometry args={[0.82, 0.55, 0.01]} />
          <meshPhysicalMaterial
            color={windowColor}
            transparent
            opacity={0.4}
            metalness={0.1}
            roughness={0.1}
          />
        </mesh>
        {/* side bars */}
        <mesh position={[0.53, 0, 0]}>
          <boxGeometry args={[0.02, 0.85, 0.72]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.53, 0, 0]}>
          <boxGeometry args={[0.02, 0.85, 0.72]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function Cable({ curve, accent }: { curve: THREE.CatmullRomCurve3; accent: string }) {
  const curveRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    if (!curveRef.current) return;
    const points = curve.getPoints(64);
    curveRef.current.setFromPoints(points);
  }, [curve]);

  return (
    <line>
      <bufferGeometry ref={curveRef} />
      <lineBasicMaterial color={accent} transparent opacity={0.35} />
    </line>
  );
}

function Scene({ cabinColor, accent, windowColor, cabinCount, reduced }: CableCarScrollProps & { reduced: boolean }) {
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, 4.5, 1.5),
        new THREE.Vector3(-2, 1.2, 0.5),
        new THREE.Vector3(2, -1.2, 0),
        new THREE.Vector3(6, -4.5, -1),
      ]),
    []
  );

  const cabins = useMemo(() => {
    return Array.from({ length: cabinCount ?? 4 }, (_, i) => ({
      key: i,
      offset: i / (cabinCount ?? 4),
      primary: i === 0,
    }));
  }, [cabinCount]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 6]} intensity={1.6} />
      <directionalLight position={[-5, -2, -4]} intensity={0.5} color="#8fa3ff" />
      <Cable curve={curve} accent={accent ?? '#c9a96e'} />
      {cabins.map((c) => (
        <Cabin
          key={c.key}
          curve={curve}
          offset={c.offset}
          scrollRef={scrollRef}
          cabinColor={cabinColor ?? '#ffc31e'}
          accent={accent ?? '#c9a96e'}
          windowColor={windowColor ?? '#7ad0ff'}
          primary={c.primary}
          reduced={reduced}
        />
      ))}
    </>
  );
}

export default function CableCarScroll({
  cabinColor,
  accent,
  windowColor,
  cabinCount,
  className,
}: CableCarScrollProps) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className={`${styles.fixed} ${className ?? ''}`}
      aria-hidden="true"
    >
      <div className={styles.veil} />
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
      >
        <Scene
          cabinColor={cabinColor}
          accent={accent}
          windowColor={windowColor}
          cabinCount={cabinCount}
          reduced={reduced}
        />
      </Canvas>
    </div>
  );
}
