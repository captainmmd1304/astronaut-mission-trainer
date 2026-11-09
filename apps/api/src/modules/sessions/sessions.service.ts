import { signToken } from '../../lib/auth';
import { HttpError } from '../../lib/http';
import { hashPassword, verifyPassword } from '../../lib/password';
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

  async register(username: string, password: string, displayName?: string) {
    const name = username.toLowerCase();
    const acc = await this.players.createAccount(
      { username: name, displayName: displayName?.trim() || username, passwordHash: await hashPassword(password) },
      this.now().toISOString(),
    );
    if (!acc) throw new HttpError(409, 'That callsign is taken. Pick another.', 'username_taken');
    return this.session(acc);
  }

  async login(username: string, password: string) {
    const acc = await this.players.findByUsername(username.toLowerCase());
    // same message for unknown user and wrong password
    if (!acc || !(await verifyPassword(password, acc.passwordHash))) {
      throw new HttpError(401, 'Callsign or password is wrong.', 'bad_credentials');
    }
    return this.session(acc);
  }

  async me(playerId: string) {
    const p = await this.players.get(playerId);
    if (!p) throw new HttpError(401, 'Sign in again', 'unauthorized');
    return { playerId: p.id, displayName: p.displayName };
  }

  private session(p: { id: string; displayName: string }) {
    return { token: signToken(this.secret, p.id), playerId: p.id, displayName: p.displayName };
  }
}
