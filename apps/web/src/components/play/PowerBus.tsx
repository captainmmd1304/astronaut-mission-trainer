'use client';
import { useRef } from 'react';
import { Icon } from '@/components/Icon';
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

const ICON: Record<Key, string> = { lifeSupport: 'air', shielding: 'shield', greenhouse: 'leaf', comms: 'signal', reserve: 'battery' };

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
    <div className="flex w-[3.9rem] flex-col items-center gap-1.5" title={hint}>
      <div className="instrument text-[15px] font-bold text-bone">{Math.round(kwh)}</div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={`${label}: ${Math.round(value * 100)} percent of generation`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        className="relative h-32 w-12 cursor-ns-resize touch-none rounded-xl border-2 border-rust/70 bg-black/60 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]"
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
        <div
          className={`absolute inset-x-0 bottom-0 rounded-[9px] bg-gradient-to-t transition-[height] duration-150 ${short ? 'from-[#c98a1c] to-caution' : 'from-[#a94a17] to-ember'}`}
          style={{ height: `${value * 100}%`, boxShadow: '0 0 16px rgba(217,115,43,0.55)' }}
        />
        {needPct !== null && (
          <div className="absolute inset-x-[-7px] flex items-center" style={{ bottom: `calc(${Math.min(needPct, 96)}% - 1px)` }} aria-hidden>
            <span className="h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-bone" />
            <span className="h-[2px] flex-1 bg-bone/90" />
            <span className="h-0 w-0 border-y-[5px] border-r-[7px] border-y-transparent border-r-bone" />
          </div>
        )}
        {/* the grip: this is the thing to drag */}
        <div
          className="pointer-events-none absolute inset-x-[-5px] grid h-6 place-items-center rounded-lg border-2 border-haze bg-gradient-to-b from-bone to-[#bda78a] shadow-[0_3px_0_#5d3016,0_6px_10px_rgba(0,0,0,0.6)] transition-[bottom] duration-150"
          style={{ bottom: `calc(${value * 100}% - 12px)` }}
        >
          <span className="block h-[2px] w-5 bg-night/60 shadow-[0_4px_0_rgba(42,36,28,0.6),0_-4px_0_rgba(42,36,28,0.6)]" />
        </div>
      </div>
      <div className="flex gap-0.5">
        <button type="button" aria-label={`Less power to ${label}`} className="key key-quiet !rounded-md !px-1.5 !py-1 !shadow-[0_3px_0_#0b0605]" onClick={() => setPower(k, value - 0.05)}>
          <Icon name="minus" size={14} />
        </button>
        <button type="button" aria-label={`More power to ${label}`} className="key key-quiet !rounded-md !px-1.5 !py-1 !shadow-[0_3px_0_#0b0605]" onClick={() => setPower(k, value + 0.05)}>
          <Icon name="plus" size={14} />
        </button>
      </div>
      <div className="flex min-h-[3rem] flex-col items-center text-center font-sans text-[12.5px] leading-tight">
        <Icon name={ICON[k]} size={16} className={short ? 'text-caution' : 'text-haze'} />
        <span className="mt-0.5 font-semibold text-bone/90">{label}</span>
        {short && <span className="blink font-bold text-caution">short {Math.round(need! - kwh)}</span>}
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
      <div className="mb-2 flex items-baseline justify-between font-sans">
        <span className="text-[13.5px] text-bone/70">Panels make</span>
        <span className="instrument text-[17px] font-bold text-starlight">{Math.round(gen)} kWh</span>
      </div>
      <div className="flex justify-between gap-0.5">
        {BARS.map((b2) => (
          <Bar key={b2.key} k={b2.key} label={b2.label} hint={b2.hint} value={draft.power[b2.key]} kwh={draft.power[b2.key] * gen} need={needs[b2.key]} gen={gen} />
        ))}
      </div>
      <p className="mt-3 font-sans text-[13.5px] leading-snug text-bone/65">
        Drag the grips or tap + and −. The white arrow marks what each system needs to run fully. Whatever you add to one bar is taken from the others.
      </p>
    </section>
  );
}
