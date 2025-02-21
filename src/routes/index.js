import { Router } from "express";
import clienteRoutes from "./cliente.routes.js";
import manzanaRoutes from "./manzana.routes.js";
import loteRoutes from "./lote.routes.js";

const router = Router();

router.use("/cliente", clienteRoutes);
router.use("/manzana", manzanaRoutes);
router.use("/lote", loteRoutes);

export default router;
