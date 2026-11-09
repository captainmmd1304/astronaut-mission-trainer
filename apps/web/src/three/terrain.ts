/** Procedural Mars ground. Pure functions so the same seed always gives the same landscape. */
const hash = (ix: number, iz: number, seed: number) => {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

function vnoise(x: number, z: number, seed: number) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz, seed);
  const b = hash(ix + 1, iz, seed);
  const c = hash(ix, iz + 1, seed);
  const d = hash(ix + 1, iz + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, z: number, seed: number, octaves = 5) {
  let amp = 0.5;
  let f = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise(x * f, z * f, seed + i * 17);
    amp *= 0.5;
    f *= 2.03;
  }
  return sum;
}

export const HABITAT = { x: -4, z: -22 };

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function terrainHeight(x: number, z: number, seed: number, roughness: number) {
  // Low and gentle near the camera, rising into ridges with distance.
  const env = smooth(6, -45, z);
  const far = 1 + Math.max(0, -z - 50) * 0.016;
  let h = (fbm(x * 0.012, z * 0.012, seed, 4) - 0.3) * 34 * (0.5 + roughness) * far * env;
  h += (fbm(x * 0.09, z * 0.09, seed + 99, 3) - 0.5) * 5 * (0.4 + roughness) * (0.3 + 0.7 * env);
  h += (fbm(x * 0.35, z * 0.35, seed + 7, 2) - 0.5) * 0.9;
  // a flat pad around the outpost and the solar field
  const d = Math.hypot((x - HABITAT.x - 7) / 1.6, z - HABITAT.z);
  return h * smooth(9, 24, d);
}
