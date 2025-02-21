import { Router } from "express";
import { create, get, remove, update } from "../controllers/lote.controller.js";

const router = Router();

router.get("/", get);
router.post("/create", create);
router.post("/edit", update);
router.post("/delete", remove);

export default router;
