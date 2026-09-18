-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('DRAFT', 'CAPTURING', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('ROOM', 'APARTMENT', 'EXTERIOR');

-- CreateTable
CREATE TABLE "ScanSession" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'DRAFT',
    "scanType" "ScanType" NOT NULL DEFAULT 'ROOM',
    "captureCount" INTEGER NOT NULL DEFAULT 0,
    "modelUrl" TEXT,
    "previewUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanCapture" (
    "id" TEXT NOT NULL,
    "scanSessionId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanCapture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScanSession" ADD CONSTRAINT "ScanSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanSession" ADD CONSTRAINT "ScanSession_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanSession" ADD CONSTRAINT "ScanSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanCapture" ADD CONSTRAINT "ScanCapture_scanSessionId_fkey" FOREIGN KEY ("scanSessionId") REFERENCES "ScanSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
