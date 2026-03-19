import { Router } from 'express';
import {
  crearReservaConHuespedes,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva
} from '../controllers/reservation.controller';

const router = Router();

// RE004 - Crear reserva
router.post('/', crearReservaConHuespedes);

// Listar todas
router.get('/', obtenerReservas);

// RE009 - Obtener una para editar
router.get('/:id', obtenerReservaPorId);

// RE009 - Actualizar reserva
router.put('/:id', actualizarReserva);

// RE005 - Eliminar
router.delete('/:id', eliminarReserva);

export default router;