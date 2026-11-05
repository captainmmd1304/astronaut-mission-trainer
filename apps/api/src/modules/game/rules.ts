import { getBalance, getScenario, getSite, type Scenario } from '@amt/content';
import { createInitialState, step, type RunConfig, type RunStatus, type SimEvent, type SimRules, type SimState } from '@amt/sim';
import type { SolDecisions, WorldSnapshot } from '@amt/shared';
import { HttpError } from '../../lib/http';

export const CREW_SIZE = 4;

export function buildRules(scenarioId: string, siteId: string, difficulty: RunConfig['difficulty']): { rules: SimRules; objectives: Scenario['learningObjectives'] } {
  const scenario = getScenario(scenarioId);
  const site = getSite(siteId);
  if (!scenario) throw new HttpError(404, `Unknown scenario: ${scenarioId}`, 'unknown_scenario');
  if (!site) throw new HttpError(404, `Unknown landing site: ${siteId}`, 'unknown_site');
  return {
    rules: {
      site: site.modifiers,
      balance: getBalance(difficulty),
      durationSols: scenario.durationSols,
      scriptedEvents: scenario.scriptedEvents,
    },
    objectives: scenario.learningObjectives,
  };
}

export interface ReplayResult {
  status: RunStatus;
  state: SimState;
  events: SimEvent[];
  solsPlayed: number;
}

/** Re-run a recorded run. Snapshots are matched to sols by index; the last one repeats if fewer are given. */
export function replay(config: RunConfig, rules: SimRules, decisions: SolDecisions[], snapshots: WorldSnapshot[]): ReplayResult {
  let state = createInitialState(config, rules);
  const events: SimEvent[] = [];
  let status: RunStatus = 'running';
  let solsPlayed = 0;
  for (let i = 0; i < decisions.length && status === 'running'; i++) {
    const world = snapshots[Math.min(i, snapshots.length - 1)];
    if (!world) throw new HttpError(400, 'At least one world snapshot is required', 'bad_request');
    const result = step(state, decisions[i]!, world, rules);
    state = result.state;
    events.push(...result.events);
    status = result.status;
    solsPlayed++;
  }
  return { status, state, events, solsPlayed };
}

export function objectivesMet(
  objectives: { id: string; text: string; provenBy: { eventType: string; explainKey: string } }[],
  events: SimEvent[],
) {
  return objectives.map((o) => ({
    id: o.id,
    text: o.text,
    met: events.some((e) => e.type === o.provenBy.eventType && e.explainKey === o.provenBy.explainKey),
  }));
}

export function computeScore(replayed: ReplayResult, metCount: number): number {
  const { state, status, solsPlayed } = replayed;
  const base = solsPlayed * (status === 'completed' ? 10 : 5);
  const health = Math.round(state.crew.health * 200);
  const objectives = metCount * 100;
  const dosePenalty = Math.round(state.radiation.doseMsvCumulative * 0.5);
  return Math.max(0, base + (status === 'completed' ? health : 0) + objectives - dosePenalty);
}
