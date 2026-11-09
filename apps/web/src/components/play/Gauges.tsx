'use client';
import { Icon } from '@/components/Icon';
import { useGame } from '@/game/store';
import { lightTimeLabel } from '@/lib/text';

type Tone = 'ok' | 'warn' | 'bad';
const FILL: Record<Tone, string> = {
  ok: 'from-ember to-haze',
  warn: 'from-[#c98a1c] to-caution',
  bad: 'from-[#a3281e] to-critical',
};

function Row({ icon, label, value, unit, frac, tone = 'ok', flip }: { icon: string; label: string; value: string; unit?: string; frac: number; tone?: Tone; flip?: boolean }) {
  // flip: higher is worse (radiation, dust), so a full bar is the danger
  const f = Math.max(0, Math.min(1, frac));
  return (
    <div className={`rounded-xl border px-3 py-2 ${tone === 'bad' ? 'border-critical/70 bg-critical/10' : tone === 'warn' ? 'border-caution/50 bg-caution/5' : 'border-rust/40 bg-night/40'}`}>
      <div className="flex items-center justify-between gap-2 font-sans">
        <span className="flex items-center gap-2 text-[14px] font-semibold text-bone">
          <Icon name={icon} size={18} className={tone === 'bad' ? 'blink text-critical' : tone === 'warn' ? 'text-caution' : 'text-haze'} />
          {label}
        </span>
        <span className="instrument text-[18px] font-bold text-starlight">
          {value}
          {unit && <span className="ml-1 text-[12px] font-medium text-bone/60">{unit}</span>}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
        <div className={`h-full rounded-full bg-gradient-to-r ${FILL[tone]} transition-[width] duration-700 ease-out`} style={{ width: `${f * 100}%`, boxShadow: tone === 'ok' ? '0 0 10px rgba(235,181,124,0.5)' : undefined }} />
      </div>
      {flip && <span className="sr-only">Lower is better</span>}
    </div>
  );
}

export function Gauges() {
  const sim = useGame((s) => s.sim);
  const rules = useGame((s) => s.run?.rules);
  if (!sim || !rules) return null;
  const b = rules.balance;
  const battFrac = sim.power.batteryKwh / sim.power.capKwh;
  const foodDays = sim.food.stockKcal / (b.foodKcalPerCrewPerSol * sim.crew.count);
  const waterDays = sim.lifeSupport.waterL / (b.waterUseLPerCrewPerSol * sim.crew.count);
  const doseFrac = sim.radiation.doseMsvCumulative / b.doseFailMsv;
  return (
    <section aria-label="Outpost instruments" className="space-y-2">
      <Row icon="battery" label="Battery" value={`${Math.round(sim.power.batteryKwh)}`} unit="kWh" frac={battFrac} tone={battFrac < b.batteryLowFraction ? (battFrac < 0.15 ? 'bad' : 'warn') : 'ok'} />
      <Row icon="air" label="Oxygen" value={sim.lifeSupport.o2Days.toFixed(1)} unit="days" frac={sim.lifeSupport.o2Days / b.o2DaysStart} tone={sim.lifeSupport.o2Days < 4 ? 'bad' : sim.lifeSupport.o2Days < 7 ? 'warn' : 'ok'} />
      <Row icon="water" label="Water" value={`${Math.round(sim.lifeSupport.waterL)}`} unit="L" frac={sim.lifeSupport.waterL / b.startingWaterL} tone={waterDays < 4 ? 'bad' : waterDays < 8 ? 'warn' : 'ok'} />
      <Row icon="food" label="Food" value={foodDays.toFixed(0)} unit="days" frac={sim.food.stockKcal / b.startingFoodKcal} tone={foodDays < 5 ? 'bad' : foodDays < 10 ? 'warn' : 'ok'} />
      <Row icon="rad" label="Radiation taken" value={sim.radiation.doseMsvCumulative.toFixed(0)} unit="mSv" frac={doseFrac} flip tone={doseFrac > 0.6 ? 'bad' : doseFrac > 0.3 ? 'warn' : 'ok'} />
      <Row icon="dust" label="Dust on panels" value={`${Math.round(sim.power.panelDust * 100)}`} unit="%" frac={sim.power.panelDust} flip tone={sim.power.panelDust > 0.6 ? 'warn' : 'ok'} />
      <Row icon="heart" label="Crew health" value={`${Math.round(sim.crew.health * 100)}`} unit="%" frac={sim.crew.health} tone={sim.crew.health < 0.4 ? 'bad' : sim.crew.health < 0.75 ? 'warn' : 'ok'} />
      <p className="px-1 pt-1 text-[12.5px] text-bone/50">Game values, simplified. Not NASA data.</p>
    </section>
  );
}

export function EarthLink() {
  const sim = useGame((s) => s.sim);
  const world = useGame((s) => s.run?.world);
  if (!sim || !world) return null;
  const up = sim.comms.linkUp;
  return (
    <div className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[12.5px] md:text-[13.5px] ${up ? 'border-starlight/50 bg-starlight/10 text-starlight' : 'blink border-caution/70 bg-caution/10 text-caution'}`}>
      <Icon name="signal" size={18} />
      <span>
        <b className="font-bold">{up ? 'Earth link up' : 'No contact with Earth'}</b>
        <span className="ml-2 hidden text-bone/70 sm:inline">{world.solarConjunction ? 'The Sun is in the way' : `${lightTimeLabel(world.lightTimeSeconds)} each way`}</span>
      </span>
    </div>
  );
}
