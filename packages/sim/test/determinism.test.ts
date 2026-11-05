import { describe, expect, it } from 'vitest';
import type { SolDecisions, WorldSnapshot } from '@amt/shared';
import { createInitialState, step } from '../src';
import type { RunConfig, SimRules } from '../src';

const config: RunConfig = { scenarioId: 'test', siteId: 'jezero', seed: 42, difficulty: 'trainee', crewSize: 4 };

import { testRules } from './fixtures';
const rules: SimRules = { ...testRules, durationSols: 5 };

const world: WorldSnapshot = {
  capturedAt: '2026-01-01T00:00:00Z',
  source: 'fixture',
  lightTimeSeconds: 600,
  solarConjunction: false,
  solarEvents: [],
};

const decisions = (sol: number): SolDecisions => ({
  sol,
  power: { lifeSupport: 0.4, shielding: 0.2, greenhouse: 0.2, comms: 0.1, reserve: 0.1 },
  project: null,
  eva: false,
  shelter: false,
});

function run() {
  let state = createInitialState(config, rules);
  const log: unknown[] = [];
  for (let sol = 1; sol <= rules.durationSols; sol++) {
    const result = step(state, decisions(sol), world, rules);
    log.push(result);
    state = result.state;
  }
  return log;
}

describe('sim determinism', () => {
  it('same seed + same inputs => identical results', () => {
    expect(run()).toEqual(run());
  });

  it('different seed => state carries a different rng state', () => {
    const a = createInitialState(config, rules);
    const b = createInitialState({ ...config, seed: 43 }, rules);
    expect(a.rngState).not.toEqual(b.rngState);
  });

  it('completes after durationSols', () => {
    const log = run() as { status: string }[];
    expect(log.at(-1)?.status).toBe('completed');
  });

});
