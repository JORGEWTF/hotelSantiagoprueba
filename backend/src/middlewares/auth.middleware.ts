import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: number;
    cargo: string;
    nombre: string;
    apellido: string;
}

// Extender el objeto Request de Express para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default') as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado." });
    }

    if (req.user.cargo !== 'Administrador') {
        return res.status(403).json({ error: "Acceso denegado. Se requiere rol de Administrador." });
    }

    next();
};
