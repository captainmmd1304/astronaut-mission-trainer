import { z } from 'zod';
import { RoleSchema, SolDecisionsSchema } from './decisions';
import { SpaceDataSource, WorldSnapshotSchema } from './world';

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
