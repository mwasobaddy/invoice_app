'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Fundamentals: Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = null; // transparent to blend with slate-50
    scene.fog = new THREE.Fog(0xf8fafc, 8, 20);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 8, 5);
    dir.castShadow = true;
    scene.add(dir);
    const limeLight = new THREE.PointLight(0xbef264, 1, 10);
    limeLight.position.set(-2, 2, 3);
    scene.add(limeLight);

    // Group for invoices
    const group = new THREE.Group();
    scene.add(group);

    // Materials — slate/lime brand
    const slateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.1 });
    const limeMat = new THREE.MeshStandardMaterial({ color: 0xbef264, roughness: 0.6 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

    // Floating invoice cards — BoxGeometry 1.4 x 0.9 x 0.05
    const invoiceGeo = new THREE.BoxGeometry(1.8, 1.2, 0.06);
    const invoices: THREE.Mesh[] = [];
    const configs = [
      { pos: [-1.8, 0.3, 0], rot: [0.1, 0.3, -0.05], mat: slateMat },
      { pos: [1.6, -0.4, -0.5], rot: [-0.1, -0.4, 0.08], mat: whiteMat },
      { pos: [0.2, 1.1, -0.8], rot: [0.05, 0.2, 0.03], mat: limeMat },
    ] as const;
    configs.forEach((c) => {
      const mesh = new THREE.Mesh(invoiceGeo, c.mat);
      mesh.position.set(c.pos[0], c.pos[1], c.pos[2]);
      mesh.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Add lime accent bar on slate invoice
      if (c.mat === slateMat) {
        const barGeo = new THREE.BoxGeometry(1.8, 0.15, 0.07);
        const bar = new THREE.Mesh(barGeo, limeMat);
        bar.position.set(0, 0.45, 0.04);
        mesh.add(bar);
      }
      group.add(mesh);
      invoices.push(mesh);
    });

    // Floating dots — lime/emerald
    const dotGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const dotMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 0.6 });
    const dots: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
      group.add(dot);
      dots.push(dot);
    }

    // --- Animation: Clock + procedural + keyframe ---
    const clock = new THREE.Clock();

    // Keyframe animation for main invoice bounce (threejs-animation skill)
    const times = [0, 1, 2];
    const values = [0, 0.3, 0];
    const track = new THREE.NumberKeyframeTrack('.position[y]', times, values);
    const clip = new THREE.AnimationClip('bounce', 2, [track]);
    const mixer = new THREE.AnimationMixer(invoices[0]);
    const action = mixer.clipAction(clip);
    action.loop = THREE.LoopRepeat;
    action.play();

    // Morph-like color pulse for lime invoice
    const colorTrack = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2], [0.75, 0.96, 0.39, 0x0f/255, 0x17/255, 0x2a/255, 0.75, 0.96, 0.39]);
    const colorClip = new THREE.AnimationClip('colorPulse', 3, [colorTrack]);
    const limeMixer = new THREE.AnimationMixer(invoices[2]);
    const colorAction = limeMixer.clipAction(colorClip);
    colorAction.loop = THREE.LoopRepeat;
    colorAction.play();

    function animate() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      mixer.update(delta);
      limeMixer.update(delta);

      // Procedural animation (threejs-animation skill)
      invoices.forEach((mesh, i) => {
        if (i === 0) return; // driven by mixer
        mesh.position.y += Math.sin(elapsed * 0.8 + i) * 0.0015;
        mesh.rotation.y += delta * (0.15 + i * 0.05);
        mesh.rotation.z = Math.sin(elapsed * 0.5 + i) * 0.05;
      });

      dots.forEach((dot, i) => {
        dot.position.y += Math.sin(elapsed * 1.2 + i * 0.7) * 0.002;
        dot.position.x += Math.cos(elapsed * 0.4 + i) * 0.001;
      });

      // Gentle group sway
      group.rotation.y = Math.sin(elapsed * 0.15) * 0.1;
      group.position.y = Math.sin(elapsed * 0.3) * 0.08;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // Cleanup (threejs-fundamentals: proper dispose)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      mixer.stopAllAction();
      limeMixer.stopAllAction();
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else (mesh.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 opacity-60"
      aria-hidden
      style={{ pointerEvents: 'none' }}
    />
  );
}
