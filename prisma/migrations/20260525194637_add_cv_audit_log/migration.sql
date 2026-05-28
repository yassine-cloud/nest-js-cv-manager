-- CreateTable
CREATE TABLE "CvAuditLog" (
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
