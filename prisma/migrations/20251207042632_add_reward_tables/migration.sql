-- CreateTable
CREATE TABLE "UserReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "expiresAt" DATETIME,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GameRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rewardId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameRound_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "UserReward" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "couponCode" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "orderNumber" TEXT,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserReward_sessionId_key" ON "UserReward"("sessionId");

-- CreateIndex
CREATE INDEX "UserReward_shop_idx" ON "UserReward"("shop");

-- CreateIndex
CREATE INDEX "UserReward_sessionId_idx" ON "UserReward"("sessionId");

-- CreateIndex
CREATE INDEX "GameRound_rewardId_idx" ON "GameRound"("rewardId");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_couponCode_key" ON "CouponUsage"("couponCode");

-- CreateIndex
CREATE INDEX "CouponUsage_shop_idx" ON "CouponUsage"("shop");

-- CreateIndex
CREATE INDEX "CouponUsage_couponCode_idx" ON "CouponUsage"("couponCode");
