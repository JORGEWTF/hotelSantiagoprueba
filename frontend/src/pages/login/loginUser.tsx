import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { User, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginUser: React.FC = () => {
  const [carnet, setCarnet] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginAdmin(carnet, password);

      // La lógica de validación de cargo puede ir aquí o en el componente protegido
      // pero el login debe ser exitoso si las credenciales son válidas.

      // Usamos el método login del contexto pasándole solo el token
      login(response.token);

      navigate('/home');

    } catch (err: any) {
      setError(err || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f4f4f4] font-sans px-4 py-8">
      {/* Contenedor Adaptativo: En móvil ocupa casi todo el ancho, en desktop se limita a 420px */}
      <div className="bg-white p-6 sm:p-10 w-full max-w-[420px] shadow-2xl rounded-sm text-center animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO / HEADER */}
        <div className="mb-8 sm:mb-10">
          <span className="text-[9px] sm:text-[10px] tracking-[4px] text-[#d4af37] font-bold uppercase block mb-2">
            Bienvenido
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl tracking-[2px] sm:tracking-[3px] m-0 text-black uppercase">
            Hotel Santiago
          </h1>
          <div className="w-12 h-[2px] bg-[#d4af37] mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-[10px] sm:text-[11px] text-left flex items-center gap-2 animate-pulse">
              <AlertCircle size={14} className="shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          {/* Carnet */}
          <div className="text-left">
            <label className="block text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Carnet de Identidad
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <User size={18} strokeWidth={1.5} />
              </span>
              <input 
                type="text" 
                placeholder="Ingrese su carnet"
                className="w-full py-3.5 sm:py-4 pr-4 pl-12 border border-gray-200 outline-none focus:border-black transition-all text-sm bg-transparent"
                value={carnet}
                onChange={(e) => setCarnet(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="text-left">
            <label className="block text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <KeyRound size={18} strokeWidth={1.5} />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full py-3.5 sm:py-4 pr-12 pl-12 border border-gray-200 outline-none focus:border-black transition-all text-sm bg-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-black transition-colors focus:outline-none p-1"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 sm:py-4 bg-black text-[#d4af37] font-bold uppercase tracking-[2px] text-xs sm:text-sm mt-4
              transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98]
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}
            `}
          >
            {loading ? 'Verificando...' : 'Acceder al Sistema'}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
          <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            Uso exclusivo para personal autorizado
          </p>
          <p className="text-[8px] sm:text-[9px] text-gray-300 italic">
            v2.1 © Hotel Santiago - Gestión Interna
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;