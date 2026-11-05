import type { SolDecisions, WorldSnapshot } from '@amt/shared';
import { createRng } from './rng';
import { powerSystem } from './systems/power';
import { lifeSupportSystem } from './systems/life-support';
import { radiationSystem } from './systems/radiation';
import { foodSystem } from './systems/food';
import { commsSystem } from './systems/comms';
import { actionsSystem } from './systems/actions';
import { Emitter } from './events/helpers';
import { worldEventsSystem } from './events';
import type { RunConfig, SimEvent, SimRules, SimState, StepResult, System } from './types';

/** Fixed order. Changing it changes game behavior and breaks recorded runs: add a test when you do. */
const PIPELINE: System[] = [
  worldEventsSystem, // scripted + live events become active effects
  actionsSystem, // EVA and projects
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
    power: {
      batteryKwh: b.batteryCapKwh * b.startBatteryFraction,
      capKwh: b.batteryCapKwh,
      panelDust: 0,
      availableKwh: 0,
      powered: { lifeSupport: 1, shielding: 1, greenhouse: 1, comms: 1 },
    },
    lifeSupport: { o2Days: b.o2DaysStart, waterL: b.startingWaterL },
    food: { stockKcal: b.startingFoodKcal, greenhouseLevel: b.startGreenhouseLevel },
    radiation: { doseMsvCumulative: 0, shieldingLevel: 0 },
    habitat: { integrity: 1 },
    crew: { count: config.crewSize, health: 1, morale: 1 },
    comms: { linkUp: true, lastGuidanceSol: null, blackoutSols: 0 },
    projects: [],
    activeEffects: [],
    causes: {},
    flags: {},
    lastEvaPostponedSol: -99,
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

  const failure = failureReason(current, rules);
  if (failure) {
    const em = new Emitter(current.sol, events);
    const c = current.causes;
    const ev = em.emit(
      'evacuation',
      'evacuation',
      [c['habitat-damage'], c['radiation-spike'], c['food-shortage'], c['shelter-power-lost'], c['battery-low']],
      { reason: failure },
    );
    events.push(ev);
    return { state: current, events, status: 'failed' };
  }
  if (current.sol >= rules.durationSols) {
    const em = new Emitter(current.sol, events);
    events.push(em.emit('mission-complete', 'mission-complete', [], { sols: current.sol }));
    return { state: current, events, status: 'completed' };
  }
  return { state: current, events, status: 'running' };
}

function failureReason(s: SimState, rules: SimRules): string | null {
  if (s.habitat.integrity <= 0) return 'habitat-lost';
  if (s.radiation.doseMsvCumulative >= rules.balance.doseFailMsv) return 'radiation-dose';
  if (s.lifeSupport.o2Days <= 0) return 'no-oxygen';
  if (s.lifeSupport.waterL <= 0 && s.crew.health <= 0) return 'no-water';
  if (s.crew.health <= 0) return 'crew-health';
  return null;
}
