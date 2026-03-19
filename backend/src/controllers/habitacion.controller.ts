import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const crearHabitacion = async (req: Request, res: Response) => {
  try {
    const { numero, piso, tipo_habitacion, ocupado, estado } = req.body;

    if (!numero || !piso || !tipo_habitacion || !estado) {
      return res.status(400).json({
        error: "Campos obligatorios faltantes",
        detalles: "El número, piso, tipo de habitación y estado son requeridos.",
      });
    }

    if (numero <= 0) return res.status(400).json({ error: "El número de habitación debe ser mayor a 0" });
    if (piso <= 0) return res.status(400).json({ error: "El piso debe ser mayor a 0" });

    const habitacionExistente = await prisma.habitacion.findUnique({
      where: { numero: parseInt(numero) },
    });

    if (habitacionExistente) {
      return res.status(409).json({ error: "El número de habitación ya existe" });
    }

    const nuevaHabitacion = await prisma.habitacion.create({
      data: {
        numero: parseInt(numero),
        piso: parseInt(piso),
        tipo_habitacion,
        ocupado: ocupado || false,
        estado,
      },
    });

    return res.status(201).json({
      mensaje: `Habitación ${nuevaHabitacion.numero} registrada correctamente`,
      habitacion: nuevaHabitacion,
    });
  } catch (error) {
    console.error("Error al crear habitación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerHabitaciones = async (req: Request, res: Response) => {
  try {
    const habitaciones = await prisma.habitacion.findMany({
      orderBy: { numero: "asc" },
    });

    return res.status(200).json({
      total: habitaciones.length,
      habitaciones,
    });
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// RE015 - DELETE físico con validaciones
export const eliminarHabitacion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const hab = await prisma.habitacion.findUnique({ where: { id } });
    if (!hab) return res.status(404).json({ error: "Habitación no encontrada" });

    // Escenario 3: ocupada => bloquear
    if (hab.ocupado) {
      return res.status(409).json({
        error: "No se puede eliminar la habitación porque está ocupada (hay huéspedes actualmente).",
      });
    }

    // Escenario 2: historial => bloquear
    const reservas = await prisma.reserva.count({ where: { habitacion_id: id } });
    const limpiezas = await prisma.limpieza.count({ where: { habitacion_id: id } });

    if (reservas > 0 || limpiezas > 0) {
      return res.status(409).json({
        error:
          "No se puede eliminar la habitación porque tiene historial de reservas o limpieza. Considere cambiar su estado a 'Inactiva'.",
        detalle: { reservas, limpiezas },
      });
    }

    await prisma.habitacion.delete({ where: { id } });

    return res.status(200).json({
      mensaje: `Habitación ${hab.numero} eliminada permanentemente`,
    });
  } catch (error) {
    console.error("Error al eliminar habitación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// RE015 - Soft delete (marcar Inactiva)
export const desactivarHabitacion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const hab = await prisma.habitacion.findUnique({ where: { id } });
    if (!hab) return res.status(404).json({ error: "Habitación no encontrada" });

    if (hab.ocupado) {
      return res.status(409).json({
        error: "No se puede desactivar la habitación porque está ocupada.",
      });
    }

    const updated = await prisma.habitacion.update({
      where: { id },
      data: { estado: "Inactiva" },
    });

    return res.status(200).json({
      mensaje: `Habitación ${updated.numero} marcada como Inactiva`,
      habitacion: updated,
    });
  } catch (error) {
    console.error("Error al desactivar habitación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarEstadoHabitacion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nuevo_estado } = req.body;

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "ID de habitación inválido" });
    }

    if (!nuevo_estado) {
      return res.status(400).json({ error: "Debe proporcionar el nuevo estado" });
    }

    const habitacion = await prisma.habitacion.findUnique({
      where: { id },
    });

    if (!habitacion) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    // Bloqueo de seguridad: No mover a estados críticos si el sistema detecta ocupación física
    if (habitacion.ocupado && (nuevo_estado === "Mantenimiento" || nuevo_estado === "Inactiva")) {
      return res.status(409).json({
        error: `No se puede cambiar a '${nuevo_estado}' porque la habitación está ocupada actualmente por un huésped.`,
      });
    }

    // --- Lógica de Sincronización Estricta ---
    // Ahora 'ocupado' SOLO es true si el estado es exactamente "Ocupado"
    const estaAhoraOcupado = nuevo_estado === "Ocupado";

    const habitacionActualizada = await prisma.habitacion.update({
      where: { id },
      data: { 
        estado: nuevo_estado,
        ocupado: estaAhoraOcupado 
      },
    });

    return res.status(200).json({
      mensaje: `Estado actualizado a ${nuevo_estado}. (Ocupación física: ${estaAhoraOcupado ? 'SÍ' : 'NO'})`,
      habitacion: habitacionActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar estado de habitación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};