import { Router } from "express";

import {
  create,
  cuotaXPago,
  get,
  pay,
  remove,
  update,
  revertpay,
  firstToExpire,
  createCuotaInicial,
  postCuotasGenerate,
  removeOfPago,
  createCuotaMensual,
  removeMensualOfPago,
  updatemensual,
  uploadReceipt,
  getReceiptUrl
} from "../controllers/cuota.controller.js";

import { requireAuth } from "../middlewares/requireAuth.js";

import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/", requireAuth, get);

router.post(
  "/getCuotaXPago",
  requireAuth,
  cuotaXPago
);

router.post("/create", requireAuth, create);

router.post(
  "/createCuotaInicial",
  requireAuth,
  createCuotaInicial
);

router.post(
  "/createCuotaMensual",
  requireAuth,
  createCuotaMensual
);

router.post("/edit", requireAuth, update);

router.post(
  "/editMensual",
  requireAuth,
  updatemensual
);

router.post("/pay", requireAuth, pay);

router.post(
  "/revertpay",
  requireAuth,
  revertpay
);

router.post("/delete", requireAuth, remove);

router.post(
  "/deleteCuotaPago",
  requireAuth,
  removeOfPago
);

router.post(
  "/deleteCuotaMensualPago",
  requireAuth,
  removeMensualOfPago
);

router.get(
  "/getFirstToExpire",
  requireAuth,
  firstToExpire
);

router.post(
  "/cuotasGenerate",
  requireAuth,
  postCuotasGenerate
);

router.post(
  "/uploadReceipt",
  requireAuth,
  upload.single("file"),
  uploadReceipt
);

router.get(
  "/getReceiptUrl/:id",
  requireAuth,
  getReceiptUrl
);

export default router;
