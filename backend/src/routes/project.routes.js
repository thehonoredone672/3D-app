import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/project.controller.js";
import { getForProject } from "../controllers/building.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", getOne);
router.get("/:id/buildings", getForProject);
router.post("/", authenticate, authorize("ADMIN"), create);
router.put("/:id", authenticate, authorize("ADMIN"), update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

export default router;
