import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: string[]; // Ejemplo: ['administrador', 'recepcion']
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  // 1. Si no hay token/usuario, fuera al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normalizar el cargo para comparar
  const cargoUsuario = user.cargo?.toLowerCase().trim() || '';

  // 3. Verificar si el cargo del usuario está en la lista de permitidos
  const hasAccess = allowedRoles.includes(cargoUsuario) || cargoUsuario === 'administrador';

  if (!hasAccess) {
    alert("No tienes permisos para acceder a esta sección");
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;