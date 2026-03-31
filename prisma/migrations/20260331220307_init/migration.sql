-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cv" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cin" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "job" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Cv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "designation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_CvToskill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CvToskill_A_fkey" FOREIGN KEY ("A") REFERENCES "Cv" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CvToskill_B_fkey" FOREIGN KEY ("B") REFERENCES "skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_CvToskill_AB_unique" ON "_CvToskill"("A", "B");

-- CreateIndex
CREATE INDEX "_CvToskill_B_index" ON "_CvToskill"("B");
