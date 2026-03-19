import { Request, Response } from 'express';
import { prisma } from "../config/prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registrarAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellido, carnet, celular, genero, password } = req.body;

        // 1. Validaciones básicas
        if (!nombre || !carnet || !password) {
            res.status(400).json({ error: "Nombre, carnet y password son requeridos" });
            return;
        }

        // 2. Verificar si el usuario ya existe convirtiendo carnet a número
        const carnetNum = Number(carnet);
        const celularNum = Number(celular);

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { carnet: carnetNum }
        });

        if (usuarioExistente) {
            res.status(409).json({ error: "Ya existe un usuario con este carnet" });
            return;
        }

        // 3. Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insertar en la DB (Asegurando tipos numéricos para carnet y celular)
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                carnet: carnetNum,
                celular: celularNum,
                genero,
                cargo: 'Administrador',
                password: hashedPassword
            },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                cargo: true,
                carnet: true
            }
        });

        res.status(201).json({
            message: "Usuario administrador creado con éxito",
            user: nuevoUsuario
        });

    } catch (err: any) {
        console.error("Error en registrarAdmin:", err);
        res.status(500).json({
            error: "Error interno al crear el usuario",
            details: err.message
        });
    }
};

export const registrarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellido, carnet, celular, genero, password, cargo } = req.body;

        // 1. Validaciones básicas
        if (!nombre || !carnet || !password || !cargo) {
            res.status(400).json({ error: "Faltan campos obligatorios (nombre, carnet, password, cargo)" });
            return;
        }

        const carnetNum = Number(carnet);
        const celularNum = Number(celular);

        // 2. Verificar existencia
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { carnet: carnetNum }
        });

        if (usuarioExistente) {
            res.status(409).json({ error: "Ya existe un usuario con este carnet" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Crear usuario con cargo dinámico
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                carnet: carnetNum,
                celular: celularNum,
                genero,
                cargo, // Aquí recibirá 'Administrador', 'Recepcion' o 'Limpieza'
                password: hashedPassword
            },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                cargo: true
            }
        });

        res.status(201).json({
            message: `Usuario con cargo ${cargo} creado con éxito`,
            user: nuevoUsuario
        });

    } catch (err: any) {
        res.status(500).json({ error: "Error al crear el usuario", details: err.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { carnet, password } = req.body;

        if (!carnet || !password) {
            res.status(400).json({ error: "Carnet y contraseña son requeridos" });
            return;
        }

        // Buscar al usuario convirtiendo el carnet de la petición a número
        const user = await prisma.usuario.findUnique({
            where: { carnet: Number(carnet) }
        });

        if (!user) {
            res.status(401).json({ error: "Credenciales inválidas" });
            return;
        }

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401).json({ error: "Credenciales inválidas" });
            return;
        }

        // Generar Token
        const token = jwt.sign(
            {
                id: user.id,
                cargo: user.cargo,
                nombre: user.nombre,
                apellido: user.apellido
            },
            process.env.JWT_SECRET || 'secret_key_default',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: "Login exitoso",
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                cargo: user.cargo
            }
        });

    } catch (err: any) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const listarUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                apellido: true,
                carnet: true,
                celular: true,
                cargo: true,
                genero: true,
                // Si tienes un campo para ver si está online, inclúyelo
                // isOnline: true 
            },
            orderBy: { cargo: 'asc' }
        });
        res.status(200).json(usuarios);
    } catch (err: any) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // 1. Verificar si el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: { id: Number(id) }
        });

        if (!usuario) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        // 2. Eliminar el usuario
        await prisma.usuario.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({
            message: `Usuario ${usuario.nombre} eliminado correctamente`
        });

    } catch (err: any) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({ 
            error: "Error interno al eliminar el usuario",
            details: err.message 
        });
    }
};