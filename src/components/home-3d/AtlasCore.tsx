'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';

type HoverRef = React.MutableRefObject<string | null>;
type NumRef = React.MutableRefObject<number>;

const LIME = new THREE.Color('#bef264');
const GOLD = '#f5c044';

function useInvoiceTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 340;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 340);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(28, 30, 90, 12);
    ctx.fillStyle = '#bef264';
    ctx.fillRect(28, 52, 200, 44);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('$62,746', 40, 82);
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 6; i++) ctx.fillRect(28, 118 + i * 30, 200 - (i % 3) * 40, 10);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(200, 250, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(190, 250);
    ctx.lineTo(197, 257);
    ctx.lineTo(211, 242);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

/**
 * AtlasCore — the single signature object for the whole page.
 * A dark faceted-metal core wrapped in a rising double-helix of gold
 * coins, orbited by invoice shards. Scroll morphs it through three acts:
 * intimate macro → wide orbit reveal → radiant finale.
 */
export default function AtlasCore({
  progress,
  hover,
  reduced,
}: {
  progress: NumRef;
  hover: HoverRef;
  reduced: boolean;
}) {
  const system = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null!);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null!);
  const helix = useRef<THREE.InstancedMesh>(null!);
  const shards = useRef<THREE.Group>(null!);
  const innerLight = useRef<THREE.PointLight>(null!);
  const pLerp = useRef(0);
  const spinKick = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useInvoiceTexture();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const COUNT = isMobile ? 36 : 64;

  const edges = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.92, 0);
    return new THREE.EdgesGeometry(g, 18);
  }, []);

  const shardSeeds = useMemo(
    () => [
      { r: 0, tilt: 0.5, speed: 0.22, y: 0.55 },
      { r: Math.PI / 2, tilt: -0.4, speed: -0.18, y: -0.15 },
      { r: Math.PI, tilt: 0.35, speed: 0.26, y: -0.7 },
      { r: (Math.PI * 3) / 2, tilt: -0.55, speed: -0.2, y: 0.2 },
    ],
    []
  );

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = clock.getElapsedTime();
    if (!system.current) return;

    // Scroll progress, smoothly chased (frozen for reduced motion)
    pLerp.current += (progress.current - pLerp.current) * Math.min(1, delta * 3.2);
    const p = reduced ? 0 : pLerp.current;

    // Hover micro-interaction: spin kick + flash decay
    if (hover.current === 'core') spinKick.current = Math.min(spinKick.current + delta * 6, 1.6);
    else spinKick.current = Math.max(spinKick.current - delta * 2.2, 0);

    // --- Core: rotation accelerates down the page, emissive awakens ---
    if (core.current) {
      core.current.rotation.y += delta * (0.28 + p * 0.75 + spinKick.current * 2.4);
      core.current.rotation.x = -0.12 + Math.sin(t * 0.4) * 0.05 + p * 0.35;
      const s = 1 + Math.sin(t * 0.8) * (reduced ? 0 : 0.018) + p * 0.08;
      core.current.scale.setScalar(s);
    }
    if (coreMat.current) {
      const target = p * 0.5 + spinKick.current * 0.55;
      coreMat.current.emissiveIntensity += (target - coreMat.current.emissiveIntensity) * Math.min(1, delta * 4);
    }
    if (edgeMat.current) {
      edgeMat.current.opacity += (0.22 + p * 0.4 + spinKick.current * 0.2 - edgeMat.current.opacity) * Math.min(1, delta * 4);
    }
    if (innerLight.current) innerLight.current.intensity = p * 7 + spinKick.current * 5;

    // --- Coin helix: radius/height morph per act, strands offset by PI ---
    if (helix.current && !reduced) {
      const radius = 1.0 + Math.sin(p * Math.PI) * 0.4 - p * 0.2;
      const height = 2.6 + Math.sin(p * Math.PI) * 0.5;
      const rise = 0.16 + p * 0.22;
      for (let i = 0; i < COUNT; i++) {
        const strand = i % 2 === 0 ? 0 : Math.PI;
        const life = (t * rise + i / COUNT) % 1;
        const y = -1.9 + life * height;
        const a = y * 2.1 + t * (0.25 + p * 0.35) + strand;
        dummy.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius * 0.85);
        dummy.rotation.set(t * 1.6 + i, a, 0);
        const fade = Math.sin(Math.PI * Math.min(1, Math.max(0, life * 1.06)));
        dummy.scale.setScalar(Math.max(0.001, 0.062 * fade));
        dummy.updateMatrix();
        helix.current.setMatrixAt(i, dummy.matrix);
      }
      helix.current.instanceMatrix.needsUpdate = true;
    }

    // --- Invoice shards: wide slow orbit that tightens into formation ---
    if (shards.current) {
      const r = 2.2 - p * 0.95;
      shards.current.children.forEach((child, i) => {
        const s = shardSeeds[i % shardSeeds.length];
        const a = s.r + t * s.speed * (reduced ? 0 : 1) + p * 0.9;
        child.position.set(Math.cos(a) * r, s.y - p * 0.25, Math.sin(a) * r * 0.8);
        child.rotation.set(s.tilt, a + Math.PI / 2, 0);
      });
      shards.current.rotation.y = reduced ? 0 : t * 0.05;
    }

    // --- Whole-system gentle float ---
    system.current.position.y = reduced ? 0 : Math.sin(t * 0.5) * 0.06;
  });

  return (
    <group ref={system} position={[-0.7, -1.5, 0]}>
      {/* brushed-platinum faceted core — luminous on light bg, dark text stays readable */}
      <mesh
        ref={core}
        userData={{ hoverId: 'core' }}
/* eslint-disable react-hooks/immutability */
        onPointerOver={(e) => {
          e.stopPropagation();
          hover.current = 'core';
        }}
        onPointerOut={() => {
          if (hover.current === 'core') hover.current = null;
        }}
      >
        <icosahedronGeometry args={[0.92, 0]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#dfe6ee"
          roughness={0.24}
          metalness={0.85}
          emissive={LIME}
          emissiveIntensity={0}
          flatShading
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edgeMat} color="#7d8aa0" transparent opacity={0.22} />
      </lineSegments>
      <pointLight ref={innerLight} position={[0, 0.2, 0.6]} color="#fff7e0" intensity={0} distance={7} />

      {/* double-helix coin stream */}
      <instancedMesh ref={helix} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 0.32, 14]} />
        <meshStandardMaterial color={GOLD} roughness={0.25} metalness={0.9} emissive="#b45309" emissiveIntensity={0.22} />
      </instancedMesh>

      {/* orbiting invoice shards */}
      <group ref={shards}>
        {shardSeeds.map((s, i) => (
          <mesh key={i} position={[Math.cos(s.r) * 2.2, s.y, Math.sin(s.r) * 2.2]} rotation={[s.tilt, s.r + Math.PI / 2, 0]}>
            <planeGeometry args={[0.42, 0.56]} />
            <meshStandardMaterial map={tex} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      <ContactShadows position={[0, -1.7, 0]} opacity={0.22} scale={4.5} blur={2.6} far={3} color="#0f172a" />
    </group>
  );
}
