import { Router } from 'express';
import { CreateRunBody, FinishRunBody } from '@amt/shared';
import { handler, parseBody } from '../../lib/http';
import type { RunsService } from './runs.service';

export function runsRouter(service: RunsService) {
  const r = Router();
  r.post('/', handler(async (req, res) => {
    const run = await service.start(req.playerId!, parseBody(CreateRunBody, req.body));
    res.status(201).json({ runId: run.id, startedAt: run.startedAt });
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
