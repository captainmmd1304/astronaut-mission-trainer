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

/** Tunable numbers. Defined by the content package (balance config) and passed in by the caller. */
export interface BalanceConfig {
  // power (kWh per sol)
  baseGenerationKwhPerSol: number;
  batteryCapKwh: number;
  startBatteryFraction: number; // 0..1
  lifeSupportKwhPerCrew: number;
  shelterKwh: number; // shelter/shielding systems at full power
  greenhouseKwh: number;
  commsKwh: number;
  // dust
  dustDepositionPerSol: number; // panel coverage gained per sol (before site modifier)
  stormDepositionMultiplier: number; // extra deposition = m * this
  stormGenerationBlock: number; // generation lost to opacity = m * this
  panelDustLoss: number; // generation lost at full coverage
  evaCleanFraction: number; // share of dust removed by one EVA
  evaStormRisk: number; // crew health lost on an EVA in a storm (scaled by magnitude)
  randomStormChancePerSol: number;
  // radiation
  doseBaselineMsvPerSol: number;
  doseFailMsv: number;
  flareMaxMsv: number; // dose of a magnitude-1 flare, unshielded
  damageMsv: number; // unmitigated spike at or above this damages the habitat
  shelterEffectiveness: number; // dose removed by a fully powered shelter, 0..1
  shelterMinPowered: number; // powered fraction below which the shelter counts as lost
  cmeHitChance: number;
  // consumables
  o2DaysStart: number;
  startingWaterL: number;
  waterUseLPerCrewPerSol: number;
  waterRecycleFraction: number; // share recovered at full life-support power
  foodKcalPerCrewPerSol: number;
  startingFoodKcal: number;
  startGreenhouseLevel: number;
  greenhouseKcalPerLevel: number; // kcal per sol at level 1.0 and full power
  // health
  starvationHealthLoss: number;
  deprivationHealthLoss: number;
  // projects: sols of work needed
  projectSols: Record<string, number>;
  batteryLowFraction: number;
  evaPostponeDustThreshold: number;
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
  /** Random storms. Defaults to true when scriptedEvents is empty. */
  randomEvents?: boolean;
}

export type EffectType = ScriptedEvent['type'] | 'flare-watch' | 'cme-pending';

export interface SimState {
  sol: number;
  rngState: number;
  power: {
    batteryKwh: number;
    capKwh: number;
    panelDust: number; // 0..1 coverage
    availableKwh: number; // generation this sol
    /** Powered fraction 0..1 of each consumer this sol. */
    powered: { lifeSupport: number; shielding: number; greenhouse: number; comms: number };
  };
  lifeSupport: { o2Days: number; waterL: number };
  food: { stockKcal: number; greenhouseLevel: number };
  radiation: { doseMsvCumulative: number; shieldingLevel: number };
  habitat: { integrity: number }; // 0..1
  crew: { count: number; health: number; morale: number }; // health/morale 0..1
  comms: { linkUp: boolean; lastGuidanceSol: number | null; blackoutSols: number };
  projects: { id: string; solsRemaining: number }[];
  activeEffects: { type: EffectType; solsRemaining: number; magnitude: number; eventId?: string }[];
  /** Latest event id per cause key, so new events can link back to what led to them. */
  causes: Record<string, string>;
  /** Edge-trigger memory (e.g. batteryLow) so events fire once per episode. */
  flags: Record<string, boolean>;
  lastEvaPostponedSol: number;
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
