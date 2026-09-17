import { Router } from "express";
import upload from "../middleware/upload.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("ADMIN"), (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
