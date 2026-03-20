import React, { useState } from 'react';
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Eraser, 
  User, 
  BadgeCheck, 
  IdCard, 
  Phone 
} from 'lucide-react';

const RegisterUser: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const initialState = {
    nombre: '',
    apellido: '',
    carnet: '',
    celular: '',
    genero: 'Masculino',
    cargo: 'Recepcion',
    password: ''
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

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

    try {
      const response = await fetch('http://localhost:3000/api/auth/register-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          carnet: Number(formData.carnet),
          celular: Number(formData.celular)
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al registrar');

      setSuccess(true);
      setFormData(initialState);
      setShowPassword(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full animate-in fade-in duration-500 p-0 sm:p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-sm overflow-hidden border border-gray-100">
        
        {/* HEADER RESPONSIVE */}
        <div className="bg-zinc-900 py-6 px-4 text-center relative">
          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-[#d4af37]/20 hidden lg:block">
            <UserPlus size={40} />
          </div>
          <h2 className="font-serif text-lg sm:text-xl tracking-[2px] sm:tracking-[3px] text-[#d4af37] uppercase">
            Registro de Personal
          </h2>
          <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest mt-1">Alta de nuevos empleados</p>
        </div>

        {/* FORMULARIO RESPONSIVE */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-xs sm:text-sm flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-xs sm:text-sm flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>¡Usuario registrado con éxito!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 sm:gap-y-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <User size={12} /> Nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-all text-sm bg-transparent"
                placeholder="Nombre"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-500 uppercase">Apellido</label>
              <input
                name="apellido"
                type="text"
                required
                value={formData.apellido}
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-all text-sm bg-transparent"
                placeholder="Apellido"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <IdCard size={12} /> Carnet (CI)
              </label>
              <input
                name="carnet"
                type="number"
                required
                value={formData.carnet}
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-all text-sm font-mono bg-transparent"
                placeholder="8456123"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <Phone size={12} /> Celular
              </label>
              <input
                name="celular"
                type="number"
                required
                value={formData.celular}
                className="border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none transition-all text-sm font-mono bg-transparent"
                placeholder="75012345"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <BadgeCheck size={12} /> Cargo
              </label>
              <select
                name="cargo"
                value={formData.cargo}
                className="border-b border-gray-200 py-2 bg-transparent focus:border-[#d4af37] outline-none cursor-pointer text-sm"
                onChange={handleChange}
              >
                <option value="Recepcion">Recepcionista</option>
                <option value="Limpieza">Personal de Limpieza</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-500 uppercase">Género</label>
              <select
                name="genero"
                value={formData.genero}
                className="border-b border-gray-200 py-2 bg-transparent focus:border-[#d4af37] outline-none cursor-pointer text-sm"
                onChange={handleChange}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 relative md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contraseña</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  className="w-full border-b border-gray-200 py-2 focus:border-[#d4af37] outline-none pr-10 text-sm bg-transparent"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* ACCIONES RESPONSIVE */}
          <div className="mt-10 sm:mt-12 flex flex-col-reverse sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => {setFormData(initialState); setError(null); setSuccess(false);}}
              className="flex items-center justify-center gap-2 px-6 py-4 border border-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              <Eraser size={14} /> Limpiar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-[#d4af37] py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[2px] sm:tracking-[3px] hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Finalizar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;