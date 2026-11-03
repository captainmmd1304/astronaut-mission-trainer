import type { SolDecisions, WorldSnapshot } from '@amt/shared';

export type Difficulty = 'trainee' | 'commander';

export interface RunConfig {
  scenarioId: string;
  siteId: string;
  seed: number;
  difficulty: Difficulty;
  crewSize: number;
}

/** Multipliers for a landing site. 1.0 = baseline. All values are game-balance abstractions. */
export interface SiteModifiers {
  dustDeposition: number;
  solarInsolation: number;
  naturalShielding: number;
  waterIce: number;
  tempSwing: number;
}

/** Tunable numbers. Lives in @amt/content (balance config) and is passed in by the caller. */
export interface BalanceConfig {
  panelAreaM2: number;
  baseGenerationKwhPerSol: number;
  batteryCapKwh: number;
  lifeSupportKwhPerCrew: number;
  doseBaselineMsvPerSol: number;
  doseFailMsv: number;
  foodKcalPerCrewPerSol: number;
  startingFoodKcal: number;
  startingWaterL: number;
  // extend as systems are implemented
}

export interface ScriptedEvent {
  sol: number;
  type: 'solar-flare' | 'dust-storm' | 'comms-blackout' | 'equipment-fault';
  magnitude: number; // 0..1 abstract severity
  durationSols?: number;
}

export interface SimRules {
  site: SiteModifiers;
  balance: BalanceConfig;
  durationSols: number; // survive this many sols to complete
  scriptedEvents: ScriptedEvent[]; // historical/black-box scenarios; empty for free play
}

export interface SimState {
  sol: number;
  rngState: number;
  power: { batteryKwh: number; panelDust: number /* 0..1 coverage */; availableKwh: number };
  lifeSupport: { o2Days: number; waterL: number };
  food: { stockKcal: number; greenhouseLevel: number };
  radiation: { doseMsvCumulative: number; shieldingLevel: number };
  crew: { count: number; health: number; morale: number }; // health/morale 0..1
  comms: { linkUp: boolean; lastGuidanceSol: number | null };
  projects: { id: string; solsRemaining: number }[];
  activeEffects: { type: ScriptedEvent['type']; solsRemaining: number; magnitude: number }[];
}

export interface SimEvent {
  /** Unique within a run: `${sol}:${type}:${n}` */
  id: string;
  sol: number;
  type: string;
  /** Ids of earlier events that led to this one (the debrief walks this backwards). */
  causedBy: string[];
  /** Key into debrief text templates. */
  explainKey: string;
  data?: Record<string, number | string | boolean>;
}

export type RunStatus = 'running' | 'failed' | 'completed';

export interface StepResult {
  state: SimState;
  events: SimEvent[];
  status: RunStatus;
}

export interface SystemCtx {
  decisions: SolDecisions;
  world: WorldSnapshot;
  rules: SimRules;
  /** Seeded generator; draw only through this. */
  rng: { next(): number };
  /** Events already emitted earlier in this same sol (for cause links). */
  priorEvents: SimEvent[];
}

export type System = (state: SimState, ctx: SystemCtx) => { state: SimState; events: SimEvent[] };
