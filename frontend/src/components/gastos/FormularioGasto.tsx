import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, ShoppingBag, Banknote, User, Save, AlertCircle } from 'lucide-react';

interface FormularioGastoProps {
  onClose: () => void;
  onGastoCreado: () => void;
}

const FormularioGasto = ({ onClose, onGastoCreado }: FormularioGastoProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    producto: '',
    precio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_CARACTERES = 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.producto.trim().length < 3) {
      setError('El producto debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user?.id || 1,
          producto: formData.producto.trim().toUpperCase(),
          precio: parseFloat(formData.precio)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar el gasto');
      }

      onGastoCreado();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const porcentajeProgreso = (formData.producto.length / MAX_CARACTERES) * 100;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        
        <div className="bg-gray-800 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d4af37] rounded-lg text-black">
              <Banknote size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Nuevo Gasto</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Formulario de Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="bg-white p-2 rounded-full shadow-sm text-[#8b7520]">
                <User size={16} />
              </div>
              <div className="text-xs">
                <p className="text-gray-400 font-bold uppercase text-[9px]">Registrado por</p>
                <p className="font-bold text-gray-700">{user.nombre} {user.apellido}</p>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                <ShoppingBag size={12} /> Producto / Servicio
              </label>
              <span className={`text-[10px] font-bold ${formData.producto.length >= MAX_CARACTERES ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.producto.length}/{MAX_CARACTERES}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="producto"
                value={formData.producto}
                onChange={handleChange}
                required
                maxLength={MAX_CARACTERES}
                placeholder="EJ: ARTICULOS DE LIMPIEZA"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all uppercase"
              />
            </div>
            
            {/* Barra de progreso CORREGIDA */}
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  porcentajeProgreso >= 100
                    ? 'bg-red-500'
                    : porcentajeProgreso >= 80
                      ? 'bg-yellow-400'
                      : 'bg-[#d4af37]'
                }`}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1 flex items-center gap-1">
              <Banknote size={12} /> Monto Total (Bs.)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">Bs.</span>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                required
                min="0.1"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl animate-shake">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-[#d4af37] text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#c4a137] shadow-lg shadow-yellow-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Guardar Gasto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioGasto;