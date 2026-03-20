import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const registrarGasto = async (req: Request, res: Response) => {
  try {
    // 1. Extraemos 'fecha' del cuerpo de la petición por si el usuario quiere enviarla
    const { usuario_id, producto, precio, fecha } = req.body;

    // Validaciones de campos requeridos
    if (!usuario_id || !producto || !precio) {
      return res.status(400).json({
        error: "Todos los campos son requeridos",
        campos: ["usuario_id", "producto", "precio"]
      });
    }

    // Validar longitud del producto
    if (producto.trim().length < 3) {
      return res.status(400).json({
        error: "El producto debe tener al menos 3 caracteres"
      });
    }

    if (producto.trim().length > 100) {
      return res.status(400).json({
        error: "El producto no puede tener más de 100 caracteres"
      });
    }

    // Validar que el precio sea positivo
    if (precio <= 0) {
      return res.status(400).json({
        error: "El precio debe ser mayor a 0"
      });
    }

    // Validar precio máximo
    if (precio > 100000) {
      return res.status(400).json({
        error: "El precio no puede ser mayor a Bs. 100,000"
      });
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: "El usuario especificado no existe"
      });
    }

    // Crear el gasto
    const nuevoGasto = await prisma.gasto.create({
      data: {
        usuario_id: parseInt(usuario_id),
        producto: producto.trim(),
        precio: parseInt(precio),
        // Si el usuario envía una fecha (ISO string), la convertimos a objeto Date.
        // Si no la envía, Prisma usará @default(now()) definido en el schema.
        ...(fecha && { fecha: new Date(fecha) })
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cargo: true
          }
        }
      }
    });

    return res.status(201).json({
      mensaje: "Gasto registrado exitosamente",
      gasto: nuevoGasto
    });

  } catch (error) {
    console.error("Error al registrar gasto:", error);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

export const obtenerGastos = async (req: Request, res: Response) => {
  try {
    const gastos = await prisma.gasto.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cargo: true
          }
        }
      },
      // Cambiamos el orden para que los gastos más recientes aparezcan primero
      orderBy: { fecha: 'desc' }
    });

    return res.status(200).json({
      total: gastos.length,
      gastos
    });

  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};