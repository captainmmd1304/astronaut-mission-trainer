import { z } from 'zod';

/** Every real-world fact needs at least one source URL. Fictional material must say so. */
const Sources = z.array(z.string().url());

export const SiteModifiersSchema = z.object({
  dustDeposition: z.number().positive(),
  solarInsolation: z.number().positive(),
  naturalShielding: z.number().min(0).max(1),
  waterIce: z.number().min(0),
  tempSwing: z.number().positive(),
});

export const LandingSiteSchema = z
  .object({
    id: z.string(),
    planet: z.literal('mars'), // widen to an enum when a second planet is added
    name: z.string(),
    terrain: z.enum(['bright', 'dark', 'mixed']),
    real: z.boolean(), // true if it is a real, named location
    latDeg: z.number().min(-90).max(90).nullable(),
    lonDeg: z.number().min(-180).max(360).nullable(),
    blurb: z.string(),
    modifiers: SiteModifiersSchema,
    /** Look parameters consumed by apps/web/src/three/MarsTerrain.tsx */
    look: z.object({
      seed: z.number().int(),
      baseColor: z.string(), // hex
      rockDensity: z.number().min(0).max(1),
      roughness: z.number().min(0).max(1),
    }),
    sources: Sources,
  })
  .refine((s) => !s.real || s.sources.length > 0, { message: 'real sites need sources' });
export type LandingSite = z.infer<typeof LandingSiteSchema>;

export const ScriptedEventSchema = z.object({
  sol: z.number().int().nonnegative(),
  type: z.enum(['solar-flare', 'dust-storm', 'comms-blackout', 'equipment-fault']),
  magnitude: z.number().min(0).max(1),
  durationSols: z.number().int().positive().optional(),
});

export const LearningObjectiveSchema = z.object({
  id: z.string(),
  text: z.string(),
  /** Debrief marks this met when an event of this type with this explainKey appears in the run. */
  provenBy: z.object({ eventType: z.string(), explainKey: z.string() }),
});

export const ScenarioSchema = z
  .object({
    id: z.string(),
    kind: z.enum(['free-play', 'historical']),
    title: z.string(),
    summary: z.string(),
    durationSols: z.number().int().positive(),
    scriptedEvents: z.array(ScriptedEventSchema),
    learningObjectives: z.array(LearningObjectiveSchema),
    fictional: z.boolean().default(false),
    sources: Sources,
  })
  .refine((s) => s.fictional || s.sources.length > 0, { message: 'non-fictional scenarios need sources' });
export type Scenario = z.infer<typeof ScenarioSchema>;

export const BlackBoxCaseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    fictional: z.boolean(),
    briefing: z.string(),
    /** Telemetry frames shown on the evidence board (one per sol). */
    telemetry: z.array(z.object({ sol: z.number().int(), values: z.record(z.string(), z.number()) })),
    decisionLog: z.array(z.object({ sol: z.number().int(), text: z.string() })),
    evidence: z.array(z.object({ id: z.string(), text: z.string(), relevant: z.boolean() })),
    /** Ordered evidence ids forming the true cause chain. */
    rootCauseChain: z.array(z.string()),
    /** Scenario used when the player chooses to re-fly this mission. */
    reflyScenarioId: z.string(),
    sources: Sources,
  })
  .refine((c) => c.fictional || c.sources.length > 0, { message: 'real case files need sources' });
export type BlackBoxCase = z.infer<typeof BlackBoxCaseSchema>;

export const BalanceSchema = z.object({
  baseGenerationKwhPerSol: z.number().positive(),
  batteryCapKwh: z.number().positive(),
  startBatteryFraction: z.number().min(0).max(1),
  lifeSupportKwhPerCrew: z.number().positive(),
  shelterKwh: z.number().positive(),
  greenhouseKwh: z.number().positive(),
  commsKwh: z.number().positive(),
  dustDepositionPerSol: z.number().min(0),
  stormDepositionMultiplier: z.number().min(0),
  stormGenerationBlock: z.number().min(0).max(1),
  panelDustLoss: z.number().min(0).max(1),
  evaCleanFraction: z.number().min(0).max(1),
  evaStormRisk: z.number().min(0).max(1),
  randomStormChancePerSol: z.number().min(0).max(1),
  randomCmeChancePerSol: z.number().min(0).max(1),
  doseBaselineMsvPerSol: z.number().min(0),
  doseFailMsv: z.number().positive(),
  flareMaxMsv: z.number().positive(),
  damageMsv: z.number().positive(),
  shelterEffectiveness: z.number().min(0).max(1),
  shelterMinPowered: z.number().min(0).max(1),
  cmeHitChance: z.number().min(0).max(1),
  o2DaysStart: z.number().positive(),
  startingWaterL: z.number().positive(),
  waterUseLPerCrewPerSol: z.number().positive(),
  waterRecycleFraction: z.number().min(0).max(1),
  foodKcalPerCrewPerSol: z.number().positive(),
  startingFoodKcal: z.number().positive(),
  startGreenhouseLevel: z.number().min(0).max(1),
  greenhouseKcalPerLevel: z.number().min(0),
  starvationHealthLoss: z.number().min(0).max(1),
  deprivationHealthLoss: z.number().min(0).max(1),
  projectSols: z.record(z.string(), z.number().int().positive()),
  batteryLowFraction: z.number().min(0).max(1),
  evaPostponeDustThreshold: z.number().min(0).max(1),
});
export type Balance = z.infer<typeof BalanceSchema>;
