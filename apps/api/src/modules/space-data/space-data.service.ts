import type { SpaceDataSource, WorldSnapshot } from '@amt/shared';
import { fetchSolarEvents } from '../../integrations/donki.client';
import { fetchHorizons, lightTimeSeconds, parseHorizonsRows, type HorizonsRow } from '../../integrations/horizons.client';
import closest from '../../integrations/fixtures/horizons-closest-approach.json';
import conjunction from '../../integrations/fixtures/horizons-conjunction.json';

/** Game rule: the Sun blocks the link when the Sun-Earth-Mars angle is this small. */
export const CONJUNCTION_ELONGATION_DEG = 2;

export type FixtureName = 'closest' | 'conjunction';
export interface SpaceDataConfig {
  mode: SpaceDataSource;
  nasaApiKey: string;
  ttlMinutes: number;
}
export interface SpaceDataDeps {
  now: () => Date;
  fetchHorizons: typeof fetchHorizons;
  fetchSolarEvents: typeof fetchSolarEvents;
  log: { warn: (o: unknown, m?: string) => void };
}

const fixtureRows = (name: FixtureName): HorizonsRow[] => parseHorizonsRows((name === 'closest' ? closest : conjunction).result);

export function snapshotFromRows(rows: HorizonsRow[], source: SpaceDataSource, capturedAt: Date, solarEvents: WorldSnapshot['solarEvents']): WorldSnapshot {
  const row = rows[0]!;
  return {
    capturedAt: capturedAt.toISOString(),
    source,
    lightTimeSeconds: Math.round(lightTimeSeconds(row.rangeAu)),
    solarConjunction: row.elongationDeg < CONJUNCTION_ELONGATION_DEG,
    solarEvents,
  };
}

export class SpaceDataService {
  private cache: { snapshot: WorldSnapshot; fetchedAt: number } | null = null;

  constructor(
    private readonly cfg: SpaceDataConfig,
    private readonly deps: SpaceDataDeps,
  ) {}

  fixtureSnapshot(name: FixtureName = 'closest'): WorldSnapshot {
    return snapshotFromRows(fixtureRows(name), 'fixture', this.deps.now(), []);
  }

  /** live -> cached -> fixture. Never throws: a missing NASA service must not stop the game. */
  async getSnapshot(fixture: FixtureName = 'closest'): Promise<WorldSnapshot> {
    const { mode } = this.cfg;
    if (mode === 'fixture') return this.fixtureSnapshot(fixture);

    const now = this.deps.now();
    const fresh = this.cache && now.getTime() - this.cache.fetchedAt < this.cfg.ttlMinutes * 60_000;
    if (fresh) return { ...this.cache!.snapshot, source: 'cached' };

    if (mode === 'live') {
      try {
        const [rows, events] = await Promise.all([this.deps.fetchHorizons(now), this.deps.fetchSolarEvents(this.cfg.nasaApiKey, now).catch((err) => {
          this.deps.log.warn({ err: String(err) }, 'DONKI unavailable, continuing without space weather');
          return [];
        })]);
        const snapshot = snapshotFromRows(rows, 'live', now, events);
        this.cache = { snapshot, fetchedAt: now.getTime() };
        return snapshot;
      } catch (err) {
        this.deps.log.warn({ err: String(err) }, 'Horizons unavailable, falling back');
      }
    }
    if (this.cache) return { ...this.cache.snapshot, source: 'cached' };
    return this.fixtureSnapshot(fixture);
  }
}
