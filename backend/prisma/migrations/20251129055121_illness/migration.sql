-- CreateEnum
CREATE TYPE "IllnessSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IllnessStatus" AS ENUM ('ONGOING', 'RECOVERED', 'RESOLVED', 'CHRONIC');

-- CreateTable
CREATE TABLE "IllnessEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bodyTemperature" DOUBLE PRECISION,
    "temperatureUnit" TEXT DEFAULT 'C',
    "severity" "IllnessSeverity" NOT NULL DEFAULT 'MILD',
    "status" "IllnessStatus" NOT NULL DEFAULT 'ONGOING',
    "notes" TEXT,
    "medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllnessEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IllnessEntry_profileId_recordedAt_idx" ON "IllnessEntry"("profileId", "recordedAt");

-- CreateIndex
CREATE INDEX "IllnessEntry_severity_idx" ON "IllnessEntry"("severity");

-- CreateIndex
CREATE INDEX "IllnessEntry_status_idx" ON "IllnessEntry"("status");

-- AddForeignKey
ALTER TABLE "IllnessEntry" ADD CONSTRAINT "IllnessEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
