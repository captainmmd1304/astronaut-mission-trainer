'use client';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { Atmosphere } from '@/game/atmosphere';
import { fbm, HABITAT, terrainHeight } from './terrain';

export interface Look {
  seed: number;
  baseColor: string;
  rockDensity: number;
  roughness: number;
}
/** What the scene needs from the sim, as plain numbers in a ref so the canvas never re-renders. */
export interface Live {
  atmo: Atmosphere;
  panelDust: number; // 0..1
  greenhouse: number; // powered 0..1
  link: boolean;
  eva: boolean;
  shelter: boolean;
  /** Seconds since the viewport mounted, used for the arrival move. */
}

function Terrain({ look }: { look: Look }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(520, 360, 200, 150);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -150);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color(look.baseColor);
    const dark = base.clone().multiplyScalar(0.42);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z, look.seed, look.roughness);
      pos.setY(i, y);
      const n = fbm(x * 0.05, z * 0.05, look.seed + 5, 3);
      c.copy(dark).lerp(base, 0.3 + n * 0.8 + y * 0.012);
      // foreground sinks into shadow, distance gets lighter: gives depth before fog does
      c.multiplyScalar(0.5 + 0.5 * Math.min(1, Math.max(0, (14 - z) / 70)));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [look.seed, look.baseColor, look.roughness]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

function Rocks({ look }: { look: Look }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = Math.round(50 + look.rockDensity * 320);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    let s = look.seed * 7919;
    const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (rnd() - 0.5) * 120;
      const z = -rnd() * 110 + 6;
      const size = 0.15 + rnd() * rnd() * 1.6;
      o.position.set(x, terrainHeight(x, z, look.seed, look.roughness) + size * 0.25, z);
      o.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      o.scale.set(size, size * (0.5 + rnd() * 0.5), size * (0.7 + rnd() * 0.6));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, look.seed, look.roughness]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#4a2a1c" roughness={1} flatShading />
    </instancedMesh>
  );
}

function Outpost({ look, live }: { look: Look; live: MutableRefObject<Live> }) {
  const panels = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const beacon = useRef<THREE.MeshStandardMaterial>(null);
  const dish = useRef<THREE.Group>(null);
  const clean = useMemo(() => new THREE.Color('#2c4468'), []);
  const dusty = useMemo(() => new THREE.Color('#9b7650'), []);
  const y = terrainHeight(HABITAT.x, HABITAT.z, look.seed, look.roughness);
  const solarY = terrainHeight(-2, HABITAT.z + 32, look.seed, look.roughness);

  useFrame(({ clock }) => {
    const l = live.current;
    panels.current?.color.copy(clean).lerp(dusty, Math.min(1, l.panelDust * 1.15));
    if (glow.current) glow.current.emissiveIntensity = 0.05 + l.greenhouse * 0.4;
    if (dish.current) dish.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.9 + (l.link ? 0 : Math.sin(clock.elapsedTime * 5) * 0.15);
    if (beacon.current) beacon.current.emissiveIntensity = l.link ? 0.5 + 0.5 * Math.max(0, Math.sin(clock.elapsedTime * 2.2)) : 0.04;
  });

  const rows = [0, 1, 2];
  const cols = [0, 1, 2, 3, 4];
  return (
    <group position={[HABITAT.x, y, HABITAT.z]}>
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[3.1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cdbfae" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[5.4, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.25, 1.25, 7, 20]} />
        <meshStandardMaterial color="#b9ab98" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[9.8, 1.0, 0.4]}>
        <boxGeometry args={[3.4, 2.0, 3.0]} />
        <meshStandardMaterial ref={glow} color="#7d8a64" emissive="#ffb061" emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.6, 0.9, 3.05]}>
        <boxGeometry args={[1.1, 0.5, 0.06]} />
        <meshStandardMaterial color="#26140c" emissive="#ffb061" emissiveIntensity={0.7} />
      </mesh>
      {/* solar field */}
      <group position={[-2 - HABITAT.x, solarY - y, 32]}>
        {rows.map((r) =>
          cols.map((c) => (
            <mesh key={`${r}-${c}`} position={[c * 3.1 - 6, 0.7, r * 2.7]} rotation={[-0.5, 0, 0]}>
              <boxGeometry args={[2.9, 0.1, 2.0]} />
              <meshStandardMaterial ref={r === 0 && c === 0 ? panels : undefined} color="#2c4468" roughness={0.55} metalness={0.2} />
            </mesh>
          )),
        )}
      </group>
      {/* antenna: the beacon is steady when Earth can hear us, dark during a blackout */}
      <mesh castShadow position={[-4.6, 2.6, 1]}>
        <cylinderGeometry args={[0.07, 0.1, 5.2, 8]} />
        <meshStandardMaterial color="#8d8172" />
      </mesh>
      <group ref={dish} position={[-4.6, 5.3, 1]}>
        <mesh rotation={[0.5, 0, 0.4]}>
          <coneGeometry args={[1.1, 0.5, 20, 1, true]} />
          <meshStandardMaterial color="#d8cdbd" side={THREE.DoubleSide} />
        </mesh>
      </group>
      <pointLight position={[0.6, 1.4, 4.6]} color="#ffb061" intensity={14} distance={16} decay={2} />
      <mesh castShadow position={[-4.6, 5.65, 1]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial ref={beacon} color="#2a0f08" emissive="#bcd0e6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}


/** Wind-blown dust: thin and slow on clear sols, a roaring curtain in a storm. */
function DustMotes({ live }: { live: MutableRefObject<Live> }) {
  const N = 900;
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) p.set([(Math.random() - 0.5) * 90, Math.random() * 14, 14 - Math.random() * 70], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    const d = live.current.atmo.dust;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const wind = (1.2 + d * 22) * dt;
    for (let i = 0; i < N; i++) {
      let x = pos.getX(i) + wind * (0.6 + (i % 7) / 9);
      let y = pos.getY(i) + Math.sin(i + x * 0.2) * dt * 0.4;
      if (x > 45) x = -45;
      if (y > 14) y = 0;
      pos.setXYZ(i, x, y, pos.getZ(i));
    }
    pos.needsUpdate = true;
    if (mat.current) {
      mat.current.opacity += (0.12 + d * 0.65 - mat.current.opacity) * 0.05;
      mat.current.size += (0.1 + d * 0.22 - mat.current.size) * 0.05;
    }
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial ref={mat} color="#e8b27c" size={0.12} sizeAttenuation transparent opacity={0.15} depthWrite={false} />
    </points>
  );
}

/** A small rover that patrols the foreground: motion that says the world is alive. */
function Rover({ look }: { look: Look }) {
  const g = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.18;
    const x = Math.sin(t) * 16 - 2;
    const z = -6 + Math.cos(t) * 4;
    if (g.current) {
      g.current.position.set(x, terrainHeight(x, z, look.seed, look.roughness) + 0.55, z);
      g.current.rotation.y = Math.atan2(Math.cos(t) * 16, -Math.sin(t) * 4) + Math.PI / 2;
    }
    wheels.current.forEach((w) => (w.rotation.x = clock.elapsedTime * 3));
  });
  return (
    <group ref={g} scale={0.9}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.2, 0.55, 1.3]} />
        <meshStandardMaterial color="#cfc3b2" roughness={0.7} />
      </mesh>
      <mesh position={[0.5, 1.05, 0]}>
        <boxGeometry args={[0.8, 0.45, 0.8]} />
        <meshStandardMaterial color="#8f8372" roughness={0.8} />
      </mesh>
      <mesh position={[-0.7, 1.3, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 1.1, 6]} />
        <meshStandardMaterial color="#6f6558" />
      </mesh>
      {[-0.85, 0, 0.85].flatMap((x) => [-0.78, 0.78].map((z) => (
        <mesh key={`${x}${z}`} ref={(m) => { if (m) wheels.current.push(m); }} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.22, 12]} />
          <meshStandardMaterial color="#2a1e17" roughness={1} />
        </mesh>
      )))}
      <mesh position={[1.12, 0.55, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#ffd9a8" />
      </mesh>
    </group>
  );
}

/** Two suited figures walk out to the panels when the crew is sent on a spacewalk. */
function EvaCrew({ look, live }: { look: Look; live: MutableRefObject<Live> }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const k = useRef(0);
  const home = { x: HABITAT.x + 2.5, z: HABITAT.z + 3.5 };
  const panels = { x: -2, z: HABITAT.z + 33 };
  useFrame(({ clock }, dt) => {
    k.current += ((live.current.eva ? 1 : 0) - k.current) * Math.min(1, dt * 0.8);
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.visible = k.current > 0.02;
      const x = home.x + (panels.x + i * 3 - home.x) * k.current;
      const z = home.z + (panels.z - 1.5 - home.z) * k.current;
      g.position.set(x, terrainHeight(x, z, look.seed, look.roughness), z);
      g.rotation.y = Math.PI;
      g.position.y += Math.abs(Math.sin(clock.elapsedTime * 6 + i)) * 0.07 * (k.current > 0.05 && k.current < 0.97 ? 1 : 0);
    });
  });
  return (
    <>
      {[0, 1].map((i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} visible={false} scale={1.15}>
          <mesh position={[0, 0.7, 0]}>
            <capsuleGeometry args={[0.28, 0.7, 4, 10]} />
            <meshStandardMaterial color="#e9e0d2" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.38, 0]}>
            <sphereGeometry args={[0.24, 12, 10]} />
            <meshStandardMaterial color="#d8a24a" metalness={0.6} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** The Sun: a small hard disc with a wide soft halo. A storm swallows it. */
function SunDisc({ live }: { live: MutableRefObject<Live> }) {
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d')!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cv);
  }, []);
  useFrame(() => {
    const k = Math.max(0, 1 - live.current.atmo.dust * 1.25);
    if (core.current) core.current.opacity = k;
    if (halo.current) halo.current.opacity = 0.32 * k + 0.05;
  });
  return (
    <group position={[130, 34, -330]}>
      <mesh>
        <sphereGeometry args={[7, 24, 16]} />
        <meshBasicMaterial ref={core} color="#fff1d6" transparent fog={false} depthWrite={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[150, 150]} />
        <meshBasicMaterial ref={halo} map={glow} color="#ff9a52" transparent opacity={0.3} blending={THREE.AdditiveBlending} fog={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Phobos: a small lumpy moon that crosses the sky in the distance. */
function Phobos() {
  const m = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.012;
    if (m.current) m.current.position.set(-150 + ((t * 300) % 300), 78 + Math.sin(t * 9) * 4, -330);
  });
  return (
    <mesh ref={m} scale={[8, 6.2, 6.8]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#6d5a4d" roughness={1} flatShading fog={false} />
    </mesh>
  );
}

/** Fog, sun and camera follow the live atmosphere. Everything is mutated, never re-rendered. */
function Atmos({ live, drift, shift }: { live: MutableRefObject<Live>; drift: boolean; shift: number }) {
  const { scene, camera } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const fog = useMemo(() => new THREE.FogExp2('#7a3a21', 0.012), []);
  const color = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame((state) => {
    const clock = state.clock;
    const a = live.current.atmo;
    fog.color.lerp(color.set(a.skyHorizon), 0.04);
    fog.density += (Math.max(0.018, a.fogDensity) - fog.density) * 0.03;
    if (sun.current) {
      sun.current.intensity += (3.1 * a.sunStrength - sun.current.intensity) * 0.05;
      sun.current.color.lerp(color.set('#ffb98a'), 0.02);
    }
    if (amb.current) amb.current.intensity += (0.55 + a.dust * 0.55 - amb.current.intensity) * 0.05;
    const t = drift ? clock.elapsedTime : 0;
    // arrival: start high and far, settle to the base view over ~3.5 s
    const k = drift ? Math.min(1, clock.elapsedTime / 3.5) : 1;
    const ease = 1 - Math.pow(1 - k, 3);
    const shake = Math.max(0, a.dust - 0.55) * 0.09 * (drift ? 1 : 0);
    const px = state.pointer.x;
    const py = state.pointer.y;
    camera.position.x += (Math.sin(t * 0.07) * 1.2 + px * 1.8 + (1 - ease) * -14 - camera.position.x) * 0.06;
    camera.position.y += (4.0 + py * 0.7 + (1 - ease) * 15 + (Math.random() - 0.5) * shake - camera.position.y) * 0.06;
    camera.position.z += (18 + (1 - ease) * 22 - camera.position.z) * 0.06;
    camera.lookAt(shift + px * 3, 4.6 + (1 - ease) * -3 + Math.sin(t * 0.05) * 0.1, -40);
  });

  return (
    <>
      <ambientLight ref={amb} color="#e7b08a" intensity={0.6} />
      <directionalLight
        ref={sun}
        position={[HABITAT.x + 40, 16, HABITAT.z + 14]}
        target-position={[HABITAT.x, 0, HABITAT.z]}
        intensity={3}
        color="#ffb98a"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0006}
        shadow-normalBias={0.05}
      />
    </>
  );
}

export function Scene({ look, live, drift, shift }: { look: Look; live: MutableRefObject<Live>; drift: boolean; shift: number }) {
  return (
    <>
      <Atmos live={live} drift={drift} shift={shift} />
      <Terrain look={look} />
      <Rocks look={look} />
      <Outpost look={look} live={live} />
      <Rover look={look} />
      <EvaCrew look={look} live={live} />
      <SunDisc live={live} />
      <Phobos />
      <DustMotes live={live} />
    </>
  );
}
