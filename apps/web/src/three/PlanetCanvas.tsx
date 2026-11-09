'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Small value-noise fbm, enough for a believable rust-and-basalt surface. */
function makeMarsTexture() {
  const W = 1024;
  const H = 512;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const vnoise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x: number, y: number) => {
    let a = 0.5;
    let f = 1;
    let s = 0;
    for (let o = 0; o < 6; o++) {
      s += a * vnoise(x * f, y * f);
      f *= 2.03;
      a *= 0.5;
    }
    return s;
  };
  const rust = new THREE.Color('#b5532a');
  const dust = new THREE.Color('#d9965a');
  const basalt = new THREE.Color('#3a2218');
  const ice = new THREE.Color('#f0e4d2');
  const c = new THREE.Color();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const lat = Math.abs(y / H - 0.5) * 2; // 0 equator, 1 pole
      const n = fbm((x / W) * 7, (y / H) * 3.5);
      const m = fbm((x / W) * 18 + 9, (y / H) * 9 + 3);
      c.copy(rust).lerp(dust, Math.max(0, n - 0.45) * 2.2).lerp(basalt, Math.max(0, 0.5 - n) * 1.9 * (0.6 + m * 0.6));
      // Valles-like dark scar near the equator
      const scar = Math.exp(-Math.pow((y / H - 0.52) * 14, 2)) * Math.max(0, fbm((x / W) * 30, 2) - 0.5) * 2.4;
      c.lerp(basalt, Math.min(0.8, scar));
      if (lat > 0.9) c.lerp(ice, (lat - 0.9) * 9 * (0.6 + m * 0.5));
      const i = (y * W + x) * 4;
      img.data[i] = c.r * 255;
      img.data[i + 1] = c.g * 255;
      img.data[i + 2] = c.b * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function Stars() {
  const geo = useMemo(() => {
    const n = 1800;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 60 + Math.random() * 60;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.004;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.35} sizeAttenuation color="#f0e4d2" transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

const atmoVert = `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const atmoFrag = `varying vec3 vN; varying vec3 vV; uniform vec3 uColor; uniform float uPow;
void main(){ float f = pow(1.0 - abs(dot(vN, vV)), uPow); gl_FragColor = vec4(uColor, f); }`;

function Mars({ dive }: { dive: boolean }) {
  const tex = useMemo(() => makeMarsTexture(), []);
  const planet = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (planet.current) planet.current.rotation.y += dt * (dive ? 0.25 : 0.06);
    if (clouds.current) clouds.current.rotation.y += dt * 0.012;
  });
  return (
    <group ref={planet} rotation={[0.25, 0, 0.12]}>
      <mesh>
        <sphereGeometry args={[3, 96, 64]} />
        <meshStandardMaterial map={tex} bumpMap={tex} bumpScale={0.35} roughness={1} metalness={0} />
      </mesh>
      <mesh ref={clouds} scale={1.012}>
        <sphereGeometry args={[3, 64, 48]} />
        <meshStandardMaterial color="#f0c9a0" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[3, 64, 48]} />
        <shaderMaterial vertexShader={atmoVert} fragmentShader={atmoFrag} uniforms={{ uColor: { value: new THREE.Color('#ff9a5c') }, uPow: { value: 4.5 } }} transparent side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Earth is a pale-blue dot; a signal pulse crawls out to it, which is the point of the whole game. */
function EarthAndSignal() {
  const earth = useRef<THREE.Group>(null);
  const pulses = useRef<THREE.Mesh[]>([]);
  const from = useMemo(() => new THREE.Vector3(1.8, 1.8, 2.2), []);
  const to = useMemo(() => new THREE.Vector3(14, 7.5, -8), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (earth.current) earth.current.position.copy(to).add(new THREE.Vector3(0, Math.sin(t * 0.3) * 0.25, 0));
    pulses.current.forEach((m, i) => {
      const k = (t * 0.14 + i / 4) % 1;
      m.position.lerpVectors(from, to, k);
      const s = 0.07 + Math.sin(k * Math.PI) * 0.1;
      m.scale.setScalar(s / 0.1);
      (m.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI);
    });
  });
  return (
    <>
      <group ref={earth} position={to.toArray()}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 24]} />
          <meshStandardMaterial color="#5d86c2" emissive="#1c3a6e" emissiveIntensity={0.9} roughness={0.8} />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[0.7, 24, 16]} />
          <meshBasicMaterial color="#8db4ef" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(m) => { if (m) pulses.current[i] = m; }}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color="#bcd0e6" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function Rig({ offsetX, dive }: { offsetX: number; dive: boolean }) {
  const { camera, pointer } = useThree();
  const t0 = useRef(performance.now());
  useFrame(() => {
    const e = Math.min(1, (performance.now() - t0.current) / 3200);
    const ease = 1 - Math.pow(1 - e, 3);
    const zFar = 22 - ease * 6; // slow arrival
    const z = dive ? zFar - Math.min(1, (performance.now() - t0.current) / 1500) * 7 : zFar;
    camera.position.x += (pointer.x * 1.2 + offsetX - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.8 + 0.4 - camera.position.y) * 0.03;
    camera.position.z += (z - camera.position.z) * 0.06;
    camera.lookAt(offsetX * 0.35, 0, 0);
  });
  return null;
}

export default function PlanetCanvas({ offsetX = 0, dive = false }: { offsetX?: number; dive?: boolean }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ fov: 38, near: 0.1, far: 400, position: [0, 0.4, 24] }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} style={{ position: 'absolute', inset: 0 }}>
      <color attach="background" args={['#0b0605']} />
      <ambientLight intensity={0.4} color="#9a7468" />
      <directionalLight position={[7, 3, 14]} intensity={3.4} color="#ffd7b0" />
      <directionalLight position={[-9, -2, -6]} intensity={0.35} color="#5b7ab8" />
      <Stars />
      <Mars dive={dive} />
      <EarthAndSignal />
      <Rig offsetX={offsetX} dive={dive} />
    </Canvas>
  );
}
