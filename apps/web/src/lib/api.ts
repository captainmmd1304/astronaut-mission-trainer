import type { LandingSite, Scenario } from '@amt/content'; // types only: never import values from @amt/content here
import type { RunConfig, SimRules } from '@amt/sim';
import type { SolDecisions, WorldSnapshot } from '@amt/shared';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

async function call<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the mission server. Check that the API is running.', 'network');
  }
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: string } };
  if (!res.ok) throw new ApiError(res.status, json.error?.message ?? 'Request failed', json.error?.code ?? 'error');
  return json as T;
}

export interface Session {
  token: string;
  playerId: string;
  displayName: string;
}
export interface TextContent {
  messages: { id: string; from: 'vikram' | 'prithvi'; trigger: string; text: string }[];
  templates: Record<string, string>;
}
export interface DossierCase {
  id: string;
  title: string;
  briefing: string;
  telemetry: { sol: number; values: Record<string, number> }[];
  decisionLog: { sol: number; text: string }[];
  evidence: { id: string; text: string }[];
  reflyScenarioId: string;
}
export interface AnswerResult {
  score: number;
  exact: boolean;
  correctSet: number;
  correctChain: { id: string; text?: string }[];
  distractors: { id: string; text: string }[];
  reflyScenarioId: string;
}
export interface StartedRun {
  runId: string;
  startedAt: string;
  config: RunConfig;
  rules: SimRules;
  scenario: Scenario;
  site: LandingSite;
  world: WorldSnapshot;
}
export interface RunRecord {
  id: string;
  scenarioId: string;
  siteId: string;
  seed: number;
  mode: string;
  difficulty: 'trainee' | 'commander';
  status: 'running' | 'failed' | 'completed';
  decisions: SolDecisions[];
  score: number | null;
}
export interface DebriefLine {
  id: string;
  sol: number;
  type: string;
  explainKey: string;
  text: string;
}
export interface Debrief {
  runId: string;
  outcome: 'failed' | 'completed';
  score: number | null;
  solsPlayed: number;
  summary: string;
  generatedBy: 'llm' | 'template';
  causeChain: DebriefLine[];
  keyEvents: DebriefLine[];
  objectives: { id: string; text: string; met: boolean }[];
  finalStats: { doseMsv: number; crewHealth: number; batteryKwh: number };
}

export const api = {
  createSession: (displayName: string) => call<Session>('POST', '/v1/sessions', { displayName }),
  sites: () => call<{ sites: LandingSite[] }>('GET', '/v1/content/sites').then((r) => r.sites),
  scenarios: () => call<{ scenarios: Scenario[] }>('GET', '/v1/content/scenarios').then((r) => r.scenarios),
  text: () => call<TextContent>('GET', '/v1/content/text'),
  blackbox: () => call<{ cases: DossierCase[] }>('GET', '/v1/content/blackbox').then((r) => r.cases),
  answer: (id: string, chain: string[]) => call<AnswerResult>('POST', `/v1/content/blackbox/${id}/answer`, { chain }),
  conditions: (fixture?: 'conjunction') =>
    call<{ snapshot: WorldSnapshot; source: string }>('GET', `/v1/space/conditions${fixture ? `?fixture=${fixture}` : ''}`),
  startRun: (token: string, body: { scenarioId: string; siteId: string; seed: number; mode: string; difficulty: string }) =>
    call<StartedRun>('POST', '/v1/runs', body, token),
  finishRun: (token: string, id: string, body: { status: string; decisions: SolDecisions[]; worldSnapshots: WorldSnapshot[] }) =>
    call<{ runId: string; status: string; score: number }>('PUT', `/v1/runs/${id}/finish`, body, token),
  run: (token: string, id: string) => call<RunRecord>('GET', `/v1/runs/${id}`, undefined, token),
  debrief: (token: string, id: string) => call<Debrief>('GET', `/v1/runs/${id}/debrief`, undefined, token),
};
