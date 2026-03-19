import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 1. IMPORTA TU PROVIDER (Asegúrate de que la ruta sea la correcta)
import { AuthProvider } from './context/AuthContext';

import RoleGuard from './components/common/RoleGuard';
import MainLayout from './components/layout/mainLayout';

// Páginas
import LoginUser from './pages/login/loginUser';
import RegisterAdmin from './pages/admin/registerAdmin';
import RegisterUser from './pages/admin/viewUser';
import RegisterSpent from './pages/reports/registerSpent';
import Reports from './pages/reports/reports';
import Rooms from './pages/rooms/Rooms';
import CreateRoom from './pages/rooms/CreateRoom';
import ViewReservation from './pages/reservations/ViewReservations';
import ViewHuesped from './pages/huesped/viewHuesped';
export default function App() {
  return (
    // 2. ENVOLVER TODO CON EL PROVIDER
    <AuthProvider>
      <Router>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/login" element={<LoginUser />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* RUTAS PROTEGIDAS */}
          <Route element={<RoleGuard allowedRoles={['administrador', 'recepcion', 'limpieza']} />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Rooms />} />

              <Route element={<RoleGuard allowedRoles={['administrador', 'recepcion']} />}>
                <Route path="/reservas" element={<ViewReservation />} />
                <Route path="/hospedados" element={<ViewHuesped />} />
                <Route path="/registrar-gasto" element={<RegisterSpent />} />
                <Route path="/reportes" element={<Reports />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={['administrador']} />}>
                <Route path="/crear-usuario" element={<RegisterUser />} />
                <Route path="/crear-habitacion" element={<CreateRoom />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}