import { Router } from "express";
import { create, getAll, updateStatus } from "../controllers/enquiry.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", create);
router.get("/", authenticate, authorize("ADMIN"), getAll);
router.put("/:id", authenticate, authorize("ADMIN"), updateStatus);

export default router;
