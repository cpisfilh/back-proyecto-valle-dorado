import { Router } from "express";
import { create, cuotaXPago, get, pay, remove, update,revertpay, firstToExpire, createCuotaInicial, postCuotasGenerate } from "../controllers/cuota.controller.js";

const router = Router();

router.get("/", get);
router.post("/getCuotaXPago", cuotaXPago);
router.post("/create", create);
router.post("/createCuotaInicial",createCuotaInicial);
router.post("/edit", update);
router.post("/pay", pay);
router.post("/revertpay", revertpay);
router.post("/delete", remove);
router.get("/getFirstToExpire", firstToExpire);
router.post("/cuotasGenerate", postCuotasGenerate);

export default router;
