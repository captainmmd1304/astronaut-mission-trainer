import type { SimState } from '@amt/sim';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const k = clamp(t);
  const c = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, '0');
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}

export interface Atmosphere {
  dust: number; // 0 clear .. 1 whiteout
  skyTop: string;
  skyHorizon: string;
  fog: string;
  fogDensity: number;
  starOpacity: number;
  flare: number; // 0..1 cold tint at the top of the sky
  sunStrength: number;
}

/**
 * Sky comes from the simulation: dust storms warm and thicken the air, clear sols show the stars.
 * Pure function so it can be tested and reused by the CSS sky and the 3D fog.
 */
export function atmosphere(sim: SimState | null): Atmosphere {
  let storm = 0;
  let watch = false;
  let flare = false;
  for (const e of sim?.activeEffects ?? []) {
    if (e.type === 'dust-storm') storm = Math.max(storm, e.magnitude);
    if (e.type === 'flare-watch') watch = true;
    if (e.type === 'solar-flare') flare = true;
  }
  const dust = clamp(storm * 0.9 + (sim?.power.panelDust ?? 0) * 0.08);
  const flareTint = flare ? 0.55 : watch ? 0.18 : 0;
  const top = mix(mix('#070409', '#1b0d0a', 0.5), '#b9774a', dust);
  return {
    dust,
    skyTop: flareTint ? mix(top, '#5c7298', flareTint) : top,
    skyHorizon: mix('#a8431f', '#ebb57c', dust),
    fog: mix('#7a3a21', '#d9a56f', dust),
    fogDensity: 0.012 + dust * 0.075,
    starOpacity: Math.pow(1 - dust, 2.2),
    flare: flareTint,
    sunStrength: 1 - dust * 0.55,
  };
}
