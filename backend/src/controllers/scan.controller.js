import path from "path";
import {
  createScanSession,
  getScanSession,
  getScanStatus,
  addCapture,
  approveScan,
  publishScan,
  deleteScan,
} from "../services/scan.service.js";
import prisma from "../utils/prisma.js";
import { scanCaptureDir, SCAN_STORAGE_ROOT } from "../middleware/scanUpload.middleware.js";
import reconstructionService from "../services/reconstruction/reconstruction.service.js";

const SCAN_TYPES = ["ROOM", "APARTMENT", "EXTERIOR"];

export async function create(req, res, next) {
  try {
    const { projectId, unitId, scanType } = req.body;
    if (!projectId || !unitId) {
      return res.status(400).json({ error: "projectId and unitId are required" });
    }
    if (scanType !== undefined && !SCAN_TYPES.includes(scanType)) {
      return res.status(400).json({ error: `scanType must be one of ${SCAN_TYPES.join(", ")}` });
    }

    const scan = await createScanSession({
      projectId,
      unitId,
      scanType,
      createdById: req.user.id,
    });
    res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    await reconstructionService.checkAndAdvance(req.params.id);
    res.json(await getScanSession(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function getStatus(req, res, next) {
  try {
    await reconstructionService.checkAndAdvance(req.params.id);
    res.json(await getScanStatus(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function loadScanSession(req, res, next) {
  try {
    const scan = await prisma.scanSession.findUnique({ where: { id: req.params.id } });
    if (!scan) return res.status(404).json({ error: "Scan session not found" });
    req.scanSession = scan;
    next();
  } catch (err) {
    next(err);
  }
}

export async function uploadCapture(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dir = scanCaptureDir(req.scanSession);
    const fileUrl = path
      .relative(SCAN_STORAGE_ROOT, path.join(dir, req.file.filename))
      .split(path.sep)
      .join("/");

    const capture = await addCapture({ scanSessionId: req.scanSession.id, fileUrl });
    res.status(201).json(capture);
  } catch (err) {
    next(err);
  }
}

export async function processScan(req, res, next) {
  try {
    await reconstructionService.processScan(req.params.id);
    res.status(202).json({ message: "Processing started" });
  } catch (err) {
    next(err);
  }
}

export async function approve(req, res, next) {
  try {
    res.json(await approveScan(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function publish(req, res, next) {
  try {
    res.json(await publishScan(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteScan(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
