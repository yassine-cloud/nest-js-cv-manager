/*
  Warnings:

  - You are about to drop the column `cvOwnerId` on the `CvAuditLog` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CvAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cvId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "firstname" TEXT,
    "age" INTEGER,
    "job" TEXT,
    "path" TEXT,
    "skills" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CvAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CvAuditLog" ("action", "age", "createdAt", "cvId", "firstname", "id", "job", "path", "skills", "userId") SELECT "action", "age", "createdAt", "cvId", "firstname", "id", "job", "path", "skills", "userId" FROM "CvAuditLog";
DROP TABLE "CvAuditLog";
ALTER TABLE "new_CvAuditLog" RENAME TO "CvAuditLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
