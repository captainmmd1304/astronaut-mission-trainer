import type { SimEvent, System } from '../types';

/** Build a cause-linked event. `n` disambiguates several events of one type in one sol. */
export function makeEvent(
  sol: number,
  type: string,
  explainKey: string,
  causedBy: string[] = [],
  data?: SimEvent['data'],
  n = 0,
): SimEvent {
  return { id: `${sol}:${type}:${n}`, sol, type, causedBy, explainKey, data };
}

/**
 * World events system. Turns external conditions into active effects on the state.
 * TODO:
 *  - scripted events: rules.scriptedEvents whose `sol` matches -> push into state.activeEffects
 *  - live events: world.solarEvents (flare => same-sol radiation spike, cme => multi-sol warning window)
 *  - dust storms: seeded probability by site + season (use ctx.rng only)
 *  - conjunction: world.solarConjunction => comms blackout effect
 *  - decrement solsRemaining and drop expired effects
 */
export const worldEventsSystem: System = (state) => ({ state, events: [] });
