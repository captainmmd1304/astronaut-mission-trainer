import { create } from 'zustand';
import { createInitialState, step, type RunStatus, type SimEvent, type SimState } from '@amt/sim';
import type { SolDecisions } from '@amt/shared';
import type { StartedRun, TextContent } from '@/lib/api';
import { fill, minutes } from '@/lib/text';

export interface LogEntry {
  id: string;
  sol: number;
  kind: 'event' | 'prithvi' | 'vikram' | 'system';
  text: string;
}
interface Pending {
  id: string;
  sol: number;
  text: string;
  deliverAt: number; // performance.now() ms
}

/** Real seconds per one second of light-time. Mirrors the API's COMMS_TIME_SCALE (0.05 = 20x faster). */
const SCALE = Number(process.env.NEXT_PUBLIC_COMMS_TIME_SCALE ?? 0.05);

type PowerKey = keyof SolDecisions['power'];
const POWER_KEYS: PowerKey[] = ['lifeSupport', 'shielding', 'greenhouse', 'comms', 'reserve'];

interface Game {
  run: StartedRun | null;
  text: TextContent | null;
  sim: SimState | null;
  status: RunStatus;
  decisions: SolDecisions[];
  events: SimEvent[];
  draft: SolDecisions | null;
  log: LogEntry[];
  pending: Pending[];
  begin(run: StartedRun, text: TextContent, prefix?: SolDecisions[]): void;
  setPower(key: PowerKey, value: number): void;
  setFlag(key: 'eva' | 'shelter', value: boolean): void;
  setProject(id: SolDecisions['project']): void;
  commit(): void;
  tick(nowMs: number): void;
  reset(): void;
}

const defaultPower: SolDecisions['power'] = { lifeSupport: 0.35, shielding: 0.15, greenhouse: 0.2, comms: 0.1, reserve: 0.2 };

function entriesFor(events: SimEvent[], text: TextContent, run: StartedRun, now: number, immediate: boolean) {
  const log: LogEntry[] = [];
  const pending: Pending[] = [];
  const delayMs = 2 * run.world.lightTimeSeconds * SCALE * 1000;
  for (const e of events) {
    const vars = { sol: e.sol, ...e.data, delayMin: minutes(2 * run.world.lightTimeSeconds) };
    const template = text.templates[e.explainKey];
    if (template) log.push({ id: `${e.id}:event`, sol: e.sol, kind: 'event', text: fill(template, vars) });
    for (const m of text.messages.filter((x) => x.trigger === e.explainKey)) {
      const body = fill(m.text, vars);
      if (m.from === 'prithvi') log.push({ id: `${e.id}:${m.id}`, sol: e.sol, kind: 'prithvi', text: body });
      else if (immediate) log.push({ id: `${e.id}:${m.id}`, sol: e.sol, kind: 'vikram', text: body });
      else pending.push({ id: `${e.id}:${m.id}`, sol: e.sol, text: body, deliverAt: now + delayMs });
    }
  }
  return { log, pending };
}

export const useGame = create<Game>((set, get) => ({
  run: null,
  text: null,
  sim: null,
  status: 'running',
  decisions: [],
  events: [],
  draft: null,
  log: [],
  pending: [],

  begin(run, text, prefix = []) {
    let sim = createInitialState(run.config, run.rules);
    let status: RunStatus = 'running';
    const events: SimEvent[] = [];
    for (const d of prefix) {
      const r = step(sim, d, run.world, run.rules);
      sim = r.state;
      status = r.status;
      events.push(...r.events);
    }
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    const welcome = text.messages.filter((m) => m.trigger === 'mission-start');
    const base: LogEntry[] = welcome.map((m) => ({ id: m.id, sol: 0, kind: 'vikram', text: m.text }));
    const { log, pending } = entriesFor(events, text, run, now, true);
    const last = prefix.at(-1);
    set({
      run,
      text,
      sim,
      status,
      decisions: prefix,
      events,
      log: [...base, ...log],
      pending,
      draft: { sol: sim.sol + 1, power: last?.power ?? defaultPower, project: last?.project ?? null, eva: false, shelter: false },
    });
  },

  setPower(key, value) {
    const d = get().draft;
    if (!d) return;
    const v = Math.min(1, Math.max(0, value));
    const others = POWER_KEYS.filter((k) => k !== key);
    const rest = others.reduce((s, k) => s + d.power[k], 0);
    const power = { ...d.power, [key]: v } as SolDecisions['power'];
    // Keep the budget at 100%: spread what is left over the other bars in proportion.
    for (const k of others) power[k] = rest > 0 ? (d.power[k] / rest) * (1 - v) : (1 - v) / others.length;
    set({ draft: { ...d, power } });
  },
  setFlag(key, value) {
    const d = get().draft;
    if (d) set({ draft: { ...d, [key]: value } });
  },
  setProject(id) {
    const d = get().draft;
    if (d) set({ draft: { ...d, project: id } });
  },

  commit() {
    const { run, sim, draft, text, status } = get();
    if (!run || !sim || !draft || !text || status !== 'running') return;
    const r = step(sim, draft, run.world, run.rules);
    const { log, pending } = entriesFor(r.events, text, run, performance.now(), false);
    set((s) => ({
      sim: r.state,
      status: r.status,
      decisions: [...s.decisions, draft],
      events: [...s.events, ...r.events],
      log: [...s.log, ...log],
      pending: [...s.pending, ...pending],
      draft: r.status === 'running' ? { sol: r.state.sol + 1, power: draft.power, project: r.state.projects.some((p) => p.id === draft.project) ? draft.project : null, eva: false, shelter: false } : null,
    }));
  },

  /** Deliver Earth messages whose light-time has elapsed, unless the link is down (blackout holds them). */
  tick(nowMs) {
    const { pending, sim } = get();
    if (!pending.length || !sim?.comms.linkUp) return;
    const due = pending.filter((p) => p.deliverAt <= nowMs);
    if (!due.length) return;
    set((s) => ({
      pending: s.pending.filter((p) => p.deliverAt > nowMs),
      log: [...s.log, ...due.map((p) => ({ id: p.id, sol: p.sol, kind: 'vikram' as const, text: p.text }))],
    }));
  },

  reset: () => set({ run: null, sim: null, decisions: [], events: [], draft: null, log: [], pending: [], status: 'running' }),
}));
