import { Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * Registra un huésped en la lista negra
 */
export const reportarHuesped = async (req: Request, res: Response) => {
    try {
        const { huesped_id, motivo } = req.body;

        if (huesped_id === undefined || huesped_id === null || !motivo) {
            return res.status(400).json({
                error: "Campos obligatorios faltantes",
                detalles: "El id del huésped y el motivo son requeridos.",
            });
        }

        // Verificar si el huésped existe
        const huesped = await prisma.huesped.findUnique({
            where: { id: huesped_id },
        });

        if (!huesped) {
            return res.status(404).json({ error: "Huésped no encontrado" });
        }

        // Crear registro en lista negra
        const reporte = await prisma.lista_negra.create({
            data: {
                huesped_id,
                motivo,
                fecha: new Date(),
            },
        });

        res.status(201).json({
            mensaje: "El huésped ha sido boletinado correctamente",
            reporte,
        });
    } catch (error) {
        console.error("Error al reportar a lista negra:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

/**
 * Elimina un registro de la lista negra (Solo Admin)
 */
export const eliminarDeListaNegra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const idNum = parseInt(id as string);
        if (isNaN(idNum)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        await prisma.lista_negra.delete({
            where: { id: idNum },
        });

        res.status(200).json({ mensaje: "Registro eliminado de la lista negra" });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Registro no encontrado en la lista negra" });
        }
        console.error("Error al eliminar de lista negra:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

/**
 * Verifica si un huésped está en la lista negra por su carnet
 */
export const verificarCarnet = async (req: Request, res: Response) => {
    try {
        const { carnet } = req.params;

        const carnetNum = parseInt(carnet as string);
        if (isNaN(carnetNum)) {
            return res.status(400).json({ error: "Carnet inválido" });
        }

        const huesped = await prisma.huesped.findFirst({
            where: {
                carnet: carnetNum,
            },
            include: {
                lista_negra: true,
            },
        });

        if (!huesped) {
            return res.status(200).json({
                encontrado: false,
                en_lista_negra: false
            });
        }

        const estaEnListaNegra = huesped.lista_negra.length > 0;

        return res.status(200).json({
            encontrado: true,
            en_lista_negra: estaEnListaNegra,
            huesped: {
                id: huesped.id,
                nombres: huesped.nombres,
                apellidos: huesped.apellidos,
                carnet: huesped.carnet,
            },
            motivos: estaEnListaNegra ? huesped.lista_negra.map((ln: any) => ({
                id: ln.id,
                motivo: ln.motivo,
                fecha: ln.fecha
            })) : [],
        });
    } catch (error) {
        console.error("Error al verificar carnet en lista negra:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
