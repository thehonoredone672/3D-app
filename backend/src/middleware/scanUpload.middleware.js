import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Deliberately NOT under UPLOAD_DIR: that root is served publicly via
// express.static in app.js, and raw scan captures must never be publicly
// reachable (see spec Section 28 - "no public raw capture URLs").
const SCAN_STORAGE_ROOT = process.env.SCAN_STORAGE_DIR || "storage";

function scanCaptureDir(scanSession) {
  return path.join(
    SCAN_STORAGE_ROOT,
    "projects",
    scanSession.projectId,
    "units",
    scanSession.unitId,
    "scans",
    scanSession.id,
    "captures"
  );
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = scanCaptureDir(req.scanSession);
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error("Unsupported file type"));
  }
  cb(null, true);
}

const scanUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

export default scanUpload;
export { scanCaptureDir, SCAN_STORAGE_ROOT };
