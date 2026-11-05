import { signToken } from '../../lib/auth';
import type { PlayerRepository } from './sessions.repository';

/** Guest sessions only: a display name and nothing else (no personal data, by design). */
export class SessionsService {
  constructor(
    private readonly players: PlayerRepository,
    private readonly secret: string,
    private readonly now: () => Date,
  ) {}
  async createGuest(displayName: string) {
    const player = await this.players.create(displayName, this.now().toISOString());
    return { token: signToken(this.secret, player.id), playerId: player.id, displayName: player.displayName };
  }
}
