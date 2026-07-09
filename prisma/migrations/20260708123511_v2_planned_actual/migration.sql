-- CreateTable
CREATE TABLE "WeeklyProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "daysPerWeek" INTEGER NOT NULL DEFAULT 4,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TrainingDayTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklyProgramId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "TrainingDayTemplate_weeklyProgramId_fkey" FOREIGN KEY ("weeklyProgramId") REFERENCES "WeeklyProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionPlanItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingDayTemplateId" TEXT NOT NULL,
    "itemSlug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "plannedSets" INTEGER,
    "plannedReps" TEXT,
    "plannedWeightKg" REAL,
    "plannedDurationSec" INTEGER,
    "plannedSpeed" TEXT,
    "plannedRestSec" INTEGER,
    "plannedTempo" TEXT,
    "plannedNotes" TEXT,
    CONSTRAINT "SessionPlanItem_trainingDayTemplateId_fkey" FOREIGN KEY ("trainingDayTemplateId") REFERENCES "TrainingDayTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckInEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mood" TEXT NOT NULL,
    "energyLevel" INTEGER NOT NULL,
    "muscleSoreness" INTEGER NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainingDayTemplateId" TEXT,
    "dayLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "durationSec" INTEGER,
    "caption" TEXT,
    "checkInId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionLog_trainingDayTemplateId_fkey" FOREIGN KEY ("trainingDayTemplateId") REFERENCES "TrainingDayTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SessionLog_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckInEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionItemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionLogId" TEXT NOT NULL,
    "planItemId" TEXT,
    "itemSlug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "plannedSets" INTEGER,
    "plannedReps" TEXT,
    "plannedWeightKg" REAL,
    "plannedDurationSec" INTEGER,
    "plannedSpeed" TEXT,
    "plannedRestSec" INTEGER,
    "plannedTempo" TEXT,
    "plannedNotes" TEXT,
    "actualSets" INTEGER,
    "actualReps" TEXT,
    "actualWeightKg" REAL,
    "actualDurationSec" INTEGER,
    "actualSpeed" TEXT,
    "actualRestSec" INTEGER,
    "actualNotes" TEXT,
    "completionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SessionItemLog_sessionLogId_fkey" FOREIGN KEY ("sessionLogId") REFERENCES "SessionLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" REAL,
    "bodyFatPct" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MediaEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionLog_checkInId_key" ON "SessionLog"("checkInId");
