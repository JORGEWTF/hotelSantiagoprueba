import { Router } from 'express';
import { realizarCheckIn, realizarCheckOut } from '../controllers/checkin.controller'; 
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * RUTAS DE GESTIÓN DE ESTANCIA
 * Estas rutas se montan usualmente sobre "/api/reservas"
 */

// 1. Realizar Check-In: Registra hora de entrada y pone habitación como "Ocupada"
// URL: PUT /api/reservas/:reserva_id/checkin
router.put('/:reserva_id/checkin', verifyToken, realizarCheckIn);

// 2. Realizar Check-Out: Registra hora de salida y pone habitación como "Sucio"
// URL: PUT /api/reservas/:reserva_id/checkout
router.put('/:reserva_id/checkout', verifyToken, realizarCheckOut);

export default router;