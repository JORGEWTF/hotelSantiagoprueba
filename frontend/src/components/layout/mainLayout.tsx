import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  BedDouble, 
  CalendarDays, 
  Users, 
  WalletMinimal, 
  UserPlus, 
  KeyRound, 
  BarChart3, 
  LogOut, 
  Hotel,
  Menu,
  X 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const cargoUsuario = user?.cargo?.toLowerCase().trim() || '';
  
  const isAdmin = cargoUsuario === 'administrador' || cargoUsuario === 'admin';
  const isRecepcion = cargoUsuario === 'recepcion' || cargoUsuario === 'recepcionista' || isAdmin;
  const isLimpieza = cargoUsuario === 'limpieza' || cargoUsuario === 'mantenimiento';

  const handleLogout = () => {
    logout();
    logout();
    navigate('/login');
  };

  const activeClass = (path: string) =>
    location.pathname === path
      ? "bg-[#d4af37] text-black font-semibold border-l-4 border-white"
      : "text-gray-400 hover:bg-zinc-900 hover:text-white border-l-4 border-transparent";

  const iconSize = 20;

  return (
    <div className="flex h-screen w-full bg-[#f4f7f6] overflow-hidden font-sans">
      
      {/* OVERLAY PARA MÓVIL */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* SIDEBAR RESPONSIVE */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-black text-white flex flex-col shadow-2xl transition-transform duration-300 transform
        lg:relative lg:translate-x-0 
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="p-8 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="text-[#d4af37]">
              <Hotel size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-serif text-md tracking-wider text-[#d4af37] leading-tight uppercase">
                Hotel Santiago
              </h1>
              <span className="text-[9px] tracking-[2px] text-gray-500 uppercase">
                {user?.cargo || 'PERSONAL'}
              </span>
            </div>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col justify-between py-6 overflow-y-auto">
          <div className="flex flex-col gap-1">

            {/* HABITACIONES: Visible para TODOS */}
            <Link 
              to="/home" 
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/home')}`}
            >
               <BedDouble size={iconSize} /> 
               <span className="text-xs uppercase tracking-wider">Habitaciones</span>
            </Link>


            {/* RECEPCIÓN Y ADMIN */}
            {isRecepcion && (
              <>
                <Link to="/reservas" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/reservas')}`}>
                   <CalendarDays size={iconSize} />
                   <span className="text-xs uppercase tracking-wider">Reservas</span>
                </Link>
                <Link to="/hospedados" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/hospedados')}`}>
                   <Users size={iconSize} />
                   <span className="text-xs uppercase tracking-wider">Hospedados</span>
                </Link>
                <Link to="/registrar-gasto" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/registrar-gasto')}`}>
                   <WalletMinimal size={iconSize} />
                   <span className="text-xs uppercase tracking-wider">Registrar Gasto</span>
                </Link>
              </>
            )}

            {/* SOLO ADMIN */}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1">
                <p className="px-6 text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-2">Gestión Admin</p>

                <Link to="/crear-usuario" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/crear-usuario')}`}>
                   <UserPlus size={iconSize} />
                   <span className="text-xs uppercase tracking-wider">Crear Usuario</span>
                </Link>

                <Link to="/crear-habitacion" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/crear-habitacion')}`}>
                   <KeyRound size={iconSize} />
                   <span className="text-xs uppercase tracking-wider">Crear Habitación</span>
                </Link>

                <Link to="/reportes" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/reportes')}`}>
                   <BarChart3 size={iconSize} />
                   <span className="text-xs uppercase tracking-wider">Caja y Reportes</span>
                </Link>
              </div>
            )}
            
            {/* Reporte para Recepción (No Admin) */}
            {!isAdmin && isRecepcion && (
               <Link to="/reportes" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 px-6 py-3.5 transition-all ${activeClass('/reportes')}`}>
                  <BarChart3 size={iconSize} />
                  <span className="text-sm uppercase tracking-wider">Reporte Diario</span>
               </Link>
            )}
          </div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-4 px-6 py-5 text-red-500 font-bold hover:bg-red-500/10 transition-colors border-t border-zinc-800 w-full text-left group"
          >
            <LogOut size={iconSize} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-wider">Cerrar Sesión</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white px-4 lg:px-10 py-4 flex justify-between items-center border-b border-gray-200 min-h-[70px] sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {/* BOTÓN HAMBURGUESA MÓVIL */}
            <button 
              className="lg:hidden p-2 text-zinc-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:block">
              <h2 className="text-md lg:text-lg font-bold text-gray-800 leading-none">
                Hola, {user?.nombre || 'Usuario'}
              </h2>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                {/* Aquí usamos isLimpieza para que el editor lo reconozca como usado */}
                {isAdmin ? 'Acceso Total al Sistema' : isLimpieza ? 'Módulo de Mantenimiento' : 'Panel Operativo'}
              </p>
            </div>
          </div>


          <div className="flex items-center gap-3">
            <span className="hidden xs:inline-block bg-[#d4af37] text-black text-[9px] font-black px-2 py-1 rounded">PRO</span>
            <div className="flex flex-col items-end mr-1 lg:mr-2">
              <span className="text-xs lg:text-sm font-semibold text-gray-700 leading-none truncate max-w-[120px] lg:max-w-none">
                {user?.nombre} {user?.apellido}
              </span>
              <span className="text-[8px] lg:text-[9px] text-gray-400 uppercase tracking-[1px] font-medium">
                {user?.cargo}
              </span>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-900 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 shadow-inner uppercase font-bold text-xs lg:text-sm">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        
        <section className="p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;