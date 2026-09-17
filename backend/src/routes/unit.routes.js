import { Router } from "express";
import { getOne, create, update, remove } from "../controllers/unit.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:id", getOne);
router.post("/", authenticate, authorize("ADMIN"), create);
router.put("/:id", authenticate, authorize("ADMIN"), update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
