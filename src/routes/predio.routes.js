import { Router } from "express";

import {
  create,
  get,
  prediosSelectModal,
  prediosxCustomer,
  relateClientProperty,
  remove,
  removeXCustomer,
  update
} from "../controllers/predio.controller.js";

import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, get);

router.post("/create", requireAuth, create);

router.post("/edit", requireAuth, update);

router.post("/delete", requireAuth, remove);

router.post("/deleteXCustomer", requireAuth, removeXCustomer);

router.post(
  "/getPrediosxCustomer",
  requireAuth,
  prediosxCustomer
);

router.get(
  "/getPrediosSelectModal",
  requireAuth,
  prediosSelectModal
);

router.post(
  "/relateClientProperty",
  requireAuth,
  relateClientProperty
);

export default router;
