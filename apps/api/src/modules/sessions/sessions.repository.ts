import { randomUUID } from 'node:crypto';

export interface Player {
  id: string;
  displayName: string;
  createdAt: string;
}

export interface PlayerRepository {
  create(displayName: string, createdAt: string): Promise<Player>;
  get(id: string): Promise<Player | null>;
}

export class MemoryPlayerRepository implements PlayerRepository {
  private players = new Map<string, Player>();
  async create(displayName: string, createdAt: string) {
    const p = { id: randomUUID(), displayName, createdAt };
    this.players.set(p.id, p);
    return p;
  }
  async get(id: string) {
    return this.players.get(id) ?? null;
  }
}
