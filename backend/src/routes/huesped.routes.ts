// huesped.route.ts
import { Router } from 'express';
import { obtenerHuespedPorCarnet, obtenerHuespedes, eliminarHuesped, actualizarHuesped } from '../controllers/huesped.controller';

const router = Router();

// 1. PRIMERO la ruta general (GET /api/huespedes)
router.get('/', obtenerHuespedes);

// 2. DESPUÉS la ruta con parámetro (GET /api/huespedes/:carnet)
router.get('/:carnet', obtenerHuespedPorCarnet);

router.put('/:id', actualizarHuesped); 

// 3. Ruta para eliminar
router.delete('/:id', eliminarHuesped);

export default router;