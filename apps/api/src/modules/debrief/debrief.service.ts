import { debriefClosingLine, renderDebriefLine } from '@amt/content';
import type { SimEvent } from '@amt/sim';
import { rephrase, type OpenRouterConfig } from '../../integrations/openrouter.client';
import { buildRules, objectivesMet, replay, CREW_SIZE } from '../game/rules';
import { HttpError } from '../../lib/http';
import type { RunRecord } from '../runs/runs.repository';

const QUIET = new Set<string>();

/** Walk causedBy backwards from `event`, returning earliest-first. Handles shared causes once. */
export function causeChain(events: SimEvent[], event: SimEvent): SimEvent[] {
  const byId = new Map(events.map((e) => [e.id, e]));
  const seen = new Set<string>();
  const out: SimEvent[] = [];
  const visit = (e: SimEvent) => {
    if (seen.has(e.id)) return;
    seen.add(e.id);
    for (const id of e.causedBy) {
      const parent = byId.get(id);
      if (parent) visit(parent);
    }
    out.push(e);
  };
  visit(event);
  return out.sort((a, b) => a.sol - b.sol);
}

const lineFor = (e: SimEvent) => ({ id: e.id, sol: e.sol, type: e.type, explainKey: e.explainKey, text: renderDebriefLine(e.explainKey, { sol: e.sol, ...e.data }) });

export class DebriefService {
  constructor(private readonly llm: OpenRouterConfig | null) {}

  async build(run: RunRecord) {
    if (run.status === 'running') throw new HttpError(409, 'Finish the run first', 'not_finished');
    const { rules, objectives } = buildRules(run.scenarioId, run.siteId, run.difficulty);
    const config = { scenarioId: run.scenarioId, siteId: run.siteId, seed: run.seed, difficulty: run.difficulty, crewSize: CREW_SIZE };
    const result = replay(config, rules, run.decisions, run.worldSnapshots);

    const notable = result.events.filter((e) => !QUIET.has(e.type));
    const last = notable.at(-1);
    const chain = last && last.causedBy.length > 0 ? causeChain(result.events, last).map(lineFor) : [];
    const keyEvents = notable.map(lineFor);
    const templateSummary = [...(chain.length ? chain : keyEvents.slice(-4)).map((l) => l.text), debriefClosingLine].join(' ');

    let summary = templateSummary;
    let generatedBy: 'llm' | 'template' = 'template';
    if (this.llm) {
      const rewritten = await rephrase(this.llm, (chain.length ? chain : keyEvents.slice(-4)).map((l) => l.text));
      if (rewritten) {
        summary = `${rewritten} ${debriefClosingLine}`;
        generatedBy = 'llm';
      }
    }

    return {
      runId: run.id,
      outcome: run.status,
      score: run.score,
      solsPlayed: result.solsPlayed,
      summary,
      generatedBy,
      causeChain: chain,
      keyEvents,
      objectives: objectivesMet(objectives, result.events),
      finalStats: {
        doseMsv: Math.round(result.state.radiation.doseMsvCumulative * 10) / 10,
        crewHealth: Math.round(result.state.crew.health * 100) / 100,
        batteryKwh: Math.round(result.state.power.batteryKwh),
      },
    };
  }
}
