import { describe, expect, it } from 'vitest';
import { getScenario } from '@amt/content';
import type { SolDecisions } from '@amt/shared';
import { CREW_SIZE, buildRules, replay } from '../src/modules/game/rules';
import { causeChain } from '../src/modules/debrief/debrief.service';
import { decide } from './helpers';

const world = { capturedAt: '2026-01-01T00:00:00Z', source: 'fixture' as const, lightTimeSeconds: 1080, solarConjunction: false, solarEvents: [] };
const cfg = { scenarioId: 'asteria-refly', siteId: 'jezero', seed: 1, difficulty: 'trainee' as const, crewSize: CREW_SIZE };
const { rules } = buildRules('asteria-refly', 'jezero', 'trainee');
const sols = getScenario('asteria-refly')!.durationSols;

const play = (policy: (sol: number) => SolDecisions) => replay(cfg, rules, Array.from({ length: sols }, (_, i) => policy(i + 1)), [world]);

describe('Asteria re-fly is a fair fight', () => {
  it("Crew 1's choices (greenhouse first, no EVA, shelter unpowered) fail with a cause chain", () => {
    const r = play((s) => decide(s, { power: { lifeSupport: 0.4, shielding: 0, greenhouse: 0.5, comms: 0.1, reserve: 0 }, shelter: true }));
    expect(r.status).toBe('failed');
    const evac = r.events.at(-1)!;
    const chain = causeChain(r.events, evac).map((e) => e.type);
    expect(chain).toContain('dust-storm-start');
    expect(chain).toContain('radiation-spike');
  });

  it('a careful player who keeps the shelter powered and cleans panels survives', () => {
    const r = play((s) => decide(s, {
      power: s >= 10
        ? { lifeSupport: 0.4, shielding: 0.5, greenhouse: 0, comms: 0.1, reserve: 0 }
        : { lifeSupport: 0.3, shielding: 0.1, greenhouse: 0.25, comms: 0.1, reserve: 0.25 },
      eva: s === 3 || s === 7,
      shelter: s >= 11 && s <= 13,
    }));
    expect(r.status).toBe('completed');
    expect(r.events.some((e) => e.explainKey === 'sheltered')).toBe(true);
  });
});
