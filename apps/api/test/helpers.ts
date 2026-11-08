import { loadEnv } from '../src/config/env';
import { createApp, type AppDeps } from '../src/app';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { SolDecisions } from '@amt/shared';

export const testEnv = (over: Record<string, string> = {}) =>
  loadEnv({ NODE_ENV: 'test', JWT_SECRET: 'test-secret-test-secret', SPACE_DATA_MODE: 'fixture', ...over });

export async function startApp(over: Record<string, string> = {}, deps: AppDeps = {}) {
  const app = createApp(testEnv(over), deps);
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const call = async (method: string, path: string, body?: unknown, token?: string) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: (await res.json()) as any };
  };
  return { call, close: () => new Promise<void>((r) => server.close(() => r())) };
}

export const decide = (sol: number, over: Partial<SolDecisions> = {}): SolDecisions => ({
  sol,
  power: { lifeSupport: 0.3, shielding: 0.15, greenhouse: 0.25, comms: 0.1, reserve: 0.2 },
  project: null,
  eva: false,
  shelter: false,
  ...over,
});
