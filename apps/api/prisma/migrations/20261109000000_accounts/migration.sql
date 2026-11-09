-- AlterTable
ALTER TABLE "Player" ADD COLUMN "username" VARCHAR(24),
ADD COLUMN "passwordHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");
