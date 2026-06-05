/*
  Warnings:

  - Added the required column `dehydrationPercent` to the `HydrationResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rehydrationNeedLiters` to the `HydrationResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waterLossLiters` to the `HydrationResult` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HydrationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "sweatRateLitersHour" REAL NOT NULL,
    "waterLossLiters" REAL NOT NULL,
    "dehydrationPercent" REAL NOT NULL,
    "rehydrationNeedLiters" REAL NOT NULL,
    "hydrationStatus" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HydrationResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HydrationResult" ("createdAt", "hydrationStatus", "id", "recommendation", "sessionId", "sweatRateLitersHour", "updatedAt") SELECT "createdAt", "hydrationStatus", "id", "recommendation", "sessionId", "sweatRateLitersHour", "updatedAt" FROM "HydrationResult";
DROP TABLE "HydrationResult";
ALTER TABLE "new_HydrationResult" RENAME TO "HydrationResult";
CREATE UNIQUE INDEX "HydrationResult_sessionId_key" ON "HydrationResult"("sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
