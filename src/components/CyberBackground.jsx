import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Responsive particle count ── */
function useParticleCount() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 300;
    const w = window.innerWidth;
    if (w < 480) return 0;       // disable on very small screens
    if (w < 768) return 120;
    if (w < 1024) return 200;
    return 400;
  });
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 480) setCount(0);
      else if (w < 768) setCount(120);
      else if (w < 1024) setCount(200);
      else setCount(400);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return count;
}

/* ── Floating particles with mouse-following ── */
function Particles({ count = 500 }) {
  const mesh = useRef();

  const [positions, colors, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const palette = [
      new THREE.Color('#4facfe'),
      new THREE.Color('#00f2fe'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#ff2d87'),
      new THREE.Color('#22d3a7'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      spd[i] = 0.2 + Math.random() * 0.8;
    }
    return [pos, col, spd];
  }, [count]);

  useFrame(({ clock, pointer }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    const arr = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.3 * spd[i] + i * 0.1) * 0.0015;
      arr[i * 3]     += Math.cos(t * 0.2 * spd[i] + i * 0.07) * 0.001;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = pointer.x * 0.12;
    mesh.current.rotation.x = pointer.y * 0.08;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── Subtle grid floor ── */
function GridFloor() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.z = (clock.getElapsedTime() * 0.25) % 2;
  });
  return <gridHelper ref={ref} args={[40, 40, '#1a3a5c', '#0a1929']} position={[0, -6, 0]} />;
}

export default function CyberBackground() {
  const count = useParticleCount();

  if (count === 0) return null; // skip rendering on very small screens

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <Particles count={count} />
        <GridFloor />
      </Canvas>
    </div>
  );
}
