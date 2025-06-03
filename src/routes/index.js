import { Router } from "express";
import clienteRoutes from "./cliente.routes.js";
import manzanaRoutes from "./manzana.routes.js";
import loteRoutes from "./lote.routes.js";
import predioRoutes from "./predio.routes.js";
import pagoRoutes from "./pago.routes.js";
import cuotaRoutes from "./cuota.routes.js";
import authRoutes from "./auth.routes.js";
import subCuotaRoutes from "./subcuota.routes.js";

const router = Router();

router.use("/cliente", clienteRoutes);
router.use("/manzana", manzanaRoutes);
router.use("/lote", loteRoutes);
router.use("/predio", predioRoutes);
router.use("/pago", pagoRoutes);
router.use("/cuota", cuotaRoutes);
router.use("/subcuota", subCuotaRoutes);
router.use("/auth", authRoutes);

export default router;
