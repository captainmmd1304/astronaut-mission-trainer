import { CreateRunBody, FinishRunBody } from '@amt/shared';
import type { z } from 'zod';
import { HttpError } from '../../lib/http';
import { buildRules, computeScore, objectivesMet, replay, CREW_SIZE } from '../game/rules';
import type { RunRecord, RunRepository } from './runs.repository';

export class RunsService {
  constructor(
    private readonly repo: RunRepository,
    private readonly now: () => Date,
  ) {}

  async start(playerId: string, body: z.infer<typeof CreateRunBody>): Promise<RunRecord> {
    buildRules(body.scenarioId, body.siteId, body.difficulty); // validates ids
    return this.repo.create({ playerId, scenarioId: body.scenarioId, siteId: body.siteId, seed: body.seed, mode: body.mode, difficulty: body.difficulty }, this.now().toISOString());
  }

  async get(playerId: string, id: string): Promise<RunRecord> {
    const run = await this.repo.get(id);
    if (!run || run.playerId !== playerId) throw new HttpError(404, 'Run not found', 'not_found');
    return run;
  }

  /** Replays the submitted run. The claimed outcome must match what the sim produces. */
  async finish(playerId: string, id: string, body: z.infer<typeof FinishRunBody>): Promise<RunRecord> {
    const run = await this.get(playerId, id);
    if (run.status !== 'running') throw new HttpError(409, 'Run already finished', 'already_finished');

    const { rules, objectives } = buildRules(run.scenarioId, run.siteId, run.difficulty);
    body.decisions.forEach((d, i) => {
      if (d.sol !== i + 1) throw new HttpError(400, `Decision ${i} must be for sol ${i + 1}`, 'bad_request');
    });
    if (body.decisions.length > rules.durationSols) throw new HttpError(400, 'Too many decisions for this scenario', 'bad_request');

    const config = { scenarioId: run.scenarioId, siteId: run.siteId, seed: run.seed, difficulty: run.difficulty, crewSize: CREW_SIZE };
    const result = replay(config, rules, body.decisions, body.worldSnapshots);
    if (result.status !== body.status) {
      throw new HttpError(422, `Replay ended as '${result.status}' but run claimed '${body.status}'`, 'replay_mismatch');
    }
    const met = objectivesMet(objectives, result.events).filter((o) => o.met).length;
    return this.repo.save({
      ...run,
      status: result.status as 'failed' | 'completed',
      decisions: body.decisions,
      worldSnapshots: body.worldSnapshots,
      score: computeScore(result, met),
      finishedAt: this.now().toISOString(),
    });
  }
}
