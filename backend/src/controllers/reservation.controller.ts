import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface HuespedInput {
  nombres: string;
  apellidos: string;
  carnet: number;
  complemento?: string;
  celular: number;
  genero: string;
  profesion: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  ciudad_nacimiento: string;
  estado_civil: string;
}

export const crearReservaConHuespedes = async (req: Request, res: Response) => {
  try {
    const {
      habitacion_numero, // Ahora recibimos el NÚMERO físico de la habitación
      fecha_entrada,
      fecha_salida,
      adelanto,
      ingreso,
      metodo_adelanto,
      metodo_ingreso,
      observacion,
      huespedes
    } = req.body;

    const dateEntrada = new Date(`${fecha_entrada}T12:00:00`);
    const dateSalida = new Date(`${fecha_salida}T12:00:00`);

    if (!huespedes || !Array.isArray(huespedes) || huespedes.length === 0) {
      return res.status(400).json({ message: "Se requiere al menos un huésped." });
    }

    const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // A. BUSCAR EL ID DE LA HABITACIÓN USANDO EL NÚMERO (Int)
      const habitacion = await tx.habitacion.findUnique({
        where: { numero: Number(habitacion_numero) }
      });

      if (!habitacion) {
        throw new Error(`La habitación #${habitacion_numero} no existe en el sistema.`);
      }

      // B. VALIDAR SOLAPAMIENTO DE FECHAS
      const solapada = await tx.reserva.findFirst({
        where: {
          habitacion_id: habitacion.id,
          AND: [
            { fecha_entrada: { lt: dateSalida } },
            { fecha_salida: { gt: dateEntrada } }
          ]
        }
      });

      if (solapada) {
        throw new Error(`La habitación ${habitacion_numero} ya está ocupada para esas fechas.`);
      }

      // C. CREAR LA RESERVA USANDO EL ID ENCONTRADO
      const nuevaReserva = await tx.reserva.create({
        data: {
          usuario_id: 1, 
          habitacion_id: habitacion.id, 
          fecha_entrada: dateEntrada,
          fecha_salida: dateSalida,
          adelanto: Number(adelanto) || 0,
          ingreso: Number(ingreso) || 0,
          total: (Number(adelanto) || 0) + (Number(ingreso) || 0),
          metodo_adelanto: metodo_adelanto || null,
          metodo_ingreso: metodo_ingreso || null,
          observacion: observacion || null,
          cantidad_personas: huespedes.length,
        }
      });

      // D. PROCESAR HUÉSPEDES
      for (let i = 0; i < huespedes.length; i++) {
        const h = huespedes[i];
        const huespedDb = await tx.huesped.upsert({
          where: { carnet: Number(h.carnet) },
          update: {
            nombres: h.nombres,
            apellidos: h.apellidos,
            celular: Number(h.celular),
            profesion: h.profesion,
            nacionalidad: h.nacionalidad,
            ciudad_nacimiento: h.ciudad_nacimiento,
            estado_civil: h.estado_civil,
          },
          create: {
            nombres: h.nombres,
            apellidos: h.apellidos,
            carnet: Number(h.carnet),
            complemento: h.complemento || null,
            celular: Number(h.celular),
            genero: h.genero,
            profesion: h.profesion,
            fecha_nacimiento: new Date(`${h.fecha_nacimiento}T12:00:00`),
            nacionalidad: h.nacionalidad,
            ciudad_nacimiento: h.ciudad_nacimiento,
            estado_civil: h.estado_civil,
            nivel: 1,
            dias_visitado: 0
          }
        });

        await tx.detalle_reserva_huesped.create({
          data: {
            reserva_id: nuevaReserva.id,
            huesped_id: huespedDb.id,
            es_titular: i === 0 
          }
        });
      }

      return nuevaReserva;
    });

    return res.status(201).json({ message: "Reserva creada exitosamente", reserva: resultado });

  } catch (error: any) {
    console.error("❌ ERROR_CREAR_RESERVA:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const obtenerReservas = async (req: Request, res: Response) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        habitacion: true,
        huespedes_detalle: {
          include: { huesped: true }
        }
      },
      orderBy: {
        fecha_entrada: 'desc'
      }
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas" });
  }
};

/**
 * ID: RE005 - Eliminación de reserva
 */
export const eliminarReserva = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID de reserva no proporcionado." });
    }

    const reservaId = Number(id);

    // 1. Verificamos si la reserva existe
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id: reservaId }
    });

    if (!reservaExistente) {
      return res.status(404).json({ message: "La reserva no existe." });
    }

    // 2. Ejecutamos la eliminación con TIPADO EXPLÍCITO en 'tx'
    // Usamos Prisma.TransactionClient para resolver el error de 'any'
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // Borrar vinculación con huéspedes primero (por integridad referencial)
      await tx.detalle_reserva_huesped.deleteMany({
        where: { reserva_id: reservaId }
      });

      // Borrar la reserva
      await tx.reserva.delete({
        where: { id: reservaId }
      });
    });

    return res.status(200).json({
      message: `Reserva #${reservaId} eliminada correctamente.`
    });

  } catch (error: any) {
    console.error("ERROR_ELIMINAR_RESERVA:", error);
    return res.status(500).json({ 
      message: "Error al intentar eliminar la reserva", 
      error: error.message 
    });
  }
};
// ==========================================
// RE009 - OBTENER UNA RESERVA POR ID
// ==========================================
export const obtenerReservaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reserva = await prisma.reserva.findUnique({
      where: { id: Number(id) },
      include: {
        habitacion: true,
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            cargo: true
          }
        },
        huespedes_detalle: {
          include: {
            huesped: true
          }
        }
      }
    });

    if (!reserva) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    return res.status(200).json(reserva);
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};


// ==========================================
// RE009 - ACTUALIZAR RESERVA
// ==========================================
export const actualizarReserva = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      habitacion_numero,
      fecha_entrada, 
      fecha_salida, 
      hora_entrada,
      hora_salida,
      cantidad_personas,
      adelanto, 
      ingreso,
      total,
      metodo_adelanto,
      metodo_ingreso, 
      observacion
    } = req.body;

    const reservaExistente = await prisma.reserva.findUnique({
      where: { id: Number(id) },
      include: { 
        habitacion: true,
        huespedes_detalle: {
          include: { huesped: true }
        }
      }
    });

    if (!reservaExistente) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    const nuevaFechaEntrada = fecha_entrada 
      ? new Date(`${fecha_entrada}T12:00:00`) 
      : reservaExistente.fecha_entrada;
    
    const nuevaFechaSalida = fecha_salida 
      ? new Date(`${fecha_salida}T12:00:00`) 
      : reservaExistente.fecha_salida;

    if (nuevaFechaSalida <= nuevaFechaEntrada) {
      return res.status(400).json({
        error: "La fecha de salida debe ser posterior a la fecha de entrada"
      });
    }

    let nuevoHabitacionId = reservaExistente.habitacion_id;

    if (habitacion_numero) {
      const habitacion = await prisma.habitacion.findUnique({
        where: { numero: Number(habitacion_numero) }
      });

      if (!habitacion) {
        return res.status(404).json({
          error: `La habitación #${habitacion_numero} no existe`
        });
      }

      nuevoHabitacionId = habitacion.id;
    }

    if (
      nuevoHabitacionId !== reservaExistente.habitacion_id &&
      reservaExistente.habitacion.ocupado === true
    ) {
      return res.status(400).json({
        error: "No se puede cambiar la habitación porque ya está ocupada."
      });
    }

    if (nuevoHabitacionId !== reservaExistente.habitacion_id) {
      const conflictos = await prisma.reserva.findFirst({
        where: {
          habitacion_id: nuevoHabitacionId,
          id: { not: Number(id) },
          AND: [
            { fecha_entrada: { lt: nuevaFechaSalida } },
            { fecha_salida: { gt: nuevaFechaEntrada } }
          ]
        }
      });

      if (conflictos) {
        return res.status(409).json({
          error: "La habitación seleccionada no está disponible"
        });
      }
    }

    const dataToUpdate: any = {};

    if (nuevoHabitacionId !== reservaExistente.habitacion_id) {
      dataToUpdate.habitacion_id = nuevoHabitacionId;
    }
    
    if (fecha_entrada) dataToUpdate.fecha_entrada = nuevaFechaEntrada;
    if (fecha_salida) dataToUpdate.fecha_salida = nuevaFechaSalida;
    if (hora_entrada) dataToUpdate.hora_entrada = new Date(`1970-01-01T${hora_entrada}`);
    if (hora_salida) dataToUpdate.hora_salida = new Date(`1970-01-01T${hora_salida}`);
    if (cantidad_personas !== undefined) dataToUpdate.cantidad_personas = Number(cantidad_personas);
    if (adelanto !== undefined) dataToUpdate.adelanto = Number(adelanto);
    if (ingreso !== undefined) dataToUpdate.ingreso = Number(ingreso);
    if (total !== undefined) dataToUpdate.total = Number(total);
    if (metodo_adelanto !== undefined) dataToUpdate.metodo_adelanto = metodo_adelanto;
    if (metodo_ingreso !== undefined) dataToUpdate.metodo_ingreso = metodo_ingreso;
    if (observacion !== undefined) dataToUpdate.observacion = observacion;

    const reservaActualizada = await prisma.reserva.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: {
        habitacion: true,
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        huespedes_detalle: {
          include: {
            huesped: true
          }
        }
      }
    });

    return res.status(200).json({
      mensaje: "Reserva actualizada exitosamente",
      reserva: reservaActualizada
    });
  } catch (error: any) {
    console.error("Error al actualizar reserva:", error);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};


