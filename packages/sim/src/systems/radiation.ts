import type { System } from '../types';
import { Emitter, clamp } from '../events/helpers';
import { effectMagnitude, hasEffect } from '../events';

export const radiationSystem: System = (state, ctx) => {
  const { decisions, rules } = ctx;
  const b = rules.balance;
  const em = new Emitter(state.sol, ctx.priorEvents);
  const causes = { ...state.causes };
  const flags = { ...state.flags };

  const flareM = effectMagnitude(state, 'solar-flare');
  const threat = flareM > 0 || hasEffect(state, 'flare-watch');
  const poweredShelter = state.power.powered.shielding;

  // shelter lost: only matters (and only reported) while there is a threat
  if (threat && poweredShelter < b.shelterMinPowered && !flags['shelterLost']) {
    const ev = em.emit('shelter-power-lost', 'shelter-power-lost', [causes['flare-watch'], causes['battery-low'], causes['power-shortfall']], {
      powered: Math.round(poweredShelter * 100) / 100,
    });
    causes['shelter-power-lost'] = ev.id;
    flags['shelterLost'] = true;
  } else if (poweredShelter >= b.shelterMinPowered) flags['shelterLost'] = false;

  const eva = decisions.eva; // crew outside cannot shelter
  const sheltered = decisions.shelter && !eva ? poweredShelter : 0;
  const mitigation = clamp(
    sheltered * b.shelterEffectiveness + state.radiation.shieldingLevel + rules.site.naturalShielding * 0.3,
    0,
    0.95,
  );

  let spike = 0;
  let habitat = state.habitat;
  let health = state.crew.health;
  if (flareM > 0) {
    const raw = flareM * b.flareMaxMsv;
    spike = raw * (1 - mitigation);
    const protectedWell = mitigation >= 0.5;
    const sources = [causes['cme-arrival'], causes['flare-watch'], causes['shelter-power-lost'], causes['eva-in-warning']];
    const ev = em.emit('radiation-spike', protectedWell ? 'sheltered' : 'radiation-spike', sources, {
      msv: Math.round(spike * 10) / 10,
      rawMsv: Math.round(raw * 10) / 10,
    });
    causes['radiation-spike'] = ev.id;
    if (!protectedWell && raw >= b.damageMsv) {
      habitat = { integrity: clamp(habitat.integrity - flareM * 1.3, 0, 1) };
      const dmg = em.emit('habitat-damage', 'habitat-damage', [ev.id], { integrity: Math.round(habitat.integrity * 100) / 100 });
      causes['habitat-damage'] = dmg.id;
    }
    if (spike > b.damageMsv) health = Math.max(0, health - 0.1);
  }

  const baseline = b.doseBaselineMsvPerSol * (1 - mitigation * 0.5);
  return {
    state: {
      ...state,
      habitat,
      crew: { ...state.crew, health },
      radiation: { ...state.radiation, doseMsvCumulative: state.radiation.doseMsvCumulative + baseline + spike },
      causes,
      flags,
    },
    events: em.events,
  };
};
