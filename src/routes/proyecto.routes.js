import { Router } from "express";

import {
  get
} from "../controllers/proyecto.controller.js";

import {
  requireAuth
} from "../middlewares/requireAuth.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  get
);

export default router;
