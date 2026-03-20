import { Router } from "express";
import {
  crearHabitacion,
  obtenerHabitaciones,
  eliminarHabitacion,
  desactivarHabitacion,
  actualizarEstadoHabitacion, // 1. Importar el nuevo controlador
} from "../controllers/habitacion.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/habitaciones", verifyToken, isAdmin, crearHabitacion);
router.get("/habitaciones", obtenerHabitaciones);

// RE015 - Gestión de eliminación y desactivación
router.delete("/habitaciones/:id", verifyToken, isAdmin, eliminarHabitacion);
router.patch("/habitaciones/:id/desactivar", verifyToken, isAdmin, desactivarHabitacion);

// NUEVO - Cambio de estado manual (Limpieza, Mantenimiento, Disponible, etc.)
router.patch("/habitaciones/:id/estado", verifyToken, actualizarEstadoHabitacion);

export default router;