import type { System } from '../types';

/**
 * Comms system.
 * TODO:
 *  - linkUp = !world.solarConjunction && no active 'comms-blackout' effect && comms power funded
 *  - Earth guidance for sol N is scheduled to arrive after world.lightTimeSeconds (scaled by the caller); record lastGuidanceSol
 *  - emit 'comms-blackout-start' / 'comms-blackout-end' so the debrief can credit autonomous decisions
 */
export const commsSystem: System = (state) => ({ state, events: [] });
