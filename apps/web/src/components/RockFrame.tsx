/**
 * The outpost sees the world through a gap in the rock. Dark foreground closes in left and right,
 * with a rim of warm light on the edge. Stretched (preserveAspectRatio none) so it fits any viewport.
 */
const OPENING =
  'M24 0 L27 12 L22 27 L28 44 L23 62 L29 80 L25 100 L79 100 L75 84 L81 68 L76 51 L82 34 L77 17 L81 0 Z';
const FULL = 'M0 0 H100 V100 H0 Z';
const FLOOR = 'M0 100 L0 91 Q10 88.5 22 92 L38 95.5 L58 93.5 L77 97 L100 90 L100 100 Z';

/** Shift the opening toward the right edge (x 22..82 becomes about 43..94). */
const shiftRight = (path: string) =>
  path.replace(/([ML]) ?(\d+(?:\.\d+)?) /g, (_m, c: string, x: string) => `${c}${(Number(x) * 0.86 + 24).toFixed(1)} `);

export function RockFrame({ side = 'center' }: { side?: 'center' | 'right' }) {
  const opening = side === 'right' ? shiftRight(OPENING) : OPENING;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rock" x1="0" x2="1">
          <stop offset="0" stopColor="#0f0806" />
          <stop offset="0.5" stopColor="#2b1a13" />
          <stop offset="1" stopColor="#0f0806" />
        </linearGradient>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07 0.025" numOctaves="4" seed="7" />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.25  0 0 0 0 0.1  0 0 0 0.9 -0.28" />
        </filter>
        <clipPath id="rockClip">
          <path d={`${FULL} ${opening}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      <path d={`${FULL} ${opening}`} fill="url(#rock)" fillRule="evenodd" />
      <g clipPath="url(#rockClip)">
        <rect width="100" height="100" filter="url(#grain)" opacity="0.5" />
      </g>
      <path d={opening} fill="none" stroke="#d9732b" strokeOpacity="0.38" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      <path d={FLOOR} fill="#150c09" />
    </svg>
  );
}
