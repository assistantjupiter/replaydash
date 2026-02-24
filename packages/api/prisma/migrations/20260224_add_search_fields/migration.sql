-- AlterTable
ALTER TABLE "Session" ADD COLUMN "browser" TEXT,
ADD COLUMN "device" TEXT,
ADD COLUMN "os" TEXT,
ADD COLUMN "hasErrors" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Session_userEmail_idx" ON "Session"("userEmail");

-- CreateIndex
CREATE INDEX "Session_browser_idx" ON "Session"("browser");

-- CreateIndex
CREATE INDEX "Session_device_idx" ON "Session"("device");

-- CreateIndex
CREATE INDEX "Session_hasErrors_idx" ON "Session"("hasErrors");

-- CreateIndex
CREATE INDEX "Session_lastActive_idx" ON "Session"("lastActive");
