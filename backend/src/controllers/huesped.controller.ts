import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Busca un huésped específico por su número de carnet (CI).
 * Se usa para el autocompletado en el frontend.
 */
export const obtenerHuespedPorCarnet = async (req: Request, res: Response) => {
  try {
    const { carnet } = req.params;
    console.log("--> Carnet recibido en Params:", carnet);

    if (!carnet) {
      return res.status(400).json({ message: "El carnet es requerido." });
    }

    const huesped = await prisma.huesped.findUnique({
      where: {
        carnet: Number(carnet),
      },
      include: {
        lista_negra: true
      }
    });

    if (!huesped) {
      return res.status(404).json({ message: "Huésped no encontrado." });
    }

    return res.json(huesped);
  } catch (error: any) {
    console.error("❌ ERROR_BUSCAR_HUESPED:", error);
    return res.status(500).json({ message: "Error al buscar el huésped", error: error.message });
  }
};

/**
 * (Opcional) Obtener todos los huéspedes
 */
export const obtenerHuespedes = async (req: Request, res: Response) => {
  try {
    const huespedes = await prisma.huesped.findMany({
      include: {
        lista_negra: true
      },
      orderBy: { apellidos: 'asc' }
    });
    return res.json(huespedes);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la lista de huéspedes" });
  }
};

/**
 * Actualizar datos de un huésped por ID
 */
export const actualizarHuesped = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return res.status(400).json({ message: "ID de huésped inválido" });
    }

    const {
      nombres,
      apellidos,
      carnet,
      complemento,
      celular,
      genero,
      profesion,
      fecha_nacimiento,
      nacionalidad,
      ciudad_nacimiento,
      estado_civil
    } = req.body;

    // Verificar si el huésped existe
    const huespedExistente = await prisma.huesped.findUnique({
      where: { id: idNum }
    });

    if (!huespedExistente) {
      return res.status(404).json({ message: "Huésped no encontrado" });
    }

    const huespedActualizado = await prisma.huesped.update({
      where: { id: idNum },
      data: {
        nombres,
        apellidos,
        carnet: carnet ? Number(carnet) : undefined,
        complemento,
        celular: celular ? Number(celular) : undefined,
        genero,
        profesion,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : undefined,
        nacionalidad,
        ciudad_nacimiento,
        estado_civil
      }
    });

    return res.json({
      message: "Huésped actualizado correctamente",
      huesped: huespedActualizado
    });

  } catch (error: any) {
    console.error("❌ ERROR_ACTUALIZAR_HUESPED:", error);

    // Error típico de Prisma si carnet ya existe
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: "Ya existe un huésped con ese número de carnet."
      });
    }

    return res.status(500).json({
      message: "Error al actualizar el huésped",
      error: error.message
    });
  }
};
/**
 * Elimina un huésped por su ID
 */
export const eliminarHuesped = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id as string);

    if (isNaN(idNum)) {
      return res.status(400).json({ message: "ID de huésped inválido" });
    }

    // Verificar si existe
    const huesped = await prisma.huesped.findUnique({ where: { id: idNum } });
    if (!huesped) {
      return res.status(404).json({ message: "Huésped no encontrado" });
    }

    // Eliminar
    await prisma.huesped.delete({
      where: { id: idNum }
    });

    return res.json({ message: "Huésped eliminado correctamente" });
  } catch (error: any) {
    console.error("❌ ERROR_ELIMINAR_HUESPED:", error);
    // Errores de restricción de clave foránea
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: "No se puede eliminar el huésped porque tiene registros asociados (reservas o lista negra)."
      });
    }
    return res.status(500).json({ message: "Error al eliminar el huésped", error: error.message });
  }
};