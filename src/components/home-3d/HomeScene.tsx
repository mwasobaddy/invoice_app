'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

/**
 * HomeScene — fixed full-viewport 3D canvas behind all homepage content.
 * Content sections sit above it (relative z-10); the canvas itself is z-0.
 * Pointer events stay enabled on the wrapper so R3F hover works in the
 * gaps — opaque content above still receives its clicks first.
 */
export default function HomeScene() {
  const [supported] = useState(() => {
    if (typeof document === 'undefined') return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  });

  if (!supported) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 42, near: 0.1, far: 100, position: [1.3, -0.5, 5.0] }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.15;
        }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </div>
  );
}
