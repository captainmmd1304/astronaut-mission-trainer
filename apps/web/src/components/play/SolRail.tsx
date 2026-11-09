'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useGame } from '@/game/store';

const BAD = new Set(['habitat-damage', 'evacuation']);
const WARN = new Set(['radiation-spike', 'battery-low', 'shelter-power-lost', 'food-shortage', 'power-shortfall', 'eva-in-warning', 'comms-down']);

/** A strip of sols across the top: done, now, to come, and where things went wrong. */
export function SolRail() {
  const sim = useGame((s) => s.sim);
  const events = useGame((s) => s.events);
  const total = useGame((s) => s.run?.rules.durationSols ?? 0);
  const cur = useRef<HTMLDivElement>(null);
  const mark = useMemo(() => {
    const m = new Map<number, 'bad' | 'warn'>();
    for (const e of events) {
      if (BAD.has(e.type)) m.set(e.sol, 'bad');
      else if (WARN.has(e.type) && m.get(e.sol) !== 'bad') m.set(e.sol, 'warn');
    }
    return m;
  }, [events]);
  const current = sim ? sim.sol + 1 : 1;
  useEffect(() => {
    cur.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [current]);
  if (!sim) return null;
  return (
    <nav aria-label="Sols" className="flex gap-1.5 overflow-x-auto py-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const done = n < current;
        const here = n === current;
        const m = mark.get(n);
        return (
          <div
            key={n}
            ref={here ? cur : undefined}
            aria-current={here ? 'step' : undefined}
            title={m ? (m === 'bad' ? `Sol ${n}: serious problem` : `Sol ${n}: warning`) : `Sol ${n}`}
            className={`instrument grid h-7 min-w-7 shrink-0 place-items-center rounded-md border text-[12.5px] font-bold transition-all ${
              here ? 'scale-110 border-haze bg-ember text-night shadow-[0_0_14px_rgba(217,115,43,0.8)]' : m === 'bad' ? 'border-critical bg-critical/25 text-critical' : m === 'warn' ? 'border-caution/70 bg-caution/15 text-caution' : done ? 'border-rust/60 bg-basalt text-bone/80' : 'border-rust/30 bg-black/30 text-bone/35'
            }`}
          >
            {n}
          </div>
        );
      })}
    </nav>
  );
}
