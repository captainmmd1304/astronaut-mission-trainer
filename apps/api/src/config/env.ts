import { z } from 'zod';

const bool = z.enum(['live', 'cached', 'fixture']);

const EnvSchema = z.object({
  PORT: z.coerce.number().int().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().optional(), // Neon direct string (migrations). All db vars absent => in-memory store
  DATABASE_URL_POOLED: z.string().optional(), // Neon pooled string, preferred at runtime
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  NASA_API_KEY: z.string().default('DEMO_KEY'),
  SPACE_DATA_MODE: bool.default('fixture'),
  SPACE_DATA_TTL_MINUTES: z.coerce.number().positive().default(60),
  COMMS_TIME_SCALE: z.coerce.number().positive().default(0.05),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('nvidia/nemotron-3-ultra-550b-a55b:free'),
});
export type Env = z.infer<typeof EnvSchema>;

/** Parse once at boot. Empty strings count as unset. Nothing else reads process.env. */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== ''));
  const parsed = EnvSchema.safeParse(cleaned);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment: ${msg}`);
  }
  return parsed.data;
}
