import { z } from 'zod';
import { RoleSchema, SolDecisionsSchema } from './decisions';
import { SpaceDataSource, WorldSnapshotSchema } from './world';

// Call signs are deliberately not email addresses: accounts need a memorable
// game identifier, not personal data. Keep this contract shared by API and UI.
export const UsernameSchema = z
  .string({ required_error: 'Enter a call sign.' })
  .trim()
  .min(3, 'Call signs need at least 3 characters.')
  .max(24, 'Call signs can be at most 24 characters.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers and underscores only.');
export type Username = z.infer<typeof UsernameSchema>;

// ---- Sessions ----
export const CreateSessionBody = z.object({ displayName: z.string().trim().min(1).max(24) });
export const CreateSessionResponse = z.object({ token: z.string(), playerId: z.string(), displayName: z.string() });

// ---- Space conditions ----
export const SpaceConditionsResponse = z.object({
  snapshot: WorldSnapshotSchema,
  source: SpaceDataSource,
});

// ---- Runs ----
export const RunModeSchema = z.enum(['solo', 'coop', 'scenario', 'blackbox-refly']);
export type RunMode = z.infer<typeof RunModeSchema>;

export const CreateRunBody = z.object({
  scenarioId: z.string(),
  siteId: z.string(),
  seed: z.number().int(),
  mode: RunModeSchema,
  difficulty: z.enum(['trainee', 'commander']),
});

export const FinishRunBody = z.object({
  status: z.enum(['failed', 'completed']),
  decisions: z.array(SolDecisionsSchema),
  worldSnapshots: z.array(WorldSnapshotSchema),
});

// ---- Rooms ----
export const CreateRoomBody = z.object({ scenarioId: z.string(), siteId: z.string() });
export const JoinRoomBody = z.object({ role: RoleSchema });
