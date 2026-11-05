import type { System } from '../types';
import { Emitter, clamp } from '../events/helpers';
import { effectMagnitude } from '../events';

export const powerSystem: System = (state, ctx) => {
  const { decisions, rules } = ctx;
  const b = rules.balance;
  const em = new Emitter(state.sol, ctx.priorEvents);
  const causes = { ...state.causes };
  const flags = { ...state.flags };

  // dust builds up faster in a storm; terrain decides the base rate
  const stormM = effectMagnitude(state, 'dust-storm');
  const faultM = effectMagnitude(state, 'equipment-fault');
  const deposition = b.dustDepositionPerSol * rules.site.dustDeposition * (1 + stormM * b.stormDepositionMultiplier);
  const panelDust = clamp(state.power.panelDust + deposition, 0, 1);

  const generation =
    b.baseGenerationKwhPerSol *
    rules.site.solarInsolation *
    (1 - panelDust * b.panelDustLoss) *
    (1 - stormM * b.stormGenerationBlock) *
    (1 - faultM * 0.5);
  const G = Math.max(0, generation);

  // normalise allocation
  const a = decisions.power;
  const sum = a.lifeSupport + a.shielding + a.greenhouse + a.comms + a.reserve;
  const k = sum > 1 ? 1 / sum : 1;
  const need = {
    lifeSupport: b.lifeSupportKwhPerCrew * state.crew.count,
    shielding: b.shelterKwh,
    greenhouse: b.greenhouseKwh,
    comms: b.commsKwh,
  };
  const given = {
    lifeSupport: a.lifeSupport * k * G,
    shielding: a.shielding * k * G,
    greenhouse: a.greenhouse * k * G,
    comms: a.comms * k * G,
  };
  let battery = state.power.batteryKwh + a.reserve * k * G;

  // unused allocation goes back into the battery
  for (const key of ['lifeSupport', 'shielding', 'greenhouse', 'comms'] as const) {
    const spare = Math.max(0, given[key] - need[key]);
    battery += spare;
    given[key] -= spare;
  }
  // life support is the one consumer the battery covers automatically
  const shortfall = Math.max(0, need.lifeSupport - given.lifeSupport);
  const draw = Math.min(shortfall, battery);
  given.lifeSupport += draw;
  battery -= draw;
  battery = clamp(battery, 0, state.power.capKwh);

  const powered = {
    lifeSupport: need.lifeSupport > 0 ? clamp(given.lifeSupport / need.lifeSupport, 0, 1) : 1,
    shielding: clamp(given.shielding / need.shielding, 0, 1),
    greenhouse: clamp(given.greenhouse / need.greenhouse, 0, 1),
    comms: clamp(given.comms / need.comms, 0, 1),
  };

  // events (edge-triggered)
  const totalNeed = need.lifeSupport + need.shielding + need.greenhouse + need.comms;
  const short = G < totalNeed;
  if (short && !flags['shortfall']) {
    const ev = em.emit('power-shortfall', 'power-shortfall', [causes['dust-storm'], causes['equipment-fault']], {
      generation: Math.round(G),
      demand: Math.round(totalNeed),
    });
    causes['power-shortfall'] = ev.id;
    flags['shortfall'] = true;
  } else if (!short) {
    flags['shortfall'] = false;
    flags['loadShedLogged'] = false;
  }
  if (short && powered.lifeSupport >= 1 && battery >= state.power.batteryKwh && !flags['loadShedLogged']) {
    const ev = em.emit('power-shortfall', 'load-shed', [causes['power-shortfall']], { battery: Math.round(battery) });
    causes['load-shed'] = ev.id;
    flags['loadShedLogged'] = true;
  }
  const low = battery / state.power.capKwh < b.batteryLowFraction;
  if (low && !flags['batteryLow']) {
    const ev = em.emit('battery-low', 'battery-low', [causes['power-shortfall']], {
      pct: Math.round(b.batteryLowFraction * 100),
      battery: Math.round(battery),
    });
    causes['battery-low'] = ev.id;
    flags['batteryLow'] = true;
  } else if (!low) flags['batteryLow'] = false;

  return {
    state: { ...state, power: { ...state.power, batteryKwh: battery, panelDust, availableKwh: G, powered }, causes, flags },
    events: em.events,
  };
};
