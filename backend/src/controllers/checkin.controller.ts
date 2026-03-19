import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const realizarCheckIn = async (req: Request, res: Response) => {
  try {
    const { reserva_id } = req.params; 
    const {
      habitacion_numero,
      fecha_entrada,
      fecha_salida,
      ingreso,
      metodo_ingreso,
      observacion,
      huespedes 
    } = req.body;

    const idNumerico = Number(reserva_id);
    const nroHabitacion = Number(habitacion_numero);

    // 1. Normalización de fechas de estancia (Mediodía)
    const nuevaEntrada = new Date(`${fecha_entrada}T12:00:00`);
    const nuevaSalida = new Date(`${fecha_salida}T12:00:00`);

    // --- 2. CORRECCIÓN DE HORA PARA BOLIVIA (UTC-4) ---
    // Obtenemos la hora actual del sistema (que suele ser UTC)
    const ahora = new Date();
    // Restamos 4 horas (4 * 60 min * 60 seg * 1000 ms) para ajustar a Bolivia
    const horaBolivia = new Date(ahora.getTime() - (4 * 60 * 60 * 1000)); 

    const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // A. BUSCAR LA HABITACIÓN POR NÚMERO
      const habitacion = await tx.habitacion.findUnique({
        where: { numero: nroHabitacion }
      });

      if (!habitacion) throw new Error(`La habitación #${nroHabitacion} no existe.`);

      // B. VALIDACIÓN DE SOLAPAMIENTO (Excluyendo esta reserva actual)
      const reservaSolapada = await tx.reserva.findFirst({
        where: {
          habitacion_id: habitacion.id,
          id: { not: idNumerico }, 
          AND: [
            { fecha_entrada: { lt: nuevaSalida } },
            { fecha_salida: { gt: nuevaEntrada } }
          ]
        }
      });

      if (reservaSolapada) {
        throw new Error(`Cruce de fechas: La habitación #${nroHabitacion} ya está ocupada por otra reserva.`);
      }

      // C. OBTENER DATOS PREVIOS (Adelanto)
      const reservaPrevia = await tx.reserva.findUnique({
        where: { id: idNumerico },
        select: { adelanto: true }
      });

      if (!reservaPrevia) throw new Error("La reserva original no existe.");

      // D. ACTUALIZACIÓN DE LA RESERVA (Check-In)
      const montoIngreso = Number(ingreso) || 0;
      const reservaActualizada = await tx.reserva.update({
        where: { id: idNumerico },
        data: {
          habitacion_id: habitacion.id,
          fecha_entrada: nuevaEntrada,
          fecha_salida: nuevaSalida,
          hora_entrada: horaBolivia, // <--- Hora corregida a las 14:00 aprox.
          ingreso: montoIngreso,
          metodo_ingreso: metodo_ingreso,
          observacion: observacion,
          total: (Number(reservaPrevia.adelanto) || 0) + montoIngreso,
          cantidad_personas: huespedes.length
        }
      });

      // E. GESTIÓN DE HUÉSPEDES (Actualizar lista y visitas)
      await tx.detalle_reserva_huesped.deleteMany({ where: { reserva_id: idNumerico } });

      for (let i = 0; i < huespedes.length; i++) {
        const h = huespedes[i];
        const huespedDb = await tx.huesped.upsert({
          where: { carnet: Number(h.carnet) },
          update: {
            nombres: h.nombres,
            apellidos: h.apellidos,
            complemento: h.complemento,
            celular: Number(h.celular),
            profesion: h.profesion,
            nacionalidad: h.nacionalidad,
            ciudad_nacimiento: h.ciudad_nacimiento,
            estado_civil: h.estado_civil,
            dias_visitado: { increment: 1 } // Incremento por estadía real
          },
          create: {
            nombres: h.nombres,
            apellidos: h.apellidos,
            carnet: Number(h.carnet),
            complemento: h.complemento,
            celular: Number(h.celular),
            genero: h.genero,
            profesion: h.profesion,
            fecha_nacimiento: new Date(`${h.fecha_nacimiento}T12:00:00`),
            nacionalidad: h.nacionalidad,
            ciudad_nacimiento: h.ciudad_nacimiento,
            estado_civil: h.estado_civil,
            nivel: 1,
            dias_visitado: 1
          }
        });

        await tx.detalle_reserva_huesped.create({
          data: {
            reserva_id: idNumerico,
            huesped_id: huespedDb.id,
            es_titular: i === 0 
          }
        });
      }

      // F. SINCRONIZACIÓN DE LA HABITACIÓN
      await tx.habitacion.update({
        where: { id: habitacion.id },
        data: { 
          estado: "Ocupado",
          ocupado: true // Bloquea borrados y cambios críticos
        }
      });

      return reservaActualizada;
    });

    return res.status(200).json({ 
      message: "Check-in realizado correctamente. Habitación marcada como OCUPADA.", 
      reserva: resultado 
    });

  } catch (error: any) {
    console.error("❌ ERROR_CHECKIN:", error);
    return res.status(400).json({ message: error.message || "Error al procesar el Check-In" });
  }
};

export const realizarCheckOut = async (req: Request, res: Response) => {
  try {
    const { reserva_id } = req.params;
    const idNumerico = Number(reserva_id);

    // --- 1. CORRECCIÓN DE HORA PARA BOLIVIA (UTC-4) ---
    const ahora = new Date();
    const horaSalidaBolivia = new Date(ahora.getTime() - (4 * 60 * 60 * 1000));

    const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      // A. BUSCAR LA RESERVA Y SU HABITACIÓN ASOCIADA
      const reservaActual = await tx.reserva.findUnique({
        where: { id: idNumerico },
        include: { habitacion: true }
      });

      if (!reservaActual) {
        throw new Error("La reserva no existe.");
      }

      if (!reservaActual.hora_entrada) {
        throw new Error("No se puede realizar Check-Out de una reserva que no ha realizado Check-In.");
      }

      // B. REGISTRAR HORA DE SALIDA EN LA RESERVA
      const reservaActualizada = await tx.reserva.update({
        where: { id: idNumerico },
        data: {
          hora_salida: horaSalidaBolivia
        }
      });

      // C. LIBERAR HABITACIÓN Y CAMBIAR ESTADO A "SUCIO"
      // Según tu lógica: ocupado = false permite que la habitación sea "borrable" o "desactivable"
      await tx.habitacion.update({
        where: { id: reservaActual.habitacion_id },
        data: {
          estado: "Sucio",
          ocupado: false 
        }
      });

      return reservaActualizada;
    });

    return res.status(200).json({
      message: "Check-Out realizado. Habitación lista para limpieza.",
      reserva: resultado
    });

  } catch (error: any) {
    console.error("❌ ERROR_CHECKOUT:", error);
    return res.status(400).json({ message: error.message || "Error al procesar el Check-Out" });
  }
};