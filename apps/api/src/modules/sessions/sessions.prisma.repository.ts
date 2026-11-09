import type { Db } from '../../lib/db';
import type { Account, Player, PlayerRepository } from './sessions.repository';

const toPlayer = (p: { id: string; displayName: string; createdAt: Date }): Player => ({
  id: p.id,
  displayName: p.displayName,
  createdAt: p.createdAt.toISOString(),
});
const toAccount = (p: { id: string; displayName: string; createdAt: Date; username: string | null; passwordHash: string | null }): Account | null =>
  p.username && p.passwordHash ? { ...toPlayer(p), username: p.username, passwordHash: p.passwordHash } : null;

export class PrismaPlayerRepository implements PlayerRepository {
  constructor(private readonly db: Db) {}
  async create(displayName: string, createdAt: string): Promise<Player> {
    return toPlayer(await this.db.player.create({ data: { displayName, createdAt: new Date(createdAt) } }));
  }
  async get(id: string): Promise<Player | null> {
    const p = await this.db.player.findUnique({ where: { id } });
    return p ? toPlayer(p) : null;
  }
  async createAccount(a: { username: string; displayName: string; passwordHash: string }, createdAt: string) {
    try {
      return toAccount(await this.db.player.create({ data: { ...a, createdAt: new Date(createdAt) } }));
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') return null; // username taken
      throw e;
    }
  }
  async findByUsername(username: string) {
    const p = await this.db.player.findUnique({ where: { username } });
    return p ? toAccount(p) : null;
  }
}
