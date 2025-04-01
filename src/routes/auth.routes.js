import { Router } from "express";
import { getUser, login } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/login", login);
router.get("/getUser",requireAuth, getUser);
// router.post("/create", create);

export default router;
