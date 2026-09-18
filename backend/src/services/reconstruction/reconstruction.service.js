import fs from "fs";
import path from "path";
import prisma from "../../utils/prisma.js";
import { getReconstructionProvider } from "./providerRegistry.js";
import { SCAN_STORAGE_ROOT } from "../../middleware/scanUpload.middleware.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

function publishModel(scanSessionId, glbPath) {
  const destName = `scan-${scanSessionId}.glb`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.copyFileSync(glbPath, path.join(UPLOAD_DIR, destName));
  return `/uploads/${destName}`;
}

class ReconstructionService {
  async processScan(scanSessionId) {
    const scan = await prisma.scanSession.findUnique({
      where: { id: scanSessionId },
      include: { captures: { orderBy: { sequenceNumber: "asc" } } },
    });
    if (!scan) {
      const err = new Error("Scan session not found");
      err.status = 404;
      throw err;
    }
    if (scan.captures.length === 0) {
      const err = new Error("Scan has no captures to process");
      err.status = 400;
      throw err;
    }

    const provider = getReconstructionProvider();

    await prisma.scanSession.update({
      where: { id: scanSessionId },
      data: { status: "PROCESSING" },
    });

    try {
      return await provider.createModel({
        jobId: scanSessionId,
        captures: scan.captures,
        sourceRoot: SCAN_STORAGE_ROOT,
      });
    } catch (err) {
      if (err.code === "RECONSTRUCTION_NOT_CONFIGURED") {
        // A deployment/config gap, not a bad scan - leave it resumable
        // rather than marking it as a genuine processing failure.
        await prisma.scanSession.update({
          where: { id: scanSessionId },
          data: { status: "UPLOADING" },
        });
        err.status = 501;
        throw err;
      }

      await prisma.scanSession.update({
        where: { id: scanSessionId },
        data: { status: "FAILED" },
      });
      throw err;
    }
  }

  // Called on each status poll (see scan.controller.js#getStatus). If the
  // job the provider is running has finished since the last check, this
  // finalizes it - publishing the GLB and flipping status to READY/FAILED.
  // Reuses the existing Step 5 polling loop instead of a separate scheduler.
  async checkAndAdvance(scanSessionId) {
    const scan = await prisma.scanSession.findUnique({ where: { id: scanSessionId } });
    if (!scan || scan.status !== "PROCESSING") return scan;

    const provider = getReconstructionProvider();
    if (typeof provider.getStatus !== "function") return scan;

    let jobStatus;
    try {
      jobStatus = await provider.getStatus(scanSessionId);
    } catch {
      return scan;
    }

    if (jobStatus.state === "running") return scan;

    if (jobStatus.state === "failed") {
      console.error(`Reconstruction failed for scan ${scanSessionId}: ${jobStatus.error}`);
      return prisma.scanSession.update({
        where: { id: scanSessionId },
        data: { status: "FAILED" },
      });
    }

    if (jobStatus.state === "succeeded") {
      const glbPath = await provider.downloadModel(scanSessionId);
      const modelUrl = publishModel(scanSessionId, glbPath);
      return prisma.scanSession.update({
        where: { id: scanSessionId },
        data: { status: "READY", modelUrl },
      });
    }

    return scan;
  }
}

export default new ReconstructionService();
