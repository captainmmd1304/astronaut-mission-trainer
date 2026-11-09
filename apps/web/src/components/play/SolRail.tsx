'use client';
import { useMemo } from 'react';
import { useGame } from '@/game/store';

const BAD = new Set(['habitat-damage', 'evacuation']);
const WARN = new Set(['radiation-spike', 'battery-low', 'shelter-power-lost', 'food-shortage', 'power-shortfall', 'eva-in-warning']);

export function SolRail() {
  const sim = useGame((s) => s.sim);
  const events = useGame((s) => s.events);
  const total = useGame((s) => s.run?.rules.durationSols ?? 0);
  const mark = useMemo(() => {
    const m = new Map<number, 'bad' | 'warn'>();
    for (const e of events) {
      if (BAD.has(e.type)) m.set(e.sol, 'bad');
      else if (WARN.has(e.type) && m.get(e.sol) !== 'bad') m.set(e.sol, 'warn');
    }
    return m;
  }, [events]);
  if (!sim) return null;
  const current = sim.sol + 1;
  return (
    <nav aria-label="Sols" className="flex gap-2 overflow-x-auto md:h-full md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pr-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const done = n < current;
        const here = n === current;
        const m = mark.get(n);
        return (
          <div key={n} aria-current={here ? 'step' : undefined} className="instrument flex shrink-0 items-center gap-2 text-[14px]">
            <span className={`inline-block h-px ${here ? 'w-6 bg-ember' : done ? 'w-4 bg-haze/70' : 'w-3 bg-rust/60'}`} />
            <span className={here ? 'text-[19px] text-ember' : done ? 'text-bone/80' : 'text-bone/35'}>{n}</span>
            {m && <span aria-label={m === 'bad' ? 'serious problem' : 'warning'} className={m === 'bad' ? 'text-critical' : 'text-caution'}>▲</span>}
          </div>
        );
      })}
    </nav>
  );
}
