import cors from 'cors';
import express from 'express';
import type { Env } from './config/env';
import { requireAuth } from './lib/auth';
import { errorMiddleware } from './lib/http';
import { fetchSolarEvents } from './integrations/donki.client';
import { fetchHorizons } from './integrations/horizons.client';
import { contentRouter } from './modules/content/content.controller';
import { DebriefService } from './modules/debrief/debrief.service';
import { debriefRouter } from './modules/debrief/debrief.controller';
import { MemoryRunRepository, type RunRepository } from './modules/runs/runs.repository';
import { RunsService } from './modules/runs/runs.service';
import { runsRouter } from './modules/runs/runs.controller';
import { MemoryPlayerRepository, type PlayerRepository } from './modules/sessions/sessions.repository';
import { SessionsService } from './modules/sessions/sessions.service';
import { sessionsRouter } from './modules/sessions/sessions.controller';
import { SpaceDataService, type SpaceDataDeps } from './modules/space-data/space-data.service';
import { spaceDataRouter } from './modules/space-data/space-data.controller';

export interface AppDeps {
  runs?: RunRepository;
  players?: PlayerRepository;
  now?: () => Date;
  space?: Partial<SpaceDataDeps>;
  log?: { warn: (o: unknown, m?: string) => void; error: (o: unknown, m?: string) => void; info: (o: unknown, m?: string) => void };
}

const quietLog = { warn: () => {}, error: () => {}, info: () => {} };

export function createApp(env: Env, deps: AppDeps = {}) {
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? quietLog;
  const space = new SpaceDataService(
    { mode: env.SPACE_DATA_MODE, nasaApiKey: env.NASA_API_KEY, ttlMinutes: env.SPACE_DATA_TTL_MINUTES },
    { now, fetchHorizons, fetchSolarEvents, log, ...deps.space },
  );
  const sessions = new SessionsService(deps.players ?? new MemoryPlayerRepository(), env.JWT_SECRET, now);
  const runs = new RunsService(deps.runs ?? new MemoryRunRepository(), now);
  const debrief = new DebriefService(env.OPENROUTER_API_KEY ? { apiKey: env.OPENROUTER_API_KEY, model: env.OPENROUTER_MODEL } : null);
  const auth = requireAuth(env.JWT_SECRET);

  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()) }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/health', (_req, res) => res.json({ ok: true, spaceDataMode: env.SPACE_DATA_MODE, commsTimeScale: env.COMMS_TIME_SCALE }));
  app.use('/v1/sessions', sessionsRouter(sessions));
  app.use('/v1/content', contentRouter());
  app.use('/v1/space', spaceDataRouter(space, env.SPACE_DATA_MODE));
  app.use('/v1/runs', auth, runsRouter(runs), debriefRouter(runs, debrief));

  app.use((_req, res) => res.status(404).json({ error: { code: 'not_found', message: 'No such route' } }));
  app.use(errorMiddleware(log));
  return app;
}
