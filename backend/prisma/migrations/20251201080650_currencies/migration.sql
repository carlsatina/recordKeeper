-- AlterTable
ALTER TABLE "UserPreference" ALTER COLUMN "currency" SET DEFAULT 'PHP';

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "type" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "balance" DOUBLE PRECISION DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCurrency" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "symbol" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserCurrency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_isDefault_idx" ON "Account"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "UserCurrency_userId_idx" ON "UserCurrency"("userId");

-- CreateIndex
CREATE INDEX "UserCurrency_userId_isDefault_idx" ON "UserCurrency"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "UserCurrency_userId_code_key" ON "UserCurrency"("userId", "code");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCurrency" ADD CONSTRAINT "UserCurrency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
