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
    <mesh geometry={geo} receiveShadow={false}>
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
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#4a2a1c" roughness={1} flatShading />
    </instancedMesh>
  );
}

function Outpost({ look, live }: { look: Look; live: MutableRefObject<Live> }) {
  const panels = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const beacon = useRef<THREE.MeshStandardMaterial>(null);
  const clean = useMemo(() => new THREE.Color('#2c4468'), []);
  const dusty = useMemo(() => new THREE.Color('#9b7650'), []);
  const y = terrainHeight(HABITAT.x, HABITAT.z, look.seed, look.roughness);
  const solarY = terrainHeight(-2, HABITAT.z + 32, look.seed, look.roughness);

  useFrame(({ clock }) => {
    const l = live.current;
    panels.current?.color.copy(clean).lerp(dusty, Math.min(1, l.panelDust * 1.15));
    if (glow.current) glow.current.emissiveIntensity = 0.05 + l.greenhouse * 0.4;
    if (beacon.current) beacon.current.emissiveIntensity = l.link ? 0.5 + 0.5 * Math.max(0, Math.sin(clock.elapsedTime * 2.2)) : 0.04;
  });

  const rows = [0, 1, 2];
  const cols = [0, 1, 2, 3, 4];
  return (
    <group position={[HABITAT.x, y, HABITAT.z]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3.1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cdbfae" roughness={0.85} />
      </mesh>
      <mesh position={[5.4, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.25, 1.25, 7, 20]} />
        <meshStandardMaterial color="#b9ab98" roughness={0.85} />
      </mesh>
      <mesh position={[9.8, 1.0, 0.4]}>
        <boxGeometry args={[3.4, 2.0, 3.0]} />
        <meshStandardMaterial ref={glow} color="#7d8a64" emissive="#ffb061" emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.6, 0.9, 3.05]}>
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
      <mesh position={[-4.6, 2.6, 1]}>
        <cylinderGeometry args={[0.07, 0.1, 5.2, 8]} />
        <meshStandardMaterial color="#8d8172" />
      </mesh>
      <mesh position={[-4.6, 5.3, 1]} rotation={[0.5, 0, 0.4]}>
        <coneGeometry args={[1.1, 0.5, 20, 1, true]} />
        <meshStandardMaterial color="#d8cdbd" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-4.6, 5.65, 1]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial ref={beacon} color="#2a0f08" emissive="#bcd0e6" emissiveIntensity={0.5} />
      </mesh>
    </group>
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

  useFrame(({ clock }) => {
    const a = live.current.atmo;
    fog.color.lerp(color.set(a.skyHorizon), 0.04);
    fog.density += (Math.max(0.018, a.fogDensity) - fog.density) * 0.03;
    if (sun.current) {
      sun.current.intensity += (3.1 * a.sunStrength - sun.current.intensity) * 0.05;
      sun.current.color.lerp(color.set('#ffb98a'), 0.02);
    }
    if (amb.current) amb.current.intensity += (0.55 + a.dust * 0.55 - amb.current.intensity) * 0.05;
    const t = drift ? clock.elapsedTime : 0;
    camera.position.set(Math.sin(t * 0.07) * 1.2, 4.0, 18);
    camera.lookAt(shift, 4.6 + Math.sin(t * 0.05) * 0.1, -40);
  });

  return (
    <>
      <ambientLight ref={amb} color="#e7b08a" intensity={0.6} />
      <directionalLight ref={sun} position={[44, 15, 10]} intensity={3} color="#ffb98a" />
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
    </>
  );
}
