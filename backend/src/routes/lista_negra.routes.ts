import { Router } from "express";
import { reportarHuesped, eliminarDeListaNegra, verificarCarnet } from "../controllers/lista_negra.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Endpoint público/privado para verificar si un carnet está en la lista negra
router.get("/lista-negra/check/:carnet", verifyToken, verificarCarnet);

// Registrar a un huésped en la lista negra (Requiere estar autenticado)
router.post("/lista-negra", verifyToken, reportarHuesped);

// Eliminar de la lista negra (Solo Administrador)
router.delete("/lista-negra/:id", verifyToken, isAdmin, eliminarDeListaNegra);

export default router;
