import { PrismaClient } from '@prisma/client';

/** One client per process. Pass Neon's pooled URL: it handles many short-lived serverless connections. */
export const createDb = (url: string) => new PrismaClient({ datasourceUrl: url });
export type Db = PrismaClient;
