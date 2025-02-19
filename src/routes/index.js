import { Router } from "express";
import clienteRoutes from "./cliente.routes.js";

const router = Router();

router.use("/cliente", clienteRoutes);

export default router;
