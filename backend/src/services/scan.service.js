import prisma from "../utils/prisma.js";

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

export async function createScanSession({ projectId, unitId, scanType, createdById }) {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { building: true },
  });
  if (!unit) throw notFound("Unit not found");
  if (unit.building.projectId !== projectId) {
    const err = new Error("Unit does not belong to the given project");
    err.status = 400;
    throw err;
  }

  return prisma.scanSession.create({
    data: {
      projectId,
      unitId,
      createdById,
      scanType: scanType || "ROOM",
      status: "UPLOADING",
    },
  });
}

export async function getScanSession(id) {
  const scan = await prisma.scanSession.findUnique({
    where: { id },
    include: {
      captures: { orderBy: { sequenceNumber: "asc" } },
      unit: true,
      project: { select: { id: true, name: true } },
    },
  });
  if (!scan) throw notFound("Scan session not found");
  return scan;
}

export async function getScanStatus(id) {
  const scan = await prisma.scanSession.findUnique({
    where: { id },
    select: { id: true, status: true, captureCount: true, modelUrl: true },
  });
  if (!scan) throw notFound("Scan session not found");
  return scan;
}

export async function approveScan(id) {
  const scan = await prisma.scanSession.findUnique({ where: { id } });
  if (!scan) throw notFound("Scan session not found");
  if (scan.status !== "READY") {
    const err = new Error("Scan must be READY before it can be approved");
    err.status = 400;
    throw err;
  }

  return prisma.scanSession.update({ where: { id }, data: { status: "APPROVED" } });
}

export async function publishScan(id) {
  const scan = await prisma.scanSession.findUnique({ where: { id } });
  if (!scan) throw notFound("Scan session not found");
  if (scan.status !== "APPROVED") {
    const err = new Error("Scan must be approved before it can be published");
    err.status = 400;
    throw err;
  }

  const [updatedScan] = await prisma.$transaction([
    prisma.scanSession.update({ where: { id }, data: { status: "PUBLISHED" } }),
    prisma.unit.update({ where: { id: scan.unitId }, data: { modelUrl: scan.modelUrl } }),
  ]);
  return updatedScan;
}

export async function deleteScan(id) {
  try {
    await prisma.scanSession.delete({ where: { id } });
  } catch (err) {
    if (err.code === "P2025") throw notFound("Scan session not found");
    throw err;
  }
}

export async function addCapture({ scanSessionId, fileUrl }) {
  return prisma.$transaction(async (tx) => {
    const scan = await tx.scanSession.update({
      where: { id: scanSessionId },
      data: { captureCount: { increment: 1 } },
    });

    return tx.scanCapture.create({
      data: {
        scanSessionId,
        fileUrl,
        sequenceNumber: scan.captureCount,
      },
    });
  });
}
