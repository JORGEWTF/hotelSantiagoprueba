import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HuespedesSection, { type Huesped } from './HuespedesSection';

interface Props {
  reserva: any; 
  onClose: () => void;
  onSuccess: () => void;
}

const CheckInForm: React.FC<Props> = ({ reserva: dataActual, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    habitacion_numero: '', 
    fecha_entrada: '',
    fecha_salida: '',
    ingreso: 0,
    metodo_ingreso: 'Efectivo',
    observacion: '',
    huespedes: [] as Huesped[]
  });

  useEffect(() => {
    if (dataActual) {
      const listaHuespedes = dataActual.huespedes_detalle?.map((d: any) => ({
        nombres: d.huesped.nombres,
        apellidos: d.huesped.apellidos,
        carnet: d.huesped.carnet.toString(),
        complemento: d.huesped.complemento || 'LP',
        celular: d.huesped.celular.toString(),
        genero: d.huesped.genero,
        profesion: d.huesped.profesion || '',
        fecha_nacimiento: d.huesped.fecha_nacimiento ? d.huesped.fecha_nacimiento.split('T')[0] : '',
        nacionalidad: d.huesped.nacionalidad || 'Boliviano',
        ciudad_nacimiento: d.huesped.ciudad_nacimiento || '',
        estado_civil: d.huesped.estado_civil || 'Soltero'
      })) || [];

      setFormData({
        habitacion_numero: dataActual.habitacion?.numero || '', 
        fecha_entrada: dataActual.fecha_entrada?.split('T')[0] || '',
        fecha_salida: dataActual.fecha_salida?.split('T')[0] || '',
        ingreso: dataActual.ingreso || 0,
        metodo_ingreso: dataActual.metodo_ingreso || 'Efectivo',
        observacion: dataActual.observacion || '',
        huespedes: listaHuespedes
      });
    }
  }, [dataActual]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateHuespedes = (update: Huesped[] | ((prev: Huesped[]) => Huesped[])) => {
    setFormData(prev => {
      const nuevosHuespedes = typeof update === 'function' ? update(prev.huespedes) : update;
      return { ...prev, huespedes: nuevosHuespedes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Obtener el token del localStorage
      const token = localStorage.getItem('token');

      // 2. Configurar cabeceras de autorización
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const dataToSend = {
        ...formData,
        habitacion_numero: Number(formData.habitacion_numero),
        ingreso: Number(formData.ingreso)
      };

      // 3. Enviar petición con la configuración de headers
      await axios.put(
        `http://localhost:3000/api/reservas/${dataActual.id}/checkin`, 
        dataToSend,
        config
      );

      alert("Check-in completado exitosamente.");
      onSuccess();
    } catch (error: any) {
      // Manejo de error 401 u otros
      const mensaje = error.response?.status === 401 
        ? "Sesión expirada o no autorizada. Por favor, inicie sesión de nuevo."
        : error.response?.data?.message || "Ocurrió un problema";
      
      alert("Error: " + mensaje);
    } finally {
      setLoading(false);
    }
  };

  const totalVisual = Number(dataActual.adelanto) + Number(formData.ingreso);

  return (
    <div className="p-8 bg-white rounded-[2.5rem] shadow-sm max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* Estilos para el scroll y limpieza de inputs numéricos */}
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { 
          -webkit-appearance: none; margin: 0; 
        }
        input[type=number] { -moz-appearance: textfield; }

        /* Estética del Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981; /* Verde esmeralda para combinar con Check-in */
          border-radius: 10px;
          border: 2px solid #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>

      {/* CABECERA: Reorganizada para evitar solapamiento con la 'X' del modal */}
      <div className="flex flex-col gap-1 mb-8 border-l-4 border-green-600 pl-4">
        <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Procesar Check-In</h2>
            <span className="text-[10px] font-black bg-green-100 text-green-700 px-3 py-1 rounded-full whitespace-nowrap">
                RES #{dataActual.id}
            </span>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Confirme los datos del huésped y el saldo pendiente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECCIÓN ESTANCIA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-[2rem]">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Habitación #</label>
            <input 
              name="habitacion_numero" 
              type="number" 
              value={formData.habitacion_numero} 
              onChange={handleChange} 
              className="p-3 rounded-xl border-none font-bold shadow-sm bg-white focus:ring-2 focus:ring-green-400 outline-none transition-all" 
              required 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Fecha Entrada</label>
            <input name="fecha_entrada" type="date" value={formData.fecha_entrada} onChange={handleChange} className="p-3 rounded-xl border-none font-bold shadow-sm focus:ring-2 focus:ring-green-400 outline-none transition-all" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Fecha Salida</label>
            <input name="fecha_salida" type="date" value={formData.fecha_salida} onChange={handleChange} className="p-3 rounded-xl border-none font-bold shadow-sm focus:ring-2 focus:ring-green-400 outline-none transition-all" required />
          </div>
        </div>

        {/* SECCIÓN HUÉSPEDES */}
        <HuespedesSection 
          huespedes={formData.huespedes} 
          setHuespedes={updateHuespedes} 
        />

        {/* SECCIÓN PAGOS */}
        <div className="bg-green-50/50 p-8 rounded-[2.5rem] border-2 border-green-100 shadow-inner">
          <h3 className="text-lg font-black text-green-800 uppercase mb-4 italic">Saldo de Entrada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-green-600 uppercase ml-2">Monto a Cobrar (Bs.)</label>
              <input 
                name="ingreso" 
                type="number" 
                value={formData.ingreso} 
                onChange={handleChange} 
                className="p-4 bg-white rounded-2xl border-none font-black text-2xl text-green-700 w-full shadow-sm focus:ring-2 focus:ring-green-400 outline-none transition-all" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Método de Cobro</label>
              <select 
                name="metodo_ingreso" 
                value={formData.metodo_ingreso} 
                onChange={handleChange} 
                className="p-4 bg-white rounded-2xl border-none font-bold w-full shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-green-400 transition-all"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="QR">Pago QR</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
            <div className="md:col-span-2 bg-green-600 p-5 rounded-2xl text-white flex justify-between items-center shadow-lg transform transition-transform active:scale-[0.98]">
              <span className="font-black uppercase text-xs">Total Liquidado (Adelanto + Ingreso):</span>
              <span className="text-2xl font-black">{totalVisual} Bs.</span>
            </div>
          </div>
          <textarea 
            name="observacion" 
            placeholder="Notas..." 
            value={formData.observacion} 
            onChange={handleChange} 
            className="mt-4 p-4 bg-white rounded-2xl border-none h-20 w-full text-sm font-medium shadow-sm focus:ring-2 focus:ring-green-400 outline-none transition-all" 
          />
        </div>

        {/* ACCIÓN PRINCIPAL (Botón de cerrar eliminado para mayor limpieza) */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-xl transition-all active:translate-y-1 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200'}`}
          >
            {loading ? 'PROCESANDO...' : 'CONFIRMAR INGRESO Y REALIZAR CHECK-IN'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckInForm;