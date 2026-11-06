-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('running', 'failed', 'completed');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "displayName" VARCHAR(24) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'running',
    "decisions" JSONB NOT NULL DEFAULT '[]',
    "worldSnapshots" JSONB NOT NULL DEFAULT '[]',
    "score" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceDataCache" (
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpaceDataCache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Run_playerId_startedAt_idx" ON "Run"("playerId", "startedAt");

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
