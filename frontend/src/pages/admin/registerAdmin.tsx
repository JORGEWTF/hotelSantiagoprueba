import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAdmin, type RegisterData } from '../../services/authService';
import { Eye, EyeOff, AlertCircle, CheckCircle2, UserPlus, Phone, CreditCard, Users, ArrowLeft } from 'lucide-react';

const RegisterAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    carnet: '',
    celular: '',
    genero: 'Masculino',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.carnet.length < 7 || formData.carnet.length > 10) {
      setError("El carnet debe tener entre 7 y 10 dígitos");
      setLoading(false);
      return;
    }

    if (formData.celular.length !== 8) {
      setError("El celular debe tener exactamente 8 dígitos");
      setLoading(false);
      return;
    }

    const dataToSubmit: RegisterData = {
      ...formData,
      carnet: Number(formData.carnet),
      celular: Number(formData.celular)
    };

    try {
      await registerAdmin(dataToSubmit);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f7f6] p-0 sm:p-4 font-sans">
      <div className="w-full h-screen sm:h-auto sm:max-w-3xl bg-white shadow-2xl sm:rounded-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Estilo Hotel Responsive */}
        <div className="bg-black py-8 sm:py-10 text-center relative px-4">
          <div className="absolute top-4 right-8 text-[#d4af37]/20 hidden sm:block">
            <UserPlus size={40} />
          </div>
          
          {/* Botón volver (solo móvil para mejor UX) */}
          <button 
            onClick={() => navigate('/login')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] sm:hidden"
          >
            <ArrowLeft size={24} />
          </button>

          <h2 className="font-serif text-xl sm:text-2xl tracking-[3px] sm:tracking-[4px] text-[#d4af37] uppercase">
            Alta de Administrador
          </h2>
          <div className="h-px bg-[#d4af37] w-12 sm:w-16 mx-auto mt-2"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 lg:p-12">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-xs sm:text-sm flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 size={18} className="shrink-0" /> 
              <span>Registro exitoso. Redirigiendo...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 sm:gap-y-8">
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-colors text-sm bg-transparent"
                placeholder="Juan"
                onChange={handleChange}
              />
            </div>

            {/* Apellido */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apellido</label>
              <input
                name="apellido"
                type="text"
                required
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-colors text-sm bg-transparent"
                placeholder="Pérez"
                onChange={handleChange}
              />
            </div>

            {/* Carnet */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={12} strokeWidth={2.5} /> Carnet (CI)
              </label>
              <input
                name="carnet"
                type="number"
                required
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-colors text-sm font-mono bg-transparent"
                placeholder="1234567"
                onChange={handleChange}
              />
              <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-tighter">Min 7 - Max 10 dígitos</span>
            </div>

            {/* Celular */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={12} strokeWidth={2.5} /> Celular
              </label>
              <input
                name="celular"
                type="number"
                required
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-colors text-sm font-mono bg-transparent"
                placeholder="70000000"
                onChange={handleChange}
              />
              <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-tighter">Exactamente 8 dígitos</span>
            </div>

            {/* Genero */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} strokeWidth={2.5} /> Género
              </label>
              <select
                name="genero"
                className="border-b border-gray-200 py-2 bg-transparent focus:border-[#d4af37] outline-none transition-colors text-sm cursor-pointer"
                onChange={handleChange}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contraseña Maestra</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-colors pr-10 text-sm bg-transparent"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-[#d4af37] py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[2px] sm:tracking-[3px] hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Confirmar Nuevo Administrador'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest hover:text-black transition-colors py-2"
            >
              ¿Ya tienes cuenta? Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;