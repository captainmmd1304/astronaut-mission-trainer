import { z } from 'zod';

/** Fractions of available power per system. Must sum to <= 1 (sim normalizes if not). */
export const PowerAllocationSchema = z.object({
  lifeSupport: z.number().min(0).max(1),
  shielding: z.number().min(0).max(1),
  greenhouse: z.number().min(0).max(1),
  comms: z.number().min(0).max(1),
  reserve: z.number().min(0).max(1), // to battery
});
export type PowerAllocation = z.infer<typeof PowerAllocationSchema>;

export const ProjectIdSchema = z.enum(['shielding-upgrade', 'greenhouse-expansion', 'panel-cleaning', 'battery-bank']);
export type ProjectId = z.infer<typeof ProjectIdSchema>;

/** Everything a player (or NPC/script) decides for one sol. */
export const SolDecisionsSchema = z.object({
  sol: z.number().int().nonnegative(),
  power: PowerAllocationSchema,
  /** Start or continue one build project (optional). */
  project: ProjectIdSchema.nullable().default(null),
  /** Send an EVA this sol (repair/inspection). */
  eva: z.boolean().default(false),
  /** Crew shelters from radiation this sol. */
  shelter: z.boolean().default(false),
});
export type SolDecisions = z.infer<typeof SolDecisionsSchema>;

export const RoleSchema = z.enum(['OUTPOST', 'MISSION_CONTROL']);
export type Role = z.infer<typeof RoleSchema>;
