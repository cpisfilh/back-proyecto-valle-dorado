import { Router } from "express";
import { create, cuotaXPago, get, pay, remove, update,revertpay } from "../controllers/cuota.controller.js";

const router = Router();

router.get("/", get);
router.post("/getCuotaXPago", cuotaXPago);
router.post("/create", create);
router.post("/edit", update);
router.post("/pay", pay);
router.post("/revertpay", revertpay);
router.post("/delete", remove);

export default router;
