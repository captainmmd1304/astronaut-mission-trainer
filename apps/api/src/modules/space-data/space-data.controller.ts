import { Router } from 'express';
import { handler } from '../../lib/http';
import type { SpaceDataService, FixtureName } from './space-data.service';

export function spaceDataRouter(service: SpaceDataService, mode: string) {
  const r = Router();
  r.get(
    '/conditions',
    handler(async (req, res) => {
      // ?fixture=conjunction only has an effect in fixture mode: lets the UI demo a blackout.
      const fixture: FixtureName = mode === 'fixture' && req.query['fixture'] === 'conjunction' ? 'conjunction' : 'closest';
      const snapshot = await service.getSnapshot(fixture);
      res.json({ snapshot, source: snapshot.source });
    }),
  );
  return r;
}
