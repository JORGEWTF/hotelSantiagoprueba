import { Router } from "express";
import {
  registrarGasto,
  obtenerGastos,
} from "../controllers/gasto.controller";

const router = Router();

router.post("/gastos", registrarGasto);
router.get("/gastos", obtenerGastos);

export default router;