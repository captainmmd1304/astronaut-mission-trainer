import { describe, expect, it } from 'vitest';
import { createInitialState, step } from '../src';
import type { SimRules, SimState, SimEvent, RunStatus } from '../src';
import { balanced, calmWorld, testConfig, testRules } from './fixtures';

function play(rules: SimRules, decide: (sol: number, s: SimState) => ReturnType<typeof balanced>, world = calmWorld, maxSols = rules.durationSols) {
  let state = createInitialState(testConfig, rules);
  const events: SimEvent[] = [];
  let status: RunStatus = 'running';
  for (let sol = 1; sol <= maxSols && status === 'running'; sol++) {
    const r = step(state, decide(sol, state), world, rules);
    state = r.state;
    events.push(...r.events);
    status = r.status;
  }
  return { state, events, status };
}

const storm = (over: Partial<SimRules> = {}): SimRules => ({
  ...testRules,
  durationSols: 30,
  scriptedEvents: [{ sol: 5, type: 'dust-storm', magnitude: 0.9, durationSols: 15 }],
  ...over,
});

const flareRules: SimRules = {
  ...testRules,
  durationSols: 10,
  scriptedEvents: [{ sol: 6, type: 'solar-flare', magnitude: 0.8 }],
};

describe('power & dust', () => {
  it('dust storm cuts generation and emits a cause-linked shortfall', () => {
    const { events } = play(storm(), (s) => balanced(s));
    const start = events.find((e) => e.type === 'dust-storm-start');
    const shortfall = events.find((e) => e.explainKey === 'power-shortfall');
    expect(start).toBeDefined();
    expect(shortfall?.causedBy).toContain(start!.id);
  });

  it('an EVA removes dust', () => {
    const rules = { ...testRules, scriptedEvents: [] };
    let s = createInitialState(testConfig, rules);
    for (let i = 1; i <= 20; i++) s = step(s, balanced(i), calmWorld, { ...rules, balance: { ...rules.balance, randomStormChancePerSol: 0 } }).state;
    const before = s.power.panelDust;
    const after = step(s, balanced(21, { eva: true }), calmWorld, { ...rules, balance: { ...rules.balance, randomStormChancePerSol: 0 } }).state.power.panelDust;
    expect(after).toBeLessThan(before * 0.5);
  });

  it('postponing EVA while dusty emits eva-postponed', () => {
    const { events } = play(storm(), (s) => balanced(s));
    expect(events.some((e) => e.type === 'eva-postponed')).toBe(true);
  });

  it('shedding load keeps the battery from draining the same way', () => {
    const careless = play(storm(), (s) => balanced(s, { power: { lifeSupport: 0.2, shielding: 0.2, greenhouse: 0.4, comms: 0.2, reserve: 0 } }), calmWorld, 14);
    const careful = play(storm(), (s) => balanced(s, { power: { lifeSupport: 0.5, shielding: 0, greenhouse: 0, comms: 0.1, reserve: 0.4 } }), calmWorld, 14);
    expect(careful.state.power.batteryKwh).toBeGreaterThan(careless.state.power.batteryKwh);
  });
});

describe('radiation', () => {
  it('a flare is announced one sol ahead', () => {
    const { events } = play(flareRules, (s) => balanced(s));
    const watch = events.find((e) => e.type === 'flare-watch');
    expect(watch?.sol).toBe(5);
  });

  it('sheltering with a powered shelter takes far less dose than not sheltering', () => {
    const open = play(flareRules, (s) => balanced(s));
    const safe = play(flareRules, (s) => balanced(s, { shelter: s >= 5 }));
    expect(safe.state.radiation.doseMsvCumulative).toBeLessThan(open.state.radiation.doseMsvCumulative * 0.4);
    expect(safe.events.find((e) => e.type === 'radiation-spike')?.explainKey).toBe('sheltered');
    expect(open.events.find((e) => e.type === 'radiation-spike')?.explainKey).toBe('radiation-spike');
  });

  it('sheltering with an unpowered shelter does not help (the Asteria failure)', () => {
    const noPower = (s: number) => balanced(s, { shelter: true, power: { lifeSupport: 0.5, shielding: 0, greenhouse: 0.4, comms: 0.1, reserve: 0 } });
    const r = play(flareRules, noPower);
    const lost = r.events.find((e) => e.type === 'shelter-power-lost');
    const spike = r.events.find((e) => e.type === 'radiation-spike');
    const dmg = r.events.find((e) => e.type === 'habitat-damage');
    expect(lost).toBeDefined();
    expect(spike?.causedBy).toContain(lost!.id);
    expect(dmg?.causedBy).toContain(spike!.id);
  });

  it('EVA during a flare ignores the shelter and is flagged', () => {
    const r = play(flareRules, (s) => balanced(s, { shelter: true, eva: s === 6 }));
    expect(r.events.some((e) => e.type === 'eva-in-warning')).toBe(true);
    expect(r.events.find((e) => e.type === 'radiation-spike')?.explainKey).toBe('radiation-spike');
  });

  it('live flare in the world snapshot causes a spike', () => {
    const world = { ...calmWorld, solarEvents: [{ id: 'f1', kind: 'flare' as const, classType: 'X2.0', startTime: '2026-01-01T00:00:00Z' }] };
    const r = play({ ...testRules, durationSols: 3 }, (s) => balanced(s), world);
    expect(r.events.some((e) => e.type === 'radiation-spike')).toBe(true);
  });

  it('a live CME warns first and only sometimes arrives', () => {
    const world = { ...calmWorld, solarEvents: [{ id: 'c1', kind: 'cme' as const, startTime: '2026-01-01T00:00:00Z' }] };
    const r = play({ ...testRules, durationSols: 6 }, (s) => balanced(s), world);
    expect(r.events.some((e) => e.type === 'flare-watch')).toBe(true);
  });
});

describe('life support, food, comms, outcomes', () => {
  it('no life-support power eventually fails the run with a cause-linked evacuation', () => {
    const r = play({ ...testRules, durationSols: 80 }, (s) => balanced(s, { power: { lifeSupport: 0, shielding: 0, greenhouse: 0, comms: 0, reserve: 1 } }));
    expect(r.status).toBe('failed');
    const evac = r.events.at(-1)!;
    expect(evac.type).toBe('evacuation');
  });

  it('conjunction takes the link down and ends with blackout-autonomy', () => {
    let state = createInitialState(testConfig, { ...testRules, durationSols: 8 });
    const rules = { ...testRules, durationSols: 8 };
    const all: SimEvent[] = [];
    for (let sol = 1; sol <= 6; sol++) {
      const r = step(state, balanced(sol), { ...calmWorld, solarConjunction: sol >= 2 && sol <= 4 }, rules);
      state = r.state;
      all.push(...r.events);
      if (sol === 3) expect(state.comms.linkUp).toBe(false);
    }
    expect(all.some((e) => e.type === 'blackout-autonomy')).toBe(true);
  });

  it('a completed run reports completed and mission-complete', () => {
    const r = play({ ...testRules, durationSols: 4, balance: { ...testRules.balance, randomStormChancePerSol: 0 } }, (s) => balanced(s));
    expect(r.status).toBe('completed');
    expect(r.events.at(-1)?.type).toBe('mission-complete');
  });

  it('every failure event has a non-empty causedBy chain in a radiation failure', () => {
    const r = play(
      { ...flareRules, scriptedEvents: [{ sol: 3, type: 'solar-flare', magnitude: 1 }, { sol: 5, type: 'solar-flare', magnitude: 1 }, { sol: 7, type: 'solar-flare', magnitude: 1 }, { sol: 9, type: 'solar-flare', magnitude: 1 }], balance: { ...testRules.balance, doseFailMsv: 200 } },
      (s) => balanced(s),
    );
    expect(r.status).toBe('failed');
    expect(r.events.at(-1)!.causedBy.length).toBeGreaterThan(0);
  });

  it('shelter powered at start keeps same-seed runs deterministic with events', () => {
    const a = play(storm(), (s) => balanced(s));
    const b = play(storm(), (s) => balanced(s));
    expect(a).toEqual(b);
  });

  it('projects complete after enough sols', () => {
    const r = play({ ...testRules, durationSols: 8, balance: { ...testRules.balance, randomStormChancePerSol: 0 } }, (s) => balanced(s, { project: 'shielding-upgrade' }));
    expect(r.state.radiation.shieldingLevel).toBeGreaterThan(0);
    expect(r.events.some((e) => e.type === 'project-complete')).toBe(true);
  });
});
