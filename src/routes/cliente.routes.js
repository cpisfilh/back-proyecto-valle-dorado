import { Router } from "express";
import { create, get } from "../controllers/cliente.controller.js";

const router = Router();

router.get("/", get);
router.post("/create", create);
// router.post("/update", update);
// router.post("/delete", delete);

export default router;
