import { randomUUID } from 'node:crypto';

export interface Player {
  id: string;
  displayName: string;
  createdAt: string;
}

export interface Account extends Player {
  username: string;
  passwordHash: string;
}

export interface PlayerRepository {
  create(displayName: string, createdAt: string): Promise<Player>;
  get(id: string): Promise<Player | null>;
  createAccount(a: { username: string; displayName: string; passwordHash: string }, createdAt: string): Promise<Account | null>;
  findByUsername(username: string): Promise<Account | null>;
}

export class MemoryPlayerRepository implements PlayerRepository {
  private players = new Map<string, Player>();
  private accounts = new Map<string, Account>();
  async create(displayName: string, createdAt: string) {
    const p = { id: randomUUID(), displayName, createdAt };
    this.players.set(p.id, p);
    return p;
  }
  async get(id: string) {
    return this.players.get(id) ?? null;
  }
  async createAccount(a: { username: string; displayName: string; passwordHash: string }, createdAt: string) {
    if (this.accounts.has(a.username)) return null;
    const acc: Account = { id: randomUUID(), createdAt, ...a };
    this.players.set(acc.id, acc);
    this.accounts.set(a.username, acc);
    return acc;
  }
  async findByUsername(username: string) {
    return this.accounts.get(username) ?? null;
  }
}
