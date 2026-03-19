import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types/auth';
import { logout as logoutService } from '../services/authService';

// Definimos las interfaces para uso interno
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

interface DecodedToken {
    id: number;
    cargo: string;
    nombre?: string;
    apellido?: string;
    exp: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    // Verificar si el token ha expirado
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        logoutService();
                    } else {
                        setUser({
                            id: decoded.id,
                            cargo: decoded.cargo,
                            nombre: decoded.nombre || '',
                            apellido: decoded.apellido || ''
                        });
                    }
                } catch (error) {
                    console.error("Error decoding token on init:", error);
                    logoutService();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({
            id: decoded.id,
            cargo: decoded.cargo,
            nombre: decoded.nombre || '',
            apellido: decoded.apellido || ''
        });
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};