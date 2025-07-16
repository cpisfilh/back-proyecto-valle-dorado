import { Router } from "express";
import { create, cuotaXPago, get, pay, remove, update,revertpay, firstToExpire, createCuotaInicial, postCuotasGenerate, removeOfPago, createCuotaMensual, removeMensualOfPago, updatemensual } from "../controllers/cuota.controller.js";

const router = Router();

router.get("/", get);
router.post("/getCuotaXPago", cuotaXPago);
router.post("/create", create);
router.post("/createCuotaInicial",createCuotaInicial);
router.post("/createCuotaMensual",createCuotaMensual);
router.post("/edit", update);
router.post("/editMensual", updatemensual);
router.post("/pay", pay);
router.post("/revertpay", revertpay);
router.post("/delete", remove);
router.post("/deleteCuotaPago", removeOfPago);
router.post("/deleteCuotaMensualPago", removeMensualOfPago);
router.get("/getFirstToExpire", firstToExpire);
router.post("/cuotasGenerate", postCuotasGenerate);

export default router;
