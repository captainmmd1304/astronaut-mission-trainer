import type { Prisma, Run } from '@prisma/client';
import type { SolDecisions, WorldSnapshot } from '@amt/shared';
import type { Db } from '../../lib/db';
import type { RunRecord, RunRepository } from './runs.repository';

const toRecord = (r: Run): RunRecord => ({
  id: r.id,
  playerId: r.playerId,
  scenarioId: r.scenarioId,
  siteId: r.siteId,
  seed: r.seed,
  mode: r.mode,
  difficulty: r.difficulty as RunRecord['difficulty'],
  status: r.status,
  decisions: r.decisions as unknown as SolDecisions[],
  worldSnapshots: r.worldSnapshots as unknown as WorldSnapshot[],
  score: r.score,
  startedAt: r.startedAt.toISOString(),
  finishedAt: r.finishedAt?.toISOString() ?? null,
});

export class PrismaRunRepository implements RunRepository {
  constructor(private readonly db: Db) {}

  async create(input: Parameters<RunRepository['create']>[0], startedAt: string) {
    return toRecord(await this.db.run.create({ data: { ...input, startedAt: new Date(startedAt) } }));
  }

  async get(id: string) {
    const r = await this.db.run.findUnique({ where: { id } });
    return r ? toRecord(r) : null;
  }

  async save(run: RunRecord) {
    const saved = await this.db.run.update({
      where: { id: run.id },
      data: {
        status: run.status,
        decisions: run.decisions as unknown as Prisma.InputJsonValue,
        worldSnapshots: run.worldSnapshots as unknown as Prisma.InputJsonValue,
        score: run.score,
        finishedAt: run.finishedAt ? new Date(run.finishedAt) : null,
      },
    });
    return toRecord(saved);
  }
}
