'use client';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/game/store';

const WHO = { prithvi: 'Prithvi', vikram: 'Vikram, Earth', event: '', system: '' } as const;

export function LogPanel() {
  const log = useGame((s) => s.log);
  const pending = useGame((s) => s.pending);
  const linkUp = useGame((s) => s.sim?.comms.linkUp ?? true);
  const tick = useGame((s) => s.tick);
  const end = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const n = performance.now();
      setNow(n);
      tick(n);
    }, 500);
    return () => clearInterval(t);
  }, [tick]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [log.length, pending.length]);

  return (
    <div role="log" aria-label="Mission log" className="h-full overflow-y-auto pr-2">
      <ul className="divide-y divide-rust/25">
        {log.map((l) => (
          <li key={l.id} className="grid grid-cols-[3.2rem_1fr] gap-x-3 py-[7px]">
            <span className="instrument pt-[2px] text-[13px] text-bone/50">{l.sol === 0 ? 'Start' : `Sol ${l.sol}`}</span>
            <div className={l.kind === 'vikram' ? 'text-starlight' : l.kind === 'event' ? 'font-sans text-[14px] text-bone/75' : 'text-bone'}>
              {WHO[l.kind] && <span className="font-sans text-[13px] font-semibold text-haze">{WHO[l.kind]}: </span>}
              <span className="text-[15.5px] leading-snug">{l.text}</span>
            </div>
          </li>
        ))}
        {pending.map((p) => (
          <li key={p.id} className="grid grid-cols-[3.2rem_1fr] gap-x-3 py-[7px] text-bone/50">
            <span className="instrument pt-[2px] text-[13px]">Sol {p.sol}</span>
            <span className="text-[15px] italic">
              {linkUp ? `Earth is replying. About ${Math.max(0, Math.ceil((p.deliverAt - now) / 1000))} s.` : 'Earth has replied but there is no contact. It will arrive when the link is back.'}
            </span>
          </li>
        ))}
      </ul>
      <div ref={end} />
    </div>
  );
}
