import { randomUUID } from 'node:crypto';
import type { SolDecisions, WorldSnapshot } from '@amt/shared';

export interface RunRecord {
  id: string;
  playerId: string;
  scenarioId: string;
  siteId: string;
  seed: number;
  mode: string;
  difficulty: 'trainee' | 'commander';
  status: 'running' | 'failed' | 'completed';
  decisions: SolDecisions[];
  worldSnapshots: WorldSnapshot[];
  score: number | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface RunRepository {
  create(input: Omit<RunRecord, 'id' | 'status' | 'decisions' | 'worldSnapshots' | 'score' | 'startedAt' | 'finishedAt'>, startedAt: string): Promise<RunRecord>;
  get(id: string): Promise<RunRecord | null>;
  save(run: RunRecord): Promise<RunRecord>;
}

/** Default store. Swap for a Prisma implementation (same interface) when DATABASE_URL is set. */
export class MemoryRunRepository implements RunRepository {
  private runs = new Map<string, RunRecord>();
  async create(input: Parameters<RunRepository['create']>[0], startedAt: string) {
    const run: RunRecord = { ...input, id: randomUUID(), status: 'running', decisions: [], worldSnapshots: [], score: null, startedAt, finishedAt: null };
    this.runs.set(run.id, run);
    return run;
  }
  async get(id: string) {
    return this.runs.get(id) ?? null;
  }
  async save(run: RunRecord) {
    this.runs.set(run.id, run);
    return run;
  }
}
