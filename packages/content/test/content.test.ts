import { describe, expect, it } from 'vitest';
import { blackBoxCases, getBalance, landingSites, scenarios, scoreChain, renderDebriefLine, debriefTemplates, scriptedMessages } from '../src';

const unique = (ids: string[]) => new Set(ids).size === ids.length;

describe('content', () => {
  it('ids are unique per collection', () => {
    expect(unique(landingSites.map((s) => s.id))).toBe(true);
    expect(unique(scenarios.map((s) => s.id))).toBe(true);
    expect(unique(blackBoxCases.map((c) => c.id))).toBe(true);
  });

  it('rootCauseChain ids all exist in evidence and are marked relevant', () => {
    for (const c of blackBoxCases) {
      for (const id of c.rootCauseChain) {
        const ev = c.evidence.find((e) => e.id === id);
        expect(ev, id).toBeDefined();
        expect(ev!.relevant).toBe(true);
      }
    }
  });

  it('black-box cases point to an existing scenario', () => {
    for (const c of blackBoxCases) expect(scenarios.some((s) => s.id === c.reflyScenarioId)).toBe(true);
  });

  it('every learning objective event key has debrief text', () => {
    for (const s of scenarios) for (const o of s.learningObjectives) expect(debriefTemplates[o.provenBy.explainKey], o.id).toBeDefined();
  });

  it('every scripted message trigger has a debrief template or is mission-start', () => {
    for (const m of scriptedMessages) {
      expect(m.text.length).toBeLessThanOrEqual(140);
      expect(m.trigger === 'mission-start' || debriefTemplates[m.trigger] !== undefined, m.id).toBe(true);
    }
  });

  it('balance parses for each difficulty', () => {
    expect(getBalance('trainee').doseFailMsv).toBeGreaterThan(0);
    expect(getBalance('commander').startBatteryFraction).toBeLessThan(getBalance('trainee').startBatteryFraction);
  });

  it('scores the chain', () => {
    const c = blackBoxCases[0]!;
    expect(scoreChain(c, c.rootCauseChain).score).toBe(1);
    expect(scoreChain(c, [...c.rootCauseChain].reverse()).score).toBeLessThan(1);
  });

  it('renders debrief lines', () => {
    expect(renderDebriefLine('battery-low', { sol: 9, pct: 40 })).toContain('40%');
  });
});
