import { Router } from 'express';
import { handler } from '../../lib/http';
import type { RunsService } from '../runs/runs.service';
import type { DebriefService } from './debrief.service';

export function debriefRouter(runs: RunsService, debrief: DebriefService) {
  const r = Router();
  r.get('/:id/debrief', handler(async (req, res) => {
    const run = await runs.get(req.playerId!, req.params['id']!);
    res.json(await debrief.build(run));
  }));
  return r;
}
