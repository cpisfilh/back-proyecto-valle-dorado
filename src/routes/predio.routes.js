import { Router } from "express";
import { create, get, prediosSelectModal, prediosxCustomer, relateClientProperty, remove, removeXCustomer, update } from "../controllers/predio.controller.js";

const router = Router();

router.get("/", get);
router.post("/create", create);
router.post("/edit", update);
router.post("/delete", remove);
router.post("/deleteXCustomer", removeXCustomer);
router.post("/getPrediosxCustomer", prediosxCustomer);
router.get("/getPrediosSelectModal", prediosSelectModal);
router.post("/relateClientProperty", relateClientProperty);

export default router;
