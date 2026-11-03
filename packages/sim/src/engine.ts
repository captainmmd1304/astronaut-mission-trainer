import type { SolDecisions, WorldSnapshot } from '@amt/shared';
import { createRng } from './rng';
import { powerSystem } from './systems/power';
import { lifeSupportSystem } from './systems/life-support';
import { radiationSystem } from './systems/radiation';
import { foodSystem } from './systems/food';
import { commsSystem } from './systems/comms';
import { worldEventsSystem } from './events';
import type { RunConfig, SimEvent, SimRules, SimState, StepResult, System } from './types';

/** Fixed order. Changing it changes game behavior and breaks recorded runs: add a test when you do. */
const PIPELINE: System[] = [
  worldEventsSystem, // scripted + live events become active effects
  powerSystem,
  lifeSupportSystem,
  radiationSystem,
  foodSystem,
  commsSystem,
];

export function createInitialState(config: RunConfig, rules: SimRules): SimState {
  const b = rules.balance;
  return {
    sol: 0,
    rngState: config.seed >>> 0,
    power: { batteryKwh: b.batteryCapKwh * 0.5, panelDust: 0, availableKwh: 0 },
    lifeSupport: { o2Days: 30, waterL: b.startingWaterL },
    food: { stockKcal: b.startingFoodKcal, greenhouseLevel: 0 },
    radiation: { doseMsvCumulative: 0, shieldingLevel: 0 },
    crew: { count: config.crewSize, health: 1, morale: 1 },
    comms: { linkUp: true, lastGuidanceSol: null },
    projects: [],
    activeEffects: [],
  };
}

/** Advance exactly one sol. Pure: same inputs always give the same output. */
export function step(
  state: SimState,
  decisions: SolDecisions,
  world: WorldSnapshot,
  rules: SimRules,
): StepResult {
  const rng = createRng(state.rngState);
  let current: SimState = { ...state, sol: state.sol + 1 };
  const events: SimEvent[] = [];

  for (const system of PIPELINE) {
    const out = system(current, { decisions, world, rules, rng, priorEvents: events });
    current = out.state;
    events.push(...out.events);
  }

  current = { ...current, rngState: rng.state };

  // TODO: failure conditions (dose over threshold, no O2/water, crew health 0) and completion (sol >= rules.durationSols)
  const status = current.sol >= rules.durationSols ? 'completed' : 'running';
  return { state: current, events, status };
}
