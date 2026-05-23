import { Router } from "express";

import {
  create,
  get,
  getOne,
  remove,
  search,
  update,
  updateBalance
} from "../controllers/pago.controller.js";

import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, get);

router.post("/getOne", requireAuth, getOne);

router.post("/create", requireAuth, create);

router.post("/edit", requireAuth, update);

router.post("/delete", requireAuth, remove);

router.post("/search", requireAuth, search);

router.post("/updateBalance", requireAuth, updateBalance);

export default router;
