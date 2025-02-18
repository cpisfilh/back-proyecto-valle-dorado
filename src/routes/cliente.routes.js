import { Router } from "express";
import { get } from "../controllers/cliente.controller.js";

const router = Router();

router.get("/", get);

export default router;
