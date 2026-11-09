import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { decide, startApp } from './helpers';

let api: Awaited<ReturnType<typeof startApp>>;
let token = '';
beforeAll(async () => {
  api = await startApp();
  token = (await api.call('POST', '/v1/sessions', { displayName: 'Cadet' })).body.token;
});
afterAll(() => api.close());

const world = { capturedAt: '2026-01-01T00:00:00Z', source: 'fixture', lightTimeSeconds: 600, solarConjunction: false, solarEvents: [] };

describe('api', () => {
  it('health', async () => {
    expect((await api.call('GET', '/health')).body.ok).toBe(true);
  });

  it('rejects bad display names and unauthenticated runs', async () => {
    expect((await api.call('POST', '/v1/sessions', { displayName: '' })).status).toBe(400);
    expect((await api.call('POST', '/v1/sessions', { displayName: 'x'.repeat(25) })).status).toBe(400);
    expect((await api.call('POST', '/v1/runs', {})).status).toBe(401);
  });

  it('serves space conditions from fixtures, with a blackout demo', async () => {
    const a = await api.call('GET', '/v1/space/conditions');
    expect(a.body.source).toBe('fixture');
    expect(a.body.snapshot.solarConjunction).toBe(false);
    expect(a.body.snapshot.lightTimeSeconds).toBeGreaterThan(150);
    const b = await api.call('GET', '/v1/space/conditions?fixture=conjunction');
    expect(b.body.snapshot.solarConjunction).toBe(true);
    expect(b.body.snapshot.lightTimeSeconds).toBeGreaterThan(1200);
  });

  it('never leaks the black-box answer key, and scores answers', async () => {
    const list = await api.call('GET', '/v1/content/blackbox');
    const c = list.body.cases[0];
    expect(JSON.stringify(list.body)).not.toContain('rootCauseChain');
    expect(c.evidence[0]).not.toHaveProperty('relevant');
    const right = await api.call('POST', `/v1/content/blackbox/${c.id}/answer`, { chain: ['ev-dust', 'ev-gen', 'ev-battery', 'ev-eva', 'ev-warning', 'ev-shelter', 'ev-dose'] });
    expect(right.body.exact).toBe(true);
    expect(right.body.score).toBe(1);
  });

  it('runs a full game: start, finish with replay check, debrief', async () => {
    const start = await api.call('POST', '/v1/runs', { scenarioId: 'free-play-30', siteId: 'jezero', seed: 7, mode: 'solo', difficulty: 'trainee' }, token);
    expect(start.status).toBe(201);
    const runId = start.body.runId;
    const decisions = Array.from({ length: 30 }, (_, i) => decide(i + 1));

    const lie = await api.call('PUT', `/v1/runs/${runId}/finish`, { status: 'failed', decisions, worldSnapshots: [world] }, token);
    expect(lie.status).toBe(422);

    const ok = await api.call('PUT', `/v1/runs/${runId}/finish`, { status: 'completed', decisions, worldSnapshots: [world] }, token);
    expect(ok.status).toBe(200);
    expect(ok.body.score).toBeGreaterThan(0);

    const again = await api.call('PUT', `/v1/runs/${runId}/finish`, { status: 'completed', decisions, worldSnapshots: [world] }, token);
    expect(again.status).toBe(409);

    const d = await api.call('GET', `/v1/runs/${runId}/debrief`, undefined, token);
    expect(d.status).toBe(200);
    expect(d.body.generatedBy).toBe('template');
    expect(d.body.summary).toContain('Asteria is not about');
  });

  it('keeps runs private to their owner', async () => {
    const other = (await api.call('POST', '/v1/sessions', { displayName: 'Other' })).body.token;
    const start = await api.call('POST', '/v1/runs', { scenarioId: 'free-play-30', siteId: 'jezero', seed: 1, mode: 'solo', difficulty: 'trainee' }, token);
    expect((await api.call('GET', `/v1/runs/${start.body.runId}`, undefined, other)).status).toBe(404);
  });

  it('rejects unknown scenarios', async () => {
    const r = await api.call('POST', '/v1/runs', { scenarioId: 'nope', siteId: 'jezero', seed: 1, mode: 'solo', difficulty: 'trainee' }, token);
    expect(r.status).toBe(404);
  });
});

describe('start run and limits', () => {
  it('start returns rules, scenario, site and a world snapshot in one response', async () => {
    const t = (await api.call('POST', '/v1/sessions', { displayName: 'Starter' })).body.token;
    const r = await api.call('POST', '/v1/runs', { scenarioId: 'asteria-refly', siteId: 'jezero', seed: 5, mode: 'blackbox-refly', difficulty: 'trainee' }, t);
    expect(r.status).toBe(201);
    expect(r.body.rules.durationSols).toBe(20);
    expect(r.body.rules.scriptedEvents.length).toBeGreaterThan(0);
    expect(r.body.site.id).toBe('jezero');
    expect(r.body.world.lightTimeSeconds).toBeGreaterThan(0);
    expect(r.body.config.crewSize).toBe(4);
  });
});

describe('accounts', () => {
  it('registers, logs in, rejects a wrong password and a taken name', async () => {
    const t = await startApp();
    try {
      const reg = await t.call('POST', '/v1/auth/register', { username: 'Sisi_01', password: 'longenough1', displayName: 'Sisi' });
      expect(reg.status).toBe(201);
      expect(reg.body.displayName).toBe('Sisi');
      expect((await t.call('POST', '/v1/auth/register', { username: 'sisi_01', password: 'longenough1' })).status).toBe(409);
      expect((await t.call('POST', '/v1/auth/login', { username: 'sisi_01', password: 'nope-nope' })).status).toBe(401);
      const ok = await t.call('POST', '/v1/auth/login', { username: 'SISI_01', password: 'longenough1' });
      expect(ok.status).toBe(200);
      const me = await t.call('GET', '/v1/auth/me', undefined, ok.body.token);
      expect(me.body.playerId).toBe(reg.body.playerId);
      expect((await t.call('POST', '/v1/auth/register', { username: 'ab', password: 'short' })).status).toBe(400);
    } finally {
      await t.close();
    }
  });
});
