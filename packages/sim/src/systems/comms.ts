import type { System } from '../types';
import { Emitter } from '../events/helpers';
import { hasEffect } from '../events';

/** Link is down in a conjunction, a scripted blackout, or when comms power is too low. */
export const commsSystem: System = (state, ctx) => {
  const em = new Emitter(state.sol, ctx.priorEvents);
  const causes = { ...state.causes };
  const down = ctx.world.solarConjunction || hasEffect(state, 'comms-blackout') || state.power.powered.comms < 0.5;
  let { blackoutSols, lastGuidanceSol } = state.comms;

  if (down) {
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
