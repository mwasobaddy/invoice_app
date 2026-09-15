'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Sparkles } from '@react-three/drei';
import AtlasCore from './AtlasCore';
import { usePointer, usePrefersReducedMotion, useScrollProgress } from './scroll';

type HoverRef = React.MutableRefObject<string | null>;

/** Cinematic camera: three waypoints (macro → orbit reveal → radiant push-in),
 *  pointer parallax, handheld sway, and an FOV kick on scroll velocity. */
function Rig({
  progress,
  pointer,
  reduced,
  hover,
}: {
  progress: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
  reduced: React.MutableRefObject<boolean>;
  hover: HoverRef;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const look = useRef(new THREE.Vector3(-0.7, -1.5, 0));
  const pLerp = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const vel = useRef(0);

  const W0 = useMemoPos([1.3, -0.5, 5.0], [-0.7, -1.5, 0]);
  const W1 = useMemoPos([-4.8, 0.6, 7.2], [-0.7, -1.5, 0]);
  const W2 = useMemoPos([-0.2, 1.6, 5.6], [-0.7, -1.7, 0]);

  useFrame(({ clock }, delta) => {
    const k = Math.min(1, delta * 3.2);
    const t = clock.getElapsedTime();
    pLerp.current += (progress.current - pLerp.current) * k;
    const p = reduced.current ? 0 : pLerp.current;

    // waypoint blend (smoothstep within each half)
    const seg = (a: number, b: number, x: number) => {
      const tt = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return tt * tt * (3 - 2 * tt);
    };
    const w = p < 0.5 ? seg(0, 0.5, p) : 1;
    const w2 = p < 0.5 ? 0 : seg(0.5, 1, p);
    const px = THREE.MathUtils.lerp(THREE.MathUtils.lerp(W0.pos[0], W1.pos[0], w), W2.pos[0], w2);
    const py = THREE.MathUtils.lerp(THREE.MathUtils.lerp(W0.pos[1], W1.pos[1], w), W2.pos[1], w2);
    const pz = THREE.MathUtils.lerp(THREE.MathUtils.lerp(W0.pos[2], W1.pos[2], w), W2.pos[2], w2);
    const lx = THREE.MathUtils.lerp(THREE.MathUtils.lerp(W0.look[0], W1.look[0], w), W2.look[0], w2);
    const ly = THREE.MathUtils.lerp(THREE.MathUtils.lerp(W0.look[1], W1.look[1], w), W2.look[1], w2);

    const mx = !reduced.current && pointer.current.active ? pointer.current.x : 0;
    const my = !reduced.current && pointer.current.active ? pointer.current.y : 0;
    const sway = reduced.current ? 0 : 1;

    camera.position.x += (px + mx * 0.65 + Math.sin(t * 0.5) * 0.05 * sway - camera.position.x) * k;
    camera.position.y += (py + my * 0.35 + Math.cos(t * 0.42) * 0.04 * sway - camera.position.y) * k;
    camera.position.z += (pz - camera.position.z) * k;
    look.current.set(lx, ly, 0);
    camera.lookAt(look.current);

    // FOV kick from scroll velocity (cinematic zoom pulse)
    if (!reduced.current) {
      const now = performance.now();
      const dt = Math.max(16, now - lastT.current);
      const v = Math.abs(window.scrollY - lastY.current) / dt;
      lastY.current = window.scrollY;
      lastT.current = now;
      vel.current += (Math.min(v * 3.2, 1) - vel.current) * Math.min(1, delta * 5);
      const fov = 42 + vel.current * 6.5;
      if (Math.abs(camera.fov - fov) > 0.02) {
        camera.fov += (fov - camera.fov) * Math.min(1, delta * 5);
        camera.updateProjectionMatrix();
      }
    }

    document.body.style.cursor = hover.current ? 'pointer' : '';
  });
  return null;
}

// Stable waypoint objects (module-scope identity not needed; tiny helper keeps JSX clean)
function useMemoPos(pos: [number, number, number], look: [number, number, number]) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = useRef({ pos, look });
  return ref.current;
}

/** Soft foreground bokeh discs (blurred-leaf depth cue). */
function Bokeh({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const tex = useMemoTexture();
  const discs = useMemoDiscs(isMobile);

  useFrame(({ clock }) => {
    if (!group.current || reduced) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const d = discs[i];
      child.position.set(d.x + Math.sin(t * d.sp + d.ph) * 0.7, d.y + Math.cos(t * d.sp * 0.8 + d.ph) * 0.4, d.z);
    });
  });

  return (
    <group ref={group}>
      {discs.map((d, i) => (
        <sprite key={i} position={[d.x, d.y, d.z]} scale={[d.s, d.s, 1]}>
          <spriteMaterial map={tex} transparent opacity={0.5} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

function useMemoTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(190,242,100,0.55)');
    g.addColorStop(0.55, 'rgba(190,242,100,0.18)');
    g.addColorStop(1, 'rgba(190,242,100,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

type BokehDisc = { x: number; y: number; z: number; s: number; ph: number; sp: number };

function useMemoDiscs(isMobile: boolean): BokehDisc[] {
  return useMemo(
    () =>
      Array.from({ length: isMobile ? 3 : 6 }, () => ({
        x: (Math.random() - 0.5) * 13,
        y: -1 - Math.random() * 11,
        z: 2.2 + Math.random() * 1.2,
        s: 0.9 + Math.random() * 1.4,
        ph: Math.random() * Math.PI * 2,
        sp: 0.12 + Math.random() * 0.2,
      })),
    [isMobile]
  );
}

export default function Experience() {
  const progress = useScrollProgress();
  const pointer = usePointer();
  const reduced = usePrefersReducedMotion();
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(reduced.current);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [reduced]);
  const hover = useRef<string | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <>
      <hemisphereLight args={['#ffffff', '#94a3b8', 1.0]} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#bef264" />

      {/* Local studio reflections — generated in-engine, zero network (metals need this) */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer intensity={1.1} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[7, 2, 1]} color="#bef264" />
        <Lightformer intensity={1.3} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[7, 2, 1]} color="#e2e8f0" />
        <Lightformer intensity={0.7} position={[0, -3, 2]} scale={[8, 2, 1]} color="#cbd5e1" />
      </Environment>

      <AtlasCore progress={progress} hover={hover} reduced={reducedMotion} />
      <Rig progress={progress} pointer={pointer} reduced={reduced} hover={hover} />

      <Sparkles count={isMobile ? 50 : 110} scale={[15, 17, 5]} position={[0, -6.5, -3]} size={2.5} speed={reducedMotion ? 0 : 0.5} color="#94a3b8" opacity={0.45} />
      <Sparkles count={isMobile ? 25 : 60} scale={[11, 15, 4]} position={[0, -6.5, -2]} size={3.5} speed={reducedMotion ? 0 : 0.7} color="#bef264" opacity={0.5} />
      {!reducedMotion && <Bokeh reduced={false} />}
    </>
  );
}
