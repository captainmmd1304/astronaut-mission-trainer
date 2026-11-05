import type { Db } from '../../lib/db';
import type { Player, PlayerRepository } from './sessions.repository';

export class PrismaPlayerRepository implements PlayerRepository {
  constructor(private readonly db: Db) {}
  async create(displayName: string, createdAt: string): Promise<Player> {
    const p = await this.db.player.create({ data: { displayName, createdAt: new Date(createdAt) } });
    return { id: p.id, displayName: p.displayName, createdAt: p.createdAt.toISOString() };
  }
  async get(id: string): Promise<Player | null> {
    const p = await this.db.player.findUnique({ where: { id } });
    return p ? { id: p.id, displayName: p.displayName, createdAt: p.createdAt.toISOString() } : null;
  }
}
