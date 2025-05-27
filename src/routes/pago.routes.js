import { Router } from "express";
import { create, get, getOne, remove, search, update } from "../controllers/pago.controller.js";

const router = Router();

router.get("/", get);
router.post("/getOne", getOne);
router.post("/create", create);
router.post("/edit", update);
router.post("/delete", remove);
router.post("/search", search);

export default router;
