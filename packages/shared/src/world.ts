import { z } from 'zod';

/** Constants used across the project. */
export const SOL_SECONDS = 88_775.244; // 24h 39m 35.244s
export const LIGHT_SECONDS_PER_AU = 499.004784;

export const SpaceDataSource = z.enum(['live', 'cached', 'fixture']);
export type SpaceDataSource = z.infer<typeof SpaceDataSource>;

export const SolarEventSchema = z.object({
  id: z.string(),
  kind: z.enum(['flare', 'cme']),
  /** e.g. "X1.2" for flares; omitted for CMEs */
  classType: z.string().optional(),
  startTime: z.string(), // ISO 8601 UTC
  peakTime: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type SolarEvent = z.infer<typeof SolarEventSchema>;

/**
 * The ONLY channel through which live (or scripted) external conditions enter the sim.
 * Captured by the api/web, stored in the run log, and passed to sim.step().
 */
export const WorldSnapshotSchema = z.object({
  capturedAt: z.string(), // ISO 8601 UTC
  source: SpaceDataSource,
  /** One-way Earth↔Mars signal delay in seconds (real, unscaled). */
  lightTimeSeconds: z.number().nonnegative(),
  /** True when the Sun blocks Earth–Mars comms. */
  solarConjunction: z.boolean(),
  solarEvents: z.array(SolarEventSchema),
});
export type WorldSnapshot = z.infer<typeof WorldSnapshotSchema>;
