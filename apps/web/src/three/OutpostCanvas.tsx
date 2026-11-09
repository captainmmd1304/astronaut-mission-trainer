'use client';
import { Canvas } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import { Scene, type Live, type Look } from './Scene';

export default function OutpostCanvas({ look, live, drift, shift }: { look: Look; live: MutableRefObject<Live>; drift: boolean; shift: number }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 42, near: 0.5, far: 700, position: [0, 4, 18] }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene look={look} live={live} drift={drift} shift={shift} />
    </Canvas>
  );
}
