import { Router } from 'express';
import { CreateRunBody, FinishRunBody } from '@amt/shared';
import { handler, parseBody } from '../../lib/http';
import type { RunsService } from './runs.service';
import type { SpaceDataService } from '../space-data/space-data.service';
import { getScenario, getSite } from '@amt/content';
import { buildRules, CREW_SIZE } from '../game/rules';

export function runsRouter(service: RunsService, space: SpaceDataService) {
  const r = Router();
  r.post('/', handler(async (req, res) => {
    const body = parseBody(CreateRunBody, req.body);
    const run = await service.start(req.playerId!, body);
    // Everything the client needs to play: it runs @amt/sim locally with these rules and this world.
    const { rules } = buildRules(run.scenarioId, run.siteId, run.difficulty);
    const world = await space.getSnapshot();
    res.status(201).json({
      runId: run.id,
      startedAt: run.startedAt,
      config: { scenarioId: run.scenarioId, siteId: run.siteId, seed: run.seed, difficulty: run.difficulty, crewSize: CREW_SIZE },
      rules,
      scenario: getScenario(run.scenarioId),
      site: getSite(run.siteId),
      world,
    });
  }));
  r.put('/:id/finish', handler(async (req, res) => {
    const run = await service.finish(req.playerId!, req.params['id']!, parseBody(FinishRunBody, req.body));
    res.json({ runId: run.id, status: run.status, score: run.score });
  }));
  r.get('/:id', handler(async (req, res) => {
    res.json(await service.get(req.playerId!, req.params['id']!));
  }));
  return r;
}
