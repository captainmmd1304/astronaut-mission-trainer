import { PrismaClient } from '@prisma/client';

/** One client per process. Neon's pooled URL handles many short-lived serverless connections. */
export const createDb = () => new PrismaClient();
export type Db = PrismaClient;
