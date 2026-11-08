import { pino } from 'pino';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { createDb } from './lib/db';
import { PrismaRunRepository } from './modules/runs/runs.prisma.repository';
import { PrismaPlayerRepository } from './modules/sessions/sessions.prisma.repository';

const env = loadEnv();
const log = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' });
// With a Neon URL runs and players persist; without it the app uses its in-memory store.
const dbUrl = env.DATABASE_URL_POOLED ?? env.DATABASE_URL;
const db = dbUrl ? createDb(dbUrl) : null;
const app = createApp(env, {
  log,
  ...(db ? { runs: new PrismaRunRepository(db), players: new PrismaPlayerRepository(db) } : {}),
});
if (!db) log.warn('No database URL set: using in-memory store, data is lost on restart');

app.listen(env.PORT, () => log.info({ port: env.PORT, spaceDataMode: env.SPACE_DATA_MODE, store: db ? 'neon' : 'memory' }, 'api listening'));
