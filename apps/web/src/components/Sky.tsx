import type { CSSProperties } from 'react';
import type { Atmosphere } from '@/game/atmosphere';
import { mix } from '@/game/atmosphere';

/** Deterministic star field (seeded, so server and client render the same stars). */
const STARS = (() => {
  let s = 20261105;
  const next = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: 170 }, () => ({ x: next() * 100, y: next() * 62, r: 0.04 + next() * next() * 0.16, o: 0.35 + next() * 0.65 }));
})();

export function Sky({ atmo, className = '' }: { atmo: Atmosphere; className?: string }) {
  const style = {
    '--sky-top': atmo.skyTop,
    '--sky-mid': mix(atmo.skyTop, atmo.skyHorizon, 0.45),
    '--sky-hor': atmo.skyHorizon,
  } as CSSProperties;
  return (
    <div aria-hidden className={`sky absolute inset-0 ${className}`} style={style}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: atmo.starOpacity, transition: 'opacity 2.4s ease' }}
      >
        {STARS.map((st, i) => (
          <ellipse key={i} cx={st.x} cy={st.y} rx={st.r * 0.62} ry={st.r} fill="#f4e9da" opacity={st.o} />
        ))}
      </svg>
      {/* low sun glow on the horizon, weaker in dust */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '46%',
          height: '30%',
          background: `radial-gradient(60% 100% at 62% 100%, rgba(255,196,140,${0.35 * atmo.sunStrength}), transparent 70%)`,
        }}
      />
    </div>
  );
}
