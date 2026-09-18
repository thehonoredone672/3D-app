import { Router } from "express";
import {
  create,
  getOne,
  getStatus,
  loadScanSession,
  uploadCapture,
  processScan,
  approve,
  publish,
  remove,
} from "../controllers/scan.controller.js";
import scanUpload from "../middleware/scanUpload.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/", create);
router.get("/:id", getOne);
router.get("/:id/status", getStatus);
router.delete("/:id", remove);

router.post("/:id/process", processScan);
router.post("/:id/approve", approve);
router.post("/:id/publish", publish);

router.post("/:id/captures", loadScanSession, (req, res, next) => {
  scanUpload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    uploadCapture(req, res, next);
  });
});

export default router;
