'use client';
import { useGame } from '@/game/store';
import { lightTimeLabel } from '@/lib/text';

function Row({ label, value, unit, frac, tone = 'ok' }: { label: string; value: string; unit?: string; frac: number; tone?: 'ok' | 'warn' | 'bad' }) {
  const color = tone === 'bad' ? 'bg-critical' : tone === 'warn' ? 'bg-caution' : 'bg-haze';
  return (
    <div className="py-[7px]">
      <div className="flex items-baseline justify-between">
        <span className="font-sans text-[14px] text-bone/80">{label}</span>
        <span className="instrument text-[17px] text-starlight">
          {tone !== 'ok' && <span aria-hidden className={tone === 'bad' ? 'text-critical' : 'text-caution'}>▲ </span>}
          {value}
          {unit && <span className="ml-1 text-[13px] text-bone/60">{unit}</span>}
        </span>
      </div>
      <div className="mt-1 h-[3px] bg-rust/45">
        <div className={`h-full ${color} transition-[width] duration-700`} style={{ width: `${Math.max(0, Math.min(1, frac)) * 100}%` }} />
      </div>
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
    <section aria-label="Outpost instruments" className="divide-y divide-rust/30">
      <Row label="Battery" value={`${Math.round(sim.power.batteryKwh)}`} unit="kWh" frac={battFrac} tone={battFrac < b.batteryLowFraction ? (battFrac < 0.15 ? 'bad' : 'warn') : 'ok'} />
      <Row label="Oxygen" value={sim.lifeSupport.o2Days.toFixed(1)} unit="days" frac={sim.lifeSupport.o2Days / b.o2DaysStart} tone={sim.lifeSupport.o2Days < 4 ? 'bad' : sim.lifeSupport.o2Days < 7 ? 'warn' : 'ok'} />
      <Row label="Water" value={`${Math.round(sim.lifeSupport.waterL)}`} unit="L" frac={sim.lifeSupport.waterL / b.startingWaterL} tone={waterDays < 4 ? 'bad' : waterDays < 8 ? 'warn' : 'ok'} />
      <Row label="Food" value={foodDays.toFixed(0)} unit="days" frac={sim.food.stockKcal / b.startingFoodKcal} tone={foodDays < 5 ? 'bad' : foodDays < 10 ? 'warn' : 'ok'} />
      <Row label="Radiation taken" value={sim.radiation.doseMsvCumulative.toFixed(0)} unit="mSv" frac={doseFrac} tone={doseFrac > 0.6 ? 'bad' : doseFrac > 0.3 ? 'warn' : 'ok'} />
      <Row label="Dust on panels" value={`${Math.round(sim.power.panelDust * 100)}`} unit="%" frac={sim.power.panelDust} tone={sim.power.panelDust > 0.6 ? 'warn' : 'ok'} />
      <Row label="Crew health" value={`${Math.round(sim.crew.health * 100)}`} unit="%" frac={sim.crew.health} tone={sim.crew.health < 0.4 ? 'bad' : sim.crew.health < 0.75 ? 'warn' : 'ok'} />
      <p className="pt-2 text-[13px] text-bone/55">Game values, simplified. They are not NASA data.</p>
    </section>
  );
}

export function EarthLink() {
  const sim = useGame((s) => s.sim);
  const world = useGame((s) => s.run?.world);
  if (!sim || !world) return null;
  const up = sim.comms.linkUp;
  return (
    <div className="instrument text-right text-[14px] leading-tight">
      <div className={up ? 'text-starlight' : 'text-caution'}>{up ? 'Earth link up' : 'No contact with Earth'}</div>
      <div className="text-bone/65">
        {world.solarConjunction ? 'The Sun is in the way' : `${lightTimeLabel(world.lightTimeSeconds)} each way`}
        {world.source !== 'live' && <span> ({world.source} data)</span>}
      </div>
    </div>
  );
}
