'use client';
import { useRef } from 'react';
import type { SolDecisions } from '@amt/shared';
import { useGame } from '@/game/store';

type Key = keyof SolDecisions['power'];
const BARS: { key: Key; label: string; hint: string }[] = [
  { key: 'lifeSupport', label: 'Air and water', hint: 'The battery covers any shortfall here' },
  { key: 'shielding', label: 'Shelter', hint: 'Must be powered to protect the crew' },
  { key: 'greenhouse', label: 'Greenhouse', hint: 'Food, but slowly' },
  { key: 'comms', label: 'Comms', hint: 'Below half power the link drops' },
  { key: 'reserve', label: 'Charge battery', hint: 'Saves power for later' },
];

function Bar({ k, label, hint, value, kwh, need, gen }: { k: Key; label: string; hint: string; value: number; kwh: number; need: number | null; gen: number }) {
  const setPower = useGame((s) => s.setPower);
  const track = useRef<HTMLDivElement>(null);
  const fromPointer = (clientY: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r) return;
    setPower(k, Math.round(((r.bottom - clientY) / r.height) * 20) / 20);
  };
  const short = need !== null && kwh < need - 0.5;
  const needPct = need !== null ? Math.min(100, (need / Math.max(1, gen)) * 100) : null;
  return (
    <div className="flex w-[4.4rem] flex-col items-center gap-2" title={hint}>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={`${label}: ${Math.round(value * 100)} percent of generation`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        className="relative h-36 w-9 cursor-ns-resize touch-none border-x border-rust/60 bg-basalt/70"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientY);
        }}
        onPointerMove={(e) => e.buttons === 1 && fromPointer(e.clientY)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setPower(k, value + 0.05);
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setPower(k, value - 0.05);
        }}
      >
        <div className={`absolute inset-x-0 bottom-0 ${short ? 'bg-caution' : 'bg-ember'}`} style={{ height: `${value * 100}%` }} />
        {needPct !== null && (
          <div className="absolute inset-x-[-5px] border-t-2 border-bone" style={{ bottom: `${Math.min(needPct, 98)}%` }} aria-hidden />
        )}
      </div>
      <div className="instrument text-center text-[13px] leading-tight text-bone">
        <div className="text-[15px]">{Math.round(kwh)} kWh</div>
        <div className="text-bone/70">{label}</div>
        {short && <div className="text-caution">short by {Math.round(need! - kwh)}</div>}
      </div>
    </div>
  );
}

export function PowerBus() {
  const sim = useGame((s) => s.sim);
  const draft = useGame((s) => s.draft);
  const rules = useGame((s) => s.run?.rules);
  if (!sim || !draft || !rules) return null;
  // Forecast uses what the panels made last sol. Generation changes with dust, so it is an estimate.
  const gen = sim.power.availableKwh > 0 ? sim.power.availableKwh : rules.balance.baseGenerationKwhPerSol * rules.site.solarInsolation;
  const b = rules.balance;
  const needs: Record<Key, number | null> = {
    lifeSupport: b.lifeSupportKwhPerCrew * sim.crew.count,
    shielding: b.shelterKwh,
    greenhouse: b.greenhouseKwh,
    comms: b.commsKwh,
    reserve: null,
  };
  return (
    <section aria-label="Power allocation">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-sans text-[15px] font-semibold text-bone">Power today</h2>
        <span className="instrument text-[13px] text-starlight">{Math.round(gen)} kWh from the panels</span>
      </div>
      <div className="flex justify-between gap-1">
        {BARS.map((b2) => (
          <Bar key={b2.key} k={b2.key} label={b2.label} hint={b2.hint} value={draft.power[b2.key]} kwh={draft.power[b2.key] * gen} need={needs[b2.key]} gen={gen} />
        ))}
      </div>
      <p className="mt-3 text-[14px] leading-snug text-bone/65">The pale line on a bar is how much that system needs to run fully. Drag a bar and the others share what is left.</p>
    </section>
  );
}
