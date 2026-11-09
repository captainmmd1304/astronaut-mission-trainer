import type { System } from '../types';
import { Emitter } from '../events/helpers';
import { hasEffect } from '../events';

/** Link is down in a conjunction, a scripted blackout, or when comms power is too low. */
export const commsSystem: System = (state, ctx) => {
  const em = new Emitter(state.sol, ctx.priorEvents);
  const causes = { ...state.causes };
  const sun = ctx.world.solarConjunction;
  const blackout = hasEffect(state, 'comms-blackout');
  const down = sun || blackout || state.power.powered.comms < 0.5;
  let { blackoutSols, lastGuidanceSol } = state.comms;

  if (down) {
    if (state.comms.linkUp) {
      const reason = sun ? 'conjunction' : blackout ? 'blackout' : 'power';
      const ev = em.emit('comms-down', reason === 'power' ? 'comms-down-power' : 'comms-down', [causes['comms-blackout'], reason === 'power' ? causes['power-shortfall'] : undefined], { reason });
      causes['comms-down'] = ev.id;
    }
    blackoutSols += 1;
  } else {
    if (blackoutSols >= 2 && state.crew.health > 0) {
      const ev = em.emit('blackout-autonomy', 'blackout-autonomy', [causes['comms-blackout']], { sols: blackoutSols });
      causes['blackout-autonomy'] = ev.id;
    }
    blackoutSols = 0;
    lastGuidanceSol = state.sol;
  }
  return { state: { ...state, comms: { linkUp: !down, lastGuidanceSol, blackoutSols }, causes }, events: em.events };
};
