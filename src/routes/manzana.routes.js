import { Router } from "express";

import {
  create,
  get,
  remove,
  update
} from "../controllers/manzana.controller.js";

import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, get);

router.post("/create", requireAuth, create);

router.post("/edit", requireAuth, update);

router.post("/delete", requireAuth, remove);

export default router;
