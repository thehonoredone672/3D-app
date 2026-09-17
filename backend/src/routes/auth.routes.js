import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.get("/admin-check", authenticate, authorize("ADMIN"), (req, res) => {
  res.json({ message: "Admin access confirmed" });
});

export default router;
