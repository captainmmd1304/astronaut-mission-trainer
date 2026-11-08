import { scenarios, landingSites } from '@amt/content';
import { createInitialState, step, type RunStatus, type SimState } from '@amt/sim';
import type { SolDecisions, WorldSnapshot } from '@amt/shared';
import { buildRules, CREW_SIZE } from '../src/modules/game/rules';

const world: WorldSnapshot = { capturedAt: '2026-01-01T00:00:00Z', source: 'fixture', lightTimeSeconds: 600, solarConjunction: false, solarEvents: [] };
type Policy = (s: SimState, sol: number) => SolDecisions;
const base = (sol: number, o: Partial<SolDecisions> = {}): SolDecisions => ({ sol, power: { lifeSupport: 0.3, shielding: 0.15, greenhouse: 0.25, comms: 0.1, reserve: 0.2 }, project: null, eva: false, shelter: false, ...o });

const policies: Record<string, Policy> = {
  idle: (_s, sol) => base(sol),
  greenhouseFirst: (_s, sol) => base(sol, { power: { lifeSupport: 0.4, shielding: 0, greenhouse: 0.5, comms: 0.1, reserve: 0 }, shelter: true }),
  careful: (s, sol) => {
    const threat = s.activeEffects.some((e) => e.type === 'flare-watch' || e.type === 'solar-flare');
    const storm = s.activeEffects.some((e) => e.type === 'dust-storm');
    if (threat) return base(sol, { power: { lifeSupport: 0.4, shielding: 0.5, greenhouse: 0, comms: 0.1, reserve: 0 }, shelter: true });
    return base(sol, {
      power: storm ? { lifeSupport: 0.35, shielding: 0.1, greenhouse: 0.1, comms: 0.1, reserve: 0.35 } : base(sol).power,
      eva: s.power.panelDust >= 0.25,
      project: sol % 7 === 0 ? 'shielding-upgrade' : null,
    });
  },
};

function run(scenarioId: string, siteId: string, difficulty: 'trainee' | 'commander', seed: number, policy: Policy) {
  const { rules } = buildRules(scenarioId, siteId, difficulty);
  const cfg = { scenarioId, siteId, seed, difficulty, crewSize: CREW_SIZE };
  let s = createInitialState(cfg, rules);
  let status: RunStatus = 'running';
  let sols = 0;
  while (status === 'running') {
    const r = step(s, policy(s, s.sol + 1), world, rules);
    s = r.state; status = r.status; sols++;
  }
  return { status, sols, dose: s.radiation.doseMsvCumulative, health: s.crew.health };
}

const N = 100;
for (const sc of scenarios) for (const diff of ['trainee', 'commander'] as const) for (const [name, p] of Object.entries(policies)) {
  let won = 0, dose = 0, sols = 0;
  for (let seed = 1; seed <= N; seed++) { const r = run(sc.id, 'jezero', diff, seed, p); if (r.status === 'completed') won++; dose += r.dose; sols += r.sols; }
  console.log(`${sc.id.padEnd(16)} ${diff.padEnd(9)} ${name.padEnd(16)} win ${String(Math.round((won / N) * 100)).padStart(3)}%  avgSols ${(sols / N).toFixed(1).padStart(5)}  avgDose ${(dose / N).toFixed(0)}`);
}
console.log('sites:', landingSites.length);
