import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        // Puedes poner un spinner aquí
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user) {
        // Normalizamos el cargo para comparación flexible
        const userRole = user.cargo.toLowerCase().trim();

        const hasPermission = allowedRoles.some(role =>
            role.toLowerCase().trim() === userRole
        );

        if (!hasPermission) {
            // Si no tiene permiso, redirigir a home o dashboard por defecto
            return <Navigate to="/home" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
